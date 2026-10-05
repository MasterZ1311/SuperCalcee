# SuperCalcee Computational Core REST API Specification

## 1. System Overview & Architecture

The SuperCalcee computational backend is a hardened, high-performance REST API built with **FastAPI** and served via the **Uvicorn ASGI** engine. It provides predictable, strictly typed, and isolated computational primitives across symbolic computer algebra (CAS), dimensional unit conversions, physical constants, domain-specific scientific computing (Physics, Astrophysics, Chemistry, Biology, Finance, Computer Science), adaptive numerical solvers, and boolean logic.

```mermaid
graph LR
    subgraph Client ["Client Layer (Desktop / Web)"]
        ElectronRenderer["Electron Renderer (Vite :5173)"]
        PreloadClient["Preload IPC Bridge"]
    end

    subgraph Middleware ["FastAPI Security Pipeline"]
        RequestID["RequestIDMiddleware (X-Request-ID)"]
        CORS["Strict CORSMiddleware"]
        Pydantic["Pydantic v2 Strict Validation"]
        SafeAST["SafeExpressionValidator (AST Allowlist)"]
    end

    subgraph CoreEngine ["Computational Engines"]
        CAS["Symbolic CAS (SymPy)"]
        Units["Dimensional Engine"]
        Domains["Science & Finance Domains"]
        Numerical["SciPy Robust Solvers"]
    end

    ElectronRenderer --> PreloadClient
    PreloadClient --> RequestID
    RequestID --> CORS
    CORS --> Pydantic
    Pydantic --> SafeAST
    SafeAST --> CoreEngine
```

### Core Specifications
- **Framework:** FastAPI (ASGI)
- **Runtime:** Python 3.10+ (Tested on Python 3.13)
- **Default Port:** `8000` (Configurable via `PORT` or `BACKEND_PORT`)
- **Default Endpoint:** `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation:** `http://127.0.0.1:8000/docs`
- **Machine-Readable OpenAPI JSON:** `http://127.0.0.1:8000/openapi.json`
- **Protocol:** HTTP/1.1 JSON (REST)

---

## 2. API Versioning & Routing

The backend supports structured API versioning:
1. **Versioned Routes (`/api/v1/...`):** Recommended for all modern clients (e.g. `POST /api/v1/cas/simplify`).
2. **Root Fallback Routes (`/...`):** Mounted identically at root level for 100% backward compatibility with legacy desktop IPC clients and existing scripts (e.g. `POST /cas/simplify`).

---

## 3. Correlation & Request Tracking (`X-Request-ID`)

Every incoming HTTP transaction is tracked using an **`X-Request-ID`** correlation token:
- If a client supplies an `X-Request-ID` header (alphanumeric string up to 64 characters), it is validated and preserved.
- If omitted or malformed, a cryptographically secure UUIDv4 hex string is generated automatically.
- The `X-Request-ID` is echoed back in the response headers of **every** HTTP response (success or error).
- All internal server logging correlates errors and events with this request ID:
  ```text
  2026-09-22 20:08:09,986 [INFO] [supercalcee.api] [c1f7b8a9e2...] Request executed successfully
  ```
- The correlation token is embedded in the JSON payload under `"request_id"` for successes and `error.details.request_id` for errors.

---

## 4. Security & CORS Architecture

