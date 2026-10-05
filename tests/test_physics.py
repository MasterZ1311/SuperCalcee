"""
Unit and boundary tests for Physics Engine (`src_python/domains/physics.py`).
"""

import math

import pytest

from src_python.domains.physics import PhysicsEngine
from src_python.validation import ZeroDenominatorError


class TestPhysicsNormalCases:
    """Standard operational physics calculations."""

    def test_energy_from_mass(self, physics: PhysicsEngine):
        """E = mc^2 forward calculation."""
        energy = physics.energy_mass_equivalence(mass=1.0)
        expected = physics.c**2
        assert math.isclose(energy, expected, rel_tol=1e-7)

    def test_mass_from_energy(self, physics: PhysicsEngine):
        """m = E / c^2 inverse calculation."""
        mass = physics.energy_mass_equivalence(energy=physics.c**2)
        assert math.isclose(mass, 1.0, rel_tol=1e-7)

    def test_heisenberg_uncertainty_momentum(self, physics: PhysicsEngine):
        """Quantum uncertainty in momentum given position uncertainty."""
        delta_p = physics.heisenberg_uncertainty(delta_x=1e-10)
        expected = (physics.h_bar / 2.0) / 1e-10
        assert math.isclose(delta_p, expected, rel_tol=1e-7)

    def test_heisenberg_uncertainty_position(self, physics: PhysicsEngine):
        """Quantum uncertainty in position given momentum uncertainty."""
        delta_x = physics.heisenberg_uncertainty(delta_p=1e-24)
        expected = (physics.h_bar / 2.0) / 1e-24
        assert math.isclose(delta_x, expected, rel_tol=1e-7)

    def test_newtons_second_law_force(self, physics: PhysicsEngine):
        """F = m * a calculation."""
        F = physics.newtons_second_law(m=10.0, a=2.5)
        assert F == 25.0

    def test_newtons_second_law_mass(self, physics: PhysicsEngine):
        """m = F / a calculation."""
        m = physics.newtons_second_law(F=50.0, a=5.0)
        assert m == 10.0

    def test_newtons_second_law_acceleration(self, physics: PhysicsEngine):
        """a = F / m calculation."""
        a = physics.newtons_second_law(F=50.0, m=10.0)
        assert a == 5.0


class TestPhysicsZeroDenominatorsAndErrors:
    """Edge cases involving division by zero and invalid parameters."""

    def test_heisenberg_zero_delta_x(self, physics: PhysicsEngine):
        """Zero position uncertainty causes ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError):
            physics.heisenberg_uncertainty(delta_x=0.0)

    def test_heisenberg_zero_delta_p(self, physics: PhysicsEngine):
        """Zero momentum uncertainty causes ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError):
            physics.heisenberg_uncertainty(delta_p=0.0)

    def test_newton_zero_mass_denominator(self, physics: PhysicsEngine):
        """Calculating acceleration with mass=0.0 causes ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError):
            physics.newtons_second_law(F=10.0, m=0.0)

    def test_newton_zero_acceleration_denominator(self, physics: PhysicsEngine):
        """Calculating mass with acceleration=0.0 causes ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError):
            physics.newtons_second_law(F=10.0, a=0.0)

    def test_energy_mass_both_provided_raises(self, physics: PhysicsEngine):
        """Providing both mass and energy must raise ValueError."""
        with pytest.raises(ValueError, match="Must provide exactly one"):
            physics.energy_mass_equivalence(mass=1.0, energy=100.0)

    def test_energy_mass_neither_provided_raises(self, physics: PhysicsEngine):
        """Providing neither mass nor energy must raise ValueError."""
        with pytest.raises(ValueError, match="Must provide exactly one"):
            physics.energy_mass_equivalence()

    def test_heisenberg_both_or_neither_raises(self, physics: PhysicsEngine):
        """Heisenberg requires exactly one parameter."""
        with pytest.raises(ValueError):
            physics.heisenberg_uncertainty(delta_x=1.0, delta_p=1.0)
        with pytest.raises(ValueError):
            physics.heisenberg_uncertainty()

    def test_newton_invalid_parameter_count(self, physics: PhysicsEngine):
        """Newton's second law requires exactly two parameters."""
        with pytest.raises(ValueError, match="Must provide exactly two"):
            physics.newtons_second_law(F=10.0)
        with pytest.raises(ValueError, match="Must provide exactly two"):
            physics.newtons_second_law(F=10.0, m=2.0, a=5.0)


