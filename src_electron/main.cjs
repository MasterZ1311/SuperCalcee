/**
 * SuperCalcee Electron Main Process Entrypoint
 * ============================================
 * 
 * Manages native window lifecycle, hardened security controls, IPC bridges,
 * and spawns the background Python computational API process (`src_python/api.py`).
 * 
 * Security Controls Implemented:
 *  - nodeIntegration: false (strictly disabled)
 *  - contextIsolation: true (renderer isolated from Node context)
 *  - sandbox: true (Chromium renderer sandbox enabled)
 *  - webSecurity: true (enforces SOP and CSP)
 *  - preload architecture with contextBridge
 *  - Navigation locking (prevents unauthorized navigation and redirection)
 *  - Window creation restriction (blocks window.open / target="_blank" popups)
 *  - External link sanitization via shell.openExternal
 *  - Permission request denial (camera, microphone, geolocation blocked)
 *  - IPC channel allowlist validation
 * 
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

const { app, BrowserWindow, ipcMain, shell, session, dialog } = require('electron');
const path = require('path');
const { isValidExternalUrl } = require('./src/security/urlValidator.cjs');
const {
    resolvePythonExecutable,
    resolveBackendPaths,
    PythonBackendController
} = require('./src/main/pythonManager.cjs');

/** @type {BrowserWindow | null} Reference to main Electron browser window */
let mainWindow = null;

/** @type {PythonBackendController} Controller managing Python backend process lifecycle */
const pythonController = new PythonBackendController();


/**
 * Creates and configures the main desktop application window with hardened security settings.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        title: "SuperCalcee — Multi-Domain Scientific Calculator"
    });

    // ------------------------------------------------------------------------
    // Security Control 1: Restrict In-Window Navigation
    // ------------------------------------------------------------------------
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const isDev = !app.isPackaged && !!process.env.VITE_DEV_SERVER_URL;
        try {
            const parsedUrl = new URL(navigationUrl);
            const devOrigin = process.env.VITE_DEV_SERVER_URL 
                ? new URL(process.env.VITE_DEV_SERVER_URL).origin 
                : 'http://localhost:5173';

            // Allow navigation to the dev server origin in development
            if (isDev && parsedUrl.origin === devOrigin) {
                return;
            }

            // Allow file protocol in production for local built assets
            if (!isDev && parsedUrl.protocol === 'file:') {
                return;
            }
        } catch {
            // Invalid URL format
        }

        // Cancel unauthorized navigation
        event.preventDefault();
        console.warn(`[Electron Security] Blocked unauthorized navigation attempt to: ${navigationUrl}`);
    });

    // ------------------------------------------------------------------------
    // Security Control 2: Restrict Navigation Redirects
    // ------------------------------------------------------------------------
    mainWindow.webContents.on('will-redirect', (event, navigationUrl) => {
        event.preventDefault();
        console.warn(`[Electron Security] Blocked redirect to external location: ${navigationUrl}`);
    });

    // ------------------------------------------------------------------------
    // Security Control 3: Prevent Arbitrary Window Creation (Popups / target="_blank")
    // ------------------------------------------------------------------------
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isValidExternalUrl(url)) {
            // Open validated external link in user's default external browser
            shell.openExternal(url).catch((err) => {
                console.error(`[Electron Security] Error opening external browser for ${url}:`, err.message);
            });
        } else {
            console.warn(`[Electron Security] Denied window creation for unverified URL: ${url}`);
        }
        return { action: 'deny' };
    });

    // In development, load from Vite server; in production, load built dist/index.html
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // Clean up window reference on close
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

/**
 * Configures application-wide session security policies and permission denials.
 */
function configureSessionSecurity() {
    // Deny all sensitive device permission requests (camera, microphone, geolocation, notifications)
    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
        console.warn(`[Electron Security] Denied device permission request for: '${permission}'`);
        callback(false);
    });
}

/**
 * Registers secure, allowlisted IPC message handlers.
 */