### 4.1 Strict Cross-Origin Resource Sharing (CORS)
The API replaces wildcard CORS configurations (`allow_origins=["*"]`) with a locked allowlist restricted exclusively to the local desktop application and local Vite HMR server:

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
```

- **Allowed Methods:** `GET`, `POST`, `OPTIONS`
- **Allowed Headers:** `Content-Type`, `Authorization`, `X-Request-ID`, `Accept`
- **Allow Credentials:** `True` (secure with explicit origin matching)
- **Environment Override:** Custom origins can be supplied via the `ALLOWED_ORIGINS` environment variable (comma-delimited).

### 4.2 AST Allowlist Validation & Code Injection Protection
User input expressions are never passed to Python `eval()`, `exec()`, or unsanitized SymPy parsers. The request passes through `parse_safe()`, which parses expressions into a Python Abstract Syntax Tree (AST) and validates that every node belongs to an allowlisted set of harmless mathematical primitives (numbers, symbols, binary operators, functions like `sin`, `cos`, `exp`, `log`).

Prohibited and rejected constructs include:
- Import statements (`import`, `__import__`)
- Dunder attribute lookups (`__class__`, `__subclasses__`, `__mro__`)
- Dangerous built-ins (`eval`, `exec`, `open`, `compile`, `globals`, `locals`, `system`)
- String literals and token flooding
- Expressions deeper than 25 nested levels or 50 function call chains

### 4.3 Input Limits & Validation Constraints
| Parameter | Constraint | Error on Violation |
| :--- | :--- | :--- |
| `expr` (Symbolic / Numerical) | `min_length=1, max_length=1000` | `422 Unprocessable Entity` |
| `variable` / `solve_for` | `min_length=1, max_length=64`, regex `^[a-zA-Z_][a-zA-Z0-9_]*$` | `422 Unprocessable Entity` |
| `target_unit` | `min_length=1, max_length=200` | `422 Unprocessable Entity` |
| `probabilities` | List length `1 <= N <= 1000`, floats `0.0 <= p <= 1.0` | `422 Unprocessable Entity` / `400 Bad Request` |
| `cashflows` | List length `1 <= N <= 1000`, finite numbers | `422 Unprocessable Entity` |
| Numbers | Finite numbers only (`NaN`, `+inf`, `-inf` strictly rejected) | `400 Bad Request` |

### 4.4 Information Leakage Prevention
Error responses are strictly sanitized before egress:
- **No Stack Traces:** Server logs capture full tracebacks internally, but client responses contain zero tracebacks.
- **Path Redaction:** File paths matching Windows (`C:\...`, `E:\...`) or Unix (`/home/...`, `/usr/...`) paths are replaced with `[REDACTED_PATH]`.
- **Object Redaction:** Internal Python object pointers (`<class '...'>`) are replaced with `[INTERNAL_OBJECT]`.

---

## 5. Standardized Response Formats

### 5.1 Success Response Envelope
All endpoints return an envelope containing `success: true`, the computation `result`, and the tracking `request_id`:

```json
{
  "success": true,
  "result": "x + 1",
  "request_id": "93bfa59a4c8a416ea4f901193d258b6f"
}
```

*Note: For numerical solver endpoints (`/numerical/...`), the top-level response also preserves solver keys (`status`, `solution`, `residual`, `iterations`, `method`) for seamless backward compatibility.*

### 5.2 Error Response Envelope
Every failure returns a predictable, typed envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed: String should have at most 1000 characters for 'body -> expr'",
    "details": {
      "request_id": "93bfa59a4c8a416ea4f901193d258b6f",
      "validation_errors": [
        {
          "field": "body -> expr",
          "message": "String should have at most 1000 characters",
          "type": "string_too_long"
        }
      ]
    }
  },
  "detail": "Validation failed: String should have at most 1000 characters for 'body -> expr'"
}
```

---

## 6. Error Codes & HTTP Status Mapping

| HTTP Status | Error Code (`error.code`) | Description | Example Cause |
| :--- | :--- | :--- | :--- |
| **`422 Unprocessable Entity`** | `VALIDATION_ERROR` | Schema validation violation | Missing required field, string length > 1000, invalid identifier format |
| **`400 Bad Request`** | `SECURITY_VIOLATION` | Malicious code execution or unauthorized AST node | Passing `__import__('os')` or `eval('1+1')` in `expr` |
| **`400 Bad Request`** | `EXPRESSION_LIMIT_EXCEEDED` | AST nesting depth or node count exceeded | Deeply nested brackets (`((((...))))`) > 25 levels |
| **`400 Bad Request`** | `SYNTAX_ERROR` | Malformed mathematical expression syntax | Incomplete operators (`x + * 2`) |
| **`400 Bad Request`** | `DOMAIN_ERROR` | Parameter violates physical or mathematical domain | Negative mass, $T < 0\text{ K}$, probabilities not summing to 1.0 |
| **`400 Bad Request`** | `ZERO_DIVISION_ERROR` | Division by zero or singularity | Calculating acceleration with $m=0$, or $Km+[S]=0$ |
| **`400 Bad Request`** | `CONVERGENCE_ERROR` | Numerical algorithm failed to converge | Non-convergent root finder or diverging integral |
| **`400 Bad Request`** | `CALCULATION_ERROR` | General numerical calculation failure | Ill-conditioned matrix, NaN generated in numerical quadrature |
| **`400 Bad Request`** | `REQUEST_ERROR` | Missing or invalid query parameter combination | Calling `/physics/emc2` with neither `mass` nor `energy` |
| **`500 Internal Server Error`** | `INTERNAL_ERROR` | Unhandled internal exception | Server-side runtime fault (traceback logged to server only) |

