"""
Unit tests for SuperCalcee Validation Utilities (`src_python/validation/`).
"""

import math

import pytest

from src_python.validation import (
    ZeroDenominatorError,
    is_close,
    validate_allele_frequencies,
    validate_cashflows,
    validate_concentration,
    validate_discount_rate,
    validate_finite_number,
    validate_finite_sequence,
    validate_frequency,
    validate_in_range,
    validate_irr_cashflows,
    validate_mass,
    validate_michaelis_menten,
    validate_non_empty_list,
    validate_non_negative,
    validate_non_zero_denominator,
    validate_positive,
    validate_positive_integer,
    validate_probability,
    validate_probability_distribution,
    validate_rate_constant,
    validate_reaction_quotient,
    validate_spot_and_strike,
    validate_temperature_kelvin,
    validate_time_to_maturity,
    validate_volatility,
    validate_wacc_inputs,
    validate_wavelength,
)


class TestCommonValidation:
    """Tests for common numerical, type, and range validation."""

    def test_validate_finite_number_valid(self):
        assert validate_finite_number(42) == 42.0
        assert validate_finite_number(3.14159) == 3.14159
        assert validate_finite_number("-12.5") == -12.5

    def test_validate_finite_number_rejects_bool(self):
        with pytest.raises(TypeError, match="must be a real number, got boolean"):
            validate_finite_number(True)
        with pytest.raises(TypeError, match="must be a real number, got boolean"):
            validate_finite_number(False)

    def test_validate_finite_number_rejects_none(self):
        with pytest.raises(TypeError, match="cannot be None"):
            validate_finite_number(None)

    def test_validate_finite_number_rejects_nan_inf(self):
        with pytest.raises(ValueError, match="cannot be NaN"):
            validate_finite_number(float("nan"))
        with pytest.raises(ValueError, match="cannot be infinite"):
            validate_finite_number(float("inf"))
        with pytest.raises(ValueError, match="cannot be infinite"):
            validate_finite_number(float("-inf"))

    def test_validate_positive(self):
        assert validate_positive(5.0) == 5.0
        with pytest.raises(ValueError, match="must be positive"):
            validate_positive(0.0)
        with pytest.raises(ValueError, match="must be positive"):
            validate_positive(-1.0)
        # allow_zero
        assert validate_positive(0.0, allow_zero=True) == 0.0
        with pytest.raises(ValueError, match="must be non-negative"):
            validate_positive(-0.5, allow_zero=True)

    def test_validate_in_range(self):
        assert validate_in_range(5.0, min_val=0.0, max_val=10.0) == 5.0
        with pytest.raises(ValueError, match="must be >= 0.0"):
            validate_in_range(-1.0, min_val=0.0, max_val=10.0)
        with pytest.raises(ValueError, match="must be <= 10.0"):
            validate_in_range(11.0, min_val=0.0, max_val=10.0)

    def test_validate_non_empty_list(self):
        assert validate_non_empty_list([1, 2, 3]) == [1, 2, 3]
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_non_empty_list([])
        with pytest.raises(TypeError, match="must be a sequence of items, not a string"):
            validate_non_empty_list("abc")

    def test_validate_finite_sequence(self):
        assert validate_finite_sequence([1, 2.5, 3]) == [1.0, 2.5, 3.0]
        with pytest.raises(ValueError, match="cannot be NaN"):
            validate_finite_sequence([1.0, float("nan")])


class TestNumericalAndSingularityValidation:
    """Tests for singularity handling and dual-inheritance ZeroDenominatorError."""

    def test_zero_denominator_error_dual_inheritance(self):
        err = ZeroDenominatorError("Division by zero")
        assert isinstance(err, ValueError)
        assert isinstance(err, ZeroDivisionError)

    def test_validate_non_zero_denominator(self):
        assert validate_non_zero_denominator(1e-35) == 1e-35
        assert validate_non_zero_denominator(-5.0) == -5.0
        with pytest.raises(ZeroDenominatorError):
            validate_non_zero_denominator(0.0)

    def test_validate_positive_integer(self):
        assert validate_positive_integer(3, "n") == 3
        assert validate_positive_integer(3.0, "n") == 3
        with pytest.raises(ValueError, match="strictly positive integer"):
            validate_positive_integer(0, "n")
        with pytest.raises(ValueError, match="whole integer"):
            validate_positive_integer(2.7, "n")
        with pytest.raises(ValueError, match="must be an integer, got bool"):
            validate_positive_integer(True, "n")

    def test_is_close(self):
        assert is_close(1.0, 1.0000001, atol=1e-5)
        assert not is_close(1.0, 1.1, atol=1e-5)


