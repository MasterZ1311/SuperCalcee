"""
Pytest configuration and shared fixtures for SuperCalcee test suite.
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

# Ensure project root and src_python are on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src_python.api import app
from src_python.cas.symbolic_engine import CASEngine, cas_engine
from src_python.constants.loader import DB, ConstantsDatabase
from src_python.domains.astrophysics import AstrophysicsEngine, astro_engine
from src_python.domains.biology import BiologyEngine, bio_engine
from src_python.domains.chemistry import ChemistryEngine, chem_engine
from src_python.domains.cs import ComputerScienceEngine, cs_engine
from src_python.domains.finance import FinanceEngine, finance_engine
from src_python.domains.physics import PhysicsEngine, physics_engine
from src_python.formula_engine.solver import FormulaEngine, formula_engine
from src_python.parser.ast_parser import LogicParser, logic_parser
from src_python.units.dimensional import DimensionalEngine, dim_engine


@pytest.fixture(scope="session")
def client() -> TestClient:
    """FastAPI TestClient instance."""
    return TestClient(app)


@pytest.fixture
def cas() -> CASEngine:
    """CAS Symbolic Engine instance."""
    return cas_engine


@pytest.fixture
def dim() -> DimensionalEngine:
    """Dimensional Analysis & Unit Engine instance."""
    return dim_engine


@pytest.fixture
def formula() -> FormulaEngine:
    """Formula Solver Engine instance."""
    return formula_engine


@pytest.fixture
def logic() -> LogicParser:
    """Boolean Logic Parser instance."""
    return logic_parser


@pytest.fixture
def constants_db() -> ConstantsDatabase:
    """Constants Database instance."""
    return DB


@pytest.fixture
def physics() -> PhysicsEngine:
    """Physics Engine instance."""
    return physics_engine


@pytest.fixture
def astro() -> AstrophysicsEngine:
    """Astrophysics Engine instance."""
    return astro_engine


@pytest.fixture
def chem() -> ChemistryEngine:
    """Chemistry Engine instance."""
    return chem_engine


@pytest.fixture
def bio() -> BiologyEngine:
    """Biology Engine instance."""
    return bio_engine


@pytest.fixture
def cs() -> ComputerScienceEngine:
    """Computer Science Engine instance."""
    return cs_engine


@pytest.fixture
def finance() -> FinanceEngine:
    """Finance Engine instance."""
    return finance_engine
