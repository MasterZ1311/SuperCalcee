from src_python.constants.loader import DB
import sympy as sp
from src_python.cas.symbolic_engine import cas_engine

class AstrophysicsEngine:
    def __init__(self):
        self.G = float(DB.get_value('G'))
        self.c = float(DB.get_value('c'))
        
    def schwarzschild_radius(self, mass: float) -> float:
        """Calculate Schwarzschild radius for a given mass in kg."""
        return (2 * self.G * mass) / (self.c ** 2)

    def keplers_third_law(self, period: float = None, semi_major_axis: float = None, mass_central: float = None):
        """
        Solves Kepler's 3rd law: T^2 = (4 * pi^2 * a^3) / (G * M)
        Provide 2 of the 3 parameters (T, a, M)
        """
        T, a, M = sp.symbols('T a M')
        eq = sp.Eq(T**2, (4 * sp.pi**2 * a**3) / (self.G * M))
        
        subs = {}
        if period is not None: subs[T] = period
        if semi_major_axis is not None: subs[a] = semi_major_axis
        if mass_central is not None: subs[M] = mass_central
        
        eq_subbed = eq.subs(subs)
        
        if period is None:
            return float(sp.solve(eq_subbed, T)[1]) # taking the positive period
        elif semi_major_axis is None:
            return float(sp.solve(eq_subbed, a)[0])
        elif mass_central is None:
            return float(sp.solve(eq_subbed, M)[0])
        else:
            return "Equation fully specified"

    def drake_equation(self, R: float, fp: float, ne: float, fl: float, fi: float, fc: float, L: float) -> float:
        """
        N = R * fp * ne * fl * fi * fc * L
        """
        return R * fp * ne * fl * fi * fc * L

astro_engine = AstrophysicsEngine()
