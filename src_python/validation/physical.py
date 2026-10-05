"""
Physical & Chemical Quantity Validation Utilities
==================================================

Provides validation for physical and chemical parameters including mass,
absolute temperature (Kelvin), concentrations, reaction quotients,
and enzyme kinetics (Michaelis-Menten).

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Any, Tuple

from .common import validate_finite_number, validate_non_negative, validate_positive
from .numerical import ZeroDenominatorError


def validate_mass(m: Any, name: str = "Mass", allow_zero: bool = False) -> float:
    """
    Validates that a mass value is physically non-negative (>= 0) or strictly positive (> 0).

    Args:
        m (Any): Mass value in kg or relevant mass units.
        name (str): Parameter display name.
        allow_zero (bool): Whether zero mass is permitted (e.g. photon rest mass).

    Returns:
        float: Validated mass.

    Raises:
        ValueError: If mass is negative, or zero when allow_zero=False.
    """
    return validate_positive(m, name=name, allow_zero=allow_zero)


def validate_temperature_kelvin(
    T: Any,
    name: str = "Temperature",
    allow_zero: bool = False,
) -> float:
    """
    Validates that a temperature in Kelvin is above absolute zero (>= 0 K or > 0 K).

    Args:
        T (Any): Temperature in Kelvin.
        name (str): Parameter display name.
        allow_zero (bool): Whether 0 K is permitted. Defaults to False because
            many thermodynamic expressions (Nernst, Arrhenius, Ideal Gas) divide by T.

    Returns:
        float: Validated temperature in Kelvin.

    Raises:
        ValueError: If temperature is below absolute zero (negative) or zero when allow_zero=False.
    """
    if allow_zero:
        return validate_non_negative(T, name=f"{name} (Kelvin)")
    else:
        return validate_positive(T, name=f"{name} (Kelvin)")


def validate_concentration(c: Any, name: str = "Concentration") -> float:
    """
    Validates that a chemical or molar concentration is non-negative (>= 0).

    Args:
        c (Any): Concentration value.
        name (str): Parameter display name.

    Returns:
        float: Validated concentration.

    Raises:
        ValueError: If concentration is negative.
    """
    return validate_non_negative(c, name=name)


def validate_reaction_quotient(Q: Any, name: str = "Reaction quotient (Q)") -> float:
    """
    Validates that a reaction quotient Q is strictly positive (> 0), as ln(Q) is undefined for Q <= 0.

    Args:
        Q (Any): Reaction quotient.
        name (str): Parameter display name.

    Returns:
        float: Validated reaction quotient.

    Raises:
        ValueError: If Q <= 0.
    """
    q_val = validate_finite_number(Q, name=name)
    if q_val <= 0.0:
        raise ValueError(f"{name} must be strictly positive (> 0), got {q_val}.")
    return q_val


def validate_rate_constant(k: Any, name: str = "Rate constant (k)") -> float:
    """
    Validates that a chemical reaction rate constant k is strictly positive (> 0).

    Args:
        k (Any): Rate constant.
        name (str): Parameter display name.

    Returns:
        float: Validated rate constant.

    Raises:
        ValueError: If k <= 0.
    """
    return validate_positive(k, name=name)


def validate_michaelis_menten(
    vmax: Any,
    km: Any,
    s: Any,
) -> Tuple[float, float, float]:
    """
    Validates enzyme kinetics parameters for the Michaelis-Menten equation:
        v = (Vmax * [S]) / (Km + [S])

    Physical & Mathematical Requirements:
    1. Denominator (Km + [S]) != 0 (prevents division by zero singularity)
    2. Vmax > 0 (maximum reaction velocity must be strictly positive)
    3. Km > 0 (Michaelis constant must be strictly positive)
    4. [S] >= 0 (substrate concentration must be non-negative)

    Args:
        vmax (Any): Maximum reaction rate Vmax.
        km (Any): Michaelis constant Km.
        s (Any): Substrate concentration [S].

    Returns:
        Tuple[float, float, float]: Validated (Vmax, Km, [S]).

    Raises:
        ZeroDenominatorError: If the denominator Km + [S] == 0.
        ValueError: If any physical constraints are violated.
    """
    vmax_val = validate_finite_number(vmax, name="Vmax")
    km_val = validate_finite_number(km, name="Km")
    s_val = validate_finite_number(s, name="Substrate concentration [S]")

    if (km_val + s_val) == 0.0:
        raise ZeroDenominatorError("Denominator (Km + S) cannot be zero.")

    if vmax_val <= 0.0:
        raise ValueError(f"Vmax must be positive (> 0), got {vmax_val}.")
    if km_val <= 0.0:
        raise ValueError(f"Km must be positive (> 0), got {km_val}.")
    if s_val < 0.0:
        raise ValueError(f"Substrate concentration [S] must be non-negative (>= 0), got {s_val}.")

    return (vmax_val, km_val, s_val)


def validate_wavelength(wavelength: Any, name: str = "Wavelength") -> float:
    """Validates that a wavelength is strictly positive (> 0)."""
    return validate_positive(wavelength, name=name)


def validate_frequency(frequency: Any, name: str = "Frequency") -> float:
    """Validates that a frequency is strictly positive (> 0)."""
    return validate_positive(frequency, name=name)
