"""
SuperCalcee Backend API Server
==============================

FastAPI REST API serving symbolic CAS, dimensional unit conversions, physical constants,
domain computations (Physics, Astrophysics, Chemistry, Biology, Finance, CS), and logic parsing.

Architecture:
    - Framework: FastAPI + Uvicorn ASGI Web Server
    - Protocol: REST / JSON over HTTP
    - Port: 8000 (Default local endpoint: http://127.0.0.1:8000)

Author: SuperCalcee Core Team
License: MIT
"""

import os
import sys
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure parent root directory is in sys.path for internal imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src_python.cas.symbolic_engine import cas_engine
from src_python.constants.loader import DB
from src_python.units.dimensional import dim_engine
from src_python.parser.ast_parser import logic_parser
from src_python.domains.physics import physics_engine
from src_python.domains.astrophysics import astro_engine
from src_python.domains.chemistry import chem_engine
from src_python.domains.biology import bio_engine
from src_python.domains.finance import finance_engine
from src_python.domains.cs import cs_engine
from src_python.formula_engine.solver import formula_engine

# Initialize FastAPI Application with metadata for open-source API documentation
app = FastAPI(
    title="SuperCalcee Computational Core API",
    description="High-performance backend serving symbolic math, dimensional physics, finance, and logic engines.",
    version="1.0.0",
    contact={
        "name": "SuperCalcee Open Source Team",
        "url": "https://github.com/MasterZ1311/SuperCalcee",
    },
    license_info={
        "name": "MIT",
    },
)

# Configure Cross-Origin Resource Sharing (CORS) for Electron and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Input Validation Models
# ============================================================================

class ExpressionInput(BaseModel):
    """Input payload for single-variable symbolic CAS operations."""
    expr: str = Field(..., description="Mathematical expression (e.g. 'x^2 + 2x + 1')", example="x**2 - 4")
    variable: str = Field("x", description="Target variable for differentiation, integration, or solving", example="x")


class LimitInput(BaseModel):
    """Input payload for mathematical limit evaluation."""
    expr: str = Field(..., description="Target expression", example="sin(x)/x")
    variable: str = Field("x", description="Variable taking the limit", example="x")
    approach: str = Field("0", description="Point of approach (e.g. '0', 'oo', '-oo')", example="0")


class LogicInput(BaseModel):
    """Input payload for Boolean logic simplification."""
    expr: str = Field(..., description="Boolean logic expression with operators (∧, ∨, →, ~, etc.)", example="A ∧ (A ∨ B)")


class UnitConversionInput(BaseModel):
    """Input payload for physical unit conversions."""
    expr: str = Field(..., description="Source quantity with units", example="100 * kilometer / hour")
    target_unit: str = Field(..., description="Target units to convert into", example="meter / second")


class BigOInput(BaseModel):
    """Input payload for asymptotic Big-O growth rate analysis."""
    f_n: str = Field(..., description="Algorithm function f(n)", example="n * log(n)")
    g_n: str = Field(..., description="Reference function g(n)", example="n**2")


class FormulaInput(BaseModel):
    """Input payload for generic multi-variable formula algebraic solving."""
    equation: str = Field(..., description="Multi-variable equation string", example="P * V = n * R * T")
    solve_for: str = Field(..., description="Target unknown variable to isolate and calculate", example="P")
    given: Dict[str, float] = Field(..., description="Dictionary of known parameter values", example={"V": 0.025, "n": 1.0, "R": 8.314, "T": 300.0})


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", summary="Health Check")
def read_root() -> Dict[str, str]:
    """Returns engine status for service readiness verification."""
    return {"status": "SuperCalcee Computational Core Engine Active", "version": "1.0.0"}


@app.get("/constants", summary="Fetch CODATA Constants Database")
def get_constants() -> Dict[str, Any]:
    """Retrieves all CODATA physical and mathematical constants."""
    return DB.get_all()


