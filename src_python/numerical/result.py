"""
Numerical Analysis Result Schema & Error Handling
==================================================

Defines the structured result model for all numerical algorithms and solvers:
root finding, numerical integration, differentiation, and limits.

Author: SuperCalcee Core Team
License: MIT
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


class NumericalError(ValueError):
    """Base exception for numerical analysis errors."""

    pass


class NumericalConvergenceError(NumericalError):
    """Raised when an iterative numerical solver fails to converge within tolerances."""

    def __init__(self, message: str, result: Optional["NumericalResult"] = None) -> None:
        super().__init__(message)
        self.result = result


@dataclass
class NumericalResult:
    """
    Standardized structured response for numerical algorithms and solvers.

    Attributes:
        status (str): Outcome status:
            - 'converged': Solution found and verified within tolerance.
            - 'no_solution': Verified that no solution exists within search bounds.
            - 'max_iterations': Iteration limit exhausted without convergence.
            - 'failed': Solver failed to converge or encountered a singularity.
            - 'singular': Function encountered a division by zero or singularity.
            - 'overflow': Numerical overflow occurred.
        solution (Any): Converged root, integral value, derivative, or limit.
                        Can be a float, list of floats, dict with real/imag parts, or None.
        residual (Optional[float]): Absolute error or residual |f(x)| at the solution.
        iterations (int): Number of iterations or function evaluations performed.
        method (str): Algorithm executed (e.g. 'brentq', 'fsolve_hybr', 'quad_qag', 'richardson').
        warning (Optional[str]): Informative warning or diagnostic advice.
        diagnostics (Dict[str, Any]): Detailed solver-specific diagnostic telemetry.
    """

    status: str
    solution: Any
    residual: Optional[float] = None
    iterations: int = 0
    method: str = "unknown"
    warning: Optional[str] = None
    diagnostics: Dict[str, Any] = field(default_factory=dict)

    @property
    def converged(self) -> bool:
        """Returns True if the solver successfully converged to a solution."""
        return self.status == "converged"

    def to_dict(self) -> Dict[str, Any]:
        """Converts the result into a clean, JSON-serializable dictionary."""
        sol_serialized = self.solution
        if isinstance(sol_serialized, complex):
            sol_serialized = {"real": sol_serialized.real, "imag": sol_serialized.imag}
        elif isinstance(sol_serialized, list):
            sol_serialized = [
                {"real": item.real, "imag": item.imag} if isinstance(item, complex) else item for item in sol_serialized
            ]

        return {
            "status": self.status,
            "solution": sol_serialized,
            "residual": self.residual,
            "iterations": self.iterations,
            "method": self.method,
            "warning": self.warning,
            "diagnostics": self.diagnostics,
        }
