"""
Formula Solver Engine Module
============================

Provides multi-variable algebraic equation parsing, variable substitution,
symbolic isolation of unknown target variables, and SciPy numerical root-finding.
"""

from src_python.formula_engine.solver import FormulaEngine, formula_engine

__all__ = ["FormulaEngine", "formula_engine"]
