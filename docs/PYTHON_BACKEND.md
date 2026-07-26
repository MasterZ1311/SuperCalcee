# SuperCalcee Scientific Engine (Python Backend)

This directory houses the high-performance scientific backend for SuperCalcee, implemented using FastAPI, SymPy, NumPy, and Pydantic.

---

## Directory Architecture

```text
src_python/
├── api.py                  # FastAPI REST server & endpoint routers
├── requirements.txt        # Python package dependencies
├── README.md               # Backend documentation
├── cas/                    # Computer Algebra System engine
│   └── symbolic_engine.py  # SymPy integration (differentiation, integration, solve)
├── constants/              # CODATA constants management
│   ├── loader.py           # Constants lookup and search utility
│   └── codata.json         # Raw CODATA physical values database
├── domains/                # Domain-specific calculation engines
│   ├── astrophysics.py     # Orbital mechanics, stellar dynamics, black holes
│   ├── biology.py          # Population genetics, enzyme kinetics
│   ├── chemistry.py        # Solution chemistry, stoichiometry, gas laws
│   ├── cs.py               # Information theory, time complexity, cryptography
│   ├── finance.py          # Options pricing, NPV, IRR, loan amortization
│   └── physics.py          # Classical mechanics, electromagnetism, optics
├── formula_engine/         # Dynamic formula solver
│   └── solver.py           # Variable isolation and equation evaluation engine
├── parser/                 # Mathematical parser
│   └── ast_parser.py       # AST transformation and mathematical validation
└── units/                  # Dimensional analysis engine
    └── dimensional.py      # Unit conversion and dimension checking
```

---

## Core API Endpoints

### 1. Computer Algebra System (`/cas`)
* `POST /cas/simplify`: Algebraically simplify a symbolic expression.
* `POST /cas/differentiate`: Compute symbolic derivative with respect to a variable.
* `POST /cas/integrate`: Compute definite or indefinite symbolic integral.
* `POST /cas/solve`: Find algebraic roots of symbolic equations.

### 2. Dimensional Units & Constants (`/units` & `/constants`)
* `GET /constants`: Retrieve all supported physical constants.
* `POST /units/convert`: Convert numerical quantities between compatible SI units.

### 3. Dynamic Formula Solver (`/formula`)
* `POST /formula/solve`: Calculate missing target variables given input values and a formula string.

---

## Execution Instructions

```bash
# Activate virtual environment
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Launch backend API server
python api.py
```
Backend services will start on `http://127.0.0.1:8000`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.
