r"""
Astrophysics Calculation Engine
===============================

Provides astronomical and cosmological solvers:
- Schwarzschild Radius ($R_s = \frac{2GM}{c^2}$) for black hole event horizons.
- Kepler's Third Law of Planetary Motion ($T^2 = \frac{4\pi^2 a^3}{GM}$).
- Drake Equation ($N = R^* \cdot f_p \cdot n_e \cdot f_l \cdot f_i \cdot f_c \cdot L$) for estimating active communicative alien civilizations.

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Optional, Union
import sympy as sp
from src_python.constants.loader import DB


class AstrophysicsEngine:
    """
    Astrophysics solver engine initialized with CODATA gravitational and light constants.
    """

    def __init__(self) -> None:
        """
        Loads constants:
        - `G`: Universal Gravitational Constant (m³/kg·s²)
        - `c`: Speed of Light in Vacuum (m/s)
        """
        self.G: float = float(DB.get_value("G"))
        self.c: float = float(DB.get_value("c"))

    def schwarzschild_radius(self, mass: float) -> float:
        r"""
        Calculates the Schwarzschild radius (event horizon radius) of a non-rotating celestial body or black hole.

        Formula:
            $$R_s = \frac{2GM}{c^2}$$

        Args:
            mass (float): Mass of the body in kilograms (kg).

        Returns:
            float: Schwarzschild radius in meters (m).

        Example:
            >>> astro_engine.schwarzschild_radius(1.989e30) # Solar Mass
            2954.04...
        """
        return (2 * self.G * mass) / (self.c ** 2)

    def keplers_third_law(
        self,
        period: Optional[float] = None,
        semi_major_axis: Optional[float] = None,
        mass_central: Optional[float] = None,
    ) -> Union[float, str]:
        r"""
        Solves Kepler's Third Law of Planetary Motion for orbital mechanics:
        $$T^2 = \frac{4\pi^2 a^3}{G M}$$

        Args:
            period (float, optional): Orbital period T in seconds.
            semi_major_axis (float, optional): Semi-major axis a in meters.
            mass_central (float, optional): Central body mass M in kilograms.

        Returns:
            Union[float, str]: Calculated missing parameter (T, a, or M).

        Raises:
            ValueError: If fewer than 2 parameters are provided.
        """
        specified = sum(p is not None for p in (period, semi_major_axis, mass_central))
        if specified < 2:
            raise ValueError("Must provide at least 2 of (period, semi_major_axis, mass_central).")

        T, a, M = sp.symbols("T a M", positive=True)
        eq = sp.Eq(T ** 2, (4 * sp.pi ** 2 * a ** 3) / (self.G * M))

        subs = {}
        if period is not None:
            subs[T] = period
        if semi_major_axis is not None:
            subs[a] = semi_major_axis
        if mass_central is not None:
            subs[M] = mass_central

        eq_subbed = eq.subs(subs)

        if period is None:
            sol = sp.solve(eq_subbed, T)
            return float(sol[0])
        elif semi_major_axis is None:
            sol = sp.solve(eq_subbed, a)
            return float(sol[0])
        elif mass_central is None:
            sol = sp.solve(eq_subbed, M)
            return float(sol[0])
        else:
            return "Equation fully specified"

    def drake_equation(
        self,
        R: float,
        fp: float,
        ne: float,
        fl: float,
        fi: float,
        fc: float,
        L: float,
    ) -> float:
        r"""
        Estimates the number N of active, communicative extraterrestrial civilizations in the Milky Way galaxy.

        Formula:
            $$N = R^* \cdot f_p \cdot n_e \cdot f_l \cdot f_i \cdot f_c \cdot L$$

        Args:
            R (float): Average rate of star formation in our galaxy (stars/year).
            fp (float): Fraction of stars that have planetary systems (0-1).
            ne (float): Average number of planets per star with planets that could support life.
            fl (float): Fraction of suitable planets on which life actually develops (0-1).
            fi (float): Fraction of life-bearing planets that develop intelligent life (0-1).
            fc (float): Fraction of intelligent civilizations that develop detectable radio technology (0-1).
            L (float): Length of time such civilizations broadcast signals into space (years).

        Returns:
            float: Estimated number of active communicative civilizations N.
        """
        return R * fp * ne * fl * fi * fc * L


# Global singleton instance for astrophysics engine
astro_engine = AstrophysicsEngine()
