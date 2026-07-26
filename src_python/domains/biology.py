"""
Biology & Bio-Math Engine
=========================

Provides quantitative biological models and genetics equations:
- Michaelis-Menten Enzyme Kinetics ($v = \\frac{V_{max} [S]}{K_m + [S]}$)
- Hardy-Weinberg Population Equilibrium ($p^2 + 2pq + q^2 = 1$)

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Dict, Optional, Any


class BiologyEngine:
    """
    Biology and bio-mathematics solver module.
    """

    def michaelis_menten(self, Vmax: float, Km: float, S: float) -> float:
        """
        Calculates enzyme reaction rate $v$ using the Michaelis-Menten model.

        Formula:
            $$v = \\frac{V_{max} [S]}{K_m + [S]}$$

        Args:
            Vmax (float): Maximum reaction velocity ($mol/L \\cdot s$).
            Km (float): Michaelis constant (substrate concentration at half $V_{max}$).
            S (float): Substrate concentration $[S]$.

        Returns:
            float: Reaction velocity $v$.

        Raises:
            ValueError: If $K_m + [S] = 0$ or negative values are passed.
        """
        if (Km + S) == 0:
            raise ValueError("Denominator (Km + S) cannot be zero.")
        return (Vmax * S) / (Km + S)

    def hardy_weinberg(
        self, p: Optional[float] = None, q: Optional[float] = None
    ) -> Dict[str, float]:
        """
        Calculates population allele frequencies and genotype proportions under Hardy-Weinberg Equilibrium.

        Formulas:
            - Allele frequency equation: $p + q = 1$
            - Genotype frequency equation: $p^2 + 2pq + q^2 = 1$

        Args:
            p (float, optional): Dominant allele frequency $p$ ($0 \\le p \\le 1$).
            q (float, optional): Recessive allele frequency $q$ ($0 \\le q \\le 1$).

        Returns:
            Dict[str, float]: Dictionary containing:
                - 'p': Dominant allele frequency
                - 'q': Recessive allele frequency
                - 'p_squared (homozygous dominant)': $p^2$
                - '2pq (heterozygous)': $2pq$
                - 'q_squared (homozygous recessive)': $q^2$

        Raises:
            ValueError: If neither parameter is specified, or allele values fall outside [0, 1].
        """
        if p is not None and q is None:
            if not (0 <= p <= 1):
                raise ValueError("Allele frequency p must be between 0 and 1.")
            q = 1.0 - p
        elif q is not None and p is None:
            if not (0 <= q <= 1):
                raise ValueError("Allele frequency q must be between 0 and 1.")
            p = 1.0 - q
        elif p is None and q is None:
            raise ValueError("Must provide either allele frequency 'p' or 'q'.")

        return {
            "p": float(p), # type: ignore
            "q": float(q), # type: ignore
            "p_squared (homozygous dominant)": float(p**2), # type: ignore
            "2pq (heterozygous)": float(2 * p * q), # type: ignore
            "q_squared (homozygous recessive)": float(q**2), # type: ignore
        }


# Global singleton instance for biology calculations
bio_engine = BiologyEngine()
