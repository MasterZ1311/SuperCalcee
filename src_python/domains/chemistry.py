from src_python.constants.loader import DB
import math

class ChemistryEngine:
    def __init__(self):
        self.R = float(DB.get_value('R'))
        self.F = float(DB.get_value('F'))

    def nernst_equation(self, E0: float, n: int, Q: float, T: float = 298.15) -> float:
        """
        Calculates cell potential using Nernst Equation.
        E = E0 - (RT/nF) * ln(Q)
        """
        return E0 - ((self.R * T) / (n * self.F)) * math.log(Q)

    def gibbs_free_energy(self, delta_H: float, T: float, delta_S: float) -> float:
        """
        G = H - TS
        Calculates the change in Gibbs free energy.
        """
        return delta_H - (T * delta_S)

    def first_order_kinetics(self, k: float, t: float, A0: float) -> float:
        """
        [A] = [A0] * e^(-kt)
        """
        return A0 * math.exp(-k * t)

chem_engine = ChemistryEngine()
