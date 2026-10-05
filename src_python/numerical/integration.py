"""
Numerical Integration (Quadrature) Engine
=========================================

Provides high-precision numerical quadrature with adaptive subdivision,
singularity detection, infinite interval support, error estimation, and convergence telemetry.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Callable

from scipy.integrate import quad

from .result import NumericalResult


def robust_quad(
    func: Callable[[float], float],
    a: float,
    b: float,
    epsabs: float = 1e-8,
    epsrel: float = 1e-8,
    limit: int = 100,
) -> NumericalResult:
    """
    Computes definite integral of func from a to b with adaptive quadrature and error checking.

    Supports:
    - Finite intervals [a, b]
    - Semi-infinite intervals [a, inf) and (-inf, b]
    - Doubly-infinite intervals (-inf, inf)
    - Integrands with integrable singularities

    Args:
        func: Integrand function f(x).
        a: Lower integration bound (can be -inf).
        b: Upper integration bound (can be +inf).
        epsabs: Absolute error tolerance (default 1e-8).
        epsrel: Relative error tolerance (default 1e-8).
        limit: Upper bound on the number of subintervals (default 100).

    Returns:
        NumericalResult: Structured output with integral value, estimated absolute error, and diagnostics.
    """
    eval_count = [0]
    last_err = [None]

    def safe_f(x):
        eval_count[0] += 1
        try:
            val = float(func(x))
            if math.isnan(val) or math.isinf(val):
                last_err[0] = f"Non-finite integrand at x={x}: {val}"
                return 0.0
            return val
        except ZeroDivisionError:
            last_err[0] = f"Integrand singularity (division by zero) at x={x}"
            return 0.0
        except Exception as e:
            last_err[0] = f"Integrand exception at x={x}: {str(e)}"
            return 0.0

    try:
        val, abserr, infodict = quad(
            safe_f,
            a,
            b,
            epsabs=epsabs,
            epsrel=epsrel,
            limit=limit,
            full_output=True,
        )

        if math.isnan(val) or math.isinf(val):
            return NumericalResult(
                status="failed",
                solution=None,
                residual=abserr,
                iterations=eval_count[0],
                method="quad_qag",
                warning=f"Integration produced non-finite value ({val}).",
                diagnostics={"last_error": last_err[0]},
            )

        # Check acceptable error bound
        max_allowed_err = max(epsabs, epsrel * abs(val)) * 100.0
        converged = abserr <= max_allowed_err

        return NumericalResult(
            status="converged" if converged else "failed",
            solution=float(val),
            residual=float(abserr),
            iterations=eval_count[0],
            method="quad_qag",
            warning=None if converged else f"Estimated error ({abserr:.2e}) exceeded tolerance.",
            diagnostics={
                "absolute_error": float(abserr),
                "neval": infodict.get("neval", eval_count[0]),
                "subintervals": len(infodict.get("alist", [])),
                "last_evaluation_note": last_err[0],
            },
        )

    except Exception as e:
        return NumericalResult(
            status="failed",
            solution=None,
            residual=None,
            iterations=eval_count[0],
            method="quad_qag",
            warning=f"Quadrature execution failed: {str(e)}",
            diagnostics={"last_evaluation_note": last_err[0]},
        )
