import numpy_financial as npf
from scipy.stats import norm
import numpy as np

class FinanceEngine:
    def npv(self, rate: float, cashflows: list[float]) -> float:
        """Calculate Net Present Value."""
        return npf.npv(rate, cashflows)

    def irr(self, cashflows: list[float]) -> float:
        """Calculate Internal Rate of Return."""
        return npf.irr(cashflows)

    def wacc(self, equity: float, debt: float, cost_eq: float, cost_debt: float, tax_rate: float) -> float:
        """Calculate Weighted Average Cost of Capital."""
        total = equity + debt
        we = equity / total
        wd = debt / total
        return we * cost_eq + wd * cost_debt * (1 - tax_rate)

    def black_scholes(self, S: float, K: float, T: float, r: float, sigma: float, option_type: str = 'call') -> float:
        """
        Black-Scholes Options Pricing.
        S = Spot price
        K = Strike price
        T = Time to maturity (years)
        r = Risk-free rate
        sigma = Volatility
        """
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)

        if option_type == 'call':
            price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        elif option_type == 'put':
            price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        else:
            raise ValueError(f"Unknown option type: {option_type}")
        
        return price

finance_engine = FinanceEngine()