---

## 7. Complete Endpoint Reference

### 7.1 System & Constants

#### `GET /` & `GET /health`
Returns service status, version, and operational readiness.

- **Request:**
  ```bash
  curl -X GET http://127.0.0.1:8000/health
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "SuperCalcee Computational Core Engine Active",
    "version": "1.0.0",
    "request_id": "e4a2d8e3c79a405a818c7e992b952b12"
  }
  ```

#### `GET /constants`
Retrieves the complete database of CODATA physical, astronomical, and mathematical constants.

- **Request:**
  ```bash
  curl -X GET http://127.0.0.1:8000/constants
  ```
- **Response (`200 OK`):**
  ```json
  {
    "c": {
      "name": "Speed of light in vacuum",
      "value": 299792458.0,
      "unit": "m/s",
      "category": "universal"
    },
    "h": {
      "name": "Planck constant",
      "value": 6.62607015e-34,
      "unit": "J*s",
      "category": "quantum"
    }
  }
  ```

---

### 7.2 Symbolic Computer Algebra (CAS)

#### `POST /cas/simplify`
Algebraically simplifies a mathematical expression string using SymPy.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/simplify \
    -H "Content-Type: application/json" \
    -d '{"expr": "(x**2 - 1)/(x - 1)"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "x + 1",
    "request_id": "4b611e9a22f34e6ab4f9d258b6f3818c"
  }
  ```

#### `POST /cas/factor`
Factors a polynomial expression into irreducible factors.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/factor \
    -H "Content-Type: application/json" \
    -d '{"expr": "x**2 - 4"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "(x - 2)*(x + 2)",
    "request_id": "58e1c6b84a32490b8f4c2e4f55a1d7f2"
  }
  ```

#### `POST /cas/expand`
Expands algebraic products and powers into polynomial terms.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/expand \
    -H "Content-Type: application/json" \
    -d '{"expr": "(x + 2)**2"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "x**2 + 4*x + 4",
    "request_id": "89fa31b268e04cc890c5b3d91ea44201"
  }
  ```

#### `POST /cas/differentiate`
Computes the symbolic derivative of an expression with respect to a target variable.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/differentiate \
    -H "Content-Type: application/json" \
    -d '{"expr": "x**3", "variable": "x"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "3*x**2",
    "request_id": "908c6e2b40aa41d1872ef783b92f9104"
  }
  ```

#### `POST /cas/integrate`
Computes the symbolic indefinite integral with respect to a target variable.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/integrate \
    -H "Content-Type: application/json" \
    -d '{"expr": "3*x**2", "variable": "x"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "x**3",
    "request_id": "a1f94d0bc2614b18b4dc739fa45e3170"
  }
  ```

#### `POST /cas/limit`
Evaluates the mathematical limit $\lim_{x \to a} f(x)$ symbolically.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/limit \
    -H "Content-Type: application/json" \
    -d '{"expr": "sin(x)/x", "variable": "x", "approach": "0"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "1",
    "request_id": "bf8c187d9043444498305c7fa35eb992"
  }
  ```

#### `POST /cas/solve`
Solves an algebraic equation for the specified variable.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cas/solve \
    -H "Content-Type: application/json" \
    -d '{"expr": "x**2 - 9 = 0", "variable": "x"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": ["-3", "3"],
    "request_id": "cc31818fa8b24a35a14d5e7a9094fe31"
  }
  ```

---

### 7.3 Dimensional Unit Conversion

#### `POST /units/convert`
Converts physical quantities between dimensionally compatible units.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/units/convert \
    -H "Content-Type: application/json" \
    -d '{"expr": "100 * kilometer / hour", "target_unit": "meter / second"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "27.7777777777778*meter/second",
    "request_id": "d049f50e93ca4cae872ba542918bbca2"
  }
  ```

