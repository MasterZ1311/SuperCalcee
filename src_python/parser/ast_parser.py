"""
Abstract Syntax Tree & Boolean Logic Parser Module
===================================================

Provides syntax processing and simplification for formal Boolean logic expressions.
Supports symbolic operators such as AND, OR, XOR, NOT, IMPLIES, EQUIVALENT, NAND, and NOR.

Operator Symbols & Translations:
    - Conjunction (AND): '∧' -> '&'
    - Disjunction (OR):  '∨' -> '|'
    - Exclusive OR (XOR): '⊕' -> '^'
    - Negation (NOT):    '~' -> '~'
    - Implication:       '→' -> '>>'
    - Equivalence:       '↔' -> '=='
    - Alternative Denial (NAND): '↑' -> ' ~& '
    - Joint Denial (NOR):        '↓' -> ' ~| '

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Dict

import sympy
from sympy.logic.boolalg import simplify_logic

from src_python.security import parse_safe


class LogicParser:
    """
    Parser and evaluation engine for formal logic expressions,
    protected by the SuperCalcee safe expression security layer.
    """

    def __init__(self) -> None:
        """Initializes the logic parser instance."""
        pass

    def parse(self, expr_str: str) -> sympy.Expr:
        """
        Parses a logic string into a SymPy boolean AST object safely without eval().

        Args:
            expr_str (str): Raw or preprocessed boolean logic string.

        Returns:
            sympy.Expr: SymPy boolean AST representation.

        Raises:
            ValueError: If parsing fails or an invalid construct is detected.
        """
        try:
            return parse_safe(expr_str, logic_mode=True)
        except Exception as e:
            raise ValueError(f"Failed to parse logic expression '{expr_str}': {e}")

    def simplify(self, expr_str: str) -> str:
        """
        Simplifies a Boolean logic expression using algebraic logic laws.

        Args:
            expr_str (str): Logic expression string.

        Returns:
            str: Minimal equivalent Boolean expression.

        Example:
            >>> parser = LogicParser()
            >>> parser.simplify("A & (A | B)")
            'A'
        """
        expr = self.parse(expr_str)
        return str(simplify_logic(expr))

    def evaluate(self, expr_str: str, truth_values: Dict[str, bool]) -> bool:
        """
        Evaluates a Boolean expression given truth values for its constituent variables.

        Args:
            expr_str (str): Logic expression string.
            truth_values (Dict[str, bool]): Map of variable names to Boolean states (e.g. {'A': True, 'B': False}).

        Returns:
            bool: Final evaluated truth value (True or False).
        """
        expr = self.parse(expr_str)
        subs_dict = {sympy.Symbol(k): v for k, v in truth_values.items()}
        return bool(expr.subs(subs_dict))


# Global singleton instance for logic parsing
logic_parser = LogicParser()


def parse_equation(expr_str: str) -> sympy.Expr:
    """
    Convenience wrapper for general mathematical equation parsing using the CAS engine.

    Args:
        expr_str (str): Expression string to parse.

    Returns:
        sympy.Expr: Parsed SymPy expression.
    """
    from src_python.cas.symbolic_engine import cas_engine

    return cas_engine.parse(expr_str)