# --- Symbolic CAS Endpoints ---

@app.post("/cas/simplify", summary="Algebraically Simplify Expression")
def simplify_expr(data: ExpressionInput) -> Dict[str, str]:
    """Simplifies a mathematical expression string using SymPy."""
    try:
        res = cas_engine.simplify(data.expr)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/cas/differentiate", summary="Symbolic Differentiation")
def diff_expr(data: ExpressionInput) -> Dict[str, str]:
    """Computes the symbolic derivative of an expression with respect to a target variable."""
    try:
        res = cas_engine.differentiate(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/cas/integrate", summary="Symbolic Indefinite Integration")
def int_expr(data: ExpressionInput) -> Dict[str, str]:
    """Computes the symbolic indefinite integral of an expression with respect to a target variable."""
    try:
        res = cas_engine.integrate(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/cas/solve", summary="Solve Algebraic Equation")
def solve_eq(data: ExpressionInput) -> Dict[str, Any]:
    """Solves an algebraic equation for the target variable."""
    try:
        res = cas_engine.solve(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Unit Conversion Endpoint ---

@app.post("/units/convert", summary="Dimensional Unit Conversion")
def convert_units(data: UnitConversionInput) -> Dict[str, str]:
    """Converts a physical quantity into compatible target units."""
    try:
        res = dim_engine.convert_units(data.expr, data.target_unit)
        return {"result": str(res)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Specialized Science & Domain Endpoints ---

@app.post("/physics/emc2", summary="Einstein Mass-Energy Equivalence")
def physics_emc2(
    mass: Optional[float] = Query(None, description="Mass in kg"),
    energy: Optional[float] = Query(None, description="Energy in Joules"),
) -> Dict[str, float]:
    """Calculates E = mc^2 mass-energy equivalence."""
    try:
        res = physics_engine.energy_mass_equivalence(mass=mass, energy=energy)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/cs/big-o", summary="Asymptotic Big-O Growth Classifier")
def cs_big_o(data: BigOInput) -> Dict[str, str]:
    """Evaluates algorithm complexity limit lim n->inf f(n)/g(n)."""
    try:
        res = cs_engine.big_o_limit(data.f_n, data.g_n)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/bio/hardy-weinberg", summary="Hardy-Weinberg Population Equilibrium")
def bio_hw(
    p: Optional[float] = Query(None, description="Dominant allele frequency p"),
    q: Optional[float] = Query(None, description="Recessive allele frequency q"),
) -> Dict[str, Any]:
    """Calculates genotype frequencies under Hardy-Weinberg equilibrium."""
    try:
        res = bio_engine.hardy_weinberg(p=p, q=q)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/finance/black-scholes", summary="Black-Scholes European Options Pricing")
def fin_bs(
    S: float = Query(..., description="Spot price ($)"),
    K: float = Query(..., description="Strike price ($)"),
    T: float = Query(..., description="Time to maturity in years"),
    r: float = Query(..., description="Risk-free rate (decimal)"),
    sigma: float = Query(..., description="Volatility (decimal)"),
    option_type: str = Query("call", description="'call' or 'put'"),
) -> Dict[str, float]:
    """Calculates European call/put option prices via Black-Scholes model."""
    try:
        res = finance_engine.black_scholes(S, K, T, r, sigma, option_type)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/logic/simplify", summary="Boolean Logic Simplification")
def simplify_logic_expr(data: LogicInput) -> Dict[str, str]:
    """Simplifies a Boolean logic expression using algebraic logic rules."""
    try:
        res = logic_parser.simplify(data.expr)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/formula/solve", summary="Multi-Variable Formula Solver")
def solve_formula(data: FormulaInput) -> Dict[str, float]:
    """Algebraically solves an equation for a target variable given known values."""
    try:
        res = formula_engine.algebraic_solve(data.equation, data.solve_for, data.given)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Main entrypoint for direct command-line execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
