"""
Probability & Statistical Validation Utilities
==============================================

Provides validation for probabilities, probability distributions (e.g. Shannon entropy),
and genetics allele frequencies (Hardy-Weinberg equilibrium).

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Any, List, Optional, Sequence, Tuple

from .common import validate_finite_number, validate_non_empty_list


def validate_probability(val: Any, name: str = "Probability") -> float:
    """
    Validates that a value is a valid probability: 0.0 <= val <= 1.0.

    Args:
        val (Any): Input probability value.
        name (str): Parameter display name.

    Returns:
        float: Validated probability.

    Raises:
        ValueError: If value is not between 0 and 1, or is NaN/inf.
        TypeError: If value is not a real number.
    """
    v = validate_finite_number(val, name=name)
    if v < 0.0 or v > 1.0:
        raise ValueError(f"{name} must be between 0 and 1, got {v}.")
    return v


def validate_probability_distribution(
    probabilities: Sequence[Any],
    name: str = "Probabilities",
    atol: float = 1e-4,
) -> List[float]:
    """
    Validates that a sequence represents a valid discrete probability distribution:
    1. The sequence is non-empty.
    2. Every probability p_i satisfies 0.0 <= p_i <= 1.0.
    3. The sum of all probabilities equals 1.0 within tolerance atol.

    Args:
        probabilities (Sequence[Any]): Sequence of probabilities.
        name (str): Parameter display name.
        atol (float): Absolute tolerance for the sum (default 1e-4).

    Returns:
        List[float]: Validated list of probabilities.

    Raises:
        ValueError: If any probability is outside [0, 1] or the sum != 1.0 within tolerance.
        TypeError: If elements are not valid numbers.
    """
    raw_list = validate_non_empty_list(probabilities, name)
    validated: List[float] = []

    for idx, p in enumerate(raw_list):
        validated.append(validate_probability(p, name=f"{name}[{idx}]"))

    total = sum(validated)
    if abs(total - 1.0) > atol:
        raise ValueError(
            f"{name} must sum to 1.0 (got sum = {total:.6f}, difference {abs(total - 1.0):.6e} > tolerance {atol})."
        )

    return validated


def validate_allele_frequencies(
    p: Optional[float] = None,
    q: Optional[float] = None,
    atol: float = 1e-4,
) -> Tuple[float, float]:
    """
    Validates allele frequencies p and q for Hardy-Weinberg equilibrium:
    - 0 <= p <= 1
    - 0 <= q <= 1
    - If only p is specified: q = 1 - p
    - If only q is specified: p = 1 - q
    - If both are specified: p + q == 1 within atol
    - At least one of p or q must be provided.

    Args:
        p (Optional[float]): Frequency of dominant allele.
        q (Optional[float]): Frequency of recessive allele.
        atol (float): Absolute tolerance for p + q == 1.

    Returns:
        Tuple[float, float]: Validated (p, q).

    Raises:
        ValueError: If neither is provided, bounds are violated, or p + q != 1.
    """
    if p is None and q is None:
        raise ValueError("Must provide either allele frequency 'p' or 'q'.")

    if p is not None:
        p_val = validate_probability(p, name="Allele frequency p")
    else:
        p_val = None

    if q is not None:
        q_val = validate_probability(q, name="Allele frequency q")
    else:
        q_val = None

    if p_val is not None and q_val is None:
        q_val = 1.0 - p_val
    elif q_val is not None and p_val is None:
        p_val = 1.0 - q_val
    else:
        # Both p and q are specified
        assert p_val is not None and q_val is not None
        if abs((p_val + q_val) - 1.0) > atol:
            raise ValueError(
                f"Allele frequencies p ({p_val}) and q ({q_val}) must sum to 1.0 "
                f"(got sum = {p_val + q_val:.6f}, diff = {abs(p_val + q_val - 1.0):.6e} > {atol})."
            )

    return (p_val, q_val)