---

### 7.4 Physics Domain

#### `POST /physics/emc2`
Calculates Einstein mass-energy equivalence $E = mc^2$. Supports either JSON body or query parameters.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/physics/emc2 \
    -H "Content-Type: application/json" \
    -d '{"mass": 1.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 8.987551787368176e+16,
    "request_id": "e58129ca08db42d7a2f58e381014e7a9"
  }
  ```

#### `POST /physics/heisenberg`
Computes the quantum uncertainty bound $\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$. Exactly one of `delta_x` or `delta_p` must be specified.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/physics/heisenberg \
    -H "Content-Type: application/json" \
    -d '{"delta_x": 1e-10}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 5.272859089270725e-25,
    "request_id": "f818ab4025d14faea80cb6192451c890"
  }
  ```

#### `POST /physics/newton`
Solves Newton's Second Law $F = ma$. Exactly two of `F`, `m`, and `a` must be provided.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/physics/newton \
    -H "Content-Type: application/json" \
    -d '{"m": 2.0, "a": 3.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 6.0,
    "request_id": "01ab78c9df104d4ba389b217e945c2a1"
  }
  ```

---

### 7.5 Astrophysics Domain

#### `POST /astro/schwarzschild`
Calculates the Schwarzschild event horizon radius $R_s = \frac{2GM}{c^2}$ for a non-rotating celestial body.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/astro/schwarzschild \
    -H "Content-Type: application/json" \
    -d '{"mass": 1.989e30}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 2953.2500768132924,
    "request_id": "129abf803c444062a9c80d46812739fa"
  }
  ```

#### `POST /astro/kepler`
Solves Kepler's Third Law $T^2 = \frac{4\pi^2 a^3}{GM}$. At least two parameters must be specified.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/astro/kepler \
    -H "Content-Type: application/json" \
    -d '{"semi_major_axis": 1.496e11, "mass_central": 1.989e30}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 31557929.54,
    "request_id": "23fa908b10dc4113a825b44917dc80a2"
  }
  ```

#### `POST /astro/drake`
Estimates the number $N$ of active, communicative alien civilizations via the Drake Equation:
$$N = R^* \cdot f_p \cdot n_e \cdot f_l \cdot f_i \cdot f_c \cdot L$$

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/astro/drake \
    -H "Content-Type: application/json" \
    -d '{"R": 1.5, "fp": 0.5, "ne": 1.0, "fl": 0.5, "fi": 0.2, "fc": 0.2, "L": 10000.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 150.0,
    "request_id": "34ab89cf12ef490db721840cb4519fa3"
  }
  ```

---

### 7.6 Chemistry Domain

#### `POST /chem/nernst`
Calculates non-standard reduction potential using the Nernst equation:
$$E = E^0 - \frac{RT}{nF} \ln Q$$

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/chem/nernst \
    -H "Content-Type: application/json" \
    -d '{"E0": 1.10, "n": 2, "Q": 0.01, "T": 298.15}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 1.1591552554760467,
    "request_id": "45bc09fa12de481ea917b43928157fba"
  }
  ```

#### `POST /chem/gibbs`
Calculates Gibbs Free Energy change $\Delta G = \Delta H - T \Delta S$ to determine thermodynamic spontaneity.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/chem/gibbs \
    -H "Content-Type: application/json" \
    -d '{"delta_H": -100000.0, "T": 298.15, "delta_S": -50.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": -85092.5,
    "request_id": "56cd10ab23ef492fa821c54839268fca"
  }
  ```

