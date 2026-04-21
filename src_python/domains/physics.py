import sympy as sp
from sympy.physics import units
from src_python.constants.loader import DB

class PhysicsEngine:
    def __init__(self):
        self.c = float(DB.get_value('c'))
        self.h_bar = float(DB.get_value('h')) / (2 * sp.pi)

    def energy_mass_equivalence(self, mass: float = None, energy: float = None):
        """
        E = mc^2
        """
        if mass is not None and energy is None:
            return mass * (self.c ** 2)
        elif energy is not None and mass is None:
            return energy / (self.c ** 2)
        else:
            raise ValueError("Provide either mass or energy")

    def heisenberg_uncertainty(self, delta_x: float = None, delta_p: float = None):
        """
        delta_x * delta_p >= h_bar / 2
        Returns the minimum required value for the missing parameter.
        """
        min_product = float(self.h_bar / 2)
        if delta_x is not None:
            return min_product / delta_x
        elif delta_p is not None:
            return min_product / delta_p
        else:
            raise ValueError("Provide either uncertainty in position or momentum")

    def newtons_second_law(self, F: float = None, m: float = None, a: float = None):
        """
        F = ma
        """
        if F is None and m is not None and a is not None:
            return m * a
        elif m is None and F is not None and a is not None:
            return F / a
        elif a is None and F is not None and m is not None:
            return F / m
        else:
            raise ValueError("Provide exactly two of F, m, a")

physics_engine = PhysicsEngine()
