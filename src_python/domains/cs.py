"""
Computer Science & Information Theory Engine
============================================

Provides theoretical computer science, algorithms, and information theory tools:
- Shannon Entropy ($H(X) = - \\sum p(x) \\log_2 p(x)$) for information content.
- Asymptotic Algorithm Complexity Limit Classifier ($f(n)$ vs $g(n)$ using $\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)}$).

Author: SuperCalcee Core Team
License: MIT
"""

from typing import List
import math
import numpy as np
import sympy as sp


class ComputerScienceEngine:
    """
    Computer science and information theory computation engine.
    """

    def shannon_entropy(self, probabilities: List[float]) -> float:
        """
        Calculates Shannon Information Entropy $H(X)$ in bits for a discrete probability distribution.

        Formula:
            $$H(X) = - \\sum_{i=1}^n p(x_i) \\log_2 p(x_i)$$

        Args:
            probabilities (List[float]): List of outcome probabilities $p_i$ ($0 \\le p_i \\le 1$).

        Returns:
            float: Information entropy in bits per symbol.

        Raises:
            ValueError: If probabilities do not sum to 1.0 (within 1e-4 tolerance).
        """
        prob_sum = sum(probabilities)
        if not np.isclose(prob_sum, 1.0, atol=1e-4):
            raise ValueError(f"Probabilities must sum to 1.0 (Current sum: {prob_sum}).")

        entropy = 0.0
        for p in probabilities:
            if p > 0:
                entropy -= p * math.log2(p)
        return float(entropy)

    def big_o_limit(self, f_str: str, g_str: str) -> str:
        """
        Determines the asymptotic growth rate relationship between two complexity functions $f(n)$ and $g(n)$
        by calculating the mathematical limit:
        $$\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)}$$

        Classification Rules:
            - Limit = 0: $f(n) = o(g(n))$ (Strictly lower growth rate; $g(n)$ dominates).
            - Limit = Constant $c > 0$: $f(n) = \\Theta(g(n))$ (Same asymptotic growth class).
            - Limit = $\\infty$: $f(n) = \\omega(g(n))$ (Strictly higher growth rate; $f(n)$ dominates).

        Args:
            f_str (str): Function $f(n)$ string (e.g. "n * log(n)").
            g_str (str): Function $g(n)$ string (e.g. "n^2").

        Returns:
            str: Human-readable Big-O / Asymptotic bound classification string.
        """
        from sympy.parsing.sympy_parser import parse_expr

        n = sp.Symbol("n", positive=True)
        f = parse_expr(f_str, local_dict={"n": n})
        g = parse_expr(g_str, local_dict={"n": n})

        limit_val = sp.limit(f / g, n, sp.oo)

        if limit_val == 0:
            return f"f(n) = o(g(n)). Faster asymptotic growth: g(n)."
        elif limit_val == sp.oo:
            return f"f(n) = w(g(n)). Faster asymptotic growth: f(n)."
        else:
            return f"f(n) = Theta(g(n)). Identical growth class. Scaling ratio: {limit_val}"


# Global singleton instance for computer science engine
cs_engine = ComputerScienceEngine()
