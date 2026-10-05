"""
Unit and functional tests for CAS Symbolic Engine (`src_python/cas/symbolic_engine.py`).
"""

import pytest

from src_python.cas.symbolic_engine import CASEngine


class TestCASBasics:
    """Core algebraic manipulation tests."""

    def test_simplify_rational(self, cas: CASEngine):
        """Simplification of rational polynomial."""
        result = cas.simplify("(x**2 - 1) / (x - 1)")
        assert result == "x + 1"

    def test_simplify_trigonometric(self, cas: CASEngine):
        """Simplification of fundamental trig identity."""
        result = cas.simplify("sin(x)**2 + cos(x)**2")
        assert result == "1"

    def test_differentiate_polynomial(self, cas: CASEngine):
        """Symbolic derivative of a polynomial."""
        result = cas.differentiate("x**3 + 2*x", "x")
        assert result == "3*x**2 + 2"

    def test_differentiate_product_rule(self, cas: CASEngine):
        """Symbolic derivative using product rule."""
        result = cas.differentiate("x * exp(x)", "x")
        assert "exp(x)" in result

    def test_integrate_indefinite(self, cas: CASEngine):
        """Indefinite symbolic integral."""
        result = cas.integrate("3*x**2", "x")
        assert result == "x**3"

    def test_integrate_trigonometric(self, cas: CASEngine):
        """Indefinite integral of cos(x)."""
        result = cas.integrate("cos(x)", "x")
        assert result == "sin(x)"

    def test_limit_standard(self, cas: CASEngine):
        """Evaluation of limit sin(x)/x as x -> 0."""
        result = cas.limit("sin(x)/x", "x", "0")
        assert result == "1"

    def test_limit_infinity(self, cas: CASEngine):
        """Evaluation of limit 1/x as x -> oo."""
        result = cas.limit("1/x", "x", "oo")
        assert result == "0"

    def test_factor_polynomial(self, cas: CASEngine):
        """Factoring polynomial difference of squares."""
        result = cas.factor("x**2 - 4")
        assert "(x - 2)*(x + 2)" in result or "(x + 2)*(x - 2)" in result

    def test_expand_binomial(self, cas: CASEngine):
        """Expansion of binomial squared."""
        result = cas.expand("(x + 2)**2")
        assert "x**2 + 4*x + 4" in result

    def test_solve_linear(self, cas: CASEngine):
        """Solving linear equation."""
        roots = cas.solve("2*x + 4 = 0", "x")
        assert roots == ["-2"]

    def test_solve_quadratic(self, cas: CASEngine):
        """Solving quadratic equation yielding two roots."""
        roots = cas.solve("x**2 - 9 = 0", "x")
        assert sorted(roots) == ["-3", "3"]

    def test_solve_expression_without_equals(self, cas: CASEngine):
        """Expression without '=' treated as expr = 0."""
        roots = cas.solve("x - 5", "x")
        assert roots == ["5"]

    def test_implicit_multiplication(self, cas: CASEngine):
        """Ensures implicit multiplication like 2x is parsed as 2*x."""
        result = cas.simplify("2x + 3x")
        assert result == "5*x"


class TestCASMalformedInputs:
    """Error handling and boundary condition tests for CAS."""

    def test_malformed_expression_syntax_error(self, cas: CASEngine):
        """Syntax errors in expressions must raise an exception."""
        with pytest.raises(Exception):
            cas.simplify("x + * 2")

    def test_unbalanced_parentheses(self, cas: CASEngine):
        """Unbalanced parentheses must raise an exception."""
        with pytest.raises(Exception):
            cas.simplify("(x + 2")

    def test_malformed_equation_multiple_equals(self, cas: CASEngine):
        """Equations with multiple '=' should fail or raise ValueError."""
        with pytest.raises(Exception):
            cas.solve("x = 2 = 3", "x")

    def test_empty_input_string(self, cas: CASEngine):
        """Empty string input must raise an exception."""
        with pytest.raises(Exception):
            cas.simplify("")

    def test_whitespace_only_input(self, cas: CASEngine):
        """Whitespace only input must raise an exception."""
        with pytest.raises(Exception):
            cas.simplify("    ")
