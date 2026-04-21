import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

class CASEngine:
    def __init__(self):
        # Allow features like implicit multiplication, e.g., "2x" -> "2*x"
        self.transformations = standard_transformations + (implicit_multiplication_application,)

    def parse(self, expr_str: str):
        """Converts string into a SymPy expression."""
        return parse_expr(expr_str, transformations=self.transformations)

    def simplify(self, expr_str: str) -> str:
        expr = self.parse(expr_str)
        return str(sp.simplify(expr))

    def factor(self, expr_str: str) -> str:
        expr = self.parse(expr_str)
        return str(sp.factor(expr))

    def expand(self, expr_str: str) -> str:
        expr = self.parse(expr_str)
        return str(sp.expand(expr))

    def differentiate(self, expr_str: str, variable: str) -> str:
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        return str(sp.diff(expr, var))

    def integrate(self, expr_str: str, variable: str) -> str:
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        return str(sp.integrate(expr, var))

    def limit(self, expr_str: str, variable: str, approach: str) -> str:
        expr = self.parse(expr_str)
        var = sp.Symbol(variable)
        val = self.parse(approach)
        return str(sp.limit(expr, var, val))

    def solve(self, equation_str: str, variable: str) -> list[str]:
        """
        Solves equation_str = 0 for variable.
        If equation contains '=', it treats it as lhs - rhs = 0.
        """
        if "=" in equation_str:
            lhs, rhs = equation_str.split("=")
            expr = self.parse(f"({lhs}) - ({rhs})")
        else:
            expr = self.parse(equation_str)
        var = sp.Symbol(variable)
        solutions = sp.solve(expr, var)
        return [str(sol) for sol in solutions]

cas_engine = CASEngine()
