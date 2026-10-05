"""
SuperCalcee Backend API Server
==============================

FastAPI REST API serving symbolic CAS, dimensional unit conversions, physical constants,
domain computations (Physics, Astrophysics, Chemistry, Biology, Finance, CS), numerical solvers,
and logic parsing.

Architecture:
    - Framework: FastAPI + Uvicorn ASGI Web Server
    - Protocol: REST / JSON over HTTP
    - Port: 8000 (Default local endpoint: http://127.0.0.1:8000)
    - Security: Strict Pydantic input schemas, AST allowlist validation, correlation IDs,
      path redaction, centralized exception handling, locked CORS origins.

Author: SuperCalcee Core Team
License: MIT
"""

import logging
import os
import re
import sys
import threading
import uuid
from typing import Any, Dict, List, Optional, Tuple

import sympy as sp
from fastapi import APIRouter, Body, FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware

# Ensure parent root directory is in sys.path for internal imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src_python.cas.symbolic_engine import cas_engine
from src_python.constants.loader import DB
from src_python.domains.astrophysics import astro_engine
from src_python.domains.biology import bio_engine
from src_python.domains.chemistry import chem_engine
from src_python.domains.cs import cs_engine
from src_python.domains.finance import finance_engine
from src_python.domains.physics import physics_engine
from src_python.formula_engine.solver import formula_engine
from src_python.numerical import (
    NumericalConvergenceError,
    NumericalError,
    robust_derivative,
    robust_limit,
    robust_quad,
    robust_root_scalar,
)
from src_python.parser.ast_parser import logic_parser
from src_python.security import (
    ExpressionLimitError,
    InvalidExpressionError,
    SecurityError,
    parse_safe,
    validate_safe_identifier,
)
from src_python.units.dimensional import dim_engine
from src_python.validation import ZeroDenominatorError

# Configure structured internal logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("supercalcee.api")


# ============================================================================
# Request ID / Correlation Middleware
# ============================================================================


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Extracts or generates an X-Request-ID correlation UUID for distributed tracing
    and error debugging. Attaches request ID to request state and response headers.
    """

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID")
        if not req_id or len(req_id) > 64 or not re.match(r"^[a-zA-Z0-9_\-]+$", req_id):
            req_id = uuid.uuid4().hex
        request.state.request_id = req_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response


# Initialize FastAPI Application
app = FastAPI(
    title="SuperCalcee Computational Core API",
    description="High-performance backend serving symbolic math, dimensional physics, finance, numerical analysis, and logic engines.",
    version="1.0.0",
    contact={
        "name": "SuperCalcee Open Source Team",
        "url": "https://github.com/MasterZ1311/SuperCalcee",
    },
    license_info={
        "name": "MIT",
    },
)

# Attach Correlation Middleware
app.add_middleware(RequestIDMiddleware)

# Configure Cross-Origin Resource Sharing (CORS) with strict explicit origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID", "Accept"],
    )
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    # Allow localhost, loopback, and RFC-1918 private network addresses (LAN) for local mobile access
    lan_origin_regex = r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$"
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=lan_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID", "Accept"],
    )


# ============================================================================
# Security & Path Redaction Utilities
# ============================================================================


def sanitize_error_message(msg: str) -> str:
    """
    Strips local file paths, internal Python object addresses, and stack indicators
    from user-facing error messages to avoid information disclosure.
    """
    if not isinstance(msg, str):
        msg = str(msg)
    # Redact Windows absolute filesystem paths (e.g. C:\... or E:\...)
    msg = re.sub(r"[a-zA-Z]:\\[^\s:\"']+", "[REDACTED_PATH]", msg)
    # Redact Unix absolute filesystem paths (e.g. /home/... or /usr/...)
    msg = re.sub(r"/(?:[a-zA-Z0-9_.\-]+/)+[a-zA-Z0-9_.\-]+", "[REDACTED_PATH]", msg)
    # Redact Python internal object representations like <class '...'> or <function ...>
    msg = re.sub(r"<[^>]+>", "[INTERNAL_OBJECT]", msg)
    return msg


def get_request_id(request: Request) -> str:
    """Helper to extract correlation ID from request state."""
    return getattr(request.state, "request_id", "unknown")


# ============================================================================
# Centralized Exception Handlers (Standardized Envelope & Zero Stack Traces)
# ============================================================================


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles Pydantic payload and parameter validation errors (HTTP 422)."""
    req_id = get_request_id(request)
    formatted_errors = []
    for err in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in err.get("loc", []))
        formatted_errors.append(
            {
                "field": field_loc,
                "message": sanitize_error_message(err.get("msg", "Invalid input")),
                "type": err.get("type", "value_error"),
            }
        )

    msg = (
        f"Validation failed: {formatted_errors[0]['message']} for '{formatted_errors[0]['field']}'"
        if formatted_errors
        else "Request validation failed."
    )
    logger.info(f"[{req_id}] Validation error: {msg}")

    return JSONResponse(
        status_code=422,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg,
                "details": {
                    "request_id": req_id,
                    "validation_errors": formatted_errors,
                },
            },
            "detail": msg,
        },
    )


