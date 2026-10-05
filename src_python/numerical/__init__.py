"""
Numerical Analysis & Hardened Solvers Package
=============================================

Provides robust, verified numerical routines for root finding, quadrature,
differentiation, and limits, with standardized convergence telemetry.

Author: SuperCalcee Core Team
License: MIT
"""

from .differentiation import robust_derivative
from .integration import robust_quad
from .limits import robust_limit
from .result import NumericalConvergenceError, NumericalError, NumericalResult
from .solvers import find_multiple_roots, robust_complex_roots, robust_root_scalar

__all__ = [
    "NumericalResult",
    "NumericalError",
    "NumericalConvergenceError",
    "robust_root_scalar",
    "find_multiple_roots",
    "robust_complex_roots",
    "robust_quad",
    "robust_derivative",
    "robust_limit",
]
