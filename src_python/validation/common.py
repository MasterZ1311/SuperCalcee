"""
Common Mathematical & Type Validation Utilities
================================================

Provides foundational validation functions for checking finite numbers, ranges,
non-negativity, positivity, and sequences.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Any, List, Sequence


def validate_finite_number(val: Any, name: str = "Value") -> float:
    """
    Validates that an input is a finite real number (not bool, None, string, NaN, or inf).

    Args:
        val (Any): Input value to test.
        name (str): Display name of the parameter for error reporting.

    Returns:
        float: Converted float value.

    Raises:
        TypeError: If val is None, boolean, or not a numeric type.
        ValueError: If val is NaN or infinite.
    """
    if val is None:
        raise TypeError(f"{name} is required and cannot be None.")
    if isinstance(val, bool):
        raise TypeError(f"{name} must be a real number, got boolean ({val}).")
    if not isinstance(val, (int, float)):
        try:
            val_float = float(val)
        except (ValueError, TypeError):
            raise TypeError(f"{name} must be a real number, got {type(val).__name__}.")
    else:
        val_float = float(val)

    if math.isnan(val_float):
        raise ValueError(f"{name} cannot be NaN (Not a Number).")
    if math.isinf(val_float):
        raise ValueError(f"{name} cannot be infinite.")

    return val_float


def validate_positive(
    val: Any,
    name: str = "Value",
    allow_zero: bool = False,
    atol: float = 0.0,
) -> float:
    """
    Validates that a number is strictly positive (> 0), or non-negative (>= 0) if allow_zero=True.

    Args:
        val (Any): Value to validate.
        name (str): Parameter name.
        allow_zero (bool): If True, 0.0 is permitted.
        atol (float): Tolerance for near-zero checks.

    Returns:
        float: Validated number.

    Raises:
        ValueError: If the value violates the positivity constraint.
    """
    v = validate_finite_number(val, name)
    if allow_zero:
        if v < -atol:
            raise ValueError(f"{name} must be non-negative (>= 0), got {v}.")
        return max(0.0, v)
    else:
        if v <= atol:
            raise ValueError(f"{name} must be positive (> 0), got {v}.")
        return v


def validate_non_negative(val: Any, name: str = "Value", atol: float = 0.0) -> float:
    """
    Convenience helper for validate_positive with allow_zero=True.
    """
    return validate_positive(val, name=name, allow_zero=True, atol=atol)


def validate_in_range(
    val: Any,
    name: str = "Value",
    min_val: float = float("-inf"),
    max_val: float = float("inf"),
    inclusive_min: bool = True,
    inclusive_max: bool = True,
) -> float:
    """
    Validates that a finite number lies within [min_val, max_val] (or open intervals).

    Args:
        val (Any): Input value.
        name (str): Parameter name.
        min_val (float): Minimum allowed value.
        max_val (float): Maximum allowed value.
        inclusive_min (bool): Whether the lower bound is inclusive.
        inclusive_max (bool): Whether the upper bound is inclusive.

    Returns:
        float: Validated number.

    Raises:
        ValueError: If the value is outside the specified range.
    """
    v = validate_finite_number(val, name)

    if inclusive_min:
        if v < min_val:
            raise ValueError(f"{name} must be >= {min_val}, got {v}.")
    else:
        if v <= min_val:
            raise ValueError(f"{name} must be > {min_val}, got {v}.")

    if inclusive_max:
        if v > max_val:
            raise ValueError(f"{name} must be <= {max_val}, got {v}.")
    else:
        if v >= max_val:
            raise ValueError(f"{name} must be < {max_val}, got {v}.")

    return v


def validate_non_empty_list(items: Any, name: str = "List") -> list:
    """
    Validates that items is a non-empty sequence or list.

    Args:
        items (Any): Iterable to check.
        name (str): Parameter name.

    Returns:
        list: Converted list of items.

    Raises:
        TypeError: If items is not iterable or is a string/mapping.
        ValueError: If the sequence is empty.
    """
    if items is None:
        raise TypeError(f"{name} cannot be None.")
    if isinstance(items, (str, bytes)):
        raise TypeError(f"{name} must be a sequence of items, not a string.")
    if not isinstance(items, Sequence):
        try:
            items = list(items)
        except TypeError:
            raise TypeError(f"{name} must be a sequence or collection, got {type(items).__name__}.")

    items_list = list(items)
    if len(items_list) == 0:
        raise ValueError(f"{name} cannot be empty.")

    return items_list


def validate_finite_sequence(items: Any, name: str = "Values") -> List[float]:
    """
    Validates that an input is a non-empty sequence of finite numbers.

    Args:
        items (Any): Iterable of numeric values.
        name (str): Parameter name.

    Returns:
        List[float]: Validated list of float numbers.
    """
    raw_list = validate_non_empty_list(items, name)
    validated = []
    for idx, item in enumerate(raw_list):
        validated.append(validate_finite_number(item, f"{name}[{idx}]"))
    return validated
