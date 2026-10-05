"""
Unit and functional tests for Dimensional Analysis & Unit Conversion Engine (`src_python/units/dimensional.py`).
"""

import pytest

from src_python.units.dimensional import DimensionalEngine


class TestUnitsValidConversions:
    """Tests valid dimensional unit conversions."""

    def test_length_conversion_km_to_m(self, dim: DimensionalEngine):
        """Convert kilometers to meters."""
        result = dim.convert_units("1 * kilometer", "meter")
        assert "1000" in str(result) and "meter" in str(result)

    def test_speed_conversion_kmh_to_ms(self, dim: DimensionalEngine):
        """Convert km/h to m/s."""
        result = dim.convert_units("36 * kilometer / hour", "meter / second")
        assert "10" in str(result) and "meter" in str(result) and "second" in str(result)

    def test_time_conversion_hour_to_sec(self, dim: DimensionalEngine):
        """Convert hours to seconds."""
        result = dim.convert_units("1 * hour", "second")
        assert "3600" in str(result) and "second" in str(result)

    def test_mass_conversion_kg_to_g(self, dim: DimensionalEngine):
        """Convert kilograms to grams."""
        result = dim.convert_units("1 * kilogram", "gram")
        assert "1000" in str(result) and "gram" in str(result)

    def test_evaluate_with_units_direct(self, dim: DimensionalEngine):
        """Ensure unit-bound expressions are created correctly."""
        expr = dim.evaluate_with_units("5 * meter")
        assert expr is not None
        assert "meter" in str(expr)


class TestUnitsInvalidAndEdgeCases:
    """Tests boundary conditions, incompatible units, and malformed inputs."""

    def test_unknown_unit_symbol(self, dim: DimensionalEngine):
        """
        Unknown unit symbols should be rejected.
        In the secure parser, non-existent units raise ValueError.
        """
        with pytest.raises(ValueError, match="Failed to parse unit expression"):
            dim.evaluate_with_units("10 * non_existent_unit_xyz")

    def test_malformed_unit_expression(self, dim: DimensionalEngine):
        """Malformed syntax in unit expressions must raise ValueError."""
        with pytest.raises(ValueError, match="Failed to parse unit expression"):
            dim.evaluate_with_units("10 + * meter")

    def test_empty_unit_expression(self, dim: DimensionalEngine):
        """Empty string must raise ValueError."""
        with pytest.raises(ValueError):
            dim.evaluate_with_units("")

    def test_incompatible_units_detection(self, dim: DimensionalEngine):
        """
        Incompatible unit conversion (e.g. Length to Time: meter -> second).
        The execution pipeline raises a ValueError for illegal dimensional conversions.
        """
        with pytest.raises(ValueError, match=".*Incompatible dimensions.*"):
            dim.convert_units("10 * meter", "second")
