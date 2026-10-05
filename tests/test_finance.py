"""
Unit and boundary tests for Quantitative Finance Engine (`src_python/domains/finance.py`).
"""

import math

import pytest

from src_python.domains.finance import FinanceEngine


class TestTimeValueOfMoneyAndValuation:
    """Tests for NPV, IRR, and WACC financial models."""

    def test_npv_positive_discount_rate(self, finance: FinanceEngine):
        """Standard NPV calculation."""
        # Initial outlay -1000, inflows: 300, 500, 700 at 10%
        rate = 0.10
        cfs = [-1000.0, 300.0, 500.0, 700.0]
        npv_val = finance.npv(rate, cfs)
        # Expected: -1000 + 300/1.1 + 500/1.21 + 700/1.331 = 211.87077
        assert 210 < npv_val < 215

    def test_npv_zero_discount_rate(self, finance: FinanceEngine):
        """At 0% discount rate, NPV equals simple sum of cash flows."""
        cfs = [-1000.0, 300.0, 500.0, 700.0]
        npv_val = finance.npv(0.0, cfs)
        assert npv_val == sum(cfs)

    def test_irr_standard(self, finance: FinanceEngine):
        """Standard IRR calculation where NPV equals zero."""
        cfs = [-1000.0, 300.0, 500.0, 700.0]
        irr_val = finance.irr(cfs)
        # Expected IRR is around ~20.13%
        assert 0.18 < irr_val < 0.22
        # Check that NPV at IRR is approximately 0
        assert math.isclose(finance.npv(irr_val, cfs), 0.0, abs_tol=1e-3)

    def test_wacc_standard(self, finance: FinanceEngine):
        """Standard WACC calculation: E=60, D=40, re=0.10, rd=0.05, t=0.20."""
        # We = 0.6, Wd = 0.4. WACC = 0.6*0.10 + 0.4*0.05*(1-0.2) = 0.06 + 0.016 = 0.076 (7.6%)
        w = finance.wacc(equity=60.0, debt=40.0, cost_eq=0.10, cost_debt=0.05, tax_rate=0.20)
        assert math.isclose(w, 0.076, rel_tol=1e-7)

    def test_wacc_zero_total_capital_raises(self, finance: FinanceEngine):
        """Total capital zero must raise ValueError."""
        with pytest.raises(ValueError, match="cannot be zero"):
            finance.wacc(equity=0.0, debt=0.0, cost_eq=0.10, cost_debt=0.05, tax_rate=0.20)


class TestBlackScholesOptionPricing:
    """Tests Black-Scholes European option pricing model and boundaries."""

    def test_black_scholes_call_normal(self, finance: FinanceEngine):
        """At-the-money call option pricing."""
        # S=100, K=100, T=1.0 yr, r=0.05, sigma=0.20
        call = finance.black_scholes(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="call")
        # Standard Black-Scholes ATM call price is ~10.45
        assert 10.40 < call < 10.50

    def test_black_scholes_put_normal(self, finance: FinanceEngine):
        """At-the-money put option pricing."""
        put = finance.black_scholes(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="put")
        # Standard ATM put price is ~5.57
        assert 5.50 < put < 5.65

    def test_black_scholes_put_call_parity(self, finance: FinanceEngine):
        """Verifies Put-Call Parity: C - P = S - K * exp(-r*T)."""
        S = 105.0
        K = 100.0
        T = 0.75
        r = 0.04
        sigma = 0.25
        call = finance.black_scholes(S, K, T, r, sigma, "call")
        put = finance.black_scholes(S, K, T, r, sigma, "put")
        lhs = call - put
        rhs = S - K * math.exp(-r * T)
        assert math.isclose(lhs, rhs, rel_tol=1e-6)

    def test_black_scholes_invalid_option_type(self, finance: FinanceEngine):
        """Unknown option type raises ValueError."""
        with pytest.raises(ValueError, match="Unknown option type"):
            finance.black_scholes(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="straddle")  # type: ignore

    def test_black_scholes_non_positive_parameters(self, finance: FinanceEngine):
        """Non-positive spot price, strike, maturity, or volatility must raise ValueError."""
        with pytest.raises(ValueError, match="must be positive"):
            finance.black_scholes(S=-100.0, K=100.0, T=1.0, r=0.05, sigma=0.20)
        with pytest.raises(ValueError, match="must be positive"):
            finance.black_scholes(S=100.0, K=-100.0, T=1.0, r=0.05, sigma=0.20)
        with pytest.raises(ValueError, match="must be positive"):
            finance.black_scholes(S=100.0, K=100.0, T=0.0, r=0.05, sigma=0.20)
        with pytest.raises(ValueError, match="must be positive"):
            finance.black_scholes(S=100.0, K=100.0, T=1.0, r=0.05, sigma=-0.20)


