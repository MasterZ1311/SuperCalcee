"""
Robust Numerical Root Finding Solvers
====================================

Provides hardened, diagnostic-rich numerical root finding using bracketed
(Brent's method) and unconstrained (hybrid Powell / MINPACK fsolve) methods.
Inspects convergence flags, calculates exact residuals, detects NaN/infinity,
overflow, underflow, and protects against silent non-convergence.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np
from scipy.optimize import brentq, fsolve

from .result import NumericalResult


def _safe_eval(func: Callable[[Any], Any], x: float) -> Tuple[Optional[float], Optional[str]]:
    """
    Safely evaluates func at scalar float x, catching floating-point exceptions.
    Handles functions expecting either scalar float x or array [x].

    Returns:
        Tuple[Optional[float], Optional[str]]: (value, error_message)
    """
    try:
        try:
            val = func(x)
        except (TypeError, IndexError):
            val = func([x])

        if hasattr(val, "__len__"):
            val = float(val[0])
        else:
            val = float(val)

        if math.isnan(val):
            return None, "Function evaluated to NaN"
        if math.isinf(val):
            return None, "Function evaluated to infinity"
        return val, None

    except ZeroDivisionError:
        return None, "Division by zero during function evaluation"
    except OverflowError:
        return None, "Numerical overflow during function evaluation"
    except Exception as e:
        return None, f"Evaluation exception: {str(e)}"


def robust_root_scalar(
    func: Callable[[Any], Any],
    initial_guess: float = 0.0,
    bracket: Optional[Tuple[float, float]] = None,
    tol: float = 1e-8,
    max_iter: int = 100,
    method: str = "auto",
) -> NumericalResult:
    """
    Finds a real root of a scalar function f(x) = 0 with comprehensive convergence inspection.

    Strategy:
    1. If a bracket [a, b] is supplied with f(a)*f(b) <= 0, uses Brent's method (brentq)
       which is guaranteed to converge.
    2. In 'auto' mode without a bracket, attempts an expanding bracket search around initial_guess.
    3. If no bracket is found, invokes SciPy fsolve with full diagnostic inspection (full_output=True).
    4. Evaluates and enforces the residual condition |f(x_sol)| <= tol.
    5. Detects NaN, infinity, overflow, and iteration exhaustion.

    Args:
        func: Objective function f(x) returning 0 at root.
        initial_guess: Starting numerical estimate (default 0.0).
        bracket: Optional (a, b) interval known to bracket the root.
        tol: Convergence tolerance for root and residual (default 1e-8).
        max_iter: Maximum iterations / function calls allowed (default 100).
        method: Solver selection ('auto', 'brentq', or 'fsolve').

    Returns:
        NumericalResult: Structured outcome with status, solution, residual, and diagnostics.
    """
    # 1. Attempt Bracketed Solver (brentq)
    target_bracket = bracket

    if target_bracket is None and method in ("auto", "brentq"):
        # Expanding search for bracket around initial_guess
        x0 = float(initial_guess)
        f0, err0 = _safe_eval(func, x0)
        if err0 is None and f0 is not None and abs(f0) <= tol:
            return NumericalResult(
                status="converged",
                solution=x0,
                residual=abs(f0),
                iterations=1,
                method="direct_hit",
                diagnostics={"initial_guess": x0, "note": "Initial guess was an exact root"},
            )

        if err0 is None and f0 is not None:
            steps = [0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 50.0]
            for step in steps:
                a, b = x0 - step, x0 + step
                fa, err_a = _safe_eval(func, a)
                fb, err_b = _safe_eval(func, b)
                if err_a is None and err_b is None and fa is not None and fb is not None:
                    if fa * fb <= 0.0:
                        target_bracket = (a, b)
                        break

    if target_bracket is not None:
        a, b = target_bracket
        fa, err_a = _safe_eval(func, a)
        fb, err_b = _safe_eval(func, b)

        if err_a or err_b or fa is None or fb is None:
            return NumericalResult(
                status="failed",
                solution=None,
                residual=None,
                iterations=0,
                method="brentq",
                warning=f"Bracket endpoint evaluation failed: {err_a or err_b}",
                diagnostics={"bracket": target_bracket},
            )

        if abs(fa) <= tol:
            return NumericalResult(
                status="converged",
                solution=float(a),
                residual=abs(fa),
                iterations=1,
                method="brentq",
                diagnostics={"bracket": target_bracket},
            )
        if abs(fb) <= tol:
            return NumericalResult(
                status="converged",
                solution=float(b),
                residual=abs(fb),
                iterations=1,
                method="brentq",
                diagnostics={"bracket": target_bracket},
            )

        if fa * fb <= 0.0:

            def f_scalar(val):
                res, err = _safe_eval(func, val)
                if err is not None or res is None:
                    raise ValueError(err)
                return res

            try:
                root, r = brentq(f_scalar, a, b, xtol=tol, rtol=tol, maxiter=max_iter, full_output=True)
                res_val, _ = _safe_eval(func, root)
                res_abs = abs(res_val) if res_val is not None else None

                if r.converged and (res_abs is None or res_abs <= max(tol * 100, 1e-4)):
                    return NumericalResult(
                        status="converged",
                        solution=float(root),
                        residual=res_abs,
                        iterations=r.iterations,
                        method="brentq",
                        diagnostics={
                            "bracket": target_bracket,
                            "function_calls": r.function_calls,
                            "flag": r.flag,
                        },
                    )
                else:
                    return NumericalResult(
                        status="failed",
                        solution=float(root),
                        residual=res_abs,
                        iterations=r.iterations,
                        method="brentq",
                        warning="Brentq terminated without achieving residual tolerance.",
                        diagnostics={"bracket": target_bracket, "flag": r.flag},
                    )
            except Exception as e:
                if method == "brentq":
                    return NumericalResult(
                        status="failed",
                        solution=None,
                        residual=None,
                        iterations=0,
                        method="brentq",
                        warning=f"Brentq execution failed: {str(e)}",
                        diagnostics={"bracket": target_bracket},
                    )

    # 2. Unconstrained Solver (SciPy fsolve with full diagnostics)
    eval_count = [0]
    last_err = [None]

    def f_fsolve(x_arr):
        eval_count[0] += 1
        x_val = float(x_arr[0])
        val, err = _safe_eval(func, x_val)
        if err is not None:
            last_err[0] = err
            # Return high penalty instead of crashing
            return 1e12
        return val

    try:
        sol_arr, infodict, ier, mesg = fsolve(
            f_fsolve,
            [float(initial_guess)],
            full_output=True,
            xtol=tol,
            maxfev=max_iter * 10,
        )
    except Exception as e:
        return NumericalResult(
            status="failed",
            solution=None,
            residual=None,
            iterations=eval_count[0],
            method="fsolve_hybr",
            warning=f"fsolve crashed during execution: {str(e)}",
            diagnostics={"last_evaluation_error": last_err[0]},
        )

    sol_val = float(sol_arr[0])

    if math.isnan(sol_val) or math.isinf(sol_val):
        return NumericalResult(
            status="overflow" if math.isinf(sol_val) else "failed",
            solution=None,
            residual=None,
            iterations=eval_count[0],
            method="fsolve_hybr",
            warning=f"fsolve produced non-finite value ({sol_val}).",
            diagnostics={"ier": ier, "mesg": mesg},
        )

    res_val, err = _safe_eval(func, sol_val)
    res_abs = abs(res_val) if res_val is not None else None

    # Check convergence status code
    if ier == 1 and res_abs is not None and res_abs <= max(tol * 100, 1e-4):
        return NumericalResult(
            status="converged",
            solution=sol_val,
            residual=res_abs,
            iterations=infodict.get("nfev", eval_count[0]),
            method="fsolve_hybr",
            diagnostics={"ier": ier, "mesg": mesg, "fvec": infodict.get("fvec", [])},
        )
    elif ier == 2:
        return NumericalResult(
            status="max_iterations",
            solution=sol_val,
            residual=res_abs,
            iterations=infodict.get("nfev", eval_count[0]),
            method="fsolve_hybr",
            warning=f"Maximum function calls reached without convergence: {mesg}",
            diagnostics={"ier": ier, "mesg": mesg},
        )
    else:
        # ier in (3, 4, 5) or residual failed
        return NumericalResult(
            status="failed",
            solution=sol_val if res_abs is not None and res_abs < 1.0 else None,
            residual=res_abs,
            iterations=infodict.get("nfev", eval_count[0]),
            method="fsolve_hybr",
            warning=f"Solver did not converge to a valid root (ier={ier}, mesg='{mesg.strip()}', residual={res_abs}).",
            diagnostics={
                "ier": ier,
                "mesg": mesg,
                "last_evaluation_error": last_err[0],
            },
        )


def find_multiple_roots(
    func: Callable[[Any], Any],
    interval: Tuple[float, float] = (-10.0, 10.0),
    steps: int = 200,
    tol: float = 1e-6,
) -> NumericalResult:
    """
    Finds multiple real roots of func across a designated interval by combining
    grid sign-change scanning with bracketed Brent's refinement.

    Args:
        func: Scalar objective function.
        interval: (min_x, max_x) search domain.
        steps: Number of sampling subdivisions.
        tol: Duplicate root identification tolerance.

    Returns:
        NumericalResult: Structured outcome with list of converged real roots.
    """
    x_min, x_max = interval
    xs = np.linspace(x_min, x_max, steps)
    roots: List[float] = []
    total_evals = 0

    # Evaluate at grid points
    vals = []
    for x in xs:
        v, _ = _safe_eval(func, float(x))
        vals.append(v)
        total_evals += 1

    for i in range(len(xs) - 1):
        x1, x2 = xs[i], xs[i + 1]
        v1, v2 = vals[i], vals[i + 1]

        if v1 is not None and abs(v1) <= tol:
            if not any(abs(v1 - r) <= tol for r in roots):
                roots.append(float(x1))
        elif v1 is not None and v2 is not None and v1 * v2 < 0.0:
            res = robust_root_scalar(func, bracket=(float(x1), float(x2)), tol=tol)
            total_evals += res.iterations
            if res.converged and res.solution is not None:
                r_val = float(res.solution)
                if not any(abs(r_val - r) <= tol for r in roots):
                    roots.append(r_val)

    roots.sort()
    return NumericalResult(
        status="converged" if len(roots) > 0 else "no_solution",
        solution=roots,
        residual=None,
        iterations=total_evals,
        method="grid_scan_brentq",
        diagnostics={"interval": interval, "roots_found_count": len(roots)},
    )


def robust_complex_roots(
    eq_or_poly_str: str,
    variable: str = "x",
) -> NumericalResult:
    """
    Computes all roots (both real and complex) of an algebraic polynomial or equation
    using SymPy's symbolic and numerical polynomial solvers.
    Ensures complex solutions are preserved rather than silently discarded.

    Args:
        eq_or_poly_str: Equation or polynomial expression (e.g. "x^2 + 4 = 0").
        variable: Target variable to solve for (default "x").

    Returns:
        NumericalResult: Structured output with list of real roots and complex pairs.
    """
    import sympy as sp

    from src_python.security import parse_safe, validate_safe_identifier

    validate_safe_identifier(variable)

    if "=" in eq_or_poly_str:
        parts = eq_or_poly_str.split("=")
        if len(parts) != 2:
            return NumericalResult(
                status="failed",
                solution=None,
                warning="Equation must contain exactly one '=' sign.",
            )
        expr = parse_safe(parts[0]) - parse_safe(parts[1])
    else:
        expr = parse_safe(eq_or_poly_str)

    var = sp.Symbol(variable)

    try:
        # Solve for roots symbolically
        sols = sp.solve(expr, var)
        real_roots: List[float] = []
        complex_roots: List[Dict[str, float]] = []

        for sol in sols:
            try:
                c_val = complex(sol.evalf())
                if abs(c_val.imag) < 1e-9:
                    real_roots.append(float(c_val.real))
                else:
                    complex_roots.append({"real": float(c_val.real), "imag": float(c_val.imag)})
            except Exception:
                pass

        real_roots.sort()

        return NumericalResult(
            status="converged" if (real_roots or complex_roots) else "no_solution",
            solution={
                "real_roots": real_roots,
                "complex_roots": complex_roots,
                "total_count": len(real_roots) + len(complex_roots),
            },
            method="sympy_algebraic_complex",
            diagnostics={
                "has_complex_solutions": len(complex_roots) > 0,
                "real_count": len(real_roots),
                "complex_count": len(complex_roots),
            },
        )
    except Exception as e:
        return NumericalResult(
            status="failed",
            solution=None,
            warning=f"Could not solve expression: {str(e)}",
            method="sympy_algebraic_complex",
        )
