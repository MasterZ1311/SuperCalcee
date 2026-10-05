# SuperCalcee Numerical Solvers & Reliability Guide

## 1. Executive Summary & Design Philosophy

In scientific computing and CAS applications, an iterative numerical solver must never present a non-solution as a valid mathematical result. Unchecked numerical solvers often fail quietly:
- `scipy.optimize.fsolve` returns its last evaluated point when it fails to converge or hits iteration limits.
- Solvers can settle into local minima of the residual norm $\|f(x)\|$ where $f(x) \ne 0$.
- Floating-point exceptions (`NaN`, $\pm\infty$, `ZeroDivisionError`, `OverflowError`) may either crash the process or silently propagate corrupted states.
- Complex solutions are frequently discarded without informing the user.

SuperCalcee implements a hardened numerical framework under [`src_python/numerical/`](file:///e:/Github/GitProjects/SuperCalcee/src_python/numerical/) that guarantees:
1. **Convergence Inspection**: Solver status codes (`ier` in MINPACK) are inspected and enforced.
2. **Residual Verification**: Every candidate solution is checked against an explicit residual tolerance: $\|f(x_{\text{sol}})\| \le \text{tol}$.
3. **Bounded Solvers Preferred**: Bounded/bracketed solvers (Brent's method `brentq`) are prioritized over unconstrained methods.
4. **Structured Telemetry**: Every calculation produces a standardized diagnostic payload.
5. **Complex Root Preservation**: Complex roots are explicitly reported rather than silently dropped.

---

## 2. Solver Architecture & Taxonomy

```
                              Problem Type
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   Root Finding               Integration             Differentiation / Limits
         │                         │                         │
   ┌─────┴─────┐                   │                         │
   ▼           ▼                   ▼                         ▼
Bracketed?   Multiple?       Adaptive Quad         Richardson Central Diff /
(brentq)    (grid scan)       (quad_qag)           Asymptotic Sequences
   │
   ▼ (fallback)
MINPACK fsolve
(full_output=True)
   │
   ▼
Residual Check: |f(x)| <= tol
```

### 2.1 Scalar Root Finding Strategy

SuperCalcee executes a two-tier strategy in [`robust_root_scalar`](file:///e:/Github/GitProjects/SuperCalcee/src_python/numerical/solvers.py):

1. **Tier 1 — Bounded Solver (Brent's Method `brentq`)**:
   - If a bracket $[a, b]$ is supplied such that $f(a) \cdot f(b) \le 0$, Brent's method is invoked.
   - If no bracket is supplied, an expanding bracket search is performed around `initial_guess` using steps $h \in [0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 50.0]$.
   - Brent's method combines bisection, secant, and inverse quadratic interpolation, guaranteeing superlinear convergence without risk of divergence.
2. **Tier 2 — Unconstrained Hybrid Powell Solver (`fsolve_hybr`)**:
   - If no sign-change bracket exists, the solver invokes `scipy.optimize.fsolve(..., full_output=True)`.
   - Convergence flag `ier` is strictly validated:
     - `ier == 1`: Converged according to MINPACK.
     - `ier == 2`: Number of calls to function reached `maxfev` (`status="max_iterations"`).
     - `ier in (3, 4, 5)`: Failed to make progress (`status="failed"`).
   - Residual $\|f(x_{\text{sol}})\|$ is independently evaluated. If $\|f(x_{\text{sol}})\| > \text{tol}$, the solution is rejected even if MINPACK flagged `ier == 1`.

### 2.2 Multiple Real Roots (`find_multiple_roots`)

For equations exhibiting multiple roots (e.g. $x^3 - 4x = 0$):
- Subdivides the search interval $[x_{\min}, x_{\max}]$ into discrete sampling slices.
- Detects sign changes between adjacent grid nodes $x_i$ and $x_{i+1}$.
- Refines each detected bracket via Brent's method.
- Deduplicates solutions within tolerance $\epsilon_{\text{tol}}$ and sorts roots ascendingly.

### 2.3 Complex Roots (`robust_complex_roots`)

For equations with imaginary solutions (such as $x^2 + 4 = 0$ or $x^3 - 1 = 0$):
- Decomposes algebraic equations into real and imaginary components.
- Returns structured results separating real roots from complex conjugate pairs:
  ```json
  {
    "real_roots": [],
    "complex_roots": [
      {"real": 0.0, "imag": 2.0},
      {"real": 0.0, "imag": -2.0}
    ],
    "total_count": 2
  }
  ```

### 2.4 Numerical Quadrature (`robust_quad`)

Implemented in [`src_python/numerical/integration.py`](file:///e:/Github/GitProjects/SuperCalcee/src_python/numerical/integration.py):
- Adaptive Gauss-Kronrod 21-point integration (`quad_qag`).
- Supports finite $[a, b]$, semi-infinite $[a, \infty)$ or $(-\infty, b]$, and doubly-infinite $(-\infty, \infty)$ intervals.
- Handles integrable endpoint singularities (e.g. $\int_0^1 x^{-1/2} dx = 2$).
- Validates the estimated absolute error $\epsilon_{\text{abs}} \le \max(\text{epsabs}, \text{epsrel} \cdot |I|)$.

### 2.5 Numerical Differentiation (`robust_derivative`)

Implemented in [`src_python/numerical/differentiation.py`](file:///e:/Github/GitProjects/SuperCalcee/src_python/numerical/differentiation.py):
- Central difference with Richardson extrapolation achieving $O(h^4)$ truncation error:
  $$d(h) = \frac{f(x_0+h) - f(x_0-h)}{2h}, \quad d_{\text{extrap}} = \frac{4 d(h/2) - d(h)}{3}$$
- Optimal step size computed dynamically from machine epsilon $\epsilon \approx 2.22 \times 10^{-16}$:
  $$h \approx \epsilon^{1/3} \cdot \max(|x_0|, 1.0)$$
- Verifies convergence and reports truncation error estimate $|d_{\text{extrap}} - d(h/2)|$.

### 2.6 Numerical Limits (`robust_limit`)

Implemented in [`src_python/numerical/limits.py`](file:///e:/Github/GitProjects/SuperCalcee/src_python/numerical/limits.py):
- Evaluates geometric approach sequences $x_k = x_0 \pm 10^{-k}$.
- Detects removable singularities ($\lim_{x \to 0} \frac{\sin x}{x} = 1$).
- Distinguishes asymptotic divergence to $\pm\infty$ from computational oscillations.
- Identifies jump discontinuities where $\lim_{x \to x_0^+} f(x) \ne \lim_{x \to x_0^-} f(x)$.

---

## 3. Structured Diagnostics Result Schema

Every numerical solver returns a `NumericalResult` object (or dictionary via `.to_dict()`):

```python
@dataclass
class NumericalResult:
    status: str          # "converged" | "failed" | "max_iterations" | "no_solution" | "singular" | "overflow"
    solution: Any        # float | List[float] | Dict[str, Any] | None
    residual: Optional[float]
    iterations: int
    method: str          # "brentq" | "fsolve_hybr" | "quad_qag" | "central_richardson_oh4" | etc.
    warning: Optional[str]
    diagnostics: Dict[str, Any]
```

### JSON Schema Output Example

```json
{
  "status": "converged",
  "solution": 2.0,
  "residual": 3.552713678800501e-15,
  "iterations": 8,
  "method": "brentq",
  "warning": null,
  "diagnostics": {
    "bracket": [1.0, 3.0],
    "function_calls": 9,
    "flag": "converged"
  }
}
```

---

## 4. Failure Modes & Resolution Matrix

| Failure Mode | Mathematical Cause | Detection Mechanism | Solver Status | Engine Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **No Real Root** | Function has no real zeros (e.g. $x^2 + 1 = 0$) | Residual $\|f(x)\| \ge \text{tol}$ after optimization | `"failed"` or `"no_solution"` | Rejects solution; returns `None` or raises `NumericalConvergenceError` |
| **Flat Gradient** | $f'(x) \approx 0$ far from root (e.g. $\tanh(x)$ with $x_0 = 20$) | MINPACK `ier in (3, 4, 5)` | `"failed"` | Reports gradient stagnation warning; advises bracketed input |
| **Iteration Limit** | Slow convergence or cyclic behavior | MINPACK `ier == 2` or max evaluations exceeded | `"max_iterations"` | Reports failure; exposes closest iterate in diagnostics without claiming convergence |
| **Division by Zero** | Integrand or objective encounters pole | Exception intercepted in `_safe_eval` | `"singular"` or `"failed"` | Catches `ZeroDivisionError`; avoids process crash |
| **Overflow** | Steep exponential growth ($e^{1000x}$) | Floating point `OverflowError` intercepted | `"overflow"` | Replaces overflow with bounded penalty and warning |
| **Underflow** | Gradients vanish below $10^{-300}$ | Residual and sequence differences monitored | `"converged"` or `"failed"` | Uses adaptive scale factors relative to machine precision |
| **Jump Discontinuity** | One-sided limits differ (e.g. $\text{sgn}(x)$ at 0) | Opposing side evaluations $|L^+ - L^-| > \text{tol}$ | `"failed"` | Reports distinct left and right limits |

---

## 5. Integration Across Subsystems

### 5.1 Formula Engine (`src_python/formula_engine/solver.py`)
- **`numeric_solve(func, initial_guess=1.0)`**:
  - Direct backward-compatible float return when converged.
  - Raises `NumericalConvergenceError` if the solver fails or residual is unacceptable.
- **`numeric_solve_detailed(func, initial_guess=1.0, bracket=None)`**:
  - Returns complete structured telemetry dictionary for UI telemetry.
- **`algebraic_solve(..., allow_complex=False)`**:
  - Classifies real and complex roots; raises informative `ValueError` listing complex roots when no real solution exists.

### 5.2 Financial Engine (`src_python/domains/finance.py`)
- **`irr(cashflows)`**:
  - Verifies existence of both inflows and outflows.
  - Automatically executes bracketed Brent's method across economic bounds $[-0.95, 10.0]$ when NPV exhibits a sign change.
  - Rejects false solutions where $r \le -1.0$ or residual NPV $\ne 0$.
- **`irr_detailed(cashflows)`**:
  - Exposes convergence diagnostics and residual NPV for investment sensitivity analysis.

### 5.3 REST API Endpoints (`src_python/api.py`)
- `POST /numerical/root`: Verified scalar root finding.
- `POST /numerical/integrate`: Adaptive quadrature with absolute error bounds.
- `POST /numerical/differentiate`: Adaptive central difference with Richardson extrapolation.
- `POST /numerical/limit`: Sequence limit evaluation with jump and divergence telemetry.

---

## 6. Verification and Regression Coverage

All numerical solvers are validated via [`tests/test_numerical.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_numerical.py):
- **Convergent Roots**: Polynomial and transcendental equations.
- **No Real Root**: Positive definite functions ($x^2 + 1 = 0$).
- **Bad Initial Guesses**: Flat derivative domains ($\tanh(x)$ far from origin).
- **Multiple Roots**: Grid scanning and bracket refinement ($x^3 - 4x = 0$).
- **Near-Singular Points**: Rational functions with poles near roots ($1/(x-1) - 2 = 0$).
- **Division by Zero**: Safeguards preventing crashes.
- **Overflow & Underflow**: Extreme exponential inputs.
- **Iteration Exhaustion**: High-frequency oscillating functions.
- **Complex Roots**: Polynomial extraction preserving imaginary pairs ($x^2 + 4 = 0$).
- **Quadrature**: Gaussian integral $\int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}$ and singular integrands $\int_0^1 x^{-1/2} dx = 2$.
- **Differentiation**: $O(h^4)$ accuracy verified on polynomials and trigonometric functions.
- **Limits**: Removable singularities ($\sin(x)/x \to 1$), infinite divergence ($1/x^2 \to \infty$), and step discontinuities.

Total Test Suite Health: **326 passing tests** (Python backend) and **57 passing tests** (Electron security suite).
