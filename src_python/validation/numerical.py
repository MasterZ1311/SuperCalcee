"""
Numerical & Singularity Validation Utilities
============================================

Provides numerical validation for mathematical singularities, division by zero,
integer constraints, and tolerance comparisons.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Any


class ZeroDenominatorError(ValueError, ZeroDivisionError):
    """
    Raised when a mathematical denominator is zero or dangerously near zero (singularity).
    Inherits from both ValueError and ZeroDivisionError for seamless compatibility
    across both general input validation handlers and mathematical division handlers.
    """

    pass


def validate_non_zero_denominator(
    val: float,
    name: str = "Denominator",
    atol: float = 0.0,
) -> float:
    """
    Validates that a denominator is non-zero and not near a singular point.

    Args:
        val (float): Value to check.
        name (str): Parameter display name.
        atol (float): Absolute tolerance near zero. Default is 0.0 to preserve
                      subatomic physical scales (e.g. Planck length ~ 1e-35).

    Returns:
        float: Validated non-zero value.

    Raises:
        ZeroDenominatorError: If the value is zero or within atol of zero.
        ValueError: If value is NaN or infinite.
    """
    if not isinstance(val, (int, float)):
        raise ValueError(f"{name} must be a number, got {type(val).__name__}.")

    if math.isnan(val):
        raise ValueError(f"{name} cannot be NaN (Not a Number).")

    if math.isinf(val):
        raise ValueError(f"{name} cannot be infinite.")

    if val == 0.0 or (atol > 0.0 and abs(val) <= atol):
        raise ZeroDenominatorError(f"{name} cannot be zero (singularity / division by zero error).")

    return float(val)


def validate_positive_integer(val: Any, name: str) -> int:
    """
    Validates that an input is a strictly positive integer (e.g. 1, 2, 3...).

    Args:
        val (Any): Value to check.
        name (str): Parameter display name.

    Returns:
        int: Validated positive integer.

    Raises:
        ValueError: If value is not an integer or is <= 0.
    """
    if isinstance(val, bool) or not isinstance(val, (int, float)):
        raise ValueError(f"{name} must be an integer, got {type(val).__name__}.")

    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} must be a finite integer, got {val}.")

    int_val = int(val)
    if float(val) != float(int_val):
        raise ValueError(f"{name} must be a whole integer, got decimal {val}.")

    if int_val <= 0:
        raise ValueError(f"{name} must be a strictly positive integer (>= 1), got {int_val}.")

    return int_val


def is_close(a: float, b: float, atol: float = 1e-6) -> bool:
    """Checks whether two floating point values are equal within an absolute tolerance."""
    return abs(a - b) <= atol
