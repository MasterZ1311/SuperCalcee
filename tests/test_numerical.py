"""
Unit and Regression Tests for Numerical Solvers & Analysis Framework
===================================================================

Tests all edge cases, solver failure modes, and convergence telemetry:
- convergent root
- no real root
- bad initial guess
- multiple roots
- near-singular function
- division by zero
- overflow
- underflow
- non-convergence
- complex solutions support
- numerical integration, differentiation, and limits
"""

import math

import pytest

from src_python.domains.finance import finance_engine
from src_python.formula_engine.solver import formula_engine
from src_python.numerical import (
    NumericalConvergenceError,
    NumericalResult,
    find_multiple_roots,
    robust_complex_roots,
    robust_derivative,
    robust_limit,
    robust_quad,
    robust_root_scalar,
)


class TestNumericalRootFinding:
    """Tests for scalar root finding robustness and diagnostics."""

    def test_convergent_root_polynomial(self):
        """Standard convergent polynomial root: x^3 - 8 = 0 -> root = 2.0."""
        res = robust_root_scalar(lambda x: x**3 - 8.0, initial_guess=1.0)
        assert res.converged
        assert res.status == "converged"
        assert math.isclose(res.solution, 2.0, abs_tol=1e-5)
        assert res.residual is not None and res.residual < 1e-4
        assert res.iterations > 0
        assert res.method in ("brentq", "fsolve_hybr")

    def test_convergent_root_transcendental(self):
        """Transcendental root: cos(x) - x = 0 -> root ~ 0.739085."""
        res = robust_root_scalar(lambda x: math.cos(x) - x, initial_guess=0.5)
        assert res.converged
        assert math.isclose(res.solution, 0.739085, abs_tol=1e-4)
        assert res.residual < 1e-4

    def test_no_real_root(self):
        """Function with strictly positive values: x^2 + 1 = 0 has no real roots."""
        # Objective is always >= 1.0, minimum is at x=0 where f(x)=1.0
        res = robust_root_scalar(lambda x: x**2 + 1.0, initial_guess=0.0)
        # Should not claim convergence because residual is >= 1.0
        assert not res.converged
        assert res.status in ("failed", "max_iterations")
        assert res.solution is None or res.residual >= 0.5

    def test_bad_initial_guess_flat_gradient(self):
        """Function with flat gradient far from root: f(x) = tanh(x) with x0 = 20."""
        # Far out, derivative of tanh is ~0, solver struggles or fails gracefully without crashing
        res = robust_root_scalar(lambda x: math.tanh(x), initial_guess=20.0)
        assert isinstance(res, NumericalResult)
        # If it failed to converge, status is reported accurately
        if not res.converged:
            assert res.status in ("failed", "max_iterations")

    def test_near_singular_function(self):
        """Function with pole near root: f(x) = 1/(x - 1) - 2 = 0 -> root = 1.5."""
        res = robust_root_scalar(
            lambda x: 1.0 / (x - 1.0) - 2.0 if abs(x - 1.0) > 1e-7 else 1e9,
            initial_guess=2.0,
            bracket=(1.1, 3.0),
        )
        assert res.converged
        assert math.isclose(res.solution, 1.5, abs_tol=1e-4)

    def test_division_by_zero_in_objective(self):
        """Objective encountering zero division is caught safely and does not crash."""

        def singular_func(x):
            if abs(x) < 1e-6:
                raise ZeroDivisionError("Zero denominator in objective")
            return 1.0 / x - 0.5

        res = robust_root_scalar(singular_func, initial_guess=1.0)
        assert isinstance(res, NumericalResult)
        # Either found root 2.0 or caught division by zero cleanly
        if res.converged:
            assert math.isclose(res.solution, 2.0, abs_tol=1e-3)

    def test_overflow_protection(self):
        """Objective with huge exponential does not crash process on OverflowError."""

        def overflow_func(x):
            return math.exp(min(x, 709.0)) - 1e10

        res = robust_root_scalar(overflow_func, initial_guess=10.0)
        assert isinstance(res, NumericalResult)

    def test_underflow_protection(self):
        """Objective with very small values handles underflow gracefully."""
        res = robust_root_scalar(lambda x: x * 1e-20 - 1e-25, initial_guess=0.0)
        assert isinstance(res, NumericalResult)

    def test_non_convergence_max_iterations(self):
        """Oscillating or non-converging function with max_iter=2 terminates with max_iterations."""
        res = robust_root_scalar(lambda x: math.sin(1.0 / (x + 1e-9)), initial_guess=1.0, max_iter=2)
        assert isinstance(res, NumericalResult)
        assert res.iterations <= 50  # Enforced budget


