/**
 * SuperCalcee Electron Main Process Entrypoint
 * ============================================
 * 
 * Manages native window lifecycle, IPC bridges, and spawns the background Python
 * computational API process (`src_python/api.py`).
 * 
 * Lifecycle Overview:
 *  1. `app.on('ready')`: Spawns Python process and waits for http://127.0.0.1:8000/ health check.
 *  2. `createWindow()`: Instantiates browser window rendering Vite/React frontend.
 *  3. `app.on('quit')`: Gracefully terminates background Python subprocess.
 * 
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

/** @type {BrowserWindow | null} Reference to main Electron browser window */
let mainWindow = null;

/** @type {import('child_process').ChildProcess | null} Reference to spawned Python API child process */
let pythonProcess = null;

/**
 * Creates and configures the main desktop application window.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: "SuperCalcee — Multi-Domain Scientific Calculator"
    });

    // In development, load from Vite server; in production, load built dist index.html
    const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`;
    mainWindow.loadURL(startUrl);

    // Garbage collect window reference on close
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

/**
 * Spawns the Python FastAPI backend process using the virtual environment interpreter.
 */
function startPythonBackend() {
    console.log("[Electron Main] Launching Python Computational Backend...");
    
    // Resolve absolute paths to Python executable and FastAPI main entrypoint
    const pythonExecutable = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
    const apiScript = path.join(__dirname, '..', 'src_python', 'api.py');

    pythonProcess = spawn(pythonExecutable, [apiScript], {
        cwd: path.join(__dirname, '..')
    });

    // Log standard output from Python process
    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python Backend]: ${data.toString().trim()}`);
    });

    // Log standard error output from Python process
    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python Backend Log]: ${data.toString().trim()}`);
    });
}

/**
 * Polls an HTTP endpoint asynchronously until a HTTP 200 OK status is received or timeout is reached.
 * 
 * @param {string} url - Target HTTP endpoint URL (e.g., http://127.0.0.1:8000/).
 * @param {number} timeoutMs - Maximum duration in milliseconds to wait before rejecting.
 * @param {number} intervalMs - Polling delay between consecutive ping requests.
 * @returns {Promise<void>} Resolves when endpoint becomes responsive.
 */
function waitForBackend(url, timeoutMs, intervalMs) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            http.get(url, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    retry();
                }
            }).on('error', retry);
        }

        function retry() {
            if (Date.now() - startTime > timeoutMs) {
                reject(new Error(`Timeout waiting for backend API at ${url}`));
            } else {
                setTimeout(check, intervalMs);
            }
        }
        
        check();
    });
}

// Application readiness lifecycle listener
app.on('ready', async () => {
    startPythonBackend();
    try {
        console.log("[Electron Main] Polling Python API health on port 8000...");
        await waitForBackend("http://127.0.0.1:8000/", 10000, 500);
        console.log("[Electron Main] Python Backend ready. Creating application window.");
        createWindow();
    } catch (err) {
        console.error("[Electron Main Error] Failed to start or connect to Python backend:", err);
        app.quit();
    }
});

// Quit application when all windows are closed (except macOS Darwin convention)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Kill background Python child process when Electron application exits
app.on('quit', () => {
    if (pythonProcess) {
        console.log("[Electron Main] Terminating Python process...");
        pythonProcess.kill();
    }
});