class TestProbabilityValidation:
    """Tests for probabilities, distributions, and allele frequencies."""

    def test_validate_probability(self):
        assert validate_probability(0.0) == 0.0
        assert validate_probability(1.0) == 1.0
        assert validate_probability(0.5) == 0.5
        with pytest.raises(ValueError, match="between 0 and 1"):
            validate_probability(-0.01)
        with pytest.raises(ValueError, match="between 0 and 1"):
            validate_probability(1.01)

    def test_validate_probability_distribution(self):
        res = validate_probability_distribution([0.2, 0.5, 0.3])
        assert math.isclose(sum(res), 1.0, rel_tol=1e-7)
        with pytest.raises(ValueError, match="must sum to 1.0"):
            validate_probability_distribution([0.2, 0.2])
        with pytest.raises(ValueError, match="between 0 and 1"):
            validate_probability_distribution([-0.5, 1.5])

    def test_validate_allele_frequencies(self):
        p, q = validate_allele_frequencies(p=0.3)
        assert math.isclose(p, 0.3) and math.isclose(q, 0.7)

        p, q = validate_allele_frequencies(q=0.2)
        assert math.isclose(p, 0.8) and math.isclose(q, 0.2)

        p, q = validate_allele_frequencies(p=0.4, q=0.6)
        assert math.isclose(p, 0.4) and math.isclose(q, 0.6)

        with pytest.raises(ValueError, match="must sum to 1.0"):
            validate_allele_frequencies(p=0.4, q=0.7)
        with pytest.raises(ValueError, match="Must provide either"):
            validate_allele_frequencies()


class TestPhysicalAndChemicalValidation:
    """Tests for physical constraints and enzyme kinetics."""

    def test_validate_mass(self):
        assert validate_mass(10.0) == 10.0
        assert validate_mass(0.0, allow_zero=True) == 0.0
        with pytest.raises(ValueError, match="must be positive"):
            validate_mass(0.0, allow_zero=False)
        with pytest.raises(ValueError, match="must be non-negative"):
            validate_mass(-1.0, allow_zero=True)

    def test_validate_temperature_kelvin(self):
        assert validate_temperature_kelvin(298.15) == 298.15
        assert validate_temperature_kelvin(0.0, allow_zero=True) == 0.0
        with pytest.raises(ValueError, match="must be positive"):
            validate_temperature_kelvin(0.0, allow_zero=False)
        with pytest.raises(ValueError, match="non-negative"):
            validate_temperature_kelvin(-5.0, allow_zero=True)

    def test_validate_michaelis_menten(self):
        vmax, km, s = validate_michaelis_menten(10.0, 2.0, 5.0)
        assert vmax == 10.0 and km == 2.0 and s == 5.0

        with pytest.raises(ZeroDenominatorError, match="cannot be zero"):
            validate_michaelis_menten(10.0, 0.0, 0.0)
        with pytest.raises(ValueError, match="Vmax must be positive"):
            validate_michaelis_menten(-10.0, 2.0, 5.0)
        with pytest.raises(ValueError, match="Km must be positive"):
            validate_michaelis_menten(10.0, -2.0, 5.0)
        with pytest.raises(ValueError, match="Substrate concentration \\[S\\] must be non-negative"):
            validate_michaelis_menten(10.0, 2.0, -1.0)


class TestFinanceValidation:
    """Tests for financial inputs, cash flows, and option metrics."""

    def test_validate_discount_rate(self):
        assert validate_discount_rate(0.05) == 0.05
        assert validate_discount_rate(-0.005) == -0.005  # Valid negative rate
        with pytest.raises(ValueError, match="strictly greater than -1.0"):
            validate_discount_rate(-1.0)
        with pytest.raises(ValueError, match="strictly greater than -1.0"):
            validate_discount_rate(-1.2)

    def test_validate_irr_cashflows(self):
        cfs = validate_irr_cashflows([-100.0, 50.0, 70.0])
        assert len(cfs) == 3
        with pytest.raises(ValueError, match="must contain both positive .* and negative"):
            validate_irr_cashflows([100.0, 200.0])
        with pytest.raises(ValueError, match="at least 2 periods"):
            validate_irr_cashflows([-100.0])

    def test_validate_wacc_inputs(self):
        e, d, re, rd, t = validate_wacc_inputs(60.0, 40.0, 0.1, 0.05, 0.25)
        assert e == 60.0 and d == 40.0 and t == 0.25
        with pytest.raises(ZeroDenominatorError, match="cannot be zero"):
            validate_wacc_inputs(0.0, 0.0, 0.1, 0.05, 0.25)
        with pytest.raises(ValueError, match="must be <= 1.0"):
            validate_wacc_inputs(60.0, 40.0, 0.1, 0.05, 1.5)
