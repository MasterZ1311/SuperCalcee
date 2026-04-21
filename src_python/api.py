from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add parent directory to path to allow imports
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

app = FastAPI(title="SuperCalcee Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExpressionInput(BaseModel):
    expr: str
    variable: str = "x"

class LimitInput(BaseModel):
    expr: str
    variable: str
    approach: str

class LogicInput(BaseModel):
    expr: str

@app.get("/")
def read_root():
    return {"status": "SuperCalcee Engine Running"}

@app.get("/constants")
def get_constants():
    return DB.get_all()

@app.post("/cas/simplify")
def simplify_expr(data: ExpressionInput):
    try:
        res = cas_engine.simplify(data.expr)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/cas/differentiate")
def diff_expr(data: ExpressionInput):
    try:
        res = cas_engine.differentiate(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/cas/integrate")
def int_expr(data: ExpressionInput):
    try:
        res = cas_engine.integrate(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/cas/solve")
def solve_eq(data: ExpressionInput):
    try:
        res = cas_engine.solve(data.expr, data.variable)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class UnitConversionInput(BaseModel):
    expr: str
    target_unit: str

@app.post("/units/convert")
def convert_units(data: UnitConversionInput):
    try:
        res = dim_engine.convert_units(data.expr, data.target_unit)
        return {"result": str(res)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/physics/emc2")
def physics_emc2(mass: float = None, energy: float = None):
    try:
        res = physics_engine.energy_mass_equivalence(mass=mass, energy=energy)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class BigOInput(BaseModel):
    f_n: str
    g_n: str

@app.post("/cs/big-o")
def cs_big_o(data: BigOInput):
    try:
        res = cs_engine.big_o_limit(data.f_n, data.g_n)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bio/hardy-weinberg")
def bio_hw(p: float = None, q: float = None):
    try:
        res = bio_engine.hardy_weinberg(p=p, q=q)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/finance/black-scholes")
def fin_bs(S: float, K: float, T: float, r: float, sigma: float, option_type: str = 'call'):
    try:
        res = finance_engine.black_scholes(S, K, T, r, sigma, option_type)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/logic/simplify")
def simplify_logic_expr(data: LogicInput):
    try:
        res = logic_parser.simplify(data.expr)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class FormulaInput(BaseModel):
    equation: str
    solve_for: str
    given: dict

@app.post("/formula/solve")
def solve_formula(data: FormulaInput):
    try:
        res = formula_engine.algebraic_solve(data.equation, data.solve_for, data.given)
        return {"result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
