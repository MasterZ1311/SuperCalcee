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

    def nernst_equation(
        self, E0: float, n: int, Q: float, T: float = 298.15
    ) -> float:
        r"""
        Calculates non-standard reduction potential of an electrochemical cell using the Nernst Equation.

        Formula:
            $$E = E^0 - \frac{RT}{nF} \ln Q$$

        Args:
            E0 (float): Standard cell potential (E^0) in Volts (V).
            n (int): Number of moles of electrons transferred in the cell reaction.
            Q (float): Reaction quotient (Q = [Products]/[Reactants]).
            T (float, optional): Temperature in Kelvin (K). Defaults to standard 298.15 K (25 °C).

        Returns:
            float: Non-standard cell potential E in Volts (V).
        """
        if Q <= 0:
            raise ValueError("Reaction quotient Q must be strictly positive (> 0).")
        return E0 - ((self.R * T) / (n * self.F)) * math.log(Q)

    def gibbs_free_energy(self, delta_H: float, T: float, delta_S: float) -> float:
        r"""
        Calculates change in Gibbs Free Energy (\Delta G) to evaluate thermodynamic spontaneity.

        Formula:
            $$\Delta G = \Delta H - T \Delta S$$

        Args:
            delta_H (float): Enthalpy change (\Delta H) in Joules (J).
            T (float): Absolute temperature in Kelvin (K).
            delta_S (float): Entropy change (\Delta S) in Joules per Kelvin (J/K).

        Returns:
            float: Gibbs Free Energy change (\Delta G) in Joules (J).
                   (\Delta G < 0 implies spontaneous reaction).
        """
        return delta_H - (T * delta_S)

    def first_order_kinetics(self, k: float, t: float, A0: float) -> float:
        r"""
        Calculates remaining reactant concentration for a first-order chemical reaction or radioactive decay.

        Formula:
            $$[A] = [A_0] e^{-kt}$$

        Args:
            k (float): Reaction rate constant (s^-1 or min^-1).
            t (float): Elapsed time (s or min).
            A0 (float): Initial concentration [A_0] (Molar or arbitrary units).

        Returns:
            float: Remaining concentration [A] after time t.
        """
        return A0 * math.exp(-k * t)


# Global singleton instance for chemistry engine
chem_engine = ChemistryEngine()
