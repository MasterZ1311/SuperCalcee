"""
Unit and boundary tests for Chemistry Engine (`src_python/domains/chemistry.py`).
"""

import math

import pytest

from src_python.domains.chemistry import ChemistryEngine


class TestChemistryCore:
    """Tests chemical thermodynamic and electrochemical calculations."""

    def test_nernst_standard_equilibrium_q1(self, chem: ChemistryEngine):
        """When reaction quotient Q = 1, E must equal standard potential E0."""
        E = chem.nernst_equation(E0=1.10, n=2, Q=1.0, T=298.15)
        assert math.isclose(E, 1.10, rel_tol=1e-7)

    def test_nernst_concentrated_products(self, chem: ChemistryEngine):
        """When Q > 1, potential E must be less than standard E0."""
        E = chem.nernst_equation(E0=1.10, n=2, Q=100.0, T=298.15)
        assert E < 1.10

    def test_nernst_concentrated_reactants(self, chem: ChemistryEngine):
        """When Q < 1, potential E must exceed standard E0."""
        E = chem.nernst_equation(E0=1.10, n=2, Q=0.01, T=298.15)
        assert E > 1.10

    def test_nernst_invalid_q_zero_or_negative(self, chem: ChemistryEngine):
        """Reaction quotient Q <= 0 must raise ValueError."""
        with pytest.raises(ValueError, match="strictly positive"):
            chem.nernst_equation(E0=1.10, n=2, Q=0.0)
        with pytest.raises(ValueError, match="strictly positive"):
            chem.nernst_equation(E0=1.10, n=2, Q=-5.0)

    def test_gibbs_free_energy_spontaneous(self, chem: ChemistryEngine):
        """Exothermic with positive entropy gives negative Delta G (spontaneous)."""
        delta_G = chem.gibbs_free_energy(delta_H=-100000.0, T=300.0, delta_S=50.0)
        assert delta_G < 0
        assert delta_G == -100000.0 - (300.0 * 50.0)

    def test_gibbs_free_energy_nonspontaneous(self, chem: ChemistryEngine):
        """Endothermic with negative entropy gives positive Delta G (non-spontaneous)."""
        delta_G = chem.gibbs_free_energy(delta_H=50000.0, T=300.0, delta_S=-20.0)
        assert delta_G > 0

    def test_first_order_kinetics_initial_concentration(self, chem: ChemistryEngine):
        """At t=0, concentration must equal initial concentration A0."""
        A = chem.first_order_kinetics(k=0.05, t=0.0, A0=1.0)
        assert A == 1.0

    def test_first_order_kinetics_half_life(self, chem: ChemistryEngine):
        """At t = ln(2)/k, concentration must equal 0.5 * A0."""
        k = 0.05
        t_half = math.log(2) / k
        A = chem.first_order_kinetics(k=k, t=t_half, A0=2.0)
        assert math.isclose(A, 1.0, rel_tol=1e-6)


class TestChemistryReliabilityAndRegression:
    """Regression tests for chemistry parameter validation."""

    def test_nernst_invalid_electron_count(self, chem: ChemistryEngine):
        """Electrons transferred n must be positive integer >= 1."""
        with pytest.raises(ValueError, match="strictly positive integer"):
            chem.nernst_equation(E0=1.10, n=0, Q=1.0)
        with pytest.raises(ValueError, match="strictly positive integer"):
            chem.nernst_equation(E0=1.10, n=-2, Q=1.0)
        with pytest.raises(ValueError, match="whole integer"):
            chem.nernst_equation(E0=1.10, n=1.5, Q=1.0)  # type: ignore

    def test_nernst_invalid_temperature(self, chem: ChemistryEngine):
        """Temperature T must be strictly positive in Kelvin."""
        with pytest.raises(ValueError, match="must be positive"):
            chem.nernst_equation(E0=1.10, n=2, Q=1.0, T=0.0)
        with pytest.raises(ValueError, match="must be positive"):
            chem.nernst_equation(E0=1.10, n=2, Q=1.0, T=-50.0)

    def test_nernst_nan_inf_rejected(self, chem: ChemistryEngine):
        """NaN and infinite inputs in Nernst equation must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            chem.nernst_equation(E0=float("nan"), n=2, Q=1.0)
        with pytest.raises(ValueError, match="cannot be infinite"):
            chem.nernst_equation(E0=1.10, n=2, Q=float("inf"))

    def test_gibbs_negative_temperature_rejected(self, chem: ChemistryEngine):
        """Negative absolute temperature in Kelvin must raise ValueError."""
        with pytest.raises(ValueError, match="non-negative"):
            chem.gibbs_free_energy(delta_H=-1000.0, T=-10.0, delta_S=20.0)

    def test_gibbs_nan_inf_rejected(self, chem: ChemistryEngine):
        """NaN and infinite inputs in Gibbs energy must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            chem.gibbs_free_energy(delta_H=float("nan"), T=300.0, delta_S=20.0)
        with pytest.raises(ValueError, match="cannot be infinite"):
            chem.gibbs_free_energy(delta_H=-1000.0, T=float("inf"), delta_S=20.0)

    def test_kinetics_invalid_parameters(self, chem: ChemistryEngine):
        """Rate constant <= 0, time < 0, or concentration < 0 must raise ValueError."""
        with pytest.raises(ValueError, match="must be positive"):
            chem.first_order_kinetics(k=0.0, t=10.0, A0=1.0)
        with pytest.raises(ValueError, match="must be positive"):
            chem.first_order_kinetics(k=-0.05, t=10.0, A0=1.0)
        with pytest.raises(ValueError, match="non-negative"):
            chem.first_order_kinetics(k=0.05, t=-5.0, A0=1.0)
        with pytest.raises(ValueError, match="non-negative"):
            chem.first_order_kinetics(k=0.05, t=10.0, A0=-1.0)

    def test_kinetics_nan_inf_rejected(self, chem: ChemistryEngine):
        """NaN and inf in kinetics calculations must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            chem.first_order_kinetics(k=float("nan"), t=10.0, A0=1.0)
        with pytest.raises(ValueError, match="cannot be infinite"):
            chem.first_order_kinetics(k=0.05, t=10.0, A0=float("inf"))
