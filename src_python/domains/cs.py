"""
Computer Science & Information Theory Engine
============================================

Provides theoretical computer science, algorithms, and information theory tools:
- Shannon Entropy ($H(X) = - \\sum p(x) \\log_2 p(x)$) for information content.
- Asymptotic Algorithm Complexity Limit Classifier ($f(n)$ vs $g(n)$ using $\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)}$).

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import List

import sympy as sp

from src_python.validation import validate_probability_distribution


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
            ValueError: If probabilities do not sum to 1.0 (within 1e-4 tolerance),
                        if any probability is outside [0, 1], if list is empty, or if NaN/inf is present.
            TypeError: If elements are not valid numbers.
        """
        probs = validate_probability_distribution(probabilities, name="Probabilities")

        entropy = 0.0
        for p in probs:
            if p > 0.0:
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
        from src_python.security import parse_safe

        if not isinstance(f_str, str) or not f_str.strip():
            raise ValueError("f(n) expression must be a non-empty string.")
        if not isinstance(g_str, str) or not g_str.strip():
            raise ValueError("g(n) expression must be a non-empty string.")

        n = sp.Symbol("n", positive=True)
        f = parse_safe(f_str, allowed_symbols={"n": n})
        g = parse_safe(g_str, allowed_symbols={"n": n})

        limit_val = sp.limit(f / g, n, sp.oo)

        if limit_val == 0:
            return "f(n) = o(g(n)). Faster asymptotic growth: g(n)."
        elif limit_val == sp.oo:
            return "f(n) = w(g(n)). Faster asymptotic growth: f(n)."
        else:
            return f"f(n) = Theta(g(n)). Identical growth class. Scaling ratio: {limit_val}"


# Global singleton instance for computer science engine
cs_engine = ComputerScienceEngine()
