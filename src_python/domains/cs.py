import math
import sympy as sp
import numpy as np

class ComputerScienceEngine:
    def shannon_entropy(self, probabilities: list[float]) -> float:
        """
        H = - sum(p * log2(p))
        """
        if not np.isclose(sum(probabilities), 1.0):
            raise ValueError("Probabilities must sum to 1")
        
        entropy = 0
        for p in probabilities:
            if p > 0:
                entropy -= p * math.log2(p)
        return entropy

    def big_o_limit(self, f_str: str, g_str: str) -> str:
        """
        Evaluates the limit of f(n)/g(n) as n -> infinity.
        If limit is 0, f(n) falls in O(g(n)) strict.
        If limit is constant c > 0, f(n) falls in Theta(g(n)).
        If limit is infinity, f(n) falls in Omega(g(n)) strict.
        """
        from sympy.parsing.sympy_parser import parse_expr
        
        n = sp.Symbol('n', positive=True)
        f = parse_expr(f_str, local_dict={'n': n})
        g = parse_expr(g_str, local_dict={'n': n})
        
        limit_val = sp.limit(f/g, n, sp.oo)
        
        if limit_val == 0:
            return f"f(n) = o(g(n)). Faster growth: g(n)."
        elif limit_val == sp.oo:
            return f"f(n) = w(g(n)). Faster growth: f(n)."
        else:
            return f"f(n) = Theta(g(n)). Similar growth rate. Constant: {limit_val}"

cs_engine = ComputerScienceEngine()
