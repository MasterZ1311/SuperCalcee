const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: "SuperCalcee"
    });

    const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`;
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startPythonBackend() {
    console.log("Starting Python Backend...");
    
    // In production, this would point to the bundled executable
    // In dev, we use the venv python
    const pythonExecutable = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
    const apiScript = path.join(__dirname, '..', 'src_python', 'api.py');

    pythonProcess = spawn(pythonExecutable, [apiScript], {
        // detached: false
    });

    pythonProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        console.log(`[Python Backend]: ${msg}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        console.error(`[Python Backend Error]: ${msg}`);
    });
}

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
                reject(new Error("Timeout waiting for backend"));
            } else {
                setTimeout(check, intervalMs);
            }
        }
        
        check();
    });
}

app.on('ready', async () => {
    startPythonBackend();
    try {
        console.log("Waiting for Python API on port 8000...");
        await waitForBackend("http://127.0.0.1:8000/", 10000, 500);
        console.log("Backend is ready. Creating window.");
        createWindow();
    } catch (err) {
        console.error("Failed to start or connect to backend:", err);
        app.quit();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