function registerIpcHandlers() {
    // Retrieve application version
    ipcMain.handle('app:get-version', () => {
        return app.getVersion();
    });

    // Retrieve operating system platform
    ipcMain.handle('app:get-platform', () => {
        return process.platform;
    });

    // Safely open validated external links in default browser
    ipcMain.handle('app:open-external-url', async (_event, targetUrl) => {
        if (!isValidExternalUrl(targetUrl)) {
            console.warn(`[Electron Security] Rejected openExternal for invalid URL: ${targetUrl}`);
            return { success: false, error: 'Invalid or prohibited external URL scheme.' };
        }
        try {
            await shell.openExternal(targetUrl);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // Query backend server readiness status
    ipcMain.handle('app:check-backend-status', () => {
        return { ready: pythonController.isReady, port: 8000 };
    });
}

/**
 * Initializes and starts the Python computational API service.
 * Handles path resolution, early crash detection, health polling, and user error dialogs.
 */
async function initializeBackend() {
    console.log("[Electron Main] Resolving Python Computational Backend...");

    const rootPath = path.resolve(path.join(__dirname, '..'));
    const isPackaged = app.isPackaged;
    const resourcesPath = process.resourcesPath;

    // 1. Discover Python executable
    const { pythonPath, source, searchedPaths } = resolvePythonExecutable({
        isPackaged,
        resourcesPath,
        rootPath
    });

    if (!pythonPath) {
        console.error("[Electron Main] Python executable discovery failed. Searched:", searchedPaths);
        dialog.showErrorBox(
            "SuperCalcee Backend Error: Python Not Found",
            `Unable to locate a compatible Python interpreter for the computational engine.\n\n` +
            `Searched locations:\n${searchedPaths.map(p => `  • ${p}`).join('\n')}\n\n` +
            `To resolve this issue:\n` +
            `1. Create the canonical virtual environment at the repository root:\n` +
            `   python -m venv venv\n\n` +
            `2. Install backend scientific dependencies:\n` +
            `   pip install -r requirements.txt\n\n` +
            `3. Or set the PYTHON_PATH environment variable to point to your python.exe.`
        );
        app.quit();
        return;
    }

    console.log(`[Electron Main] Discovered Python interpreter via [${source}]: ${pythonPath}`);

    // 2. Resolve script and working directory
    const { apiScript, workingDir } = resolveBackendPaths({
        isPackaged,
        resourcesPath,
        rootPath
    });

    // 3. Spawn Python process
    try {
        pythonController.start({
            pythonPath,
            apiScript,
            workingDir,
            port: 8000
        });
    } catch (err) {
        console.error("[Electron Main Error] Failed to launch Python backend process:", err);
        dialog.showErrorBox(
            "SuperCalcee Backend Launch Failure",
            `Failed to start the background computational process.\n\n${err.message}`
        );
        app.quit();
        return;
    }

    // 4. Poll health check with 15-second timeout and early crash interception
    try {
        console.log("[Electron Main] Polling Python API health check on http://127.0.0.1:8000/health...");
        await pythonController.waitForHealth("http://127.0.0.1:8000/health", 15000, 300);
        console.log("[Electron Main] Python Backend healthy and responsive. Launching desktop UI.");
        createWindow();
    } catch (err) {
        console.error("[Electron Main Error] Backend startup failed or timed out:", err);
        dialog.showErrorBox(
            "SuperCalcee Backend Connection Failure",
            `The computational backend failed to become responsive.\n\n${err.message}\n\n` +
            `Please ensure the required Python packages are installed:\n` +
            `  pip install -r requirements.txt\n\n` +
            `You can also inspect the logs or run 'python src_python/api.py' directly to check for syntax or environment errors.`
        );
        pythonController.stop();
        app.quit();
    }
}

// Application readiness lifecycle listener
app.on('ready', async () => {
    configureSessionSecurity();
    registerIpcHandlers();
    await initializeBackend();
});

// Quit application when all windows are closed (except macOS Darwin convention)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Cleanly terminates the Python process tree to eliminate orphan processes.
 */
function cleanupBackend() {
    pythonController.stop();
}

// Clean shutdown listeners
app.on('before-quit', cleanupBackend);
app.on('will-quit', cleanupBackend);
app.on('quit', cleanupBackend);

process.on('SIGINT', () => {
    cleanupBackend();
    process.exit(0);
});

process.on('SIGTERM', () => {
    cleanupBackend();
    process.exit(0);
});

