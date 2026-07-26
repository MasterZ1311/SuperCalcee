r"""
Physics Calculation Engine
==========================

Provides fundamental physics equations and solvers:
- Einstein's Mass-Energy Equivalence ($E = mc^2$)
- Heisenberg Uncertainty Principle ($\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$)
- Newton's Second Law of Motion ($F = ma$)

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Optional, Union
import sympy as sp
from src_python.constants.loader import DB


class PhysicsEngine:
    """
    Core physics solver engine initialized with CODATA fundamental constants.
    """

    def __init__(self) -> None:
        r"""
        Loads fundamental physical constants:
        - `c`: Speed of light in vacuum (m/s)
        - `h_bar`: Reduced Planck constant \hbar = h / (2\pi) (J·s)
        """
        self.c: float = float(DB.get_value("c"))
        self.h_bar: float = float(DB.get_value("h")) / (2 * sp.pi.evalf())

    def energy_mass_equivalence(
        self, mass: Optional[float] = None, energy: Optional[float] = None
    ) -> float:
        """
        Calculates relativistic mass-energy equivalence using Einstein's formula E = mc^2.

        Args:
            mass (float, optional): Mass in kilograms (kg).
            energy (float, optional): Energy in Joules (J).

        Returns:
            float: Calculated Energy in Joules (if mass provided) or Mass in kg (if energy provided).

        Raises:
            ValueError: If neither mass nor energy is provided, or both are provided.

        Example:
            >>> physics_engine.energy_mass_equivalence(mass=1.0)
            8.987551787368176e+16
        """
        if mass is not None and energy is None:
            return float(mass * (self.c ** 2))
        elif energy is not None and mass is None:
            return float(energy / (self.c ** 2))
        else:
            raise ValueError("Must provide exactly one of 'mass' or 'energy'.")

    def heisenberg_uncertainty(
        self, delta_x: Optional[float] = None, delta_p: Optional[float] = None
    ) -> float:
        r"""
        Calculates minimum quantum uncertainty bound per Heisenberg's Uncertainty Principle:
        $$\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$$

        Args:
            delta_x (float, optional): Position uncertainty in meters (m).
            delta_p (float, optional): Momentum uncertainty in kg·m/s.

        Returns:
            float: Minimum required uncertainty for the missing parameter.

        Raises:
            ValueError: If neither or both parameters are specified.
        """
        min_product: float = float(self.h_bar / 2.0)

        if delta_x is not None and delta_p is None:
            return min_product / delta_x
        elif delta_p is not None and delta_x is None:
            return min_product / delta_p
        else:
            raise ValueError("Must provide exactly one of 'delta_x' or 'delta_p'.")

    def newtons_second_law(
        self,
        F: Optional[float] = None,
        m: Optional[float] = None,
        a: Optional[float] = None,
    ) -> float:
        """
        Solves Newton's Second Law of Motion F = ma.

        Args:
            F (float, optional): Force in Newtons (N).
            m (float, optional): Mass in kilograms (kg).
            a (float, optional): Acceleration in meters per second squared (m/s²).

        Returns:
            float: Missing parameter (F, m, or a).

        Raises:
            ValueError: If anything other than exactly two parameters are specified.
        """
        specified = sum(p is not None for p in (F, m, a))
        if specified != 2:
            raise ValueError("Must provide exactly two of 'F', 'm', and 'a'.")

        if F is None:
            return m * a  # type: ignore
        elif m is None:
            return F / a  # type: ignore
        else:
            return F / m  # type: ignore


# Global singleton instance for physics computations
physics_engine = PhysicsEngine()
