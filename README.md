# SuperCalcee

[![CI](https://github.com/MasterZ1311/SuperCalcee/actions/workflows/ci.yml/badge.svg)](https://github.com/MasterZ1311/SuperCalcee/actions/workflows/ci.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![Electron](https://img.shields.io/badge/electron-41-47848F.svg)](https://www.electronjs.org/)
[![Code Style: Ruff](https://img.shields.io/badge/code%20style-ruff-000000.svg)](https://github.com/astral-sh/ruff)
[![Type Checked: Mypy](https://img.shields.io/badge/type%20checked-mypy-blue.svg)](https://mypy-lang.org/)
[![Security: Audited](https://img.shields.io/badge/security-audited-success.svg)](docs/CI.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

SuperCalcee is an advanced, domain-aware scientific calculator and symbolic computation platform. Designed with a dual-stack architecture combining a **React 19 / Electron** desktop shell with a **FastAPI / SymPy** scientific Python backend, SuperCalcee provides physical unit validation, computer algebra system (CAS) capabilities, and domain-specific formula engines across multi-disciplinary fields.

---

## Key Features

* **Multi-Domain Calculation Engines**: Dedicated computational modules for Physics, Astrophysics, Chemistry, Biology, Computer Science, and Quantitative Finance.
* **Computer Algebra System (CAS)**: Symbolic differentiation, integration, algebraic root solving, and simplification powered by SymPy.
* **Dimensional Analysis & Physical Constants**: Enforces SI unit compatibility and integrates CODATA 2022 physical constants.
* **Modular Formula Section Store**: Browse, install, and execute domain-specific formula packs (e.g. Classical Mechanics, Thermodynamics, Corporate Finance, Geometry).
* **Custom Formula Builder**: Create, test, and save custom formulas with dynamic variable bindings.
* **Dynamic Scientific Keypad**: Context-sensitive keypad layouts configured for domain modes.

---

## System Architecture Overview

SuperCalcee decouples computational logic from frontend presentation via a 7-layer architecture:

```text
+-------------------------------------------------------------+
|                  React 19 / Electron Desktop Shell          |
+-------------------------------------------------------------+
                              |
                     REST API Transport (HTTP)
                              |
+-------------------------------------------------------------+
|                  FastAPI Scientific Backend Server          |
|  +-------------------------------------------------------+  |
|  | AST Parser & Logic Engine                             |  |
|  +-------------------------------------------------------+  |
|  | Dimensional Analysis Engine & CODATA Constants        |  |
|  +-------------------------------------------------------+  |
|  | SymPy Computer Algebra System (CAS) Engine            |  |
|  +-------------------------------------------------------+  |
|  | Formula Engine & Domain Modules (Physics, Finance...)   |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

For complete technical specifications, see the [Architecture Guide](docs/ARCHITECTURE.md).

---

## Documentation Index

All detailed documentation is organized inside the [`docs/`](docs/) directory:

* [Technical Architecture Guide](docs/ARCHITECTURE.md) - Deep dive into the 7-layer core engine and technology stack.
* [Setup & Execution Guide](docs/HOW_TO_RUN.md) - Step-by-step instructions to install, run, and package SuperCalcee.
* [Production Deployment Guide](docs/DEPLOYMENT.md) - Standalone desktop packaging, cloud container deployment (Docker), and web edge hosting.
* [Mobile Setup & Usage Guide](docs/MOBILE_GUIDE.md) - Run and use SuperCalcee on mobile devices via Wi-Fi LAN, PWA, and Capacitor.
* [Desktop UI Module Guide](docs/ELECTRON_FRONTEND.md) - React 19 and Electron architecture, UI components, and state management.
* [Scientific Backend Engine Guide](docs/PYTHON_BACKEND.md) - FastAPI REST API structure, SymPy CAS integration, and unit conversion services.
* [Continuous Integration (CI) Pipeline](docs/CI.md) - Automated regression testing, linters, formatting, type checking, and security scans.
* [Automated Testing Guide](docs/TESTING.md) - Comprehensive backend (pytest) and frontend (node:test) testing structure.
* [Domain Specifications](docs/SUPERCALCEE.md) - Mathematical and scientific equations across all domain modules.
* [Design Philosophy](docs/UNDERSTANDING_SUPERCALCEE.md) - Core architectural principles of dimensional awareness and symbolic exactness.
* [Development Roadmap](docs/FUTURE_SCOPE.md) - Future scope, feature milestones, and expansion objectives.
* [Refactor Walkthrough](docs/WALKTHROUGH.md) - Summary of modularization changes and repository updates.

---

## Quick Start

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/MasterZ1311/SuperCalcee.git
cd SuperCalcee

# Create canonical Python virtual environment at repository root
python -m venv venv

# Activate virtual environment
# Windows (PowerShell): .\venv\Scripts\activate  |  macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# Install Node frontend dependencies
npm install
```

### 2. Launch Desktop Application
```bash
# Launches both Vite and Electron (with auto-spawned Python backend)
npm start
```

For comprehensive instructions, production packaging, and troubleshooting, see [HOW_TO_RUN.md](docs/HOW_TO_RUN.md).

---

## License

This project is licensed under the MIT License.
