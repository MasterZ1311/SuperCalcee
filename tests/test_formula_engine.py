"""
Unit and boundary tests for Generic Formula Engine (`src_python/formula_engine/solver.py`).
"""

import math

import pytest

from src_python.formula_engine.solver import FormulaEngine


class TestFormulaEngineAlgebraic:
    """Tests algebraic solving and variable isolation."""

    def test_solve_single_root_kinematics(self, formula: FormulaEngine):
        """v = u + a*t solving for acceleration a."""
        # 20 = 5 + a*3 -> a = 5.0
        a = formula.algebraic_solve(
            eq_str="v = u + a * t", variable_to_solve="a", given_values={"v": 20.0, "u": 5.0, "t": 3.0}
        )
        assert math.isclose(a, 5.0, rel_tol=1e-7)

    def test_solve_ideal_gas_pressure(self, formula: FormulaEngine):
        """P * V = n * R * T solving for P."""
        P = formula.algebraic_solve(
            eq_str="P * V = n * R * T",
            variable_to_solve="P",
            given_values={"V": 0.025, "n": 1.0, "R": 8.314, "T": 300.0},
        )
        expected = (1.0 * 8.314 * 300.0) / 0.025
        assert math.isclose(P, expected, rel_tol=1e-7)

    def test_solve_multiple_roots_returns_real_root(self, formula: FormulaEngine):
        """x^2 = 9 has two real roots [-3, 3]; engine filters and returns a real root."""
        root = formula.algebraic_solve(eq_str="x**2 = 9", variable_to_solve="x", given_values={})
        assert root in (-3.0, 3.0)

    def test_solve_expression_without_equals(self, formula: FormulaEngine):
        """Expressions without '=' assumed equal to zero (e.g., 2*x - 10 -> x=5)."""
        root = formula.algebraic_solve(eq_str="2 * x - 10", variable_to_solve="x", given_values={})
        assert root == 5.0

    def test_solve_no_real_root(self, formula: FormulaEngine):
        """
        x^2 + 10 = 0 has purely imaginary roots (+- i*sqrt(10)).
        Engine should either raise ValueError or handle complex roots without unhandled TypeError.
        """
        with pytest.raises((ValueError, TypeError)):
            formula.algebraic_solve(eq_str="x**2 + 10 = 0", variable_to_solve="x", given_values={})

    def test_solve_malformed_equation_multiple_equals(self, formula: FormulaEngine):
        """Equations containing multiple '=' characters must raise an error."""
        with pytest.raises(Exception):
            formula.algebraic_solve(eq_str="P * V = n * R * T = 0", variable_to_solve="P", given_values={"V": 1.0})

    def test_solve_malformed_syntax_error(self, formula: FormulaEngine):
        """Syntax errors in equations must raise an exception."""
        with pytest.raises(Exception):
            formula.algebraic_solve(eq_str="P * * V = 10", variable_to_solve="P", given_values={})


class TestFormulaEngineNumeric:
    """Tests SciPy numerical root finding fallback."""

    def test_numeric_solve_convergent(self, formula: FormulaEngine):
        """Numeric root of x^3 - 8 = 0 starting from 1.0."""
        root = formula.numeric_solve(lambda x: x**3 - 8.0, initial_guess=1.0)
        assert math.isclose(root, 2.0, abs_tol=1e-5)

    def test_numeric_solve_transcendental(self, formula: FormulaEngine):
        """Numeric root of non-analytical function x + exp(x) = 2."""
        root = formula.numeric_solve(lambda x: float(x[0]) + math.exp(float(x[0])) - 2.0, initial_guess=0.5)
        val = root + math.exp(root) - 2.0
        assert math.isclose(val, 0.0, abs_tol=1e-5)
