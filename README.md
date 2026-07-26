# SuperCalcee

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
* [Desktop UI Module Guide](docs/ELECTRON_FRONTEND.md) - React 19 and Electron architecture, UI components, and state management.
* [Scientific Backend Engine Guide](docs/PYTHON_BACKEND.md) - FastAPI REST API structure, SymPy CAS integration, and unit conversion services.
* [Domain Specifications](docs/SUPERCALCEE.md) - Mathematical and scientific equations across all domain modules.
* [Design Philosophy](docs/UNDERSTANDING_SUPERCALCEE.md) - Core architectural principles of dimensional awareness and symbolic exactness.
* [Development Roadmap](docs/FUTURE_SCOPE.md) - Future scope, feature milestones, and expansion objectives.
* [Refactor Walkthrough](docs/WALKTHROUGH.md) - Summary of modularization changes and repository updates.

---

## Quick Start

### 1. Backend Setup
```bash
cd src_python
python -m venv venv
# Windows: .\venv\Scripts\activate  |  macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python api.py
```

### 2. Frontend Setup
```bash
cd src_electron
npm install
npm run dev
```

For detailed setup instructions and production packaging guidance, refer to [HOW_TO_RUN.md](docs/HOW_TO_RUN.md).

---

## License

This project is licensed under the MIT License.
