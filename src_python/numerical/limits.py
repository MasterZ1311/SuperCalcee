"""
Numerical Limit Evaluation Engine
=================================

Provides numerical limit evaluation using adaptive geometric approach sequences,
asymptotic divergence classification, and two-sided discontinuity detection.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Callable

from .result import NumericalResult


def robust_limit(
    func: Callable[[float], float],
    x0: float,
    direction: str = "both",
    tol: float = 1e-5,
) -> NumericalResult:
    """
    Numerically evaluates the limit of func(x) as x -> x0.

    Args:
        func: Target function f(x).
        x0: Point of approach (can be finite or +/- inf).
        direction: 'right' (x0+), 'left' (x0-), or 'both' (two-sided).
        tol: Convergence tolerance between sequence steps.

    Returns:
        NumericalResult: Evaluated limit value or divergence indication.
    """
    # 1. Handle Infinite Approaches (x -> +inf or x -> -inf)
    if math.isinf(x0):
        sign = 1.0 if x0 > 0 else -1.0
        grid = [sign * (10.0**k) for k in range(1, 10)]
        vals = []
        for x in grid:
            try:
                v = float(func(x))
                vals.append(v)
            except Exception:
                break

        if len(vals) < 3:
            return NumericalResult(
                status="failed",
                solution=None,
                method="infinite_sequence",
                warning=f"Unable to evaluate function at large values x -> {x0}.",
            )

        # Check divergence
        if all(abs(vals[i]) > abs(vals[i - 1]) and abs(vals[i]) > 1e8 for i in range(1, len(vals))):
            asymp_inf = float("inf") if vals[-1] > 0 else float("-inf")
            return NumericalResult(
                status="converged",
                solution=asymp_inf,
                residual=0.0,
                iterations=len(vals),
                method="infinite_sequence",
                diagnostics={"behavior": "divergent_to_infinity", "sequence": vals[-3:]},
            )

        # Check convergence to finite value
        diff = abs(vals[-1] - vals[-2])
        if diff <= tol:
            return NumericalResult(
                status="converged",
                solution=vals[-1],
                residual=diff,
                iterations=len(vals),
                method="infinite_sequence",
                diagnostics={"sequence": vals[-3:]},
            )
        else:
            return NumericalResult(
                status="failed",
                solution=vals[-1],
                residual=diff,
                iterations=len(vals),
                method="infinite_sequence",
                warning="Sequence did not stabilize at large x.",
            )

    # 2. Handle Finite Approaches (x -> x0)
    steps = [10.0 ** (-k) for k in range(2, 9)]

    def eval_sequence(sgn: float):
        seq = []
        for h in steps:
            x = x0 + sgn * h
            try:
                v = float(func(x))
                seq.append(v)
            except ZeroDivisionError:
                seq.append(float("inf") if sgn > 0 else float("-inf"))
            except Exception:
                break
        return seq

    right_seq = eval_sequence(1.0) if direction in ("right", "both") else None
    left_seq = eval_sequence(-1.0) if direction in ("left", "both") else None

    # Check for divergence to infinity
    def check_divergence(seq):
        if seq and len(seq) >= 3:
            if all(abs(seq[i]) > 1e8 for i in range(len(seq) - 3, len(seq))):
                return float("inf") if seq[-1] > 0 else float("-inf")
        return None

    right_div = check_divergence(right_seq) if right_seq else None
    left_div = check_divergence(left_seq) if left_seq else None

    if direction == "both":
        n_iters = len(right_seq or []) + len(left_seq or [])
        if right_div is not None and left_div is not None:
            if right_div == left_div:
                return NumericalResult(
                    status="converged",
                    solution=right_div,
                    residual=0.0,
                    iterations=n_iters,
                    method="adaptive_sequence",
                    diagnostics={"behavior": "divergent_to_infinity"},
                )
            else:
                return NumericalResult(
                    status="failed",
                    solution=None,
                    iterations=n_iters,
                    method="adaptive_sequence",
                    warning=f"Two-sided limit diverges with opposing signs: left={left_div}, right={right_div}.",
                )

        if not right_seq or not left_seq or len(right_seq) < 3 or len(left_seq) < 3:
            return NumericalResult(
                status="failed",
                solution=None,
                method="adaptive_sequence",
                warning="Insufficient evaluations near limit point.",
            )

        right_lim = right_seq[-1]
        left_lim = left_seq[-1]
        diff_sides = abs(right_lim - left_lim)

        if diff_sides > max(tol * 10, 1e-3):
            return NumericalResult(
                status="failed",
                solution=None,
                residual=diff_sides,
                iterations=n_iters,
                method="adaptive_sequence",
                warning=f"Left and right limits do not match: left={left_lim:.5f}, right={right_lim:.5f} (diff={diff_sides:.2e}).",
                diagnostics={"left_limit": left_lim, "right_limit": right_lim},
            )

        limit_val = (right_lim + left_lim) / 2.0
        return NumericalResult(
            status="converged",
            solution=limit_val,
            residual=diff_sides,
            iterations=n_iters,
            method="adaptive_sequence",
            diagnostics={"left_limit": left_lim, "right_limit": right_lim},
        )

    target_seq = right_seq if direction == "right" else left_seq
    target_div = right_div if direction == "right" else left_div

    if target_div is not None:
        return NumericalResult(
            status="converged",
            solution=target_div,
            residual=0.0,
            iterations=len(target_seq or []),
            method="adaptive_sequence",
            diagnostics={"behavior": "divergent_to_infinity"},
        )

    if not target_seq or len(target_seq) < 2:
        return NumericalResult(
            status="failed",
            solution=None,
            method="adaptive_sequence",
            warning="Failed to evaluate sufficient points in sequence.",
        )

    res_diff = abs(target_seq[-1] - target_seq[-2])
    return NumericalResult(
        status="converged" if res_diff <= tol * 10 else "failed",
        solution=target_seq[-1],
        residual=res_diff,
        iterations=len(target_seq),
        method="adaptive_sequence",
        warning=None if res_diff <= tol * 10 else "Sequence did not stabilize.",
    )
