"""
Generic Formula & Algebraic Solver Engine
==========================================

Solves arbitrary multi-variable formulas symbolically for any target unknown,
substitutes user-provided parameter values, and returns numeric solutions.
Integrates robust numerical root-finding with convergence and residual verification.

Features:
    - Symbolic isolate-and-solve workflow via SymPy `solve`.
    - Handles multi-variable equations with arbitrary user scopes.
    - Filters real roots from complex root sets with diagnostics.
    - Verified numerical root-finding using Brent's method and hybrid MINPACK fsolve.

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Any, Callable, Dict, List, Optional

import sympy as sp

from src_python.numerical import (
    NumericalConvergenceError,
    robust_root_scalar,
)
from src_python.security import SecurityError, parse_safe, validate_safe_identifier


class FormulaEngine:
    """
    Multi-variable formula solver utilizing symbolic algebra and verified numerical solvers.
    """

    def __init__(self) -> None:
        """Initializes the formula solver instance."""
        pass

    def algebraic_solve(
        self,
        eq_str: str,
        variable_to_solve: str,
        given_values: Dict[str, float],
        allow_complex: bool = False,
    ) -> Any:
        """
        Symbolically solves an equation for a target variable given known values for other parameters.

        Args:
            eq_str (str): Multi-variable equation string (e.g., "P * V = n * R * T" or "v = u + a*t").
            variable_to_solve (str): Name of the unknown variable to solve for (e.g., "P").
            given_values (Dict[str, float]): Dictionary mapping known variable names to numerical values.
            allow_complex (bool): If True, returns complex solutions when no real solutions exist.

        Returns:
            float or complex or dict: Numerical result for the target variable.

        Raises:
            ValueError: If the target variable cannot be isolated or has no real solution.

        Example:
            >>> solver = FormulaEngine()
            >>> solver.algebraic_solve("F = m * a", "a", {"F": 10.0, "m": 2.0})
            5.0
        """
        # Validate target unknown identifier
        validate_safe_identifier(variable_to_solve)

        # Validate known variable identifiers and ensure numeric values
        for k, v in given_values.items():
            validate_safe_identifier(k)
            if not isinstance(v, (int, float)) or not math.isfinite(v):
                raise SecurityError(f"Given value for parameter '{k}' must be a finite number.")

        # Step 1: Parse equation string into SymPy Eq object using safe parser
        if "=" in eq_str:
            parts = eq_str.split("=")
            if len(parts) != 2:
                raise ValueError("Equation must contain exactly one '=' sign.")
            lhs = parse_safe(parts[0])
            rhs = parse_safe(parts[1])
            eq = sp.Eq(lhs, rhs)
        else:
            # Assume expression equals zero if no '=' present
            expr = parse_safe(eq_str)
            eq = sp.Eq(expr, 0)

        target = sp.Symbol(variable_to_solve)

        # Step 2: Build substitution dictionary for known variables
        subs_dict = {sp.Symbol(k): v for k, v in given_values.items()}
        eq_subbed = eq.subs(subs_dict)

        # Step 3: Solve algebraically for target variable
        solutions = sp.solve(eq_subbed, target)
        if not solutions:
            raise ValueError(
                f"Could not solve equation '{eq_str}' for variable '{variable_to_solve}' "
                f"with given inputs: {given_values}"
            )

        # Step 4: Classify real and complex roots
        real_roots: List[float] = []
        complex_roots: List[complex] = []

        for sol in solutions:
            try:
                eval_sol = complex(sol.evalf())
                if abs(eval_sol.imag) < 1e-9:
                    real_roots.append(float(eval_sol.real))
                else:
                    complex_roots.append(eval_sol)
            except Exception:
                if getattr(sol, "is_real", False):
                    try:
                        real_roots.append(float(sol))
                    except Exception:
                        pass

        if real_roots:
            return real_roots[0]

        if allow_complex and complex_roots:
            return complex_roots[0]

        if complex_roots and not real_roots:
            raise ValueError(
                f"Equation '{eq_str}' has no real solution for '{variable_to_solve}'. "
                f"Found {len(complex_roots)} complex solution(s): {[str(c) for c in complex_roots]}"
            )

        # Fallback to first solution if no explicit classification succeeded
        try:
            return float(solutions[0])
        except Exception:
            raise ValueError(f"Could not convert algebraic solution '{solutions[0]}' to numeric float.")

    def numeric_solve(
        self,
        func: Callable[[Any], Any],
        initial_guess: float = 1.0,
        bracket: Optional[tuple] = None,
    ) -> float:
        """
        Numerically finds a root of func(x) = 0 with verified convergence and residual checking.

        Args:
            func (Callable[[Any], Any]): Objective function returning 0 at the desired root.
            initial_guess (float, optional): Initial numerical guess. Defaults to 1.0.
            bracket (tuple, optional): Known (a, b) interval bracketing the root.

        Returns:
            float: Verified numerical root value.

        Raises:
            NumericalConvergenceError: If the solver fails to converge within tolerances.
        """
        result = robust_root_scalar(func, initial_guess=initial_guess, bracket=bracket)
        if result.converged and result.solution is not None:
            return float(result.solution)

        raise NumericalConvergenceError(
            f"Numerical solver failed to converge: {result.warning or result.status} "
            f"(residual={result.residual}, method={result.method})",
            result=result,
        )

    def numeric_solve_detailed(
        self,
        func: Callable[[Any], Any],
        initial_guess: float = 1.0,
        bracket: Optional[tuple] = None,
        tol: float = 1e-8,
    ) -> Dict[str, Any]:
        """
        Executes robust root finding and returns the complete structured diagnostic dictionary.

        Returns:
            Dict[str, Any]: {status, solution, residual, iterations, method, warning, diagnostics}
        """
        res = robust_root_scalar(func, initial_guess=initial_guess, bracket=bracket, tol=tol)
        return res.to_dict()


# Global singleton instance for formula operations
formula_engine = FormulaEngine()
