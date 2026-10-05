"""
Numerical Differentiation Engine
================================

Provides high-accuracy adaptive numerical differentiation with Richardson extrapolation,
error estimation, singularity checks, and step-size optimization.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Callable, Optional

from .result import NumericalResult


def robust_derivative(
    func: Callable[[float], float],
    x0: float,
    order: int = 1,
    h: Optional[float] = None,
    tol: float = 1e-6,
) -> NumericalResult:
    """
    Computes numerical derivative f'(x0) using adaptive central differences
    and Richardson extrapolation (O(h^4) truncation error).

    Args:
        func: Target differentiable function.
        x0: Evaluation point.
        order: Derivative order (currently supports order=1).
        h: Finite difference step size. If None, automatically computed from machine epsilon.
        tol: Estimated truncation error tolerance.

    Returns:
        NumericalResult: Derivative estimate with error bound and telemetry.
    """
    if order != 1:
        return NumericalResult(
            status="failed",
            solution=None,
            method="central_richardson",
            warning=f"Derivative order {order} not supported; use order=1.",
        )

    # Machine epsilon for float64 is approx 2.22e-16
    eps = 2.220446049250313e-16

    # Optimal central difference step size is approximately eps^(1/3) * max(|x0|, 1.0)
    base_h = (eps ** (1.0 / 3.0)) * max(abs(x0), 1.0) if h is None else float(h)
    h_step = max(base_h, 1e-12)

    try:
        # Step 1: Central difference at h
        f_plus1 = func(x0 + h_step)
        f_minus1 = func(x0 - h_step)

        if any(math.isnan(v) or math.isinf(v) for v in (f_plus1, f_minus1)):
            return NumericalResult(
                status="failed",
                solution=None,
                method="central_richardson",
                warning=f"Function evaluated to non-finite value near x0={x0}.",
            )

        d1 = (f_plus1 - f_minus1) / (2.0 * h_step)

        # Step 2: Central difference at h / 2
        h_half = h_step / 2.0
        f_plus2 = func(x0 + h_half)
        f_minus2 = func(x0 - h_half)

        if any(math.isnan(v) or math.isinf(v) for v in (f_plus2, f_minus2)):
            return NumericalResult(
                status="failed",
                solution=None,
                method="central_richardson",
                warning=f"Function evaluated to non-finite value at half-step near x0={x0}.",
            )

        d2 = (f_plus2 - f_minus2) / (2.0 * h_half)

        # Step 3: Richardson extrapolation: (4 * d2 - d1) / 3
        d_extrap = (4.0 * d2 - d1) / 3.0
        error_est = abs(d_extrap - d2)

        converged = error_est <= max(tol, tol * abs(d_extrap))

        return NumericalResult(
            status="converged" if converged else "failed",
            solution=float(d_extrap),
            residual=float(error_est),
            iterations=4,  # 4 function evaluations
            method="central_richardson_oh4",
            warning=None if converged else f"Truncation error estimate ({error_est:.2e}) exceeded tolerance.",
            diagnostics={
                "step_size": h_step,
                "d_step_h": d1,
                "d_step_half": d2,
                "error_estimate": error_est,
            },
        )

    except ZeroDivisionError:
        return NumericalResult(
            status="singular",
            solution=None,
            method="central_richardson",
            warning=f"Division by zero encountered while differentiating at x0={x0}.",
        )
    except Exception as e:
        return NumericalResult(
            status="failed",
            solution=None,
            method="central_richardson",
            warning=f"Differentiation failed: {str(e)}",
        )
