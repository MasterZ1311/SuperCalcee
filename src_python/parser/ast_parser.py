from sympy.parsing.sympy_parser import parse_expr
from sympy.logic.boolalg import simplify_logic, to_cnf, to_dnf
import sympy

class LogicParser:
    def __init__(self):
        # We define replacements for logic symbols to SymPy boolean operators
        self.replacements = {
            '∧': '&',
            '∨': '|',
            '⊕': '^',
            '~': '~',
            '→': '>>',
            '↔': '=='
        }
        
    def _preprocess(self, expr_str: str) -> str:
        for k, v in self.replacements.items():
            expr_str = expr_str.replace(k, v)
        # Note: NAND (↑) and NOR (↓) are not natively single-character in python, they'd need compound parsing.
        expr_str = expr_str.replace('↑', ' ~& ')
        expr_str = expr_str.replace('↓', ' ~| ')
        return expr_str

    def parse(self, expr_str: str):
        processed = self._preprocess(expr_str)
        try:
            return parse_expr(processed)
        except Exception as e:
            raise ValueError(f"Failed to parse logic expression: {expr_str}. Error: {e}")

    def simplify(self, expr_str: str) -> str:
        expr = self.parse(expr_str)
        return str(simplify_logic(expr))

    def evaluate(self, expr_str: str, truth_values: dict) -> bool:
        expr = self.parse(expr_str)
        subs_dict = {sympy.Symbol(k): v for k, v in truth_values.items()}
        return bool(expr.subs(subs_dict))

logic_parser = LogicParser()

def parse_equation(expr_str: str):
    """Wrapper for general mathematical parsing."""
    from src_python.cas.symbolic_engine import cas_engine
    return cas_engine.parse(expr_str)
