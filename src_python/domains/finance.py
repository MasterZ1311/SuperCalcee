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

from typing import List, Literal
import numpy as np
from scipy.stats import norm
from scipy.optimize import fsolve

try:
    import numpy_financial as npf
except ImportError:
    npf = None


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
            rate (float): Annual discount rate as a decimal (e.g. 0.10 for 10%).
            cashflows (List[float]): Cash flows list starting with initial outlay C0 (e.g. [-1000, 300, 500, 700]).

        Returns:
            float: Net Present Value ($).
        """
        if npf is not None:
            return float(npf.npv(rate, cashflows))
        return float(sum(cf / ((1.0 + rate) ** i) for i, cf in enumerate(cashflows)))

    def irr(self, cashflows: List[float]) -> float:
        """
        Calculates Internal Rate of Return (IRR) for a series of cash flows.

        Args:
            cashflows (List[float]): Cash flows list starting with initial negative outlay C0.

        Returns:
            float: Internal Rate of Return as a decimal (e.g. 0.15 for 15%).
        """
        if npf is not None:
            return float(npf.irr(cashflows))

        def npv_func(r):
            return sum(cf / ((1.0 + r[0]) ** i) for i, cf in enumerate(cashflows))

        sol = fsolve(npv_func, [0.10])
        return float(sol[0])

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
            equity (float): Total market value of equity (E).
            debt (float): Total market value of debt (D).
            cost_eq (float): Cost of equity (r_e) as a decimal (e.g. 0.08).
            cost_debt (float): Cost of debt (r_d) as a decimal (e.g. 0.05).
            tax_rate (float): Corporate tax rate (t) as a decimal (e.g. 0.25).

        Returns:
            float: WACC as a decimal proportion.
        """
        total = equity + debt
        if total == 0:
            raise ValueError("Total capital (equity + debt) cannot be zero.")

        we = equity / total
        wd = debt / total
        return float(we * cost_eq + wd * cost_debt * (1.0 - tax_rate))

    def black_scholes(
        self,
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        option_type: Literal["call", "put"] = "call",
    ) -> float:
        """
        Calculates European Option price using the analytical Black-Scholes model.

        Formulas:
            $$d_1 = \\frac{\\ln(S / K) + (r + 0.5 \\sigma^2) T}{\\sigma \\sqrt{T}}$$
            $$d_2 = d_1 - \\sigma \\sqrt{T}$$
            $$C = S N(d_1) - K e^{-rT} N(d_2)$$
            $$P = K e^{-rT} N(-d_2) - S N(-d_1)$$

        Args:
            S (float): Current underlying asset spot price ($).
            K (float): Strike price ($).
            T (float): Time to maturity in years (e.g., 0.5 for 6 months).
            r (float): Risk-free interest rate as a decimal (e.g., 0.05 for 5%).
            sigma (float): Volatility of the underlying asset as a decimal (e.g., 0.20 for 20%).
            option_type (Literal['call', 'put'], optional): Option type. Defaults to 'call'.

        Returns:
            float: Theoretical option price ($).

        Raises:
            ValueError: If an unknown option type is specified.
        """
        if T <= 0 or sigma <= 0 or S <= 0 or K <= 0:
            raise ValueError("Spot price S, strike K, time T, and volatility sigma must be positive.")

        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)

        opt_clean = option_type.lower().strip()
        if opt_clean == "call":
            price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        elif opt_clean == "put":
            price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        else:
            raise ValueError(f"Unknown option type '{option_type}'. Use 'call' or 'put'.")

        return float(price)


# Global singleton instance for finance engine
finance_engine = FinanceEngine()