class TestPhysicsBoundariesAndNegativeParameters:
    """Extreme limits and negative value handling."""

    def test_negative_mass_energy(self, physics: PhysicsEngine):
        """Negative mass produces negative energy (non-physical mathematical evaluation)."""
        energy = physics.energy_mass_equivalence(mass=-5.0)
        assert energy < 0

    def test_negative_acceleration(self, physics: PhysicsEngine):
        """Deceleration produces negative force."""
        F = physics.newtons_second_law(m=10.0, a=-9.8)
        assert F == -98.0

    def test_astronomical_mass_boundary(self, physics: PhysicsEngine):
        """Energy equivalence for solar mass (1.989e30 kg)."""
        solar_mass = 1.989e30
        energy = physics.energy_mass_equivalence(mass=solar_mass)
        assert energy > 1e47

    def test_subatomic_quantum_boundary(self, physics: PhysicsEngine):
        """Uncertainty at Planck scale (1e-35 m)."""
        delta_p = physics.heisenberg_uncertainty(delta_x=1e-35)
        assert delta_p > 1.0


class TestPhysicsReliabilityAndRegression:
    """Regression tests for physics validation utilities."""

    def test_heisenberg_negative_uncertainty_raises(self, physics: PhysicsEngine):
        """Negative position or momentum uncertainty must raise ValueError."""
        with pytest.raises(ValueError, match="must be strictly positive"):
            physics.heisenberg_uncertainty(delta_x=-1e-10)
        with pytest.raises(ValueError, match="must be strictly positive"):
            physics.heisenberg_uncertainty(delta_p=-1e-24)

    def test_heisenberg_zero_inherits_value_and_zero_division(self, physics: PhysicsEngine):
        """ZeroDenominatorError inherits from both ValueError and ZeroDivisionError."""
        with pytest.raises(ZeroDenominatorError):
            physics.heisenberg_uncertainty(delta_x=0.0)
        with pytest.raises(ValueError):
            physics.heisenberg_uncertainty(delta_x=0.0)
        with pytest.raises(ZeroDivisionError):
            physics.heisenberg_uncertainty(delta_x=0.0)

    def test_energy_mass_nan_inf_rejected(self, physics: PhysicsEngine):
        """NaN and inf values in mass-energy equivalence are rejected."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            physics.energy_mass_equivalence(mass=float("nan"))
        with pytest.raises(ValueError, match="cannot be infinite"):
            physics.energy_mass_equivalence(energy=float("inf"))

    def test_newton_negative_mass_rejected(self, physics: PhysicsEngine):
        """Newton's second law rejects non-positive mass when solving for F."""
        with pytest.raises(ValueError, match="Mass .* must be positive"):
            physics.newtons_second_law(m=-5.0, a=2.0)

    def test_newton_opposite_signs_force_acceleration(self, physics: PhysicsEngine):
        """Solving for mass with opposing F and a yields negative mass and raises ValueError."""
        with pytest.raises(ValueError, match="Force and acceleration must have the same directional sign"):
            physics.newtons_second_law(F=10.0, a=-2.0)

    def test_newton_nan_inf_rejected(self, physics: PhysicsEngine):
        """NaN and inf inputs to Newton's second law are rejected."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            physics.newtons_second_law(F=float("nan"), m=5.0)
        with pytest.raises(ValueError, match="cannot be infinite"):
            physics.newtons_second_law(m=5.0, a=float("inf"))
