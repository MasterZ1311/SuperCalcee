/**
 * SuperCalcee Python Process Manager
 * ==================================
 * 
 * Manages the lifecycle of the background Python computational API process:
 *  - Canonical and fallback virtual environment resolution
 *  - Cross-platform path handling (Windows & POSIX)
 *  - Paths with spaces and Unicode support
 *  - Process tree spawning with parent-PID monitoring
 *  - Health check polling with early exit/crash detection
 *  - Complete process tree termination on Windows (no orphan processes)
 * 
 * @module main/pythonManager
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const http = require('http');

/**
 * Normalizes and checks if a file exists on disk.
 * Handles paths with spaces and Unicode.
 * 
 * @param {string} targetPath - Absolute path to test
 * @returns {boolean} True if path exists and is a file
 */
function fileExists(targetPath) {
  try {
    if (!targetPath) return false;
    const stats = fs.statSync(targetPath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Normalizes and checks if a directory exists on disk.
 * 
 * @param {string} targetPath - Absolute path to test
 * @returns {boolean} True if path exists and is a directory
 */
function dirExists(targetPath) {
  try {
    if (!targetPath) return false;
    const stats = fs.statSync(targetPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Discovers the Python executable path using canonical conventions and fallbacks.
 * 
 * @param {Object} opts
 * @param {boolean} opts.isPackaged - Whether Electron is running in packaged mode
 * @param {string} opts.resourcesPath - Process resources path in packaged mode
 * @param {string} opts.rootPath - Repository root path in development
 * @returns {{ pythonPath: string, source: string, searchedPaths: string[] }}
 */
function resolvePythonExecutable({ isPackaged, resourcesPath, rootPath }) {
  const isWindows = process.platform === 'win32';
  const binSubdir = isWindows ? 'Scripts' : 'bin';
  const exeName = isWindows ? 'python.exe' : 'python';
  const searchedPaths = [];

  // 1. Explicit override via environment variable
  if (process.env.PYTHON_PATH) {
    searchedPaths.push(process.env.PYTHON_PATH);
    if (fileExists(process.env.PYTHON_PATH)) {
      return { pythonPath: path.resolve(process.env.PYTHON_PATH), source: 'PYTHON_PATH_ENV', searchedPaths };
    }
  }

  // 2. Currently active virtual environment in shell
  if (process.env.VIRTUAL_ENV) {
    const activeVenvExe = path.join(process.env.VIRTUAL_ENV, binSubdir, exeName);
    searchedPaths.push(activeVenvExe);
    if (fileExists(activeVenvExe)) {
      return { pythonPath: path.resolve(activeVenvExe), source: 'VIRTUAL_ENV', searchedPaths };
    }
  }

  // 3. Packaged standalone application bundle
  if (isPackaged && resourcesPath) {
    const packagedVenv = path.join(resourcesPath, 'venv', binSubdir, exeName);
    searchedPaths.push(packagedVenv);
    if (fileExists(packagedVenv)) {
      return { pythonPath: path.resolve(packagedVenv), source: 'PACKAGED_VENV', searchedPaths };
    }

    const packagedDist = path.join(resourcesPath, 'python_dist', exeName);
    searchedPaths.push(packagedDist);
    if (fileExists(packagedDist)) {
      return { pythonPath: path.resolve(packagedDist), source: 'PACKAGED_DIST', searchedPaths };
    }
  }

  // 4. Canonical Development Virtual Environment (<root>/venv)
  const canonicalRootVenv = path.join(rootPath, 'venv', binSubdir, exeName);
  searchedPaths.push(canonicalRootVenv);
  if (fileExists(canonicalRootVenv)) {
    return { pythonPath: path.resolve(canonicalRootVenv), source: 'CANONICAL_ROOT_VENV', searchedPaths };
  }

  // 5. Standard IDE Hidden Virtual Environment (<root>/.venv)
  const dotVenv = path.join(rootPath, '.venv', binSubdir, exeName);
  searchedPaths.push(dotVenv);
  if (fileExists(dotVenv)) {
    return { pythonPath: path.resolve(dotVenv), source: 'DOT_VENV', searchedPaths };
  }

  // 6. Legacy / Subdirectory Virtual Environment (<root>/src_python/venv)
  const srcPythonVenv = path.join(rootPath, 'src_python', 'venv', binSubdir, exeName);
  searchedPaths.push(srcPythonVenv);
  if (fileExists(srcPythonVenv)) {
    return { pythonPath: path.resolve(srcPythonVenv), source: 'SRC_PYTHON_VENV', searchedPaths };
  }

  // 7. System Python fallback (search PATH)
  try {
    const whichCmd = isWindows ? 'where.exe python' : 'which python3 || which python';
    const systemPython = execSync(whichCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split(/\r?\n/)[0];
    if (systemPython && fileExists(systemPython)) {
      searchedPaths.push(systemPython);
      return { pythonPath: path.resolve(systemPython), source: 'SYSTEM_PATH', searchedPaths };
    }
  } catch {
    // Not found in system PATH
  }

  return { pythonPath: null, source: 'NOT_FOUND', searchedPaths };
}

/**
 * Resolves the absolute path to api.py and the working directory.
 * 
 * @param {Object} opts
 * @param {boolean} opts.isPackaged
 * @param {string} opts.resourcesPath
 * @param {string} opts.rootPath
 * @returns {{ apiScript: string, workingDir: string }}
 */
function resolveBackendPaths({ isPackaged, resourcesPath, rootPath }) {
  if (isPackaged && resourcesPath) {
    return {
      apiScript: path.resolve(path.join(resourcesPath, 'src_python', 'api.py')),
      workingDir: path.resolve(resourcesPath)
    };
  }
  return {
    apiScript: path.resolve(path.join(rootPath, 'src_python', 'api.py')),
    workingDir: path.resolve(rootPath)
  };
}

/**
 * State tracking class for the spawned Python backend process.
 */
class PythonBackendController {
  constructor() {
    /** @type {import('child_process').ChildProcess | null} */
    this.process = null;
    this.pid = null;
    this.isReady = false;
    this.stderrBuffer = [];
    this.stdoutBuffer = [];
    this.exitCode = null;
    this.hasExited = false;
    this.exitError = null;
  }

  /**
   * Spawns the Python process with parent PID monitoring.
   * 
   * @param {Object} params
   * @param {string} params.pythonPath
   * @param {string} params.apiScript
   * @param {string} params.workingDir
   * @param {number} [params.port=8000]
   * @returns {import('child_process').ChildProcess}
   */
  start({ pythonPath, apiScript, workingDir, port = 8000 }) {
    if (!fileExists(pythonPath)) {
      throw new Error(`Python executable not found at: ${pythonPath}`);
    }
    if (!fileExists(apiScript)) {
      throw new Error(`FastAPI script not found at: ${apiScript}`);
    }

    const args = [
      apiScript,
      '--port', String(port),
      '--parent-pid', String(process.pid)
    ];

    console.log(`[Python Manager] Spawning: "${pythonPath}" with cwd: "${workingDir}"`);

    this.process = spawn(pythonPath, args, {
      cwd: workingDir,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONIOENCODING: 'utf-8'
      },
      shell: false
    });

    this.pid = this.process.pid;
    this.hasExited = false;
    this.exitCode = null;
    this.stderrBuffer = [];
    this.stdoutBuffer = [];

    this.process.stdout.on('data', (data) => {
      const text = data.toString('utf-8');
      this.stdoutBuffer.push(text);
      if (this.stdoutBuffer.length > 50) this.stdoutBuffer.shift();
      console.log(`[Python Backend]: ${text.trim()}`);
    });

    this.process.stderr.on('data', (data) => {
      const text = data.toString('utf-8');
      this.stderrBuffer.push(text);
      if (this.stderrBuffer.length > 50) this.stderrBuffer.shift();
      console.error(`[Python Backend Log]: ${text.trim()}`);
    });

    this.process.on('error', (err) => {
      console.error('[Python Manager Error]: Process failed to start or crashed:', err);
      this.exitError = err;
      this.hasExited = true;
    });

    this.process.on('exit', (code, signal) => {
      console.log(`[Python Manager] Process exited with code ${code} (signal: ${signal})`);
      this.hasExited = true;
      this.exitCode = code;
    });

    return this.process;
  }

  /**
   * Polls the backend health endpoint until responsive or timeout reached.
   * 
   * @param {string} [healthUrl='http://127.0.0.1:8000/health']
   * @param {number} [timeoutMs=15000]
   * @param {number} [intervalMs=300]
   * @returns {Promise<void>}
   */
  waitForHealth(healthUrl = 'http://127.0.0.1:8000/health', timeoutMs = 15000, intervalMs = 300) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const check = () => {
        // Immediate failure if child process exited or errored
        if (this.hasExited) {
          const stderrSummary = this.stderrBuffer.slice(-10).join('').trim();
          const detail = stderrSummary ? `\n\nStderr Output:\n${stderrSummary}` : '';
          return reject(new Error(
            `Python computational backend exited prematurely with code ${this.exitCode}.${detail}`
          ));
        }

        const req = http.get(healthUrl, (res) => {
          if (res.statusCode === 200) {
            this.isReady = true;
            resolve();
          } else {
            retry();
          }
        });

        req.on('error', () => {
          retry();
        });

        req.setTimeout(intervalMs * 2, () => {
          req.destroy();
          retry();
        });
      };

      const retry = () => {
        if (Date.now() - startTime > timeoutMs) {
          const stderrSummary = this.stderrBuffer.slice(-10).join('').trim();
          const detail = stderrSummary ? `\n\nLast output from backend:\n${stderrSummary}` : '';
          reject(new Error(`Timeout waiting for backend API at ${healthUrl} after ${timeoutMs}ms.${detail}`));
        } else {
          setTimeout(check, intervalMs);
        }
      };

      check();
    });
  }

  /**
   * Terminates the Python process and all child processes cleanly.
   * On Windows, uses taskkill /T /F to eliminate orphan worker processes.
   */
  stop() {
    if (!this.process || this.hasExited) {
      this.process = null;
      return;
    }

    const pid = this.pid;
    console.log(`[Python Manager] Terminating Python process tree (PID: ${pid})...`);

    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // Process might have already terminated
      }
    } else {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        try {
          this.process.kill('SIGTERM');
        } catch {
          // Ignore
        }
      }
    }

    this.process = null;
    this.hasExited = true;
    this.isReady = false;
  }
}

module.exports = {
  fileExists,
  dirExists,
  resolvePythonExecutable,
  resolveBackendPaths,
  PythonBackendController
};
