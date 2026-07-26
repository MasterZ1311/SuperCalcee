"""
Dimensional Analysis & Unit Conversion Module
==============================================

Uses SymPy Physics Units namespace to evaluate expressions containing physical quantities
and convert between compatible physical dimensions (e.g. length, mass, time, energy).
"""

from src_python.units.dimensional import DimensionalEngine, dim_engine

__all__ = ["DimensionalEngine", "dim_engine"]
