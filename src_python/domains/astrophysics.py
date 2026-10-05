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
from src_python.validation import (
    validate_mass,
    validate_non_negative,
    validate_positive,
    validate_probability,
)


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
            mass (float): Mass of the body in kilograms (kg). Must be >= 0.

        Returns:
            float: Schwarzschild radius in meters (m).

        Raises:
            ValueError: If mass < 0 or is NaN/infinite.
        """
        m_val = validate_mass(mass, name="Mass", allow_zero=True)
        return (2.0 * self.G * m_val) / (self.c**2)

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
            period (float, optional): Orbital period T in seconds. Must be > 0.
            semi_major_axis (float, optional): Semi-major axis a in meters. Must be > 0.
            mass_central (float, optional): Central body mass M in kilograms. Must be > 0.

        Returns:
            Union[float, str]: Calculated missing parameter (T, a, or M).

        Raises:
            ValueError: If fewer than 2 parameters are provided, or if any parameter is <= 0 or invalid.
        """
        specified = sum(p is not None for p in (period, semi_major_axis, mass_central))
        if specified < 2:
            raise ValueError("Must provide at least 2 of (period, semi_major_axis, mass_central).")

        T, a, M = sp.symbols("T a M", positive=True)
        eq = sp.Eq(T**2, (4 * sp.pi**2 * a**3) / (self.G * M))

        subs = {}
        if period is not None:
            t_val = validate_positive(period, name="Orbital period (T)")
            subs[T] = t_val
        if semi_major_axis is not None:
            a_val = validate_positive(semi_major_axis, name="Semi-major axis (a)")
            subs[a] = a_val
        if mass_central is not None:
            m_val = validate_positive(mass_central, name="Central mass (M)")
            subs[M] = m_val

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
            R (float): Average rate of star formation in our galaxy (stars/year). Must be > 0.
            fp (float): Fraction of stars that have planetary systems (0 <= fp <= 1).
            ne (float): Average number of planets per star that could support life (ne >= 0).
            fl (float): Fraction of suitable planets on which life develops (0 <= fl <= 1).
            fi (float): Fraction of life-bearing planets that develop intelligent life (0 <= fi <= 1).
            fc (float): Fraction of civilizations that develop detectable radio technology (0 <= fc <= 1).
            L (float): Length of time such civilizations broadcast signals into space in years (L > 0).

        Returns:
            float: Estimated number of active communicative civilizations N.

        Raises:
            ValueError: If parameters violate physical or probabilistic bounds, or are NaN/infinite.
        """
        r_val = validate_positive(R, name="Star formation rate (R*)")
        fp_val = validate_probability(fp, name="Planetary fraction (fp)")
        ne_val = validate_non_negative(ne, name="Habitable planets per system (ne)")
        fl_val = validate_probability(fl, name="Life fraction (fl)")
        fi_val = validate_probability(fi, name="Intelligence fraction (fi)")
        fc_val = validate_probability(fc, name="Communication fraction (fc)")
        l_val = validate_positive(L, name="Civilization broadcast lifetime (L)")

        return r_val * fp_val * ne_val * fl_val * fi_val * fc_val * l_val


# Global singleton instance for astrophysics engine
astro_engine = AstrophysicsEngine()