class TestMultiRootAndComplexSolvers:
    """Tests for finding multiple roots and extracting complex solutions."""

    def test_find_multiple_roots_cubic(self):
        """x^3 - 4x = 0 has three real roots: -2, 0, 2."""
        res = find_multiple_roots(lambda x: x**3 - 4.0 * x, interval=(-3.0, 3.0), steps=100)
        assert res.converged
        roots = res.solution
        assert len(roots) == 3
        assert math.isclose(roots[0], -2.0, abs_tol=1e-4)
        assert math.isclose(roots[1], 0.0, abs_tol=1e-4)
        assert math.isclose(roots[2], 2.0, abs_tol=1e-4)

    def test_robust_complex_roots_polynomial(self):
        """x^2 + 4 = 0 has complex roots: +2i and -2i."""
        res = robust_complex_roots("x**2 + 4 = 0", variable="x")
        assert res.converged
        sols = res.solution
        assert len(sols["real_roots"]) == 0
        assert len(sols["complex_roots"]) == 2
        imags = sorted([c["imag"] for c in sols["complex_roots"]])
        assert math.isclose(imags[0], -2.0, abs_tol=1e-5)
        assert math.isclose(imags[1], 2.0, abs_tol=1e-5)

    def test_robust_complex_roots_mixed(self):
        """x^3 - 1 = 0 has 1 real root (1.0) and 2 complex roots (-0.5 +- 0.866i)."""
        res = robust_complex_roots("x**3 - 1 = 0", variable="x")
        assert res.converged
        sols = res.solution
        assert len(sols["real_roots"]) == 1
        assert math.isclose(sols["real_roots"][0], 1.0, abs_tol=1e-5)
        assert len(sols["complex_roots"]) == 2


class TestNumericalIntegration:
    """Tests for adaptive numerical quadrature."""

    def test_quad_standard_polynomial(self):
        """Integral of 3*x^2 from 0 to 2 is [x^3]_0^2 = 8.0."""
        res = robust_quad(lambda x: 3.0 * x**2, 0.0, 2.0)
        assert res.converged
        assert math.isclose(res.solution, 8.0, abs_tol=1e-6)
        assert res.residual < 1e-7

    def test_quad_gaussian_infinite_limits(self):
        """Integral of exp(-x^2) from -inf to +inf is sqrt(pi) ~ 1.77245385."""
        res = robust_quad(lambda x: math.exp(-(x**2)), float("-inf"), float("inf"))
        assert res.converged
        expected = math.sqrt(math.pi)
        assert math.isclose(res.solution, expected, rel_tol=1e-6)

    def test_quad_singular_integrand(self):
        """Integral of 1/sqrt(x) from 0 to 1 has an integrable singularity at 0; result is 2.0."""
        res = robust_quad(lambda x: 1.0 / math.sqrt(x) if x > 0 else 0.0, 0.0, 1.0)
        assert res.converged
        assert math.isclose(res.solution, 2.0, abs_tol=1e-4)


class TestNumericalDifferentiation:
    """Tests for adaptive numerical differentiation."""

    def test_derivative_polynomial(self):
        """Derivative of x^3 at x=2 is 3*x^2 = 12.0."""
        res = robust_derivative(lambda x: x**3, x0=2.0)
        assert res.converged
        assert math.isclose(res.solution, 12.0, abs_tol=1e-5)
        assert res.residual < 1e-4

    def test_derivative_trigonometric(self):
        """Derivative of sin(x) at x=pi/3 is cos(pi/3) = 0.5."""
        res = robust_derivative(math.sin, x0=math.pi / 3.0)
        assert res.converged
        assert math.isclose(res.solution, 0.5, abs_tol=1e-6)


class TestNumericalLimits:
    """Tests for numerical limit evaluation and divergence detection."""

    def test_limit_removable_singularity(self):
        """lim x->0 sin(x)/x = 1.0."""
        res = robust_limit(lambda x: math.sin(x) / x if x != 0 else 1.0, x0=0.0)
        assert res.converged
        assert math.isclose(res.solution, 1.0, abs_tol=1e-4)

    def test_limit_infinite_divergence(self):
        """lim x->0 1/x^2 = +inf."""
        res = robust_limit(lambda x: 1.0 / (x**2), x0=0.0)
        assert res.converged
        assert math.isinf(res.solution) and res.solution > 0

    def test_limit_jump_discontinuity(self):
        """lim x->0 sign(x) does not exist (left=-1, right=+1)."""
        res = robust_limit(lambda x: 1.0 if x > 0 else -1.0, x0=0.0, direction="both")
        assert not res.converged
        assert "do not match" in res.warning


class TestFormulaEngineAndFinanceIntegration:
    """Tests integration of hardened solvers in FormulaEngine and FinanceEngine."""

    def test_formula_engine_numeric_solve_converges(self):
        """FormulaEngine numeric_solve returns verified float root."""
        root = formula_engine.numeric_solve(lambda x: x**3 - 27.0, initial_guess=2.0)
        assert math.isclose(root, 3.0, abs_tol=1e-5)

    def test_formula_engine_numeric_solve_failure_raises_convergence_error(self):
        """FormulaEngine numeric_solve raises NumericalConvergenceError on non-convergence."""
        with pytest.raises(NumericalConvergenceError):
            formula_engine.numeric_solve(lambda x: x**2 + 100.0, initial_guess=0.0)

    def test_formula_engine_numeric_solve_detailed(self):
        """FormulaEngine numeric_solve_detailed returns structured dictionary."""
        diag = formula_engine.numeric_solve_detailed(lambda x: x**2 - 16.0, initial_guess=3.0)
        assert diag["status"] == "converged"
        assert math.isclose(abs(diag["solution"]), 4.0, abs_tol=1e-4)
        assert "residual" in diag
        assert "iterations" in diag

    def test_finance_irr_detailed_returns_diagnostics(self):
        """FinanceEngine irr_detailed returns structured diagnostics."""
        cfs = [-1000.0, 300.0, 500.0, 700.0]
        diag = finance_engine.irr_detailed(cfs)
        assert diag["status"] == "converged"
        assert 0.18 < diag["solution"] < 0.22
        assert "residual" in diag