#### `POST /chem/kinetics`
Calculates remaining reactant concentration under first-order decomposition or radioactive decay $[A] = [A_0] e^{-kt}$.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/chem/kinetics \
    -H "Content-Type: application/json" \
    -d '{"k": 0.05, "t": 10.0, "A0": 1.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 0.6065306597126334,
    "request_id": "67de21bc34fa403ab932d65940379fda"
  }
  ```

---

### 7.7 Biology Domain

#### `POST /bio/hardy-weinberg`
Calculates genotype frequencies under Hardy-Weinberg equilibrium ($p^2 + 2pq + q^2 = 1$). Supports JSON body or query parameters.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/bio/hardy-weinberg \
    -H "Content-Type: application/json" \
    -d '{"p": 0.6}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": {
      "p": 0.6,
      "q": 0.4,
      "p_squared (homozygous dominant)": 0.36,
      "2pq (heterozygous)": 0.48,
      "q_squared (homozygous recessive)": 0.16
    },
    "request_id": "78ef32cd45ab414ba043e76051480aeb"
  }
  ```

#### `POST /bio/michaelis-menten`
Calculates enzyme catalyzed reaction velocity $v = \frac{V_{max}[S]}{K_m + [S]}$.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/bio/michaelis-menten \
    -H "Content-Type: application/json" \
    -d '{"Vmax": 10.0, "Km": 2.0, "S": 5.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 7.142857142857143,
    "request_id": "89fa43de56bc425cb154f87162591bfc"
  }
  ```

---

### 7.8 Finance Domain

#### `POST /finance/black-scholes`
Calculates European call/put option pricing via the Black-Scholes analytical model. Supports JSON body or query parameters.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/finance/black-scholes \
    -H "Content-Type: application/json" \
    -d '{
      "S": 100.0,
      "K": 100.0,
      "T": 1.0,
      "r": 0.05,
      "sigma": 0.2,
      "option_type": "call"
    }'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 10.450583572185565,
    "request_id": "90ab54ef67cd436dc265a98273602c0d"
  }
  ```

#### `POST /finance/wacc`
Computes corporate Weighted Average Cost of Capital (WACC).

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/finance/wacc \
    -H "Content-Type: application/json" \
    -d '{
      "equity": 1000.0,
      "debt": 500.0,
      "cost_eq": 0.10,
      "cost_debt": 0.05,
      "tax_rate": 0.25
    }'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 0.07916666666666666,
    "request_id": "a1bc65fa78de447ed376ba9384713d1e"
  }
  ```

#### `POST /finance/npv`
Calculates Net Present Value for a series of periodic cash flows.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/finance/npv \
    -H "Content-Type: application/json" \
    -d '{
      "rate": 0.10,
      "cashflows": [-1000.0, 300.0, 500.0, 700.0]
    }'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 211.87077385424465,
    "request_id": "b2cd76ab89ef458fe487cb0495824e2f"
  }
  ```

#### `POST /finance/irr`
Calculates Internal Rate of Return (IRR) with robust convergence verification.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/finance/irr \
    -H "Content-Type: application/json" \
    -d '{
      "cashflows": [-1000.0, 300.0, 500.0, 700.0]
    }'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 0.22129598287796035,
    "request_id": "c3de87bc90fa469af598dc1506935f30"
  }
  ```

---

### 7.9 Computer Science & Logic Domain

#### `POST /cs/big-o`
Classifies the asymptotic complexity relationship between $f(n)$ and $g(n)$ via $\lim_{n \to \infty} \frac{f(n)}{g(n)}$.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cs/big-o \
    -H "Content-Type: application/json" \
    -d '{"f_n": "n", "g_n": "n**2"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "f(n) = o(g(n)). Faster asymptotic growth: g(n).",
    "request_id": "d4ef98cd01ab47ab0609ed2617046a41"
  }
  ```

#### `POST /cs/entropy`
Calculates discrete Shannon Information Entropy $H(X) = -\sum p_i \log_2(p_i)$ in bits.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/cs/entropy \
    -H "Content-Type: application/json" \
    -d '{"probabilities": [0.5, 0.25, 0.25]}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 1.5,
    "request_id": "e5fa09de12bc48bc171afe3728157b52"
  }
  ```

#### `POST /logic/simplify`
Simplifies Boolean logic expressions using boolean algebraic axioms and identities.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/logic/simplify \
    -H "Content-Type: application/json" \
    -d '{"expr": "A & (A | B)"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": "A",
    "request_id": "f6ab10ef23cd49cd282b0f4839268c63"
  }
  ```