class TestFinanceReliabilityAndRegression:
    """Regression tests for quantitative finance input validation."""

    def test_npv_singular_discount_rate_rejected(self, finance: FinanceEngine):
        """Discount rates <= -100% (-1.0) cause singularities and must be rejected."""
        with pytest.raises(ValueError, match="strictly greater than -1.0"):
            finance.npv(rate=-1.0, cashflows=[-1000.0, 500.0])
        with pytest.raises(ValueError, match="strictly greater than -1.0"):
            finance.npv(rate=-1.5, cashflows=[-1000.0, 500.0])

    def test_npv_legitimate_negative_discount_rate_allowed(self, finance: FinanceEngine):
        """Small negative interest rates (e.g. -0.5%) are valid economic scenarios."""
        res = finance.npv(rate=-0.005, cashflows=[-1000.0, 1100.0])
        assert res > 0

    def test_irr_no_sign_change_rejected(self, finance: FinanceEngine):
        """Cash flows with no sign change (all positive or all negative) have no IRR."""
        with pytest.raises(ValueError, match="must contain both positive .* and negative"):
            finance.irr([100.0, 200.0, 300.0])
        with pytest.raises(ValueError, match="must contain both positive .* and negative"):
            finance.irr([-100.0, -200.0, -300.0])

    def test_irr_insufficient_periods_rejected(self, finance: FinanceEngine):
        """Cash flows series with fewer than 2 periods must raise ValueError."""
        with pytest.raises(ValueError, match="at least 2 periods"):
            finance.irr([-1000.0])

    def test_wacc_negative_capital_rejected(self, finance: FinanceEngine):
        """Negative equity or negative debt must raise ValueError."""
        with pytest.raises(ValueError, match="non-negative"):
            finance.wacc(equity=-50.0, debt=50.0, cost_eq=0.1, cost_debt=0.05, tax_rate=0.2)
        with pytest.raises(ValueError, match="non-negative"):
            finance.wacc(equity=50.0, debt=-50.0, cost_eq=0.1, cost_debt=0.05, tax_rate=0.2)

    def test_wacc_invalid_tax_rate_rejected(self, finance: FinanceEngine):
        """Tax rates outside [0.0, 1.0] must raise ValueError."""
        with pytest.raises(ValueError, match="must be >= 0.0"):
            finance.wacc(equity=60.0, debt=40.0, cost_eq=0.1, cost_debt=0.05, tax_rate=-0.1)
        with pytest.raises(ValueError, match="must be <= 1.0"):
            finance.wacc(equity=60.0, debt=40.0, cost_eq=0.1, cost_debt=0.05, tax_rate=1.5)

    def test_finance_nan_inf_rejected(self, finance: FinanceEngine):
        """NaN and inf are rejected across finance models."""
        with pytest.raises(ValueError, match="cannot be NaN"):
            finance.npv(rate=0.1, cashflows=[float("nan"), 100.0])
        with pytest.raises(ValueError, match="cannot be infinite"):
            finance.black_scholes(S=100.0, K=100.0, T=float("inf"), r=0.05, sigma=0.2)
