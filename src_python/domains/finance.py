r"""
Financial Mathematics & Quantitative Engine
============================================

Provides corporate finance, investment analysis, and financial engineering models:
- Net Present Value (NPV)
- Internal Rate of Return (IRR)
- Weighted Average Cost of Capital (WACC)
- Black-Scholes European Options Pricing Model (Call & Put Options)

Author: SuperCalcee Core Team
License: MIT
"""

import math
from typing import Any, Dict, List

import numpy as np
from scipy.stats import norm

try:
    import numpy_financial as npf
except ImportError:
    npf = None  # type: ignore[assignment]


from src_python.validation import (
    validate_cashflows,
    validate_discount_rate,
    validate_finite_number,
    validate_irr_cashflows,
    validate_spot_and_strike,
    validate_time_to_maturity,
    validate_volatility,
    validate_wacc_inputs,
)


class FinanceEngine:
    """
    Quantitative financial engineering and corporate finance solver module.
    """

    def npv(self, rate: float, cashflows: List[float]) -> float:
        """
        Calculates Net Present Value (NPV) of a series of cash flows given a discount rate.

        Formula:
            $$NPV = \\sum_{i=0}^N \\frac{C_i}{(1 + r)^i}$$

        Args:
            rate (float): Annual discount rate as a decimal (e.g. 0.10 for 10%). Must be > -1.0 (-100%).
            cashflows (List[float]): Cash flows list starting with initial outlay C0 (e.g. [-1000, 300, 500, 700]).

        Returns:
            float: Net Present Value ($).

        Raises:
            ValueError: If discount rate <= -1.0 or if cash flows are invalid.
        """
        r_val = validate_discount_rate(rate, name="Discount rate")
        cf_list = validate_cashflows(cashflows, name="Cash flows")

        if npf is not None:
            return float(npf.npv(r_val, cf_list))
        return float(sum(cf / ((1.0 + r_val) ** i) for i, cf in enumerate(cf_list)))

    def irr(self, cashflows: List[float]) -> float:
        """
        Calculates Internal Rate of Return (IRR) for a series of cash flows.

        Args:
            cashflows (List[float]): Cash flows list starting with initial negative outlay C0.
                                     Must contain at least one positive and one negative value.

        Returns:
            float: Internal Rate of Return as a decimal (e.g. 0.15 for 15%).

        Raises:
            ValueError: If cash flows do not contain both positive and negative values.
        """
        cf_list = validate_irr_cashflows(cashflows, name="Cash flows")

        if npf is not None:
            try:
                npf_val = float(npf.irr(cf_list))
                if not math.isnan(npf_val) and not math.isinf(npf_val) and npf_val > -1.0:
                    npv_check = sum(cf / ((1.0 + npf_val) ** i) for i, cf in enumerate(cf_list))
                    if abs(npv_check) <= 1e-2:
                        return npf_val
            except Exception:
                pass

        def npv_func(r):
            r_val = float(r[0]) if hasattr(r, "__len__") else float(r)
            if r_val <= -1.0:
                return 1e12
            return sum(cf / ((1.0 + r_val) ** i) for i, cf in enumerate(cf_list))

        from src_python.numerical import NumericalConvergenceError, robust_root_scalar

        # Attempt unconstrained robust solver starting from 10%
        res = robust_root_scalar(npv_func, initial_guess=0.10, tol=1e-6)
        if res.converged and res.solution is not None and res.solution > -1.0:
            return float(res.solution)

        # Attempt bracketed search across economic bounds
        for upper in [1.0, 5.0, 20.0, 100.0]:
            f_low = npv_func(-0.95)
            f_high = npv_func(upper)
            if f_low * f_high <= 0:
                res_b = robust_root_scalar(npv_func, bracket=(-0.95, upper), tol=1e-6)
                if res_b.converged and res_b.solution is not None:
                    return float(res_b.solution)

        if res.converged and res.solution is not None:
            return float(res.solution)

        raise NumericalConvergenceError(
            f"IRR could not converge to a valid economic rate for cash flows: {cf_list}. "
            f"Residual: {res.residual}, Status: {res.status}"
        )

    def irr_detailed(self, cashflows: List[float]) -> Dict[str, Any]:
        """
        Calculates IRR and returns full structured numerical diagnostics.

        Returns:
            Dict[str, Any]: {status, solution, residual, iterations, method, warning, diagnostics}
        """
        cf_list = validate_irr_cashflows(cashflows, name="Cash flows")

        def npv_func(r):
            r_val = float(r[0]) if hasattr(r, "__len__") else float(r)
            if r_val <= -1.0:
                return 1e12
            return sum(cf / ((1.0 + r_val) ** i) for i, cf in enumerate(cf_list))

        from src_python.numerical import robust_root_scalar

        res = robust_root_scalar(npv_func, initial_guess=0.10, tol=1e-6)
        return res.to_dict()

    def wacc(
        self,
        equity: float,
        debt: float,
        cost_eq: float,
        cost_debt: float,
        tax_rate: float,
    ) -> float:
        """
        Calculates Weighted Average Cost of Capital (WACC).

        Formula:
            $$WACC = \\left(\\frac{E}{V} \\cdot r_e\\right) + \\left(\\frac{D}{V} \\cdot r_d \\cdot (1 - t)\\right)$$

        Args:
            equity (float): Total market value of equity (E >= 0).
            debt (float): Total market value of debt (D >= 0). Total capital (E+D) must be > 0.
            cost_eq (float): Cost of equity (r_e) as a decimal (e.g. 0.08).
            cost_debt (float): Cost of debt (r_d) as a decimal (e.g. 0.05).
            tax_rate (float): Corporate tax rate (t) as a decimal (0 <= t <= 1).

        Returns:
            float: WACC as a decimal proportion.

        Raises:
            ValueError: If equity or debt < 0, total capital == 0, or tax_rate outside [0, 1].
        """
        e_val, d_val, re_val, rd_val, t_val = validate_wacc_inputs(equity, debt, cost_eq, cost_debt, tax_rate)

        total = e_val + d_val
        we = e_val / total
        wd = d_val / total
        return float(we * re_val + wd * rd_val * (1.0 - t_val))

    def black_scholes(
        self,
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        option_type: str = "call",
    ) -> float:
        """
        Calculates European Option price using the analytical Black-Scholes model.

        Formulas:
            $$d_1 = \\frac{\\ln(S / K) + (r + 0.5 \\sigma^2) T}{\\sigma \\sqrt{T}}$$
            $$d_2 = d_1 - \\sigma \\sqrt{T}$$
            $$C = S N(d_1) - K e^{-rT} N(d_2)$$
            $$P = K e^{-rT} N(-d_2) - S N(-d_1)$$

        Args:
            S (float): Current underlying asset spot price ($ > 0).
            K (float): Strike price ($ > 0).
            T (float): Time to maturity in years (> 0).
            r (float): Risk-free interest rate as a decimal (e.g., 0.05 for 5%).
            sigma (float): Volatility of the underlying asset as a decimal (> 0).
            option_type (Literal['call', 'put'], optional): Option type. Defaults to 'call'.

        Returns:
            float: Theoretical option price ($).

        Raises:
            ValueError: If S, K, T, or sigma <= 0, or if an unknown option type is specified.
        """
        s_val, k_val = validate_spot_and_strike(S, K)
        t_val = validate_time_to_maturity(T)
        sigma_val = validate_volatility(sigma)
        r_val = validate_finite_number(r, name="Risk-free rate (r)")

        d1 = (np.log(s_val / k_val) + (r_val + 0.5 * sigma_val**2) * t_val) / (sigma_val * np.sqrt(t_val))
        d2 = d1 - sigma_val * np.sqrt(t_val)

        opt_clean = option_type.lower().strip()
        if opt_clean == "call":
            price = s_val * norm.cdf(d1) - k_val * np.exp(-r_val * t_val) * norm.cdf(d2)
        elif opt_clean == "put":
            price = k_val * np.exp(-r_val * t_val) * norm.cdf(-d2) - s_val * norm.cdf(-d1)
        else:
            raise ValueError(f"Unknown option type '{option_type}'. Use 'call' or 'put'.")

        return float(price)


# Global singleton instance for finance engine
finance_engine = FinanceEngine()