#### `POST /formula/solve`
Algebraically isolates and solves any variable in a multi-variable formula given known parameters.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/formula/solve \
    -H "Content-Type: application/json" \
    -d '{
      "equation": "v = u + a * t",
      "solve_for": "a",
      "given": {"v": 20.0, "u": 5.0, "t": 3.0}
    }'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": 5.0,
    "request_id": "07bc21fa34de4ade393c105940379d74"
  }
  ```

---

### 7.10 Numerical Solvers

#### `POST /numerical/root`
Numerically finds roots $f(x) = 0$ using Brent's method or unconstrained scalar solvers with convergence and residual verification.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/numerical/root \
    -H "Content-Type: application/json" \
    -d '{"expr": "x**3 - 8", "initial_guess": 1.0, "bracket": [0.0, 5.0]}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "converged",
    "solution": 2.0,
    "residual": 0.0,
    "iterations": 8,
    "method": "brentq",
    "details": {},
    "result": {
      "status": "converged",
      "solution": 2.0,
      "residual": 0.0,
      "iterations": 8,
      "method": "brentq",
      "details": {}
    },
    "request_id": "18cd32ab45ef4bef404d216051480e85"
  }
  ```

#### `POST /numerical/integrate`
Computes definite integrals $\int_a^b f(x) dx$ using adaptive Gauss-Kronrod numerical quadrature with error estimation.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/numerical/integrate \
    -H "Content-Type: application/json" \
    -d '{"expr": "3*x**2", "a": 0.0, "b": 2.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "converged",
    "solution": 8.0,
    "residual": 8.881784197001252e-14,
    "iterations": 21,
    "method": "scipy_quad",
    "details": {},
    "result": {
      "status": "converged",
      "solution": 8.0,
      "residual": 8.881784197001252e-14,
      "iterations": 21,
      "method": "scipy_quad",
      "details": {}
    },
    "request_id": "29de43bc56fa4cfa515e327162591f96"
  }
  ```

#### `POST /numerical/differentiate`
Calculates numerical derivative $f'(x_0)$ using adaptive central differences with Richardson extrapolation.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/numerical/differentiate \
    -H "Content-Type: application/json" \
    -d '{"expr": "x**3", "x0": 2.0}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "converged",
    "solution": 12.000000000000002,
    "residual": 1.7763568394002505e-15,
    "iterations": 4,
    "method": "richardson_extrapolation",
    "details": {},
    "result": {
      "status": "converged",
      "solution": 12.000000000000002,
      "residual": 1.7763568394002505e-15,
      "iterations": 4,
      "method": "richardson_extrapolation",
      "details": {}
    },
    "request_id": "3aef54cd67ab4dfb626f4382736020a7"
  }
  ```

#### `POST /numerical/limit`
Numerically evaluates $\lim_{x \to x_0} f(x)$ with divergence detection.

- **Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/numerical/limit \
    -H "Content-Type: application/json" \
    -d '{"expr": "sin(x)/x", "x0": 0.0, "direction": "both"}'
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "converged",
    "solution": 1.0,
    "residual": 0.0,
    "iterations": 7,
    "method": "adaptive_sequence",
    "details": {},
    "result": {
      "status": "converged",
      "solution": 1.0,
      "residual": 0.0,
      "iterations": 7,
      "method": "adaptive_sequence",
      "details": {}
    },
    "request_id": "4bfa65de78bc4efc73705493847131b8"
  }
  ```

---

## 8. Deployment & Configuration

### 8.1 Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` / `BACKEND_PORT` | Port for the Uvicorn web server to bind to | `8000` |
| `ALLOWED_ORIGINS` | Comma-separated list of permitted CORS origins | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000` |

### 8.2 Development Configuration
To run the server in local development mode with automatic reloading:
```bash
python -m uvicorn src_python.api:app --host 127.0.0.1 --port 8000 --reload
```

### 8.3 Production Configuration
When running packaged inside Electron or in a dedicated container:
```bash
python src_python/api.py
```
- Electron main process manages backend process spawning and readiness monitoring via `waitForBackend("http://127.0.0.1:8000/health")`.
- In production, ensure `ALLOWED_ORIGINS` strictly reflects the production application origins.
