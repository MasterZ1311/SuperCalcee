"""
Unit and boundary tests for Computer Science Engine (`src_python/domains/cs.py`).
"""

import math

import pytest

from src_python.domains.cs import ComputerScienceEngine


class TestShannonEntropy:
    """Tests Shannon Information Entropy calculations."""

    def test_entropy_fair_coin(self, cs: ComputerScienceEngine):
        """Fair coin toss [0.5, 0.5] has maximum entropy of 1.0 bit."""
        H = cs.shannon_entropy([0.5, 0.5])
        assert math.isclose(H, 1.0, rel_tol=1e-7)

    def test_entropy_four_uniform_outcomes(self, cs: ComputerScienceEngine):
        """Uniform distribution of 4 outcomes has log2(4) = 2.0 bits."""
        H = cs.shannon_entropy([0.25, 0.25, 0.25, 0.25])
        assert math.isclose(H, 2.0, rel_tol=1e-7)

    def test_entropy_deterministic_zero(self, cs: ComputerScienceEngine):
        """Completely certain outcome [1.0, 0.0] has entropy of 0.0 bits."""
        H = cs.shannon_entropy([1.0, 0.0])
        assert H == 0.0

    def test_entropy_invalid_probability_sum(self, cs: ComputerScienceEngine):
        """Probabilities not summing to 1.0 must raise ValueError."""
        with pytest.raises(ValueError, match="Probabilities must sum to 1.0"):
            cs.shannon_entropy([0.2, 0.3])


class TestBigOClassification:
    """Tests asymptotic complexity growth rate limits."""

    def test_big_o_strictly_lower_growth(self, cs: ComputerScienceEngine):
        """f(n) = n is o(g(n) = n^2)."""
        res = cs.big_o_limit("n", "n**2")
        assert "o(g(n))" in res
        assert "Faster asymptotic growth: g(n)" in res

    def test_big_o_strictly_higher_growth(self, cs: ComputerScienceEngine):
        """f(n) = n^2 is w(g(n) = n)."""
        res = cs.big_o_limit("n**2", "n")
        assert "w(g(n))" in res
        assert "Faster asymptotic growth: f(n)" in res

    def test_big_o_theta_same_growth(self, cs: ComputerScienceEngine):
        """f(n) = 3*n and g(n) = 5*n have same Theta asymptotic class."""
        res = cs.big_o_limit("3*n", "5*n")
        assert "Theta(g(n))" in res
        assert "3/5" in res


class TestCSReliabilityAndRegression:
    """Regression tests for scientific validation in Computer Science engine."""

    def test_entropy_negative_probability(self, cs: ComputerScienceEngine):
        """Negative probabilities (e.g. [-0.5, 1.5]) summing to 1.0 must be rejected."""
        with pytest.raises(ValueError, match="between 0 and 1"):
            cs.shannon_entropy([-0.5, 1.5])

    def test_entropy_probability_exceeding_one(self, cs: ComputerScienceEngine):
        """Probabilities > 1.0 must be rejected."""
        with pytest.raises(ValueError, match="between 0 and 1"):
            cs.shannon_entropy([1.5, -0.5])

    def test_entropy_empty_list_rejected(self, cs: ComputerScienceEngine):
        """Empty probability list must be rejected."""
        with pytest.raises(ValueError, match="cannot be empty"):
            cs.shannon_entropy([])

    def test_entropy_nan_inf_rejected(self, cs: ComputerScienceEngine):
        """NaN or infinite probabilities must be rejected."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            cs.shannon_entropy([float("nan"), 0.5])
        with pytest.raises(ValueError, match="cannot be infinite"):
            cs.shannon_entropy([float("inf"), 0.5])

    def test_big_o_empty_strings_rejected(self, cs: ComputerScienceEngine):
        """Empty function string inputs to Big-O must raise ValueError."""
        with pytest.raises(ValueError, match="non-empty string"):
            cs.big_o_limit("", "n^2")
        with pytest.raises(ValueError, match="non-empty string"):
            cs.big_o_limit("n", "  ")
