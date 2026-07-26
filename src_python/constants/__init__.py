"""
Physical and Mathematical Constants Module
==========================================

Loads and manages standard CODATA physical constants, astronomical metrics,
and mathematical constants with values, standard units, and descriptions.
"""

from src_python.constants.loader import ConstantsDatabase, DB, get_constant_value

__all__ = ["ConstantsDatabase", "DB", "get_constant_value"]
