"""
Validation Framework for SuperCalcee
====================================

Provides centralized mathematical, physical, probabilistic, financial,
and numerical singularity validation rules.

Author: SuperCalcee Core Team
License: MIT
"""

from .common import (
    validate_finite_number,
    validate_finite_sequence,
    validate_in_range,
    validate_non_empty_list,
    validate_non_negative,
    validate_positive,
)
from .finance import (
    validate_cashflows,
    validate_discount_rate,
    validate_irr_cashflows,
    validate_spot_and_strike,
    validate_time_to_maturity,
    validate_volatility,
    validate_wacc_inputs,
)
from .numerical import (
    ZeroDenominatorError,
    is_close,
    validate_non_zero_denominator,
    validate_positive_integer,
)
from .physical import (
    validate_concentration,
    validate_frequency,
    validate_mass,
    validate_michaelis_menten,
    validate_rate_constant,
    validate_reaction_quotient,
    validate_temperature_kelvin,
    validate_wavelength,
)
from .probability import (
    validate_allele_frequencies,
    validate_probability,
    validate_probability_distribution,
)

__all__ = [
    # Common
    "validate_finite_number",
    "validate_positive",
    "validate_non_negative",
    "validate_in_range",
    "validate_non_empty_list",
    "validate_finite_sequence",
    # Numerical
    "ZeroDenominatorError",
    "validate_non_zero_denominator",
    "validate_positive_integer",
    "is_close",
    # Probability
    "validate_probability",
    "validate_probability_distribution",
    "validate_allele_frequencies",
    # Physical
    "validate_mass",
    "validate_temperature_kelvin",
    "validate_concentration",
    "validate_reaction_quotient",
    "validate_rate_constant",
    "validate_michaelis_menten",
    "validate_wavelength",
    "validate_frequency",
    # Finance
    "validate_spot_and_strike",
    "validate_volatility",
    "validate_time_to_maturity",
    "validate_discount_rate",
    "validate_cashflows",
    "validate_irr_cashflows",
    "validate_wacc_inputs",
]
