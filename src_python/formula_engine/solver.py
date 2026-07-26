"""
Generic Formula & Algebraic Solver Engine
==========================================

Solves arbitrary multi-variable formulas symbolically for any target unknown,
substitutes user-provided parameter values, and returns numeric solutions.
Also integrates SciPy numerical root-finding (`fsolve`) for non-analytical equations.

Features:
    - Symbolic isolate-and-solve workflow via SymPy `solve`.
    - Handles multi-variable equations with arbitrary user scopes.
    - Filters real roots from complex root sets.
    - Numerical root-finding fallback using SciPy `fsolve`.

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Dict, Any, Callable
import sympy as sp
from scipy.optimize import fsolve


class FormulaEngine:
    """
    Multi-variable formula solver utilizing symbolic algebra and numerical solvers.
    """

    def __init__(self) -> None:
        """Initializes the formula solver instance."""
        pass

    def algebraic_solve(
        self, eq_str: str, variable_to_solve: str, given_values: Dict[str, float]
    ) -> float:
        """
        Symbolically solves an equation for a target variable given known values for other parameters.

        Args:
            eq_str (str): Multi-variable equation string (e.g., "P * V = n * R * T" or "v = u + a*t").
            variable_to_solve (str): Name of the unknown variable to solve for (e.g., "P").
            given_values (Dict[str, float]): Dictionary mapping known variable names to numerical values.

        Returns:
            float: Numerical result for the target variable.

        Raises:
            ValueError: If the target variable cannot be isolated or solved.

        Example:
            >>> solver = FormulaEngine()
            >>> solver.algebraic_solve("F = m * a", "a", {"F": 10.0, "m": 2.0})
            5.0
        """
        # Step 1: Parse equation string into SymPy Eq object
        if "=" in eq_str:
            lhs, rhs = eq_str.split("=")
            eq = sp.Eq(sp.parse_expr(lhs), sp.parse_expr(rhs))
        else:
            # Assume expression equals zero if no '=' present
            eq = sp.Eq(sp.parse_expr(eq_str), 0)

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

        # Step 4: Return the first real solution if multiple roots exist
        for sol in solutions:
            try:
                eval_sol = complex(sol)
                if abs(eval_sol.imag) < 1e-9:
                    return float(eval_sol.real)
            except Exception:
                if sol.is_real:
                    return float(sol)

        # Fallback to first solution if no explicit real check matched
        return float(solutions[0])

    def numeric_solve(
        self, func: Callable[[float], float], initial_guess: float = 1.0
    ) -> float:
        """
        Uses SciPy's `fsolve` for numerical root-finding of non-linear or non-analytical functions.

        Args:
            func (Callable[[float], float]): Objective function returning 0 at the desired root.
            initial_guess (float, optional): Initial numerical guess. Defaults to 1.0.

        Returns:
            float: Numerically converged root value.
        """
        result = fsolve(func, initial_guess)
        return float(result[0])


# Global singleton instance for formula operations
formula_engine = FormulaEngine()
