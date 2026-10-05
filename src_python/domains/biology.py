"""
Biology & Bio-Math Engine
=========================

Provides quantitative biological models and genetics equations:
- Michaelis-Menten Enzyme Kinetics ($v = \\frac{V_{max} [S]}{K_m + [S]}$)
- Hardy-Weinberg Population Equilibrium ($p^2 + 2pq + q^2 = 1$)

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Dict, Optional

from src_python.validation import (
    validate_allele_frequencies,
    validate_michaelis_menten,
)


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
            Vmax (float): Maximum reaction velocity ($mol/L \\cdot s$). Must be > 0.
            Km (float): Michaelis constant (substrate concentration at half $V_{max}$). Must be > 0.
            S (float): Substrate concentration $[S]$. Must be >= 0.

        Returns:
            float: Reaction velocity $v$.

        Raises:
            ValueError: If Vmax <= 0, Km <= 0, S < 0, or if inputs are NaN/infinite.
            ZeroDenominatorError: If denominator Km + [S] == 0.
        """
        vmax_val, km_val, s_val = validate_michaelis_menten(Vmax, Km, S)
        return (vmax_val * s_val) / (km_val + s_val)

    def hardy_weinberg(self, p: Optional[float] = None, q: Optional[float] = None) -> Dict[str, float]:
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
            ValueError: If neither parameter is specified, allele values fall outside [0, 1],
                        or both are specified and do not sum to 1.0 (within 1e-4 tolerance).
        """
        p_val, q_val = validate_allele_frequencies(p, q)

        return {
            "p": float(p_val),
            "q": float(q_val),
            "p_squared (homozygous dominant)": float(p_val**2),
            "2pq (heterozygous)": float(2.0 * p_val * q_val),
            "q_squared (homozygous recessive)": float(q_val**2),
        }


# Global singleton instance for biology calculations
bio_engine = BiologyEngine()
