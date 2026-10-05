# SuperCalcee Testing Guide & Baseline Test Suite Documentation

**Document Version:** 1.0.0  
**Updated:** 2026-09-22  
**Status:** Baseline Established

---

## 1. Overview

This document provides complete instructions for executing the automated baseline test suites for SuperCalcee across both the Python computational backend and the React / Electron frontend.

---

## 2. Expected Environment & Prerequisites

### Backend Environment
* **Python**: Version 3.10, 3.11, 3.12, or 3.13.
* **Core Dependencies**:
  * `pytest>=7.0.0`
  * `fastapi>=0.100.0`
  * `httpx` (for FastAPI `TestClient`)
  * `sympy>=1.12`
  * `numpy>=1.24.0`
  * `scipy>=1.10.0`
  * `pydantic>=2.0.0`

### Frontend Environment
* **Node.js**: Version 18.0.0 or higher (Tested on Node.js v22.19.0).
* **Test Runner**: Node.js built-in native test runner (`node:test` and `node:assert`).
* **Package Manager**: `npm` v9.0.0 or higher.

---

## 3. How to Run Tests

### A. How to Run Backend Tests

From the repository root (`SuperCalcee/`):

```bash
# Run all backend pytest suites with verbose output
python -m pytest -v

# Run a specific test suite (e.g., CAS Engine)
python -m pytest tests/test_cas.py -v

# Run with short traceback and summary
python -m pytest -q
```

### B. How to Run Frontend Tests

From the frontend directory (`src_electron/`):

```bash
cd src_electron

# Run all frontend unit tests
npm test

# Alternatively, run directly with node
node --test test/**/*.test.js
```

Or from the repository root:

```bash
npm test --prefix src_electron
```

### C. How to Run All Tests (Combined)

On Windows (PowerShell):

```powershell
python -m pytest; npm test --prefix src_electron
```

On Linux / macOS (Bash):

```bash
python -m pytest && npm test --prefix src_electron
```

---

## 4. Test Suite Categorization

### Backend Test Suites (`tests/`)

| Test File | Target Module | Scope & Invariants Tested | Total Tests |
| :--- | :--- | :--- | :---: |
| [`test_cas.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_cas.py) | `src_python/cas/symbolic_engine.py` | Algebraic simplification, differentiation, integration, limits, polynomial factoring, binomial expansion, equation root finding, malformed inputs, unbalanced brackets. | 19 |
| [`test_units.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_units.py) | `src_python/units/dimensional.py` | SI conversions (length, speed, time, mass), incompatible unit dimensional error checking, unknown units, malformed syntax. | 9 |
| [`test_physics.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_physics.py) | `src_python/domains/physics.py` | Mass-energy equivalence ($E=mc^2$), Heisenberg uncertainty principle bound, Newton's Second Law ($F=ma$), zero denominators, negative values, boundary conditions. | 16 |
| [`test_astrophysics.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_astrophysics.py) | `src_python/domains/astrophysics.py` | Schwarzschild event horizon radius, Kepler's Third Law orbital mechanics, Drake equation for communicative civilizations. | 8 |
| [`test_chemistry.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_chemistry.py) | `src_python/domains/chemistry.py` | Nernst equation reduction potentials, invalid reaction quotients ($Q \le 0$), Gibbs Free Energy spontaneity ($\Delta G$), first-order reaction kinetics half-lives. | 8 |
| [`test_biology.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_biology.py) | `src_python/domains/biology.py` | Hardy-Weinberg equilibrium frequencies ($p+q=1, p^2+2pq+q^2=1$), out-of-range probabilities, Michaelis-Menten enzyme kinetics, denominator zero edge case. | 9 |
| [`test_cs.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_cs.py) | `src_python/domains/cs.py` | Shannon information entropy (fair coin, uniform, deterministic), invalid probability distributions ($\sum p \ne 1$), Big-O asymptotic limits ($o, \omega, \Theta$). | 7 |
| [`test_finance.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_finance.py) | `src_python/domains/finance.py` | Net Present Value (NPV), Internal Rate of Return (IRR), Weighted Average Cost of Capital (WACC), Black-Scholes call/put pricing, Put-Call Parity, non-positive parameters. | 10 |
| [`test_formula_engine.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_formula_engine.py) | `src_python/formula_engine/solver.py` | Multi-variable algebraic isolation (kinematics, ideal gas), multiple roots filtering real roots, no real roots, multiple equals errors, SciPy `numeric_solve` roots. | 9 |
| [`test_api.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_api.py) | `src_python/api.py` | All 12 FastAPI endpoints (health, constants, CAS, units, physics, cs, bio, finance, logic, formula), Pydantic 422 validations, malformed syntax 400s, oversized payloads. | 19 |
| [`test_security.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_security.py) | Security Boundaries | Harmless probes verifying that expression parsing inputs cannot execute arbitrary Python code (`__import__`, `__builtins__`, module attributes). | 5 |
| [`test_edge_cases.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_edge_cases.py) | Cross-System Boundaries | Extreme floating point values ($1e308, 1e-308$), logic parser glyphs ($\land, \lor, \oplus, \to, \leftrightarrow, \uparrow, \downarrow$), nested brackets (50 levels), constants DB bounds. | 11 |

