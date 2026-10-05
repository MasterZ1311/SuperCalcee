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

from typing import Optional

import sympy as sp

from src_python.constants.loader import DB
from src_python.validation import (
    validate_finite_number,
    validate_non_zero_denominator,
    validate_positive,
)


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

    def energy_mass_equivalence(self, mass: Optional[float] = None, energy: Optional[float] = None) -> float:
        """
        Calculates relativistic mass-energy equivalence using Einstein's formula E = mc^2.

        Args:
            mass (float, optional): Mass in kilograms (kg).
            energy (float, optional): Energy in Joules (J).

        Returns:
            float: Calculated Energy in Joules (if mass provided) or Mass in kg (if energy provided).

        Raises:
            ValueError: If neither mass nor energy is provided, both are provided,
                        or if inputs are NaN/infinite.
        """
        if mass is not None and energy is None:
            m_val = validate_finite_number(mass, name="Mass")
            return float(m_val * (self.c**2))
        elif energy is not None and mass is None:
            e_val = validate_finite_number(energy, name="Energy")
            return float(e_val / (self.c**2))
        else:
            raise ValueError("Must provide exactly one of 'mass' or 'energy'.")

    def heisenberg_uncertainty(self, delta_x: Optional[float] = None, delta_p: Optional[float] = None) -> float:
        r"""
        Calculates minimum quantum uncertainty bound per Heisenberg's Uncertainty Principle:
        $$\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$$

        Args:
            delta_x (float, optional): Position uncertainty in meters (m). Must be > 0.
            delta_p (float, optional): Momentum uncertainty in kg·m/s. Must be > 0.

        Returns:
            float: Minimum required uncertainty for the missing parameter.

        Raises:
            ValueError: If neither or both parameters are specified, or if <= 0.
            ZeroDenominatorError: If the provided uncertainty parameter is zero.
        """
        if (delta_x is not None and delta_p is not None) or (delta_x is None and delta_p is None):
            raise ValueError("Must provide exactly one of 'delta_x' or 'delta_p'.")

        min_product: float = float(self.h_bar / 2.0)

        if delta_x is not None:
            dx_val = validate_finite_number(delta_x, name="Position uncertainty delta_x")
            validate_non_zero_denominator(dx_val, name="Position uncertainty delta_x")
            if dx_val < 0.0:
                raise ValueError(f"Position uncertainty delta_x must be strictly positive, got {dx_val}.")
            return min_product / dx_val
        else:
            dp_val = validate_finite_number(delta_p, name="Momentum uncertainty delta_p")
            validate_non_zero_denominator(dp_val, name="Momentum uncertainty delta_p")
            if dp_val < 0.0:
                raise ValueError(f"Momentum uncertainty delta_p must be strictly positive, got {dp_val}.")
            return min_product / dp_val

    def newtons_second_law(
        self,
        F: Optional[float] = None,
        m: Optional[float] = None,
        a: Optional[float] = None,
    ) -> float:
        """
        Solves Newton's Second Law of Motion F = ma.

        Args:
            F (float, optional): Force in Newtons (N). Can be negative (direction).
            m (float, optional): Mass in kilograms (kg). Must be > 0.
            a (float, optional): Acceleration in m/s². Can be negative (deceleration).

        Returns:
            float: Missing parameter (F, m, or a).

        Raises:
            ValueError: If anything other than exactly two parameters are specified,
                        if mass is non-positive, or if inputs are invalid.
            ZeroDenominatorError: If solving for acceleration with m=0 or solving for mass with a=0.
        """
        specified = sum(p is not None for p in (F, m, a))
        if specified != 2:
            raise ValueError("Must provide exactly two of 'F', 'm', and 'a'.")

        if F is None:
            assert m is not None and a is not None
            m_val = validate_positive(m, name="Mass (m)")
            a_val = validate_finite_number(a, name="Acceleration (a)")
            return float(m_val * a_val)
        elif m is None:
            assert F is not None and a is not None
            f_val = validate_finite_number(F, name="Force (F)")
            a_val = validate_finite_number(a, name="Acceleration (a)")
            validate_non_zero_denominator(a_val, name="Acceleration (a)")
            calc_m = f_val / a_val
            if calc_m <= 0.0:
                raise ValueError(
                    f"Calculated mass must be strictly positive (> 0), got {calc_m}. "
                    "Force and acceleration must have the same directional sign."
                )
            return float(calc_m)
        else:
            assert F is not None and m is not None
            f_val = validate_finite_number(F, name="Force (F)")
            m_val = validate_finite_number(m, name="Mass (m)")
            validate_non_zero_denominator(m_val, name="Mass (m)")
            if m_val < 0.0:
                raise ValueError(f"Mass (m) must be strictly positive (> 0), got {m_val}.")
            return float(f_val / m_val)


# Global singleton instance for physics computations
physics_engine = PhysicsEngine()
