# SuperCalcee: Universal Computational Engine

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/MasterZ1311/SuperCalcee)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#system-requirements--prerequisites)
[![Tech Stack](https://img.shields.io/badge/stack-Electron%20%7C%20React%20%7C%20Python%20%7C%20FastAPI-orange.svg)](#technology-stack)
[![Formula Engine](https://img.shields.io/badge/formula%20packages-SymPy%20%7C%20SciPy%20%7C%20NumPy%20%7C%20Math.js-brightgreen.svg)](#formula-packages--mathematical-libraries)

> **SuperCalcee** is an offline-first universal computational universe interface. It unifies Symbolic Computer Algebra (CAS), dimensional unit analysis, CODATA 2022 physical constants, inverse formula solving, and 6 scientific domain engines into a single desktop application with an Apple-inspired UI.

---

## Table of Contents

1. [Latest Code Changes & Implementation Highlights](#latest-code-changes--implementation-highlights)
2. [Formula Packages & Mathematical Libraries](#formula-packages--mathematical-libraries)
3. [System Requirements & Prerequisites](#system-requirements--prerequisites)
4. [Installation Guide: Formula Packages & Dependencies](#installation-guide-formula-packages--dependencies)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Python Backend & Formula Packages Setup](#2-python-backend--formula-packages-setup)
   - [3. Frontend Application & MathJS Packages Setup](#3-frontend-application--mathjs-packages-setup)
   - [4. Verification of Installed Formula Packages](#4-verification-of-installed-formula-packages)
5. [Running the Application](#running-the-application)
6. [Project Architecture & Directory Map](#project-architecture--directory-map)
7. [Domain Modules & Formula Solvers](#domain-modules--formula-solvers)
8. [Computational Reproducibility & Offline Engine](#computational-reproducibility--offline-engine)
9. [Testing & QA Verification](#testing--qa-verification)
10. [Documentation Map (Unique Cause of Each File)](#documentation-map-unique-cause-of-each-file)
11. [License & Citation](#license--citation)

---

## Latest Code Changes & Implementation Highlights

The SuperCalcee repository has undergone key structural and technical implementations to enable an offline-first dual-stack engine architecture:

### Backend Code Enhancements (`src_python/`)
- **FastAPI Core Service (`src_python/api.py`):** Added comprehensive OpenAPI endpoints (`/calculate`, `/solve-formula`, `/logic`, `/convert-units`, `/big-o`, `/constants`) with CORS middleware and pydantic request validation models.
- **Symbolic CAS Engine (`src_python/cas/symbolic_engine.py`):** Wrapped `SymPy` to enable implicit multiplication parsing (`2x -> 2*x`), exact symbolic differentiation, integration, Taylor limits, matrix algebra, and equation solving.
- **Dynamic Formula Inverter (`src_python/formula_engine/solver.py`):** Implemented algebraic root-finding (`sympy.solve`) allowing multi-variable formula inversion without manual rearrangement.
- **CODATA 2022 Database (`src_python/constants/`):** Embedded local JSON database of physical constants (speed of light $c$, Planck $h$, Avogadro $N_A$, etc.) complete with values, SI units, exactness flags, and uncertainties.
- **Dimensional Safety Middleware (`src_python/units/`):** Created SI base unit mapping ($m, kg, s, A, K, mol, cd$) to throw runtime errors on physically impossible operations (e.g. $Joules + Watts$).
- **6 Domain Modules (`src_python/domains/`):** Modular engines for Physics ($E=mc^2$, Heisenberg), Astrophysics (Schwarzschild, Kepler, Drake), Chemistry (Nernst, Gibbs), Biology (Michaelis-Menten, Hardy-Weinberg), Finance (NPV, IRR, Black-Scholes), and CS (Big-O analysis, Shannon entropy).

### Frontend Code Enhancements (`src_electron/`)
- **Electron Main Process (`src_electron/main.cjs`):** Configured automated Python process management (`child_process.spawn`). Spawns `api.py` in the background bound to `127.0.0.1:8000`, polls `/health` for readiness, and handles graceful termination upon exit.
- **React 19 + Vite 6 UI (`src_electron/src/`):** Developed glassmorphism dark-mode UI with dynamic sidebar navigation (`Sidebar.jsx`), real-time calculation display (`Display.jsx`), mathematical keypad (`Keypad.jsx`), and interactive formula solver modal (`FormulaModal.jsx`).
- **MathJS & Lucide Integration:** Integrated `mathjs` on the client for lightweight client-side expression formatting and `lucide-react` for scientific domain icons.

---

## Formula Packages & Mathematical Libraries

SuperCalcee relies on specialized open-source mathematical packages to execute symbolic, numerical, financial, and logical operations:

### Python Backend Formula Packages

| Package Name | Min Version | Primary Mathematical Function / Usage in SuperCalcee |
|---|---|---|
| **`sympy`** | `^1.12` | **Symbolic Computer Algebra System (CAS):** Factorization, expansion, limits, symbolic differentiation, integration, differential equations, expression parsing, matrix algebra, and dynamic equation solving. |
| **`numpy`** | `^1.24.0` | **Numerical Array Computing:** High-performance vector operations, array manipulation, numerical evaluation, and matrix transformations. |
| **`scipy`** | `^1.10.0` | **Advanced Scientific Computing:** Special functions (Gamma, Zeta, Bessel, Airy), numerical integration (`quad`), root-finding algorithms (Newton-Raphson), and optimization routines. |
| **`numpy-financial`** | `^1.0.0` | **Financial Formula Engine:** Net Present Value (`npv`), Internal Rate of Return (`irr`), payment calculations (`pmt`), and compound interest calculations. |
| **`pydantic`** | `^2.0.0` | **Data Schema Validation:** Enforces mathematical input validation and payload safety for REST API endpoints. |
| **`fastapi`** | `^0.100.0` | **High-Performance API Framework:** Serves computational requests locally with JSON serialization. |
| **`uvicorn`** | `^0.22.0` | **ASGI Server:** Runs the local backend server bound to loopback `127.0.0.1:8000`. |

### JavaScript / React Frontend Formula Packages

| Package Name | Min Version | Primary Function in SuperCalcee Desktop UI |
|---|---|---|
| **`mathjs`** | `^15.2.0` | **Client-Side Expression Engine:** Real-time syntax validation, mathematical string formatting, and client-side arithmetic fallback. |
| **`lucide-react`** | `^1.8.0` | **Domain UI Iconography:** Renders vector icons for scientific domains. |
| **`react` & `react-dom`** | `^19.2.5` | **User Interface Framework:** Responsive state management and component rendering. |
| **`electron`** | `^41.2.1` | **Desktop Wrapper & IPC:** Cross-platform native window rendering and background Python sidecar process orchestration. |

---

## System Requirements & Prerequisites

* **Operating System:** Windows 10/11 (64-bit), macOS 12+ (Intel/Apple Silicon), or Linux (Ubuntu 20.04+)
* **Node.js Environment:** Node.js `v18.0.0` or higher & `npm v9.0.0` or higher
* **Python Environment:** Python `3.10`, `3.11`, or `3.12` (Python 3.12 recommended)
* **Hardware:** 4 GB RAM minimum (8 GB recommended), 500 MB disk space

---

## Installation Guide: Formula Packages & Dependencies

Follow these step-by-step instructions to set up the environment and install all Python formula packages and Node modules.

### 1. Clone Repository

```bash
git clone https://github.com/MasterZ1311/SuperCalcee.git
cd SuperCalcee
```

---

### 2. Python Backend & Formula Packages Setup

Create an isolated Python virtual environment and install all mathematical packages (`sympy`, `scipy`, `numpy`, `numpy-financial`, `fastapi`, `uvicorn`).

#### Step 2.1: Create Virtual Environment

```bash
# In the repository root directory:
python -m venv venv
```

#### Step 2.2: Activate Virtual Environment

* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Windows (Command Prompt):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```
* **macOS / Linux (Bash/Zsh):**
  ```bash
  source venv/bin/activate
  ```

#### Step 2.3: Upgrade Package Installer (`pip`)

```bash
python -m pip install --upgrade pip setuptools wheel
```

#### Step 2.4: Install Formula Packages via `requirements.txt`

```bash
# Option A: Install from root requirements.txt
pip install -r requirements.txt

# Option B: Install from backend directory requirements.txt
pip install -r src_python/requirements.txt
```

#### Alternative Step 2.4: Direct Command Installation of Formula Packages

If installing packages individually or troubleshooting:

```bash
pip install sympy numpy scipy numpy-financial fastapi uvicorn pydantic pytest
```

---

### 3. Frontend Application & MathJS Packages Setup

Navigate to the desktop application directory and install Node.js dependencies including `mathjs`, `lucide-react`, `electron`, and `vite`.

```bash
cd src_electron

# Install Node modules and frontend formula libraries
npm install
```

If installing frontend formula packages manually:

```bash
npm install mathjs lucide-react react react-dom
npm install --save-dev electron vite concurrently wait-on cross-env electron-builder
```

---

### 4. Verification of Installed Formula Packages

Validate that all formula packages are successfully installed and operational:

#### Verify Python Formula Packages

```bash
# Run standalone verification command
python -c "import sympy, numpy, scipy, numpy_financial, fastapi; print('All Python Formula Packages Verified Successfully!')"
```

#### Verify Frontend Packages & Electron Build

```bash
cd src_electron
npm run build
```

---

## Running the Application

### Method 1: Single Command Launch (Recommended)

From the `src_electron` directory, execute:

```bash
npm start
```

**How it works:**
1. Concurrently starts the Vite dev server for React (`http://localhost:5173`).
2. Waits for Vite to respond using `wait-on`.
3. Electron launches `main.cjs`, which automatically spawns `src_python/api.py` in the background bound to `http://127.0.0.1:8000`.
4. Polls `http://127.0.0.1:8000/health` until ready, then displays the frameless application UI.

---

### Method 2: Independent Sub-System Execution (Debugging)

#### Run Backend API Separately:
```bash
# Terminal 1: Python Backend
..\venv\Scripts\activate   # Windows
uvicorn src_python.api:app --reload --port 8000
```
* Interactive API Documentation: `http://127.0.0.1:8000/docs`

#### Run Frontend Separately:
```bash
# Terminal 2: React Desktop Frontend
cd src_electron
npm run dev
```

---

## Project Architecture & Directory Map

```
SuperCalcee/
├── README.md                      # [Root Portal] Primary guide & formula installation steps
├── SUPERCALCEE.md                 # [PRD & Blueprint] Master product requirement specification
├── understanding_supercalcee.md   # [Technical Manual] Architectural deep-dive & risk matrix
├── walkthrough.md                 # [Verification Log] QA checklist & runtime verification results
├── requirements.txt               # [Python Spec] Formula packages & backend dependencies
│
├── src_electron/                  # [Frontend Desktop App Sub-System]
│   ├── main.cjs                   # Electron main process & Python sidecar manager
│   ├── index.html                 # App HTML shell
│   ├── package.json               # Node dependencies (mathjs, react, electron, vite)
│   ├── vite.config.js             # Vite bundler configuration
│   └── src/                       # React 19 source code
│       ├── App.jsx                # Core state coordinator & API router
│       ├── index.css              # Glassmorphism dark mode stylesheet
│       └── components/            # Sidebar, Display, Keypad, FormulaModal
│
└── src_python/                    # [Backend Computational Core Sub-System]
    ├── api.py                     # FastAPI REST server & OpenAPI schemas
    ├── requirements.txt           # Python formula packages (sympy, scipy, numpy)
    ├── cas/                       # Symbolic CAS Engine (sympy wrapper)
    ├── constants/                 # CODATA 2022 physical constants database
    ├── units/                     # Dimensional analysis & unit conversion engine
    ├── formula_engine/            # Dynamic equation solver (sympy.solve)
    ├── parser/                    # Logic AST parser & implicit multiplication
    └── domains/                   # Scientific domain modules
        ├── physics.py             # Relativity, quantum, mechanics
        ├── astrophysics.py        # Orbital mechanics, Schwarzschild, Drake
        ├── chemistry.py           # Nernst, Gibbs energy, kinetics
        ├── biology.py             # Michaelis-Menten, Hardy-Weinberg
        ├── finance.py             # NPV, IRR, Black-Scholes
        └── cs.py                  # Big-O complexity & Shannon entropy
```

---

## Domain Modules & Formula Solvers

| Domain | Implemented Formula / Operation | Input / Request Example | Output / Capability |
|---|---|---|---|
| **Symbolic CAS** | Differentiation, Integration, Limits | `expr: "sin(x)*exp(x)", var: "x"` | Symbolic derivative `exp(x)*sin(x) + exp(x)*cos(x)` |
| **Physics** | Mass-Energy Equivalence ($E=mc^2$) | `m = 2.5 kg` | $E = 2.2469 \times 10^{17} \text{ Joules}$ |
| **Astrophysics** | Schwarzschild Radius ($R_s = \frac{2GM}{c^2}$) | `M = 1.989e30 kg` (Solar Mass) | $R_s = 2953.25 \text{ meters}$ |
| **Chemistry** | Nernst Cell Potential ($E = E^\circ - \frac{RT}{zF} \ln Q$) | `E0 = 1.1, T = 298.15, z = 2, Q = 0.01` | $E = 1.159 \text{ Volts}$ |
| **Biology** | Michaelis-Menten Kinetics ($v = \frac{V_{\max}[S]}{K_m + [S]}$) | `Vmax = 100, Km = 5, S = 10` | Velocity $v = 66.67 \text{ mmol/s}$ |
| **Finance** | Net Present Value (NPV) & Black-Scholes | `rate: 0.08, cashflows: [-1000, 300, 400, 500]` | $\text{NPV} = \$48.02$ |
| **Computer Science** | Asymptotic Big-O Analysis & Entropy | `f(n): "n*log(n)", g(n): "n^2"` | $\mathcal{O}(n \log n)$ bounds verified |

---

## Computational Reproducibility & Offline Engine

SuperCalcee adheres to strict computational reproducibility standards:
1. **Air-Gapped Privacy:** 100% offline execution. No external data transmitted; backend operates strictly on local loopback `127.0.0.1`.
2. **Standardized Constants:** Physical constants follow CODATA 2022 values with exact flags and standard uncertainties.
3. **Deterministic Symbolic Compute:** Algebraic simplification precedes floating-point evaluation to prevent rounding error drift.

---

## Testing & QA Verification

Execute backend test suites to verify formula packages and API endpoints:

```bash
# Run pytest verification
cd src_python
..\venv\Scripts\activate
pytest
```

For complete verification reports, refer to [walkthrough.md](file:///e:/Github/GitProjects/SuperCalcee/walkthrough.md).

---

## Documentation Map (Unique Cause of Each File)

| Document File | Unique Cause / Primary Purpose | Target Reader |
|---|---|---|
| [README.md](file:///e:/Github/GitProjects/SuperCalcee/README.md) | **Root Portal:** Latest code changes, formula package installation steps, system requirements, and execution setup. | All Developers & Users |
| [SUPERCALCEE.md](file:///e:/Github/GitProjects/SuperCalcee/SUPERCALCEE.md) | **PRD & Blueprint:** Master product requirements, system layers, strategic vision, and roadmap. | Product Architects |
| [understanding_supercalcee.md](file:///e:/Github/GitProjects/SuperCalcee/understanding_supercalcee.md) | **Technical Manual:** Exhaustive architectural breakdown, risk matrix, and formula inversion mechanics. | Core Engine Developers |
| [walkthrough.md](file:///e:/Github/GitProjects/SuperCalcee/walkthrough.md) | **Verification Log:** Completed features checklist, runtime API test results, and electron-builder packaging rules. | QA Engineers |
| [src_electron/README.md](file:///e:/Github/GitProjects/SuperCalcee/src_electron/README.md) | **Frontend App Guide:** React UI components, Electron main process, IPC bridge, and Vite build pipeline. | Frontend Engineers |
| [src_python/README.md](file:///e:/Github/GitProjects/SuperCalcee/src_python/README.md) | **Backend Engine Guide:** FastAPI endpoints, SymPy solver architecture, CODATA database schema, and unit conversion rules. | Backend Engineers |

---

## License & Citation

### License
Distributed under the **MIT License**. See `LICENSE` for details.

### Citation
```bibtex
@software{SuperCalcee2026,
  author = {Sivakumar (MasterZ1311)},
  title = {SuperCalcee: Universal Computational Engine and Scientific Domain Interface},
  url = {https://github.com/MasterZ1311/SuperCalcee},
  version = {1.0.0},
  year = {2026}
}
```

---

<p align="center">
  <b>SuperCalcee</b> — <i>A Computational Universe Interface.</i>
</p>