---

### Frontend Test Suites (`src_electron/test/`)

| Test File | Scope & Invariants Tested | Total Tests |
| :--- | :--- | :---: |
| [`mathEngine.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/mathEngine.test.js) | Arithmetic, scientific functions, variable scope binding, 8-decimal precision stabilization, near-zero epsilon filter, syntax error strings, non-string handling. | 7 |
| [`keypadState.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/keypadState.test.js) | Keypad accumulation, leading zero replacement, decimal insertion, All Clear (`AC`), Backspace (`C`), sign toggling (`+/-`), glyph sanitization (`×` $\to$ `*`, `÷` $\to$ `/`). | 6 |
| [`validation.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/validation.test.js) | Formula input validation, missing variable detection, non-numeric value rejection, custom formula builder input validation. | 6 |
| [`formulaSelection.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/formulaSelection.test.js) | Preset formulas database structure (32 formulas), 10 formula pack JSON files integrity (84 formulas), active domain formula merging logic. | 3 |
| [`apiClient.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/apiClient.test.js) | REST client request contracts, endpoint URL builder, payload formatting, 200 OK parsing, error response detail extraction. | 6 |
| [`utils.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/utils.test.js) | Client CODATA constants categories, physical values and SI units, finite numerical verification, symbol search helper. | 4 |

---

## 5. Baseline Test Execution Results

As mandated, tests were executed against the active application codebase without making functional modifications to product code. The genuine baseline test results are recorded below:

### Summary

```text
Backend Suite (pytest):    135 tests | 129 Passed |  6 Failed | 0 Skipped | 0 Errors
Frontend Suite (node:test): 32 tests |  32 Passed |  0 Failed | 0 Skipped | 0 Errors
Total:                     167 tests | 161 Passed |  6 Failed | 0 Skipped | 0 Errors
```

### Known Baseline Failures (To Be Addressed in Implementation Phase)

1. **`tests/test_units.py::test_incompatible_units_detection`**:
   * *Defect:* `dim.convert_units("10 * meter", "second")` returns `10*meter` unconverted rather than raising a dimensional error.
2. **`tests/test_units.py::test_unknown_unit_symbol`**:
   * *Defect:* `10 * non_existent_unit_xyz` is parsed by `parse_expr` as a free algebraic variable rather than being rejected as an invalid unit.
3. **`tests/test_security.py::test_api_cas_simplify_rejects_code_execution_probe`**:
   * *Defect:* `POST /cas/simplify` with `{"expr": "__import__(\"sys\").platform"}` evaluates Python code and returns `"win32"`.
4. **`tests/test_security.py::test_formula_engine_rejects_code_execution_probe`**:
   * *Defect:* `formula_engine.algebraic_solve` executes `__import__("sys").hexversion = x` without validation or rejection.
5. **`tests/test_edge_cases.py::test_logic_nand_glyph`**:
   * *Defect:* NAND glyph `A ↑ B` is replaced with ` ~& ` in `ast_parser.py`, triggering a Python `SyntaxError: invalid syntax`.
6. **`tests/test_edge_cases.py::test_logic_nor_glyph`**:
   * *Defect:* NOR glyph `A ↓ B` is replaced with ` ~| ` in `ast_parser.py`, triggering a Python `SyntaxError: invalid syntax`.
