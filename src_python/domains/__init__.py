"""
Scientific & Specialized Domain Calculation Engines
====================================================

Contains domain-specific computation modules:
- PhysicsEngine (e.g. E=mc^2, Heisenberg Uncertainty, Newton's Laws)
- AstrophysicsEngine (e.g. Schwarzschild Radius, Kepler's 3rd Law, Drake Equation)
- ChemistryEngine (e.g. Nernst Equation, Gibbs Free Energy, First-order Kinetics)
- BiologyEngine (e.g. Michaelis-Menten Kinetics, Hardy-Weinberg Equilibrium)
- FinanceEngine (e.g. Black-Scholes, WACC, NPV, IRR)
- ComputerScienceEngine (e.g. Shannon Entropy, Asymptotic Complexity Big-O Limit)
"""

from src_python.domains.physics import PhysicsEngine, physics_engine
from src_python.domains.astrophysics import AstrophysicsEngine, astro_engine
from src_python.domains.chemistry import ChemistryEngine, chem_engine
from src_python.domains.biology import BiologyEngine, bio_engine
from src_python.domains.finance import FinanceEngine, finance_engine
from src_python.domains.cs import ComputerScienceEngine, cs_engine

__all__ = [
    "PhysicsEngine", "physics_engine",
    "AstrophysicsEngine", "astro_engine",
    "ChemistryEngine", "chem_engine",
    "BiologyEngine", "bio_engine",
    "FinanceEngine", "finance_engine",
    "ComputerScienceEngine", "cs_engine",
]
