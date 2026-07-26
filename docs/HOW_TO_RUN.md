# How to Run SuperCalcee

This document provides step-by-step instructions to set up, run, and package SuperCalcee on your local machine.

---

## Prerequisites

Ensure you have the following software installed before proceeding:

* **Node.js**: Version 18.0.0 or higher
* **npm**: Version 9.0.0 or higher
* **Python**: Version 3.10 or higher
* **Git**: Version 2.30 or higher

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MasterZ1311/SuperCalcee.git
cd SuperCalcee
```

### 2. Set Up the Python Backend

The backend provides the Computer Algebra System (CAS), unit conversion, and scientific calculation services.

```bash
# Navigate to the Python backend directory
cd src_python

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\activate

# On macOS / Linux:
source venv/bin/activate

# Install required Python dependencies
pip install -r requirements.txt
```

### 3. Set Up the Electron & React Frontend

The frontend provides the desktop UI shell and formula store interface.

```bash
# Navigate to the Electron frontend directory
cd ../src_electron

# Install Node.js dependencies
npm install
```

---

## Running the Application

Both the Python API backend and the Electron frontend must be running to enable full functionality.

### Development Mode

#### Step 1: Start the Backend API
In your first terminal window (from `src_python` directory with virtual environment activated):

```bash
python api.py
```
The FastAPI backend will initialize at `http://127.0.0.1:8000`.

#### Step 2: Start the Electron Application
In your second terminal window (from `src_electron` directory):

```bash
npm run dev
```
This command starts the Vite development server and launches the Electron application shell.

---

## API Verification

You can interactively test and verify all Python backend REST endpoints by navigating to:

```text
http://127.0.0.1:8000/docs
```

This page opens the automated OpenAPI / Swagger documentation, allowing you to test endpoints such as `/cas/simplify`, `/cas/differentiate`, and `/constants`.

---

## Production Packaging

To build a standalone desktop executable package:

```bash
cd src_electron
npm run package
```

The production installer and packaged binaries will be generated inside the `src_electron/release` directory.
