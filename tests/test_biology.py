"""
Unit and boundary tests for Biology Engine (`src_python/domains/biology.py`).
"""

import math

import pytest

from src_python.domains.biology import BiologyEngine
from src_python.validation import ZeroDenominatorError


class TestHardyWeinbergEquilibrium:
    """Hardy-Weinberg population genetics equations."""

    def test_hardy_weinberg_given_p(self, bio: BiologyEngine):
        """p = 0.7 gives q = 0.3, p^2 = 0.49, 2pq = 0.42, q^2 = 0.09."""
        res = bio.hardy_weinberg(p=0.7)
        assert math.isclose(res["p"], 0.7, rel_tol=1e-7)
        assert math.isclose(res["q"], 0.3, rel_tol=1e-7)
        assert math.isclose(res["p_squared (homozygous dominant)"], 0.49, rel_tol=1e-7)
        assert math.isclose(res["2pq (heterozygous)"], 0.42, rel_tol=1e-7)
        assert math.isclose(res["q_squared (homozygous recessive)"], 0.09, rel_tol=1e-7)
        # Check sum of genotypes = 1.0
        total = (
            res["p_squared (homozygous dominant)"] + res["2pq (heterozygous)"] + res["q_squared (homozygous recessive)"]
        )
        assert math.isclose(total, 1.0, rel_tol=1e-7)

    def test_hardy_weinberg_given_q(self, bio: BiologyEngine):
        """q = 0.4 gives p = 0.6."""
        res = bio.hardy_weinberg(q=0.4)
        assert math.isclose(res["p"], 0.6, rel_tol=1e-7)
        assert math.isclose(res["q"], 0.4, rel_tol=1e-7)

    def test_hardy_weinberg_invalid_ranges(self, bio: BiologyEngine):
        """Allele frequencies outside [0, 1] must raise ValueError."""
        with pytest.raises(ValueError, match="between 0 and 1"):
            bio.hardy_weinberg(p=1.5)
        with pytest.raises(ValueError, match="between 0 and 1"):
            bio.hardy_weinberg(p=-0.1)
        with pytest.raises(ValueError, match="between 0 and 1"):
            bio.hardy_weinberg(q=2.0)
        with pytest.raises(ValueError, match="between 0 and 1"):
            bio.hardy_weinberg(q=-0.5)

    def test_hardy_weinberg_neither_provided_raises(self, bio: BiologyEngine):
        """Providing neither p nor q must raise ValueError."""
        with pytest.raises(ValueError, match="Must provide either"):
            bio.hardy_weinberg()


class TestEnzymeKinetics:
    """Michaelis-Menten enzyme kinetics equations."""

    def test_michaelis_menten_normal(self, bio: BiologyEngine):
        """Vmax=10.0, Km=2.0, S=3.0 -> v = (10*3)/(2+3) = 6.0."""
        v = bio.michaelis_menten(Vmax=10.0, Km=2.0, S=3.0)
        assert v == 6.0

    def test_michaelis_menten_saturating_substrate(self, bio: BiologyEngine):
        """When S >> Km, reaction rate approaches Vmax."""
        v = bio.michaelis_menten(Vmax=100.0, Km=1.0, S=10000.0)
        assert math.isclose(v, 100.0, rel_tol=1e-3)

    def test_michaelis_menten_half_vmax(self, bio: BiologyEngine):
        """When S == Km, reaction rate equals Vmax / 2."""
        v = bio.michaelis_menten(Vmax=50.0, Km=5.0, S=5.0)
        assert v == 25.0

    def test_michaelis_menten_zero_substrate(self, bio: BiologyEngine):
        """When S = 0, reaction rate must be 0."""
        v = bio.michaelis_menten(Vmax=10.0, Km=2.0, S=0.0)
        assert v == 0.0

    def test_michaelis_menten_zero_denominator_raises(self, bio: BiologyEngine):
        """When Km + S == 0, must raise ValueError."""
        with pytest.raises(ValueError, match="Denominator .* cannot be zero"):
            bio.michaelis_menten(Vmax=10.0, Km=-5.0, S=5.0)


class TestBiologyReliabilityAndRegression:
    """Regression tests for scientific validation rules in biology."""

    def test_hardy_weinberg_both_specified_valid(self, bio: BiologyEngine):
        """When both p and q are specified and sum to 1.0, calculation succeeds."""
        res = bio.hardy_weinberg(p=0.4, q=0.6)
        assert res["p"] == 0.4
        assert res["q"] == 0.6
        assert math.isclose(res["2pq (heterozygous)"], 0.48, rel_tol=1e-7)

    def test_hardy_weinberg_both_specified_invalid_sum(self, bio: BiologyEngine):
        """When both p and q are specified but p + q != 1, raises ValueError."""
        with pytest.raises(ValueError, match="must sum to 1.0"):
            bio.hardy_weinberg(p=0.6, q=0.6)
        with pytest.raises(ValueError, match="must sum to 1.0"):
            bio.hardy_weinberg(p=0.2, q=0.2)

    def test_hardy_weinberg_nan_inf_rejected(self, bio: BiologyEngine):
        """NaN and inf allele frequencies are rejected."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            bio.hardy_weinberg(p=float("nan"))
        with pytest.raises(ValueError, match="cannot be infinite"):
            bio.hardy_weinberg(q=float("inf"))

    def test_michaelis_menten_negative_parameters(self, bio: BiologyEngine):
        """Negative Vmax, Km, or substrate S are rejected."""
        with pytest.raises(ValueError, match="Vmax must be positive"):
            bio.michaelis_menten(Vmax=-10.0, Km=2.0, S=5.0)
        with pytest.raises(ValueError, match="Km must be positive"):
            bio.michaelis_menten(Vmax=10.0, Km=-2.0, S=5.0)
        with pytest.raises(ValueError, match="Substrate concentration \\[S\\] must be non-negative"):
            bio.michaelis_menten(Vmax=10.0, Km=2.0, S=-5.0)

    def test_michaelis_menten_nan_inf_rejected(self, bio: BiologyEngine):
        """NaN and inf parameters in Michaelis-Menten are rejected."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            bio.michaelis_menten(Vmax=float("nan"), Km=2.0, S=5.0)
        with pytest.raises(ValueError, match="cannot be infinite"):
            bio.michaelis_menten(Vmax=10.0, Km=float("inf"), S=5.0)

    def test_michaelis_menten_zero_denominator_error_type(self, bio: BiologyEngine):
        """ZeroDenominatorError satisfies both ValueError and ZeroDivisionError."""
        with pytest.raises(ZeroDivisionError):
            bio.michaelis_menten(Vmax=10.0, Km=0.0, S=0.0)
        with pytest.raises(ValueError):
            bio.michaelis_menten(Vmax=10.0, Km=0.0, S=0.0)
