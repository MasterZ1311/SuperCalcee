# How to Run SuperCalcee

This document provides step-by-step instructions to set up, run, test, and package SuperCalcee on your local machine.

---

## Prerequisites

Ensure the following software is installed on your workstation:

* **Node.js**: Version 18.0.0 or higher (`node -v`)
* **npm**: Version 9.0.0 or higher (`npm -v`)
* **Python**: Version 3.10 or higher (`python --version`)
* **Git**: Version 2.30 or higher

---

## 1. Installation & Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/MasterZ1311/SuperCalcee.git
cd SuperCalcee
```

### Step 2: Set Up the Canonical Python Virtual Environment

SuperCalcee uses a single canonical virtual environment at the repository root (`<repo_root>/venv`). This environment powers the FastAPI computational backend, test suites, and standalone production packaging.

```bash
# 1. Create the virtual environment from the repository root:
python -m venv venv

# 2. Activate the virtual environment:
# On Windows (PowerShell):
.\venv\Scripts\activate

# On macOS / Linux:
source venv/bin/activate

# 3. Upgrade pip and install scientific backend dependencies:
pip install --upgrade pip
pip install -r requirements.txt
```

> [!NOTE]
> The Electron main process automatically detects virtual environments at `<root>/venv`, `<root>/.venv`, `<root>/src_python/venv`, or any environment specified via `PYTHON_PATH`.

### Step 3: Install Node.js Frontend Dependencies

You can install frontend dependencies directly from the repository root or inside `src_electron`:

```bash
# From repository root:
npm install

# OR navigate to src_electron:
cd src_electron
npm install
cd ..
```

---

## 2. Running SuperCalcee

### Option A: Unified Desktop Launch (Recommended)

This command concurrently starts the Vite dev server and launches Electron. Electron automatically discovers the canonical Python virtual environment, spawns the FastAPI server on port 8000 with parent-PID monitoring, waits for health confirmation, and opens the desktop interface.

```bash
# From repository root:
npm start

# OR from src_electron:
cd src_electron
npm start
```

### Option B: Separate Terminal Development

If you prefer inspecting backend server logs directly:

#### Terminal 1 — Python Backend API
```bash
# From repository root (with venv activated):
python src_python/api.py
```
*Backend initializes at `http://127.0.0.1:8000`. Swagger API docs are at `http://127.0.0.1:8000/docs`.*

#### Terminal 2 — React / Vite Dev Server
```bash
cd src_electron
npm run dev
```
*Access the web UI at `http://localhost:5173`.*

#### Terminal 3 — Electron Shell (Optional)
```bash
cd src_electron
npm run electron:start
```

### Option C: Mobile & Local Network (LAN) Launch

To run SuperCalcee and use it simultaneously from your smartphone or tablet over local Wi-Fi:

#### Terminal 1 — Python Backend on LAN (0.0.0.0:8000)
```bash
npm run backend:lan
```

#### Terminal 2 — Frontend Dev Server on LAN (0.0.0.0:5173)
```bash
npm run dev:lan
```
Vite will output your local network address (e.g. `http://192.168.1.50:5173`). Open that URL in your mobile browser!

For complete mobile setup, PWA installation, and custom endpoint details, see the [Mobile Setup & Usage Guide](MOBILE_GUIDE.md). For cloud hosting and packaging, see the [Deployment Guide](DEPLOYMENT.md).

---

## 3. Running Automated Tests

### Run Full Test Suite (Frontend + Backend)
```bash
# From repository root:
npm test
```

### Run Frontend Contract Tests (70 Tests)
```bash
# From repository root:
npm run test:frontend

# OR from src_electron:
cd src_electron
npm test
```

### Run Backend Pytest Suite (357 Tests)
```bash
# From repository root (with venv activated):
pytest -v
```

---

## 4. Production Packaging

To build a standalone desktop executable and portable bundle:

```bash
# 1. Ensure the canonical virtual environment exists and dependencies are installed:
.\venv\Scripts\activate
pip install -r requirements.txt

# 2. Build the client bundle and package the standalone desktop app:
# From repository root:
npm run package

# OR from src_electron:
cd src_electron
npm run package
```

The packaged distribution will be generated inside:
```text
src_electron/release/
```
The distribution includes:
* `SuperCalcee.exe` (main application binary)
* `resources/venv/` (bundled isolated Python runtime)
* `resources/src_python/` (scientific engine scripts and constants)
* `resources/app.asar` (compiled React application bundle)

---

## 5. Troubleshooting & FAQ

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Python Not Found" dialog** | Virtual environment missing or not located in searched paths | Run `python -m venv venv && pip install -r requirements.txt` at the repository root, or export `PYTHON_PATH=/path/to/python.exe`. |
| **Port 8000 already in use** | A previous Python instance is still running | The new process manager terminates stale processes automatically. You can also run `taskkill /IM python.exe /F` on Windows. |
| **Spaces in directory paths** | Path contains spaces (e.g. `C:\Program Files\...`) | SuperCalcee uses unquoted array arguments with `shell: false` to natively support spaces and non-ASCII characters. |
| **Orphan Python processes** | Electron was terminated abruptly | `api.py` includes a background parent-watchdog thread (`--parent-pid <PID>`) that automatically shuts down Python within 2 seconds if Electron exits. |
