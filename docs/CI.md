# Continuous Integration & Automated Regression Pipeline

This document details the Continuous Integration (CI) and Automated Regression Testing architecture for **SuperCalcee**. The CI pipeline ensures that every code change is automatically analyzed for code quality, formatting, static types, security regressions, test integrity, and build reproducibility across both the Python computational core and the Electron desktop frontend.

---

## 1. CI Pipeline Architecture

The SuperCalcee CI workflow is orchestrated via GitHub Actions in [`.github/workflows/ci.yml`](file:///e:/Github/GitProjects/SuperCalcee/.github/workflows/ci.yml) and executes on every push and pull request against `MZ-Main`, `main`, and `master`.

```
                    GitHub Push / Pull Request
                               │
       ┌───────────────────────┼────────────────────────┬──────────────────────┐
       ▼                       ▼                        ▼                      ▼
  Backend CI              Frontend CI          Electron Packaging       Security Audit
(Python 3.10-3.13)       (Node 18, 20, 22)         Validation
       │                       │                        │                      │
  ├─ Ruff Format          ├─ ESLint                ├─ IPC Allowlist       ├─ npm audit
  ├─ Ruff Lint            ├─ Node Unit Tests       ├─ Preload Isolation   ├─ pip-audit
  ├─ Mypy Types           └─ Vite Build            ├─ CSP Verification    └─ Gitleaks
  ├─ Security Tests                                └─ extraResources
  └─ Pytest Suite                                     Bundle Validation
```

---

## 2. CI Jobs & Coverage Matrix

### Job 1: `backend` (Python CI Matrix)
- **Environments:** `ubuntu-latest`
- **Matrix:** Python `3.10`, `3.11`, `3.12`, `3.13`
- **Steps:**
  1. **Dependency Installation:** Upgrades `pip` and installs pinned production dependencies from [`requirements.txt`](file:///e:/Github/GitProjects/SuperCalcee/requirements.txt) along with dev/test tools (`ruff`, `mypy`, `pytest`, `httpx`).
  2. **Code Formatting Enforcement:** Enforces PEP 8 and modern Python formatting via `ruff format --check src_python tests`.
  3. **Linter Check:** Analyzes codebase for errors, unused imports, undefined variables, and bad practices via `ruff check src_python tests`.
  4. **Static Type Checking:** Verifies type correctness across all 35 source files in `src_python/` using `mypy src_python`.
  5. **Security Regression Tests:** Runs [`tests/test_security.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_security.py) (51 tests) covering AST allowlists, blocking of dangerous builtins (`eval`, `exec`, `open`, `__import__`), attribute traversal restrictions, token flood prevention, and endpoint injection safeguards.
  6. **Full Backend Test Suite:** Runs all 357 unit and integration tests across CAS, dimensional units, physical constants, numerical solvers, and all scientific domains (Astrophysics, Biology, Chemistry, Computer Science, Finance, Physics).

### Job 2: `frontend` (React / Vite CI Matrix)
- **Environments:** `ubuntu-latest`
- **Matrix:** Node.js `18`, `20`, `22` (Active LTS and current releases)
- **Steps:**
  1. **Clean Installation:** `npm ci --prefix src_electron` for deterministic dependency resolution.
  2. **Linting:** Validates code quality and React hook rules using `npm run lint --prefix src_electron` (ESLint 9 Flat Config).
  3. **Node Native Unit Tests:** Runs all 82 unit tests in `src_electron/test/` using Node's native test runner (`node --test test/**/*.test.js`), validating keypad state, formula selection, math engine, constants registry, URL sanitization, and API client error handling.
  4. **Production Build:** Compiles React/Vite assets via `npm run build --prefix src_electron`, verifying asset bundling and chunk generation.

### Job 3: `electron-validation` (Desktop Packaging & Configuration)
- **Environments:** `ubuntu-latest` (Node 20)
- **Dependencies:** Runs after `frontend` succeeds.
- **Steps:**
  1. **Electron Security Invariants:** Executes [`src_electron/test/security.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/security.test.js) to guarantee:
     - `nodeIntegration: false`
     - `contextIsolation: true`
     - `sandbox: true`
     - `webSecurity: true`
     - Restrictive Content Security Policy (CSP) with `default-src 'self'` and `object-src 'none'`
     - Preload script isolation via `contextBridge` with no leaked Node globals or raw `ipcRenderer`
     - Strict IPC channel allowlisting
     - External URL sanitization and protocol rejection (`file:`, `javascript:`, `data:`, `shell:`)
  2. **Packaging Config Validation:** Validates that `package.json` specifies:
     - Canonical entry point `main.cjs`
     - Valid `appId` (`com.supercalcee.app`) and `productName` (`SuperCalcee`)
     - `extraResources` mapping for bundled virtual environment (`../venv` -> `venv`) and Python backend (`../src_python` -> `src_python`)
  3. **Build Artifact Check:** Verifies existence of production bundle entry point `src_electron/dist/index.html`.

### Job 4: `security-scan` (Static Analysis & Dependency Audits)
- **Environments:** `ubuntu-latest`
- **Steps:**
  1. **Frontend Dependency Audit:** Runs `npm audit --prefix src_electron --audit-level=high` to detect known CVEs in Node dependencies.
  2. **Backend Dependency Audit:** Executes `pip-audit -r requirements.txt` against PyPI advisory databases.
  3. **Secret Scanning:** Executes `gitleaks/gitleaks-action@v2` across the complete git commit history to detect leaked API keys, tokens, or private credentials.

---

## 3. Strict Failure Conditions

The CI workflow fails immediately and blocks merging if **any** of the following occur:
- Any unit, integration, or domain test fails in `pytest` (Backend) or `node --test` (Frontend).
- Any security regression test fails in [`tests/test_security.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_security.py).
- Code formatting does not conform to `ruff format` specifications.
- `ruff check` detects lint violations.
- `mypy` detects type check errors in `src_python`.
- `eslint` detects lint errors in `src_electron`.
- Production Vite build fails or fails to generate `dist/index.html`.
- Any Electron security invariant in `src_electron/test/security.test.js` is violated.
- High-severity dependency vulnerabilities are detected by `npm audit` or `pip-audit`.
- Unencrypted secrets or credentials are found by `gitleaks`.

---

## 4. Running CI Commands Locally

Developers must run and pass all CI checks locally prior to committing:

### All-in-One Commands (Root `package.json`)
```bash
# Run all tests (frontend 82 tests + backend 357 tests)
npm test

# Run all linters (ESLint + Ruff)
npm run lint

# Check code formatting (Ruff)
npm run format:check

# Auto-format Python code (Ruff)
npm run format:fix

# Run static type checking (Mypy)
npm run typecheck

# Run security regression tests
npm run test:security

# Run dependency vulnerability audits (npm audit + pip-audit)
npm run audit

# Build frontend production bundle
npm run build
```

### Backend Direct Commands
```bash
# Activate virtual environment
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux / macOS

# Linter & Formatter
ruff check src_python tests
ruff format --check src_python tests
mypy src_python

# Security regression tests
pytest tests/test_security.py -v

# Full test suite
pytest -v

# Dependency vulnerability scan
pip-audit -r requirements.txt
```

### Frontend & Electron Direct Commands
```bash
cd src_electron

# Linter
npm run lint

# Unit & Security tests
npm test

# Vite production build
npm run build

# Dependency vulnerability audit
npm audit
```

---

## 5. Continuous Improvement & Maintenance

- **Adding New Dependencies:** Any package added to `requirements.txt` or `src_electron/package.json` must be checked with `npm run audit` or `pip-audit` prior to PR submission.
- **Python Version Updates:** The Python matrix in `.github/workflows/ci.yml` is tested across versions 3.10 through 3.13. Any new language syntax must remain compatible with Python 3.10+.