@app.exception_handler(SecurityError)
async def security_exception_handler(request: Request, exc: SecurityError) -> JSONResponse:
    """Handles expression AST security rejections and length limit errors (HTTP 400)."""
    req_id = get_request_id(request)
    logger.warning(f"[{req_id}] Security rejection: {exc}")
    code = "EXPRESSION_LIMIT_EXCEEDED" if isinstance(exc, ExpressionLimitError) else "SECURITY_VIOLATION"
    msg = sanitize_error_message(str(exc))

    return JSONResponse(
        status_code=400,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": code,
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


@app.exception_handler(ZeroDenominatorError)
async def zero_division_exception_handler(request: Request, exc: ZeroDenominatorError) -> JSONResponse:
    """Handles mathematical division by zero and singularity conditions (HTTP 400)."""
    req_id = get_request_id(request)
    msg = sanitize_error_message(str(exc))
    return JSONResponse(
        status_code=400,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": "ZERO_DIVISION_ERROR",
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


@app.exception_handler(NumericalConvergenceError)
async def numerical_convergence_exception_handler(request: Request, exc: NumericalConvergenceError) -> JSONResponse:
    """Handles numerical solver non-convergence and divergence failures (HTTP 400)."""
    req_id = get_request_id(request)
    msg = sanitize_error_message(str(exc))
    return JSONResponse(
        status_code=400,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": "CONVERGENCE_ERROR",
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


@app.exception_handler(NumericalError)
async def numerical_error_exception_handler(request: Request, exc: NumericalError) -> JSONResponse:
    """Handles general numerical calculation errors (HTTP 400)."""
    req_id = get_request_id(request)
    msg = sanitize_error_message(str(exc))
    return JSONResponse(
        status_code=400,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": "CALCULATION_ERROR",
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Handles mathematical domain constraint errors and syntax errors (HTTP 400)."""
    req_id = get_request_id(request)
    msg = sanitize_error_message(str(exc))
    code = "SYNTAX_ERROR" if isinstance(exc, InvalidExpressionError) else "DOMAIN_ERROR"
    return JSONResponse(
        status_code=400,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": code,
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Standardizes explicit FastAPI HTTPExceptions into structured error response envelope."""
    req_id = get_request_id(request)
    msg = sanitize_error_message(str(exc.detail))
    code = "REQUEST_ERROR" if exc.status_code < 500 else "INTERNAL_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": code,
                "message": msg,
                "details": {"request_id": req_id, "status_code": exc.status_code},
            },
            "detail": msg,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches all unexpected internal exceptions (HTTP 500).
    Logs the full stack trace internally to server logs, but returns a clean, sanitized
    error message with correlation ID to the client without leaking file paths or internal representations.
    """
    req_id = get_request_id(request)
    logger.error(f"[{req_id}] Unhandled internal server exception: {exc}", exc_info=True)
    msg = "An unexpected internal server error occurred while processing the computation."

    return JSONResponse(
        status_code=500,
        headers={"X-Request-ID": req_id},
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": msg,
                "details": {"request_id": req_id},
            },
            "detail": msg,
        },
    )


# ============================================================================
# Strict Pydantic Input Validation Models
# ============================================================================


class ExpressionInput(BaseModel):
    """Input payload for single-variable symbolic CAS operations."""

    expr: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Mathematical expression (e.g. 'x^2 + 2x + 1')",
        json_schema_extra={"example": "x**2 - 4"},
    )
    variable: str = Field(
        "x",
        min_length=1,
        max_length=64,
        pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$",
        description="Target variable for differentiation, integration, or solving",
        json_schema_extra={"example": "x"},
    )


class LimitInput(BaseModel):
    """Input payload for mathematical limit evaluation."""

    expr: str = Field(
        ..., min_length=1, max_length=1000, description="Target expression", json_schema_extra={"example": "sin(x)/x"}
    )
    variable: str = Field(
        "x",
        min_length=1,
        max_length=64,
        pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$",
        description="Variable taking the limit",
        json_schema_extra={"example": "x"},
    )
    approach: str = Field(
        "0",
        min_length=1,
        max_length=100,
        description="Point of approach (e.g. '0', 'oo', '-oo')",
        json_schema_extra={"example": "0"},
    )


class LogicInput(BaseModel):
    """Input payload for Boolean logic simplification."""

    expr: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Boolean logic expression with operators (∧, ∨, →, ~, etc.)",
        json_schema_extra={"example": "A ∧ (A ∨ B)"},
    )


class UnitConversionInput(BaseModel):
    """Input payload for physical unit conversions."""

    expr: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Source quantity with units",
        json_schema_extra={"example": "100 * kilometer / hour"},
    )
    target_unit: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Target units to convert into",
        json_schema_extra={"example": "meter / second"},
    )


class BigOInput(BaseModel):
    """Input payload for asymptotic Big-O growth rate analysis."""

    f_n: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Algorithm function f(n)",
        json_schema_extra={"example": "n * log(n)"},
    )
    g_n: str = Field(
        ..., min_length=1, max_length=500, description="Reference function g(n)", json_schema_extra={"example": "n**2"}
    )


class ShannonEntropyInput(BaseModel):
    """Input payload for discrete Shannon entropy calculation."""

    probabilities: List[float] = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="List of probabilities summing to 1.0",
        json_schema_extra={"example": [0.5, 0.25, 0.25]},
    )


class MichaelisMentenInput(BaseModel):
    """Input payload for enzyme kinetics."""

    Vmax: float = Field(..., gt=0, description="Maximum velocity Vmax > 0", json_schema_extra={"example": 10.0})
    Km: float = Field(..., gt=0, description="Michaelis constant Km > 0", json_schema_extra={"example": 2.0})
    S: float = Field(..., ge=0, description="Substrate concentration [S] >= 0", json_schema_extra={"example": 5.0})


class HardyWeinbergInput(BaseModel):
    """Input payload for Hardy-Weinberg population equilibrium."""

    p: Optional[float] = Field(None, ge=0.0, le=1.0, description="Dominant allele frequency (0 <= p <= 1)")
    q: Optional[float] = Field(None, ge=0.0, le=1.0, description="Recessive allele frequency (0 <= q <= 1)")


class FormulaInput(BaseModel):
    """Input payload for generic multi-variable formula algebraic solving."""

    equation: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Multi-variable equation string",
        json_schema_extra={"example": "P * V = n * R * T"},
    )
    solve_for: str = Field(
        ...,
        min_length=1,
        max_length=64,
        pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$",
        description="Target unknown variable to isolate and calculate",
        json_schema_extra={"example": "P"},
    )
    given: Dict[str, float] = Field(
        ...,
        description="Dictionary of known parameter values",
        json_schema_extra={"example": {"V": 0.025, "n": 1.0, "R": 8.314, "T": 300.0}},
    )


# --- Physics Domain Schemas ---


class PhysicsEMC2Input(BaseModel):
    """Input payload for Einstein mass-energy equivalence."""

    mass: Optional[float] = Field(None, description="Mass in kilograms (kg)")
    energy: Optional[float] = Field(None, description="Energy in Joules (J)")


class HeisenbergInput(BaseModel):
    """Input payload for Heisenberg Uncertainty Principle."""

    delta_x: Optional[float] = Field(None, gt=0, description="Position uncertainty (m) > 0")
    delta_p: Optional[float] = Field(None, gt=0, description="Momentum uncertainty (kg·m/s) > 0")


class NewtonSecondLawInput(BaseModel):
    """Input payload for Newton's Second Law F = ma."""

    F: Optional[float] = Field(None, description="Force in Newtons (N)")
    m: Optional[float] = Field(None, gt=0, description="Mass in kilograms (kg) > 0")
    a: Optional[float] = Field(None, description="Acceleration in m/s²")


# --- Astrophysics Domain Schemas ---


class SchwarzschildInput(BaseModel):
    """Input payload for Schwarzschild black hole radius calculation."""

    mass: float = Field(..., ge=0, description="Mass in kilograms (kg) >= 0")


class KeplerThirdLawInput(BaseModel):
    """Input payload for Kepler's Third Law."""

    period: Optional[float] = Field(None, gt=0, description="Orbital period T in seconds > 0")
    semi_major_axis: Optional[float] = Field(None, gt=0, description="Semi-major axis a in meters > 0")
    mass_central: Optional[float] = Field(None, gt=0, description="Central body mass M in kilograms > 0")


class DrakeInput(BaseModel):
    """Input payload for the Drake Equation."""

    R: float = Field(..., gt=0, description="Star formation rate (stars/year) > 0")
    fp: float = Field(..., ge=0, le=1, description="Fraction of stars with planets (0 <= fp <= 1)")
    ne: float = Field(..., ge=0, description="Average number of habitable planets per star >= 0")
    fl: float = Field(..., ge=0, le=1, description="Fraction developing life (0 <= fl <= 1)")
    fi: float = Field(..., ge=0, le=1, description="Fraction developing intelligence (0 <= fi <= 1)")
    fc: float = Field(..., ge=0, le=1, description="Fraction developing detectable signals (0 <= fc <= 1)")
    L: float = Field(..., gt=0, description="Civilization communicative lifetime in years > 0")


# --- Chemistry Domain Schemas ---


class NernstInput(BaseModel):
    """Input payload for Nernst electrochemical equation."""

    E0: float = Field(..., description="Standard cell potential in Volts (V)")
    n: int = Field(..., ge=1, description="Number of moles of electrons transferred >= 1")
    Q: float = Field(..., gt=0, description="Reaction quotient Q > 0")
    T: float = Field(298.15, gt=0, description="Temperature in Kelvin (K) > 0")


class GibbsInput(BaseModel):
    """Input payload for Gibbs Free Energy calculation."""

    delta_H: float = Field(..., description="Enthalpy change in Joules (J)")
    T: float = Field(..., ge=0, description="Temperature in Kelvin (K) >= 0")
    delta_S: float = Field(..., description="Entropy change in J/K")


class FirstOrderKineticsInput(BaseModel):
    """Input payload for first-order reaction kinetics."""

    k: float = Field(..., gt=0, description="Reaction rate constant > 0")
    t: float = Field(..., ge=0, description="Elapsed time >= 0")
    A0: float = Field(..., ge=0, description="Initial concentration >= 0")


# --- Finance Domain Schemas ---


class BlackScholesInput(BaseModel):
    """Input payload for Black-Scholes European option pricing."""

    S: float = Field(..., gt=0, description="Spot price ($) > 0")
    K: float = Field(..., gt=0, description="Strike price ($) > 0")
    T: float = Field(..., gt=0, description="Time to maturity in years > 0")
    r: float = Field(..., description="Risk-free rate (decimal)")
    sigma: float = Field(..., gt=0, description="Volatility (decimal) > 0")
    option_type: str = Field("call", description="'call' or 'put'")


class WACCInput(BaseModel):
    """Input payload for Weighted Average Cost of Capital."""

    equity: float = Field(..., ge=0, description="Market value of equity >= 0")
    debt: float = Field(..., ge=0, description="Market value of debt >= 0")
    cost_eq: float = Field(..., description="Cost of equity (decimal)")
    cost_debt: float = Field(..., description="Cost of debt (decimal)")
    tax_rate: float = Field(..., ge=0, le=1, description="Corporate tax rate (0 <= t <= 1)")


class NPVInput(BaseModel):
    """Input payload for Net Present Value calculation."""

    rate: float = Field(..., gt=-1.0, description="Discount rate > -1.0")
    cashflows: List[float] = Field(
        ..., min_length=1, max_length=1000, description="Series of cash flows starting with initial outlay"
    )


class IRRInput(BaseModel):
    """Input payload for Internal Rate of Return calculation."""

    cashflows: List[float] = Field(
        ...,
        min_length=2,
        max_length=1000,
        description="Series of cash flows with at least one positive and negative value",
    )


# --- Numerical Solvers Schemas ---


class NumericalRootInput(BaseModel):
    """Input payload for verified numerical root finding."""

    expr: str = Field(..., min_length=1, max_length=1000, description="Objective function f(x) = 0")
    variable: str = Field(
        "x", min_length=1, max_length=64, pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$", description="Independent variable"
    )
    initial_guess: float = Field(0.0, description="Starting estimate for solver")
    bracket: Optional[List[float]] = Field(None, description="Optional [a, b] bracket interval")
    tol: float = Field(1e-8, gt=0, description="Convergence tolerance")


class NumericalIntegrateInput(BaseModel):
    """Input payload for adaptive numerical quadrature."""

    expr: str = Field(..., min_length=1, max_length=1000, description="Integrand function f(x)")
    variable: str = Field(
        "x", min_length=1, max_length=64, pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$", description="Integration variable"
    )
    a: float = Field(..., description="Lower integration bound")
    b: float = Field(..., description="Upper integration bound")
    epsabs: float = Field(1e-8, gt=0, description="Absolute error tolerance")


class NumericalDerivativeInput(BaseModel):
    """Input payload for adaptive numerical differentiation."""

    expr: str = Field(..., min_length=1, max_length=1000, description="Differentiable function f(x)")
    variable: str = Field(
        "x", min_length=1, max_length=64, pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$", description="Independent variable"
    )
    x0: float = Field(..., description="Evaluation point x0")


class NumericalLimitInput(BaseModel):
    """Input payload for numerical limit evaluation."""

    expr: str = Field(..., min_length=1, max_length=1000, description="Function f(x)")
    variable: str = Field(
        "x", min_length=1, max_length=64, pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$", description="Independent variable"
    )
    x0: float = Field(..., description="Approach point")
    direction: str = Field("both", pattern=r"^(both|right|left)$", description="'both', 'right', or 'left'")


# ============================================================================
# API Version 1 Router Construction
# ============================================================================

v1_router = APIRouter()


# --- System & Constants Endpoints ---


@v1_router.get("/", summary="Health Check")
@v1_router.get("/health", summary="Detailed Health Check")
def read_root(request: Request) -> Dict[str, Any]:
    """Returns engine status for service readiness verification."""
    req_id = get_request_id(request)
    return {
        "success": True,
        "status": "SuperCalcee Computational Core Engine Active",
        "version": "1.0.0",
        "request_id": req_id,
    }


@v1_router.get("/constants", summary="Fetch CODATA Constants Database")
def get_constants() -> Dict[str, Any]:
    """Retrieves all CODATA physical and mathematical constants."""
    return DB.get_all()


# --- Symbolic CAS Endpoints ---


@v1_router.post("/cas/simplify", summary="Algebraically Simplify Expression")
def simplify_expr(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Simplifies a mathematical expression string using SymPy."""
    req_id = get_request_id(request)
    res = cas_engine.simplify(data.expr)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/factor", summary="Factor Polynomial Expression")
def factor_expr(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Factors a polynomial expression into irreducible factors."""
    req_id = get_request_id(request)
    res = cas_engine.factor(data.expr)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/expand", summary="Expand Algebraic Expression")
def expand_expr(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Expands products and powers in an algebraic expression."""
    req_id = get_request_id(request)
    res = cas_engine.expand(data.expr)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/differentiate", summary="Symbolic Differentiation")
def diff_expr(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Computes the symbolic derivative of an expression with respect to a target variable."""
    req_id = get_request_id(request)
    res = cas_engine.differentiate(data.expr, data.variable)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/integrate", summary="Symbolic Indefinite Integration")
def int_expr(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Computes the symbolic indefinite integral of an expression with respect to a target variable."""
    req_id = get_request_id(request)
    res = cas_engine.integrate(data.expr, data.variable)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/limit", summary="Symbolic Limit Evaluation")
def limit_expr(data: LimitInput, request: Request) -> Dict[str, Any]:
    """Evaluates the mathematical limit of an expression symbolically."""
    req_id = get_request_id(request)
    res = cas_engine.limit(data.expr, data.variable, data.approach)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cas/solve", summary="Solve Algebraic Equation")
def solve_eq(data: ExpressionInput, request: Request) -> Dict[str, Any]:
    """Solves an algebraic equation for the target variable."""
    req_id = get_request_id(request)
    res = cas_engine.solve(data.expr, data.variable)
    return {"success": True, "result": res, "request_id": req_id}


# --- Unit Conversion Endpoint ---


@v1_router.post("/units/convert", summary="Dimensional Unit Conversion")
def convert_units(data: UnitConversionInput, request: Request) -> Dict[str, Any]:
    """Converts a physical quantity into compatible target units."""
    req_id = get_request_id(request)
    res = dim_engine.convert_units(data.expr, data.target_unit)
    return {"success": True, "result": str(res), "request_id": req_id}


# --- Physics Domain Endpoints ---


@v1_router.post("/physics/emc2", summary="Einstein Mass-Energy Equivalence")
def physics_emc2(
    request: Request,
    payload: Optional[PhysicsEMC2Input] = Body(None),
    mass: Optional[float] = Query(None, description="Mass in kg"),
    energy: Optional[float] = Query(None, description="Energy in Joules"),
) -> Dict[str, Any]:
    """Calculates E = mc^2 mass-energy equivalence. Supports JSON payload or query parameters."""
    req_id = get_request_id(request)
    m = payload.mass if payload and payload.mass is not None else mass
    e = payload.energy if payload and payload.energy is not None else energy
    res = physics_engine.energy_mass_equivalence(mass=m, energy=e)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/physics/heisenberg", summary="Heisenberg Uncertainty Principle")
def physics_heisenberg(data: HeisenbergInput, request: Request) -> Dict[str, Any]:
    """Calculates minimum uncertainty limit via Heisenberg Uncertainty Principle."""
    req_id = get_request_id(request)
    res = physics_engine.heisenberg_uncertainty(delta_x=data.delta_x, delta_p=data.delta_p)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/physics/newton", summary="Newton's Second Law F = ma")
def physics_newton(data: NewtonSecondLawInput, request: Request) -> Dict[str, Any]:
    """Solves Newton's Second Law of Motion F = ma for the missing parameter."""
    req_id = get_request_id(request)
    res = physics_engine.newtons_second_law(F=data.F, m=data.m, a=data.a)
    return {"success": True, "result": res, "request_id": req_id}


# --- Astrophysics Domain Endpoints ---


@v1_router.post("/astro/schwarzschild", summary="Schwarzschild Black Hole Radius")
def astro_schwarzschild(data: SchwarzschildInput, request: Request) -> Dict[str, Any]:
    """Calculates the Schwarzschild radius for a non-rotating mass."""
    req_id = get_request_id(request)
    res = astro_engine.schwarzschild_radius(data.mass)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/astro/kepler", summary="Kepler's Third Law")
def astro_kepler(data: KeplerThirdLawInput, request: Request) -> Dict[str, Any]:
    """Solves Kepler's Third Law for orbital period, semi-major axis, or central mass."""
    req_id = get_request_id(request)
    res = astro_engine.keplers_third_law(
        period=data.period,
        semi_major_axis=data.semi_major_axis,
        mass_central=data.mass_central,
    )
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/astro/drake", summary="Drake Equation")
def astro_drake(data: DrakeInput, request: Request) -> Dict[str, Any]:
    """Estimates active communicative civilizations via the Drake Equation."""
    req_id = get_request_id(request)
    res = astro_engine.drake_equation(
        R=data.R,
        fp=data.fp,
        ne=data.ne,
        fl=data.fl,
        fi=data.fi,
        fc=data.fc,
        L=data.L,
    )
    return {"success": True, "result": res, "request_id": req_id}


# --- Chemistry Domain Endpoints ---


@v1_router.post("/chem/nernst", summary="Nernst Electrochemical Equation")
def chem_nernst(data: NernstInput, request: Request) -> Dict[str, Any]:
    """Calculates electrochemical cell potential under non-standard conditions."""
    req_id = get_request_id(request)
    res = chem_engine.nernst_equation(E0=data.E0, n=data.n, Q=data.Q, T=data.T)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/chem/gibbs", summary="Gibbs Free Energy Change")
def chem_gibbs(data: GibbsInput, request: Request) -> Dict[str, Any]:
    """Calculates thermodynamic Gibbs Free Energy change delta G."""
    req_id = get_request_id(request)
    res = chem_engine.gibbs_free_energy(delta_H=data.delta_H, T=data.T, delta_S=data.delta_S)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/chem/kinetics", summary="First-Order Reaction Kinetics")
def chem_kinetics(data: FirstOrderKineticsInput, request: Request) -> Dict[str, Any]:
    """Calculates remaining reactant concentration under first-order decay."""
    req_id = get_request_id(request)
    res = chem_engine.first_order_kinetics(k=data.k, t=data.t, A0=data.A0)
    return {"success": True, "result": res, "request_id": req_id}


# --- Biology Domain Endpoints ---


@v1_router.post("/bio/hardy-weinberg", summary="Hardy-Weinberg Population Equilibrium")
def bio_hw(
    request: Request,
    payload: Optional[HardyWeinbergInput] = Body(None),
    p: Optional[float] = Query(None, description="Dominant allele frequency p"),
    q: Optional[float] = Query(None, description="Recessive allele frequency q"),
) -> Dict[str, Any]:
    """Calculates genotype frequencies under Hardy-Weinberg equilibrium."""
    req_id = get_request_id(request)
    p_val = payload.p if payload and payload.p is not None else p
    q_val = payload.q if payload and payload.q is not None else q
    res = bio_engine.hardy_weinberg(p=p_val, q=q_val)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/bio/michaelis-menten", summary="Michaelis-Menten Enzyme Kinetics")
def bio_mm(data: MichaelisMentenInput, request: Request) -> Dict[str, Any]:
    """Calculates enzyme reaction rate v via Michaelis-Menten kinetics."""
    req_id = get_request_id(request)
    res = bio_engine.michaelis_menten(data.Vmax, data.Km, data.S)
    return {"success": True, "result": res, "request_id": req_id}


# --- Finance Domain Endpoints ---


@v1_router.post("/finance/black-scholes", summary="Black-Scholes European Options Pricing")
def fin_bs(
    request: Request,
    payload: Optional[BlackScholesInput] = Body(None),
    S: Optional[float] = Query(None, description="Spot price ($)"),
    K: Optional[float] = Query(None, description="Strike price ($)"),
    T: Optional[float] = Query(None, description="Time to maturity in years"),
    r: Optional[float] = Query(None, description="Risk-free rate (decimal)"),
    sigma: Optional[float] = Query(None, description="Volatility (decimal)"),
    option_type: Optional[str] = Query(None, description="'call' or 'put'"),
) -> Dict[str, Any]:
    """Calculates European call/put option prices via Black-Scholes model."""
    req_id = get_request_id(request)
    s_val = payload.S if payload else S
    k_val = payload.K if payload else K
    t_val = payload.T if payload else T
    r_val = payload.r if payload else r
    sig_val = payload.sigma if payload else sigma
    opt_val = (payload.option_type if payload else option_type) or "call"

    if s_val is None or k_val is None or t_val is None or r_val is None or sig_val is None:
        raise HTTPException(
            status_code=400, detail="Missing required parameters for Black-Scholes (S, K, T, r, sigma)."
        )

    res = finance_engine.black_scholes(s_val, k_val, t_val, r_val, sig_val, opt_val)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/finance/wacc", summary="Weighted Average Cost of Capital")
def fin_wacc(data: WACCInput, request: Request) -> Dict[str, Any]:
    """Calculates corporate Weighted Average Cost of Capital (WACC)."""
    req_id = get_request_id(request)
    res = finance_engine.wacc(
        equity=data.equity,
        debt=data.debt,
        cost_eq=data.cost_eq,
        cost_debt=data.cost_debt,
        tax_rate=data.tax_rate,
    )
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/finance/npv", summary="Net Present Value")
def fin_npv(data: NPVInput, request: Request) -> Dict[str, Any]:
    """Calculates Net Present Value for an investment cash flow stream."""
    req_id = get_request_id(request)
    res = finance_engine.npv(rate=data.rate, cashflows=data.cashflows)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/finance/irr", summary="Internal Rate of Return")
def fin_irr(data: IRRInput, request: Request) -> Dict[str, Any]:
    """Calculates Internal Rate of Return for an investment cash flow stream."""
    req_id = get_request_id(request)
    res = finance_engine.irr(cashflows=data.cashflows)
    return {"success": True, "result": res, "request_id": req_id}


# --- Computer Science Domain Endpoints ---


@v1_router.post("/cs/big-o", summary="Asymptotic Big-O Growth Classifier")
def cs_big_o(data: BigOInput, request: Request) -> Dict[str, Any]:
    """Evaluates algorithm complexity limit lim n->inf f(n)/g(n)."""
    req_id = get_request_id(request)
    res = cs_engine.big_o_limit(data.f_n, data.g_n)
    return {"success": True, "result": res, "request_id": req_id}


@v1_router.post("/cs/entropy", summary="Shannon Information Entropy")
def cs_entropy(data: ShannonEntropyInput, request: Request) -> Dict[str, Any]:
    """Calculates discrete Shannon entropy in bits."""
    req_id = get_request_id(request)
    res = cs_engine.shannon_entropy(data.probabilities)
    return {"success": True, "result": res, "request_id": req_id}


# --- Boolean Logic Endpoint ---


@v1_router.post("/logic/simplify", summary="Boolean Logic Simplification")
def simplify_logic_expr(data: LogicInput, request: Request) -> Dict[str, Any]:
    """Simplifies a Boolean logic expression using algebraic logic rules."""
    req_id = get_request_id(request)
    res = logic_parser.simplify(data.expr)
    return {"success": True, "result": res, "request_id": req_id}


# --- Formula Engine Endpoint ---


@v1_router.post("/formula/solve", summary="Multi-Variable Formula Solver")
def solve_formula(data: FormulaInput, request: Request) -> Dict[str, Any]:
    """Algebraically solves an equation for a target variable given known values."""
    req_id = get_request_id(request)
    res = formula_engine.algebraic_solve(data.equation, data.solve_for, data.given)
    return {"success": True, "result": res, "request_id": req_id}


# --- Numerical Solvers Endpoints ---


@v1_router.post("/numerical/root", summary="Verified Numerical Root Finding")
def numerical_root(data: NumericalRootInput, request: Request) -> Dict[str, Any]:
    """Numerically solves f(x) = 0 with convergence and residual verification."""
    req_id = get_request_id(request)
    validate_safe_identifier(data.variable)
    var = sp.Symbol(data.variable)
    parsed = parse_safe(data.expr, allowed_symbols={data.variable: var})
    func = sp.lambdify(var, parsed, modules=["math", "numpy"])

    bracket_tuple: Optional[Tuple[float, float]] = (
        (float(data.bracket[0]), float(data.bracket[1])) if data.bracket and len(data.bracket) == 2 else None
    )
    res = robust_root_scalar(
        func,
        initial_guess=data.initial_guess,
        bracket=bracket_tuple,
        tol=data.tol,
    )
    res_dict = res.to_dict()
    return {"success": True, "result": res_dict, **res_dict, "request_id": req_id}


@v1_router.post("/numerical/integrate", summary="Adaptive Numerical Quadrature")
def numerical_integrate(data: NumericalIntegrateInput, request: Request) -> Dict[str, Any]:
    """Numerically computes the definite integral of f(x) from a to b with error estimation."""
    req_id = get_request_id(request)
    validate_safe_identifier(data.variable)
    var = sp.Symbol(data.variable)
    parsed = parse_safe(data.expr, allowed_symbols={data.variable: var})
    func = sp.lambdify(var, parsed, modules=["math", "numpy"])

    res = robust_quad(func, data.a, data.b, epsabs=data.epsabs)
    res_dict = res.to_dict()
    return {"success": True, "result": res_dict, **res_dict, "request_id": req_id}


@v1_router.post("/numerical/differentiate", summary="Adaptive Numerical Differentiation")
def numerical_differentiate(data: NumericalDerivativeInput, request: Request) -> Dict[str, Any]:
    """Numerically computes f'(x0) using adaptive Richardson extrapolation."""
    req_id = get_request_id(request)
    validate_safe_identifier(data.variable)
    var = sp.Symbol(data.variable)
    parsed = parse_safe(data.expr, allowed_symbols={data.variable: var})
    func = sp.lambdify(var, parsed, modules=["math", "numpy"])

    res = robust_derivative(func, data.x0)
    res_dict = res.to_dict()
    return {"success": True, "result": res_dict, **res_dict, "request_id": req_id}


@v1_router.post("/numerical/limit", summary="Adaptive Numerical Limit Evaluation")
def numerical_limit(data: NumericalLimitInput, request: Request) -> Dict[str, Any]:
    """Numerically computes the limit of f(x) as x -> x0 with divergence detection."""
    req_id = get_request_id(request)
    validate_safe_identifier(data.variable)
    var = sp.Symbol(data.variable)
    parsed = parse_safe(data.expr, allowed_symbols={data.variable: var})
    func = sp.lambdify(var, parsed, modules=["math", "numpy"])

    res = robust_limit(func, data.x0, direction=data.direction)
    res_dict = res.to_dict()
    return {"success": True, "result": res_dict, **res_dict, "request_id": req_id}


# Mount API v1 router both under /api/v1 (versioned) and / (backward-compatible)
app.include_router(v1_router, prefix="/api/v1", tags=["v1"])
app.include_router(v1_router, tags=["core"])


@app.post("/shutdown", summary="Graceful Server Shutdown")
def shutdown_server(request: Request) -> Dict[str, Any]:
    """Allows authorized local callers to request graceful shutdown."""
    req_id = get_request_id(request)

    def _delayed_exit():
        import time

        time.sleep(0.3)
        os._exit(0)

    threading.Thread(target=_delayed_exit, daemon=True).start()
    return {"success": True, "message": "Server shutting down", "request_id": req_id}


def start_parent_watchdog(parent_pid: int) -> None:
    """
    Monitors the parent process ID. If the parent terminates, the Python
    backend cleanly exits immediately to eliminate orphan processes.
    """
    import ctypes
    import time

    def _watch() -> None:
        is_windows = sys.platform == "win32"
        while True:
            time.sleep(1.5)
            try:
                if is_windows:
                    # Query process exit code via kernel32
                    kernel32 = ctypes.windll.kernel32
                    handle = kernel32.OpenProcess(0x1000, False, parent_pid)  # PROCESS_QUERY_LIMITED_INFORMATION
                    if not handle:
                        os._exit(0)
                    exit_code = ctypes.c_ulong()
                    if kernel32.GetExitCodeProcess(handle, ctypes.byref(exit_code)):
                        kernel32.CloseHandle(handle)
                        # STILL_ACTIVE = 259
                        if exit_code.value != 259:
                            os._exit(0)
                    else:
                        kernel32.CloseHandle(handle)
                        os._exit(0)
                else:
                    # POSIX: signal 0 checks process existence
                    os.kill(parent_pid, 0)
            except Exception:
                os._exit(0)

    t = threading.Thread(target=_watch, daemon=True, name="ParentWatchdog")
    t.start()


# Main entrypoint for direct command-line execution
if __name__ == "__main__":
    import argparse

    import uvicorn

    parser = argparse.ArgumentParser(description="SuperCalcee Backend API")
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", os.getenv("BACKEND_HOST", "127.0.0.1")),
        help="Host interface to bind to (e.g. 127.0.0.1 or 0.0.0.0 for LAN/mobile access)",
    )
    parser.add_argument(
        "--port", type=int, default=int(os.getenv("PORT", os.getenv("BACKEND_PORT", 8000))), help="Port to bind to"
    )
    parser.add_argument(
        "--parent-pid",
        type=int,
        default=int(os.getenv("PARENT_PID", 0)),
        help="Parent process ID to monitor for auto-exit",
    )
    args = parser.parse_args()

    if args.parent_pid > 0:
        start_parent_watchdog(args.parent_pid)

    uvicorn.run(app, host=args.host, port=args.port)
