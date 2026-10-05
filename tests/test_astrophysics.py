"""
Unit and boundary tests for Astrophysics Engine (`src_python/domains/astrophysics.py`).
"""

import math

import pytest

from src_python.domains.astrophysics import AstrophysicsEngine


class TestAstrophysicsCore:
    """Tests astronomical calculations and physical bounds."""

    def test_schwarzschild_radius_solar_mass(self, astro: AstrophysicsEngine):
        """Schwarzschild radius for 1 Solar Mass (~1.989e30 kg) should be ~2954 m (~3 km)."""
        solar_mass = 1.989e30
        rs = astro.schwarzschild_radius(solar_mass)
        assert 2950 < rs < 2960

    def test_schwarzschild_radius_zero_mass(self, astro: AstrophysicsEngine):
        """Zero mass yields zero event horizon."""
        rs = astro.schwarzschild_radius(0.0)
        assert rs == 0.0

    def test_schwarzschild_radius_earth_mass(self, astro: AstrophysicsEngine):
        """Earth mass (~5.972e24 kg) Schwarzschild radius is ~8.87 mm (0.00887 m)."""
        earth_mass = 5.972e24
        rs = astro.schwarzschild_radius(earth_mass)
        assert 0.008 < rs < 0.010

    def test_kepler_third_law_earth_orbit(self, astro: AstrophysicsEngine):
        """Kepler's third law for Earth's orbital period around the Sun (~3.156e7 seconds / 1 year)."""
        a = 1.496e11  # 1 AU in meters
        M = 1.989e30  # Solar mass in kg
        period = astro.keplers_third_law(semi_major_axis=a, mass_central=M)
        assert isinstance(period, float)
        one_year_seconds = 365.25 * 24 * 3600
        assert math.isclose(period, one_year_seconds, rel_tol=0.01)

    def test_kepler_third_law_solve_semi_major_axis(self, astro: AstrophysicsEngine):
        """Kepler's third law solving for semi-major axis given period and mass."""
        T = 365.25 * 24 * 3600
        M = 1.989e30
        a = astro.keplers_third_law(period=T, mass_central=M)
        assert isinstance(a, float)
        assert math.isclose(a, 1.496e11, rel_tol=0.01)

    def test_kepler_third_law_insufficient_parameters(self, astro: AstrophysicsEngine):
        """Fewer than 2 parameters must raise ValueError."""
        with pytest.raises(ValueError, match="Must provide at least 2"):
            astro.keplers_third_law(period=100.0)

    def test_drake_equation_nominal(self, astro: AstrophysicsEngine):
        """Drake equation calculation with typical optimistic parameters."""
        N = astro.drake_equation(R=1.5, fp=0.5, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)
        expected = 1.5 * 0.5 * 2.0 * 1.0 * 0.2 * 0.2 * 10000.0
        assert math.isclose(N, expected, rel_tol=1e-7)

    def test_drake_equation_zero_factor(self, astro: AstrophysicsEngine):
        """If any probability factor is zero, N must be zero."""
        N = astro.drake_equation(R=1.5, fp=0.0, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)
        assert N == 0.0


class TestAstrophysicsReliabilityAndRegression:
    """Regression tests for astrophysics physical parameter validation."""

    def test_schwarzschild_negative_mass_rejected(self, astro: AstrophysicsEngine):
        """Negative mass for black hole event horizon must raise ValueError."""
        with pytest.raises(ValueError, match="non-negative"):
            astro.schwarzschild_radius(-1.989e30)

    def test_schwarzschild_nan_inf_rejected(self, astro: AstrophysicsEngine):
        """NaN or infinite mass in Schwarzschild radius must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            astro.schwarzschild_radius(float("nan"))
        with pytest.raises(ValueError, match="cannot be infinite"):
            astro.schwarzschild_radius(float("inf"))

    def test_kepler_non_positive_parameters_rejected(self, astro: AstrophysicsEngine):
        """Negative or zero period, axis, or central mass must raise ValueError."""
        with pytest.raises(ValueError, match="must be positive"):
            astro.keplers_third_law(period=-100.0, mass_central=1e30)
        with pytest.raises(ValueError, match="must be positive"):
            astro.keplers_third_law(semi_major_axis=0.0, mass_central=1e30)
        with pytest.raises(ValueError, match="must be positive"):
            astro.keplers_third_law(period=1000.0, mass_central=-1e30)

    def test_kepler_nan_inf_rejected(self, astro: AstrophysicsEngine):
        """NaN or inf parameters in Kepler's third law must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            astro.keplers_third_law(period=float("nan"), mass_central=1e30)
        with pytest.raises(ValueError, match="cannot be infinite"):
            astro.keplers_third_law(period=1000.0, semi_major_axis=float("inf"))

    def test_drake_equation_invalid_parameters(self, astro: AstrophysicsEngine):
        """Invalid probabilities, negative rates, or lifetimes must raise ValueError."""
        # fp > 1
        with pytest.raises(ValueError, match="between 0 and 1"):
            astro.drake_equation(R=1.5, fp=1.5, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)
        # R <= 0
        with pytest.raises(ValueError, match="must be positive"):
            astro.drake_equation(R=0.0, fp=0.5, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)
        # L <= 0
        with pytest.raises(ValueError, match="must be positive"):
            astro.drake_equation(R=1.5, fp=0.5, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=-100.0)
        # ne < 0
        with pytest.raises(ValueError, match="non-negative"):
            astro.drake_equation(R=1.5, fp=0.5, ne=-1.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)

    def test_drake_equation_nan_inf_rejected(self, astro: AstrophysicsEngine):
        """NaN or inf in Drake equation must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            astro.drake_equation(R=float("nan"), fp=0.5, ne=2.0, fl=1.0, fi=0.2, fc=0.2, L=10000.0)
