"""
Computer Algebra System (CAS) Engine
====================================

This module encapsulates SymPy functionality to provide high-level symbolic 
mathematics operations including simplification, factorization, expansion, 
differentiation, integration, limit calculations, and algebraic equation solving.

Key Features:
    - Implicit multiplication support (e.g., "2x" automatically becomes "2*x").
    - Algebraic equation splitting ("lhs = rhs" -> "lhs - rhs = 0").
    - Clean string representation of mathematical expressions and solutions.

Author: SuperCalcee Core Team
License: MIT
"""

from typing import List, Union
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)


class CASEngine:
    """
    Symbolic mathematics computation engine wrapping SymPy parsers and solvers.
    """

    def __init__(self) -> None:
        """
        Initializes the CAS engine with standard AST transformations.
        Enables implicit multiplication so expressions like '2x' or '3(a+b)' are parsed correctly.
        """
        self.transformations = standard_transformations + (
            implicit_multiplication_application,
        )

    def parse(self, expr_str: str) -> sp.Expr:
        """
        Converts a string representation of a mathematical expression into a SymPy expression object.

        Args:
            expr_str (str): Math expression as a string (e.g., "2*x + 5").

        Returns:
            sp.Expr: Parsed SymPy expression instance.

        Raises:
            SyntaxError: If the expression string cannot be parsed.

        Example:
            >>> engine = CASEngine()
            >>> expr = engine.parse("2x + 3")
            >>> type(expr)
            <class 'sympy.core.add.Add'>
        """
        return parse_expr(expr_str, transformations=self.transformations)

    def simplify(self, expr_str: str) -> str:
        """
        Algebraically simplifies a mathematical expression.

        Args:
            expr_str (str): Expression to simplify (e.g., "(x^2 - 1)/(x - 1)").

        Returns:
            str: Simplified expression as a formatted string.

        Example:
            >>> engine.simplify("(x**2 - 1) / (x - 1)")
            'x + 1'
        """
        expr = self.parse(expr_str)
        return str(sp.simplify(expr))

    def factor(self, expr_str: str) -> str:
        """
        Factors a polynomial expression into irreducibles.

        Args:
            expr_str (str): Polynomial expression (e.g., "x**2 - 4").

        Returns:
            str: Factored expression (e.g., "(x - 2)*(x + 2)").
        """
        expr = self.parse(expr_str)
        return str(sp.factor(expr))

    def expand(self, expr_str: str) -> str:
        """
        Expands algebraic products and powers in an expression.

        Args:
            expr_str (str): Expression to expand (e.g., "(x + 2)**2").

        Returns:
            str: Expanded expression string (e.g., "x**2 + 4*x + 4").
        """
        expr = self.parse(expr_str)
        return str(sp.expand(expr))

    def differentiate(self, expr_str: str, variable: str = "x") -> str:
        """
        Computes the symbolic derivative of an expression with respect to a variable.

        Args:
            expr_str (str): Expression to differentiate (e.g., "sin(x) * x^2").
            variable (str, optional): Target differentiation variable. Defaults to "x".

        Returns:
            str: Symbolic derivative expression string.

        Example:
            >>> engine.differentiate("x**3", "x")
            '3*x**2'
        """
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        return str(sp.diff(expr, var))

    def integrate(self, expr_str: str, variable: str = "x") -> str:
        """
        Computes the indefinite symbolic integral of an expression with respect to a variable.

        Args:
            expr_str (str): Expression to integrate (e.g., "3*x**2").
            variable (str, optional): Target integration variable. Defaults to "x".

        Returns:
            str: Symbolic indefinite integral expression string.

        Example:
            >>> engine.integrate("3*x**2", "x")
            'x**3'
        """
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        return str(sp.integrate(expr, var))

    def limit(self, expr_str: str, variable: str, approach: str) -> str:
        """
        Evaluates the mathematical limit of an expression as a variable approaches a value.

        Args:
            expr_str (str): Expression (e.g., "sin(x)/x").
            variable (str): Variable taking the limit (e.g., "x").
            approach (str): Point of approach (e.g., "0", "oo", "-oo").

        Returns:
            str: Evaluated limit result string.

        Example:
            >>> engine.limit("sin(x)/x", "x", "0")
            '1'
        """
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        val = self.parse(approach)
        return str(sp.limit(expr, var, val))

    def solve(self, equation_str: str, variable: str = "x") -> List[str]:
        """
        Solves an algebraic equation symbolically for the target variable.
        
        Note:
            If equation_str contains an equals sign '=', it parses it as `lhs - rhs = 0`.
            Otherwise, it treats the expression as equal to 0.

        Args:
            equation_str (str): Equation or expression string (e.g., "x^2 - 4 = 0" or "x^2 - 4").
            variable (str, optional): Variable to solve for. Defaults to "x".

        Returns:
            List[str]: List of string representations of solved roots.

        Example:
            >>> engine.solve("x**2 - 9 = 0", "x")
            ['-3', '3']
        """
        if "=" in equation_str:
            lhs, rhs = equation_str.split("=")
            expr = self.parse(f"({lhs}) - ({rhs})")
        else:
            expr = self.parse(equation_str)

        var = sp.Symbol(variable)
        solutions = sp.solve(expr, var)
        return [str(sol) for sol in solutions]


# Global singleton instance for easy import across modules
cas_engine = CASEngine()
