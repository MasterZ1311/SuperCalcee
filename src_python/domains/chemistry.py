r"""
Chemistry Calculation Engine
============================

Provides physical and analytical chemistry solvers:
- Nernst Equation ($E = E_0 - \frac{RT}{nF} \ln Q$) for electrochemical cell potential.
- Gibbs Free Energy Change ($\Delta G = \Delta H - T \Delta S$) for thermodynamic spontaneity.
- First-Order Reaction Kinetics ($[A] = [A_0] e^{-kt}$) for chemical decomposition & radioactive decay.

Author: SuperCalcee Core Team
License: MIT
"""

import math

from src_python.constants.loader import DB
from src_python.validation import (
    validate_concentration,
    validate_finite_number,
    validate_non_negative,
    validate_positive_integer,
    validate_rate_constant,
    validate_reaction_quotient,
    validate_temperature_kelvin,
)


class ChemistryEngine:
    """
    Chemistry solver engine initialized with ideal gas R and Faraday F constants.
    """

    def __init__(self) -> None:
        """
        Loads constants:
        - `R`: Universal Gas Constant (8.314462618 J/(mol·K))
        - `F`: Faraday Constant (96485.33212 C/mol)
        """
        self.R: float = float(DB.get_value("R"))
        self.F: float = float(DB.get_value("F"))

    def nernst_equation(self, E0: float, n: int, Q: float, T: float = 298.15) -> float:
        r"""
        Calculates non-standard reduction potential of an electrochemical cell using the Nernst Equation.

        Formula:
            $$E = E^0 - \frac{RT}{nF} \ln Q$$

        Args:
            E0 (float): Standard cell potential (E^0) in Volts (V).
            n (int): Number of moles of electrons transferred in the cell reaction. Must be integer >= 1.
            Q (float): Reaction quotient (Q = [Products]/[Reactants]). Must be > 0.
            T (float, optional): Temperature in Kelvin (K). Defaults to standard 298.15 K (25 °C). Must be > 0 K.

        Returns:
            float: Non-standard cell potential E in Volts (V).

        Raises:
            ValueError: If Q <= 0, T <= 0, or n is not a positive integer.
        """
        e0_val = validate_finite_number(E0, name="Standard potential (E0)")
        n_val = validate_positive_integer(n, name="Electrons transferred (n)")
        q_val = validate_reaction_quotient(Q, name="Reaction quotient (Q)")
        t_val = validate_temperature_kelvin(T, name="Temperature", allow_zero=False)

        return e0_val - ((self.R * t_val) / (n_val * self.F)) * math.log(q_val)

    def gibbs_free_energy(self, delta_H: float, T: float, delta_S: float) -> float:
        r"""
        Calculates change in Gibbs Free Energy (\Delta G) to evaluate thermodynamic spontaneity.

        Formula:
            $$\Delta G = \Delta H - T \Delta S$$

        Args:
            delta_H (float): Enthalpy change (\Delta H) in Joules (J). Can be negative (exothermic).
            T (float): Absolute temperature in Kelvin (K). Must be >= 0 K.
            delta_S (float): Entropy change (\Delta S) in Joules per Kelvin (J/K).

        Returns:
            float: Gibbs Free Energy change (\Delta G) in Joules (J).
                   (\Delta G < 0 implies spontaneous reaction).

        Raises:
            ValueError: If temperature is below absolute zero (T < 0 K) or inputs are NaN/infinite.
        """
        dh_val = validate_finite_number(delta_H, name="Enthalpy change (delta_H)")
        t_val = validate_temperature_kelvin(T, name="Temperature", allow_zero=True)
        ds_val = validate_finite_number(delta_S, name="Entropy change (delta_S)")

        return dh_val - (t_val * ds_val)

    def first_order_kinetics(self, k: float, t: float, A0: float) -> float:
        r"""
        Calculates remaining reactant concentration for a first-order chemical reaction or radioactive decay.

        Formula:
            $$[A] = [A_0] e^{-kt}$$

        Args:
            k (float): Reaction rate constant (s^-1 or min^-1). Must be > 0.
            t (float): Elapsed time (s or min). Must be >= 0.
            A0 (float): Initial concentration [A_0] (Molar or arbitrary units). Must be >= 0.

        Returns:
            float: Remaining concentration [A] after time t.

        Raises:
            ValueError: If k <= 0, t < 0, or A0 < 0.
        """
        k_val = validate_rate_constant(k, name="Rate constant (k)")
        t_val = validate_non_negative(t, name="Elapsed time (t)")
        a0_val = validate_concentration(A0, name="Initial concentration (A0)")

        return a0_val * math.exp(-k_val * t_val)


# Global singleton instance for chemistry engine
chem_engine = ChemistryEngine()
