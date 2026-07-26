# SuperCalcee Computational Backend Engine (Python Module)

> **Document Type:** Sub-Module Documentation (Backend & CAS Core Layer)  
> **Unique Purpose:** Exhaustive technical manual for the Python FastAPI computational engine, SymPy CAS integration, dimensional analysis middleware, CODATA database schema, and formula inversion algorithms.  
> **Navigation:** [Root README](file:///e:/Github/GitProjects/SuperCalcee/README.md) | [PRD & Blueprint](file:///e:/Github/GitProjects/SuperCalcee/SUPERCALCEE.md) | [Technical Deep-Dive](file:///e:/Github/GitProjects/SuperCalcee/understanding_supercalcee.md) | [Verification Log](file:///e:/Github/GitProjects/SuperCalcee/walkthrough.md) | [Frontend Guide](file:///e:/Github/GitProjects/SuperCalcee/src_electron/README.md)

---

## Directory Layout & Engine Modules

```
src_python/
├── api.py                    # FastAPI application, route handlers & middleware
├── requirements.txt          # Python dependencies (SymPy, FastAPI, NumPy, SciPy)
├── cas/                      # Computer Algebra System engine
│   ├── symbolic_engine.py    # SymPy symbolic wrapper (diff, integrate, solve, simplify)
│   └── ...
├── constants/                # Physical constants database
│   ├── codata.json           # CODATA 2022 dataset schema
│   └── loader.py             # Constant lookup & uncertainty management
├── units/                    # Dimensional analysis & unit conversion engine
│   └── dimensional.py        # Dimensional validation & exception enforcement
├── formula_engine/           # Inverse formula solver
│   └── solver.py             # Dynamic equation solver (sympy.solve for missing variable)
└── domains/                  # 6 Scientific domain logic engines
    ├── physics.py            # Relativity, quantum, mechanics equations
    ├── astrophysics.py       # Orbital mechanics, Schwarzschild radius, Drake eq.
    ├── chemistry.py          # Nernst, Gibbs energy, reaction kinetics
    ├── biology.py            # Michaelis-Menten, Hardy-Weinberg
    ├── finance.py            # NPV, IRR, WACC, Black-Scholes
    └── cs.py                 # Big-O calculation & Shannon entropy
```

---

## REST API Endpoint Reference

The backend operates locally on `http://127.0.0.1:8000`.

### Health Check
* **`GET /health`**
  * Response: `{"status": "ok", "engine": "SuperCalcee-Python-CAS"}`

### General CAS Execution
* **`POST /calculate`**
  * Payload: `{"expr": "diff(x^3 + 2*x, x)", "mode": "cas"}`
  * Response: `{"result": "3*x^2 + 2", "latex": "3 x^{2} + 2"}`

### Inverse Formula Solving
* **`POST /solve-formula`**
  * Payload: `{"formula_id": "black_scholes", "knowns": {"S": 100, "K": 100, "T": 1, "r": 0.05, "sigma": 0.2}, "target": "call_price"}`
  * Response: `{"target": "call_price", "value": 10.45058}`

### CODATA Constant Retrieval
* **`GET /constants/{symbol}`**
  * Response: `{"symbol": "c", "name": "speed of light in vacuum", "value": 299792458, "unit": "m s^-1", "exact": true}`

---

## Running the Backend Standalone

```bash
# Activate virtual environment
..\venv\Scripts\activate   # Windows
source ../venv/bin/activate # macOS/Linux

# Run with Uvicorn (hot-reloading enabled)
uvicorn api:app --reload --port 8000
```

Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.
