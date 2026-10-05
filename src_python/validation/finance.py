"""
Financial Calculation Validation Utilities
==========================================

Provides validation for financial inputs including options pricing (Black-Scholes),
DCF/NPV/IRR cash flows, and cost of capital (WACC).
Carefully distinguishes legitimate negative financial quantities (negative returns,
cash outflows, net losses) from invalid mathematical inputs (singular discount rates,
non-positive prices/volatilities).

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Any, List, Sequence, Tuple

from .common import (
    validate_finite_number,
    validate_finite_sequence,
    validate_in_range,
    validate_non_negative,
    validate_positive,
)
from .numerical import ZeroDenominatorError


def validate_spot_and_strike(
    spot: Any,
    strike: Any,
) -> Tuple[float, float]:
    """
    Validates asset spot price (S) and strike price (K).
    Both must be strictly positive (> 0) for standard financial pricing models.

    Args:
        spot (Any): Underlying asset price.
        strike (Any): Option strike price.

    Returns:
        Tuple[float, float]: Validated (spot, strike).

    Raises:
        ValueError: If spot <= 0 or strike <= 0.
    """
    s_val = validate_positive(spot, name="Spot price S")
    k_val = validate_positive(strike, name="Strike price K")
    return (s_val, k_val)


def validate_volatility(
    sigma: Any,
    name: str = "Volatility sigma",
) -> float:
    """
    Validates annualized volatility sigma. Must be strictly positive (> 0).

    Args:
        sigma (Any): Volatility.
        name (str): Parameter display name.

    Returns:
        float: Validated volatility.

    Raises:
        ValueError: If volatility <= 0.
    """
    return validate_positive(sigma, name=name)


def validate_time_to_maturity(
    T: Any,
    name: str = "Time to maturity T",
) -> float:
    """
    Validates time to maturity T in years. Must be strictly positive (> 0).

    Args:
        T (Any): Time to maturity.
        name (str): Parameter display name.

    Returns:
        float: Validated time.

    Raises:
        ValueError: If T <= 0.
    """
    return validate_positive(T, name=name)


def validate_discount_rate(
    rate: Any,
    name: str = "Discount rate (r)",
) -> float:
    """
    Validates a discount rate r for discounted cash flow calculations.
    r must be strictly greater than -1.0 (-100%) because (1 + r) is in the denominator.
    If r == -1.0, 1 + r = 0 (division by zero singularity).
    If r < -1.0, 1 + r < 0, leading to alternating sign or complex discount factors.

    Note: Legitimate small negative interest rates (e.g. -0.005) are permitted!

    Args:
        rate (Any): Discount rate in decimal form (e.g. 0.05 for 5%).
        name (str): Parameter display name.

    Returns:
        float: Validated discount rate.

    Raises:
        ValueError: If rate <= -1.0.
    """
    r_val = validate_finite_number(rate, name=name)
    if r_val <= -1.0:
        raise ValueError(
            f"{name} must be strictly greater than -1.0 (-100%), got {r_val}. "
            "A discount rate <= -100% causes a mathematical singularity (1 + r <= 0)."
        )
    return r_val


def validate_cashflows(
    cashflows: Sequence[Any],
    name: str = "Cash flows",
) -> List[float]:
    """
    Validates a sequence of cash flows.
    Legitimate negative cash flows (e.g. investments, outflows) and positive cash flows
    (inflows, profits) are fully permitted, but all elements must be finite real numbers.

    Args:
        cashflows (Sequence[Any]): Sequence of cash flow amounts.
        name (str): Parameter display name.

    Returns:
        List[float]: Validated cash flows list.
    """
    return validate_finite_sequence(cashflows, name=name)


def validate_irr_cashflows(
    cashflows: Sequence[Any],
    name: str = "Cash flows",
) -> List[float]:
    """
    Validates cash flows for Internal Rate of Return (IRR).
    In addition to being finite numbers, IRR mathematically requires at least one sign change:
    there must be at least one positive cash flow (inflow) and at least one negative cash flow (outflow).

    Args:
        cashflows (Sequence[Any]): Cash flow series.
        name (str): Parameter display name.

    Returns:
        List[float]: Validated cash flows list.

    Raises:
        ValueError: If there is no sign change (e.g. all positive or all negative).
    """
    cf_list = validate_cashflows(cashflows, name=name)
    if len(cf_list) < 2:
        raise ValueError(f"{name} for IRR must contain at least 2 periods, got {len(cf_list)}.")

    has_positive = any(cf > 0.0 for cf in cf_list)
    has_negative = any(cf < 0.0 for cf in cf_list)

    if not (has_positive and has_negative):
        raise ValueError(
            f"{name} for IRR must contain both positive (inflows) and negative (outflows) values "
            "for an internal rate of return to exist."
        )

    return cf_list


def validate_wacc_inputs(
    equity: Any,
    debt: Any,
    cost_of_equity: Any,
    cost_of_debt: Any,
    tax_rate: Any,
) -> Tuple[float, float, float, float, float]:
    """
    Validates inputs for Weighted Average Cost of Capital (WACC):
    - Equity >= 0
    - Debt >= 0
    - Total Capital (Equity + Debt) > 0 (cannot be zero)
    - Cost of equity and cost of debt are finite
    - Tax rate is in [0.0, 1.0]

    Returns:
        Tuple[float, float, float, float, float]: Validated (E, D, Re, Rd, t).
    """
    e_val = validate_non_negative(equity, name="Equity")
    d_val = validate_non_negative(debt, name="Debt")

    total = e_val + d_val
    if total <= 0.0:
        raise ZeroDenominatorError(f"Total capital (equity + debt) cannot be zero or negative, got {total}.")

    re_val = validate_finite_number(cost_of_equity, name="Cost of equity")
    rd_val = validate_finite_number(cost_of_debt, name="Cost of debt")
    t_val = validate_in_range(tax_rate, name="Tax rate", min_val=0.0, max_val=1.0)

    return (e_val, d_val, re_val, rd_val, t_val)
