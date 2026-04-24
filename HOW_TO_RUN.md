# ⚙️ How to Run SuperCalcee

This document provides step-by-step instructions to set up and run SuperCalcee on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (3.9 or higher)
- **Git**

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/MasterZ1311/SuperCalcee.git
cd SuperCalcee
```

### 2. Set Up the Python Backend
The backend handles all computational logic, including CAS, Physics, and Finance engines.

```bash
cd src_python
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sympy numpy pydantic
```

### 3. Set Up the Electron Frontend
The frontend provides the user interface and interacts with the Python API.

```bash
cd ../src_electron
# Install dependencies
npm install
```

---

## 🚀 Running the Application

SuperCalcee requires both the Backend and Frontend to be running simultaneously.

### Option A: Manual Start (Recommended for Debugging)

1.  **Start the Python API**:
    In one terminal, from `src_python`:
    ```bash
    python api.py
    ```
    The API will start at `http://127.0.0.1:8000`.

2.  **Start the Electron App**:
    In another terminal, from `src_electron`:
    ```bash
    npm run start
    ```
    This will launch the Vite development server and the Electron window.

### Option B: Unified Start (If configured)
If you have `concurrently` set up in the root or electron directory, you might be able to run:
```bash
npm run start
```

---

## 🧪 Testing the API

You can verify the backend is running by visiting:
`http://127.0.0.1:8000/docs`

This will open the Swagger UI, allowing you to test individual endpoints like `/cas/simplify` or `/units/convert`.

---

## 📦 Packaging for Production

To create a portable executable:

```bash
cd src_electron
npm run package
```
The resulting build will be located in the `src_electron/release` directory.

---

> [!NOTE]
> If you encounter `ENOENT` errors when running `npm run dev` from the root, ensure you are in the `src_electron` directory or that a root `package.json` exists to proxy the commands.
