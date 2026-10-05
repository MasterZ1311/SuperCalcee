# SuperCalcee Scientific Computing Validation Rules & Reliability Matrix

## 1. Architectural Overview

Scientific calculators and computer algebra systems must balance mathematical flexibility with rigorous physical and numerical validity. Without strict input validation:
- Zero denominators create unhandled `ZeroDivisionError` crashes or IEEE 754 infinity propagation.
- Out-of-bounds probabilities (e.g. $p = -0.5$ or $p = 1.2$) produce non-physical outputs (negative entropy, imaginary frequencies).
- Negative physical parameters (such as negative absolute temperatures below $0\text{ K}$, negative masses, or negative reactant concentrations) violate thermodynamic and relativistic laws.
- Unhandled `NaN` and `Infinity` silently corrupt downstream calculations and user dashboards.

SuperCalcee provides a unified, centralized validation layer under [`src_python/validation/`](file:///e:/Github/GitProjects/SuperCalcee/src_python/validation/):

```
src_python/validation/
├── __init__.py       # Centralized public exports
├── common.py         # Finite number, positivity, range, and sequence validators
├── numerical.py      # Singularity detection, positive integers, ZeroDenominatorError
├── physical.py       # Mass, temperature (Kelvin), concentration, Michaelis-Menten
├── probability.py    # Probabilities, discrete distributions, Hardy-Weinberg
└── finance.py        # Spot/strike, volatility, discount rates, cash flow sign changes, WACC
```

### Dual-Inheritance Singularity Architecture

To ensure total backward-compatibility with existing arithmetic handlers while providing descriptive client error messages, SuperCalcee implements:

```python
class ZeroDenominatorError(ValueError, ZeroDivisionError):
    """
    Raised when a mathematical denominator is zero or dangerously near a singularity.
    Inherits from both ValueError (for general input validation) and ZeroDivisionError
    (for mathematical division handlers).
    """
    pass
```

---

## 2. Master Domain Validation Matrix

| Domain | Function | Parameter | Type | Allowed Range | Physical / Mathematical Constraint | Zero Restriction | NaN / Inf Handling | Raised Error |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Biology** | `hardy_weinberg` | `p` | `float` | $[0.0, 1.0]$ | Dominant allele frequency | Permitted ($0.0 \le p \le 1.0$) | Rejected | `ValueError` |
| **Biology** | `hardy_weinberg` | `q` | `float` | $[0.0, 1.0]$ | Recessive allele frequency | Permitted ($0.0 \le q \le 1.0$) | Rejected | `ValueError` |
| **Biology** | `hardy_weinberg` | `(p, q)` | `tuple` | $p + q = 1.0 \pm 10^{-4}$ | Normalization condition when both supplied | Neither or both zero rejected | Rejected | `ValueError` |
| **Biology** | `michaelis_menten` | `Vmax` | `float` | $(0, \infty)$ | Maximum enzyme velocity | Strictly non-zero ($V_{\max} > 0$) | Rejected | `ValueError` |
| **Biology** | `michaelis_menten` | `Km` | `float` | $(0, \infty)$ | Michaelis constant | Strictly non-zero ($K_m > 0$) | Rejected | `ValueError` |
| **Biology** | `michaelis_menten` | `S` | `float` | $[0, \infty)$ | Substrate concentration $[S]$ | Permitted ($S = 0 \implies v = 0$) | Rejected | `ValueError` |
| **Biology** | `michaelis_menten` | `Km + S` | `float` | $(0, \infty)$ | Denominator of reaction rate equation | $K_m + [S] = 0$ strictly rejected | Rejected | `ZeroDenominatorError` |
| **CS** | `shannon_entropy` | `probabilities` | `List[float]` | Non-empty | Discrete probability distribution | Permitted ($p_i \ge 0$) | Rejected | `ValueError` / `TypeError` |
| **CS** | `shannon_entropy` | `p_i` | `float` | $[0.0, 1.0]$ | Individual outcome probability | Permitted ($0 \log 0 \to 0$) | Rejected | `ValueError` |
| **CS** | `shannon_entropy` | `sum(p_i)` | `float` | $1.0 \pm 10^{-4}$ | Total measure of probability space | Sum = 0 strictly rejected | Rejected | `ValueError` |
| **CS** | `big_o_limit` | `f_str`, `g_str` | `str` | Non-empty | Algorithm asymptotic complexity expressions | Non-empty string required | N/A | `ValueError` |
| **Physics** | `energy_mass_equivalence`| `mass` | `float` | $[0, \infty)$ | Relativistic rest mass | Permitted ($m = 0 \implies E = 0$) | Rejected | `ValueError` |
| **Physics** | `energy_mass_equivalence`| `energy` | `float` | $[0, \infty)$ | Rest mass equivalent energy | Permitted ($E = 0 \implies m = 0$) | Rejected | `ValueError` |
| **Physics** | `heisenberg_uncertainty` | `delta_x` | `float` | $(0, \infty)$ | Position uncertainty standard deviation | Strictly non-zero ($\Delta x > 0$) | Rejected | `ZeroDenominatorError` / `ValueError` |
| **Physics** | `heisenberg_uncertainty` | `delta_p` | `float` | $(0, \infty)$ | Momentum uncertainty standard deviation | Strictly non-zero ($\Delta p > 0$) | Rejected | `ZeroDenominatorError` / `ValueError` |
| **Physics** | `newtons_second_law` | `m` | `float` | $(0, \infty)$ | Inertial mass in classical mechanics | Strictly non-zero ($m > 0$) | Rejected | `ZeroDenominatorError` / `ValueError` |
| **Physics** | `newtons_second_law` | `a` | `float` | $(-\infty, \infty)$ | Acceleration vector magnitude | $a \ne 0$ when solving for mass | Rejected | `ZeroDenominatorError` |
| **Physics** | `newtons_second_law` | `F`, `a` | `float` | Same sign | Force and acceleration directional alignment | Cannot have opposite signs for $m$ | Rejected | `ValueError` |
| **Astrophysics** | `schwarzschild_radius` | `mass` | `float` | $[0, \infty)$ | Celestial body or black hole mass | Permitted ($M = 0 \implies R_s = 0$) | Rejected | `ValueError` |
| **Astrophysics** | `keplers_third_law` | `period` | `float` | $(0, \infty)$ | Orbital period $T$ | Strictly non-zero ($T > 0$) | Rejected | `ValueError` |
| **Astrophysics** | `keplers_third_law` | `semi_major_axis`| `float`| $(0, \infty)$ | Semi-major axis $a$ | Strictly non-zero ($a > 0$) | Rejected | `ValueError` |
| **Astrophysics** | `keplers_third_law` | `mass_central` | `float` | $(0, \infty)$ | Central celestial body mass $M$ | Strictly non-zero ($M > 0$) | Rejected | `ValueError` |
| **Astrophysics** | `drake_equation` | `R` | `float` | $(0, \infty)$ | Galactic star formation rate | Strictly non-zero ($R^* > 0$) | Rejected | `ValueError` |
| **Astrophysics** | `drake_equation` | `fp, fl, fi, fc`| `float`| $[0.0, 1.0]$ | Planetary, biological, and technical fractions | Permitted ($0 \implies N = 0$) | Rejected | `ValueError` |
| **Astrophysics** | `drake_equation` | `ne` | `float` | $[0, \infty)$ | Habitable planets per system | Permitted ($n_e \ge 0$) | Rejected | `ValueError` |
| **Astrophysics** | `drake_equation` | `L` | `float` | $(0, \infty)$ | Communicative civilization lifetime | Strictly non-zero ($L > 0$) | Rejected | `ValueError` |
| **Chemistry** | `nernst_equation` | `E0` | `float` | $(-\infty, \infty)$ | Standard reduction potential (V) | Permitted | Rejected | `ValueError` |
| **Chemistry** | `nernst_equation` | `n` | `int` | $\{1, 2, 3, \dots\}$ | Moles of electrons transferred | Strictly non-zero integer ($n \ge 1$) | Rejected | `ValueError` |
| **Chemistry** | `nernst_equation` | `Q` | `float` | $(0, \infty)$ | Reaction quotient $[P]/[R]$ | Strictly non-zero ($Q > 0$ for $\ln Q$) | Rejected | `ValueError` |
| **Chemistry** | `nernst_equation` | `T` | `float` | $(0, \infty)$ | Absolute temperature in Kelvin | Strictly non-zero ($T > 0\text{ K}$) | Rejected | `ValueError` |
| **Chemistry** | `gibbs_free_energy` | `delta_H` | `float` | $(-\infty, \infty)$ | Enthalpy change $\Delta H$ | Permitted ($\Delta H < 0$ exothermic) | Rejected | `ValueError` |
| **Chemistry** | `gibbs_free_energy` | `T` | `float` | $[0, \infty)$ | Absolute temperature in Kelvin | Permitted ($T \ge 0\text{ K}$) | Rejected | `ValueError` |
| **Chemistry** | `gibbs_free_energy` | `delta_S` | `float` | $(-\infty, \infty)$ | Entropy change $\Delta S$ | Permitted | Rejected | `ValueError` |
| **Chemistry** | `first_order_kinetics` | `k` | `float` | $(0, \infty)$ | Reaction decomposition rate constant | Strictly non-zero ($k > 0$) | Rejected | `ValueError` |
| **Chemistry** | `first_order_kinetics` | `t` | `float` | $[0, \infty)$ | Elapsed reaction time | Permitted ($t = 0 \implies [A] = [A_0]$) | Rejected | `ValueError` |
| **Chemistry** | `first_order_kinetics` | `A0` | `float` | $[0, \infty)$ | Initial reactant concentration | Permitted ($A_0 \ge 0$) | Rejected | `ValueError` |
| **Finance** | `npv` | `rate` | `float` | $(-1.0, \infty)$ | Discount rate $r > -100\%$ | Permitted ($r = 0 \implies \sum CF_i$) | Rejected | `ValueError` |
| **Finance** | `npv` | `cashflows` | `List[float]` | Non-empty | Sequence of periodic cash flows | Permitted (negative outlays allowed) | Rejected | `ValueError` |
| **Finance** | `irr` | `cashflows` | `List[float]` | $\ge 2$ periods | Cash flows with $\ge 1$ sign change | All positive or all negative rejected | Rejected | `ValueError` |
| **Finance** | `wacc` | `equity`, `debt` | `float` | $[0, \infty)$ | Capital balance values | $E + D = 0$ strictly rejected | Rejected | `ZeroDenominatorError` |
| **Finance** | `wacc` | `tax_rate` | `float` | $[0.0, 1.0]$ | Corporate effective tax rate | Permitted ($0 \le t \le 1$) | Rejected | `ValueError` |
| **Finance** | `black_scholes` | `S`, `K` | `float` | $(0, \infty)$ | Spot asset price and strike price | Strictly non-zero ($S > 0, K > 0$) | Rejected | `ValueError` |
| **Finance** | `black_scholes` | `T` | `float` | $(0, \infty)$ | Time to expiration in years | Strictly non-zero ($T > 0$) | Rejected | `ValueError` |
| **Finance** | `black_scholes` | `sigma` | `float` | $(0, \infty)$ | Annualized volatility $\sigma$ | Strictly non-zero ($\sigma > 0$) | Rejected | `ValueError` |
| **Finance** | `black_scholes` | `option_type` | `str` | `{"call", "put"}` | Option exercise style | Case-insensitive | N/A | `ValueError` |

---

## 3. Domain-Specific Validation Rules

### 3.1 Genetics & Biology

#### Hardy-Weinberg Population Equilibrium
- **Rule 1.1**: Allele frequencies $p$ (dominant) and $q$ (recessive) must satisfy $0.0 \le p \le 1.0$ and $0.0 \le q \le 1.0$.
- **Rule 1.2**: At least one allele frequency must be provided. If only $p$ is provided, $q = 1 - p$. If only $q$ is provided, $p = 1 - q$.
- **Rule 1.3**: When both $p$ and $q$ are specified simultaneously, they must satisfy $|(p + q) - 1.0| \le 10^{-4}$. Any deviation beyond tolerance raises a `ValueError`.

#### Michaelis-Menten Enzyme Kinetics
- **Rule 2.1**: Reaction velocity $v = \frac{V_{\max}[S]}{K_m + [S]}$ requires $V_{\max} > 0$ and $K_m > 0$.
- **Rule 2.2**: Substrate concentration $[S]$ must be physically non-negative ($[S] \ge 0$). When $[S] = 0$, reaction rate $v = 0$.
- **Rule 2.3**: Singular denominator condition: $K_m + [S] = 0$ raises `ZeroDenominatorError` (inheriting from both `ValueError` and `ZeroDivisionError`).

### 3.2 Information Theory & Computer Science

#### Shannon Entropy
- **Rule 3.1**: Discrete probability distribution must be non-empty.
- **Rule 3.2**: Each probability element $p_i$ must satisfy $0.0 \le p_i \le 1.0$. Negative probabilities or probabilities $> 1$ are strictly rejected.
- **Rule 3.3**: The distribution must be normalized: $|\sum_{i=1}^n p_i - 1.0| \le 10^{-4}$.
- **Rule 3.4**: $p_i = 0$ is handled continuously per $0 \log_2(0) \to 0$ without numeric singularities.

#### Asymptotic Big-O Classifier
- **Rule 4.1**: Input function strings $f(n)$ and $g(n)$ must be non-empty strings.
- **Rule 4.2**: Must pass safe AST parser validation allowlisting only mathematical symbols with $n > 0$.

### 3.3 Physics & Mechanics

#### Mass-Energy Equivalence ($E = mc^2$)
- **Rule 5.1**: Exactly one parameter (`mass` or `energy`) must be provided.
- **Rule 5.2**: Rest mass $m$ must be non-negative ($m \ge 0$). Energy must be non-negative ($E \ge 0$).
- **Rule 5.3**: Inputs must be finite numbers (rejecting `NaN`, `Infinity`, booleans, and non-numeric types).

#### Heisenberg Uncertainty Principle ($\Delta x \cdot \Delta p \ge \frac{\hbar}{2}$)
- **Rule 6.1**: Exactly one parameter (`delta_x` or `delta_p`) must be provided.
- **Rule 6.2**: Quantum uncertainties represent standard deviations and must be strictly positive ($\Delta x > 0, \Delta p > 0$).
- **Rule 6.3**: An input of $0.0$ raises `ZeroDenominatorError`. Subatomic quantum scales (e.g. Planck length $10^{-35}\text{ m}$) are fully supported.

#### Newton's Second Law ($F = ma$)
- **Rule 7.1**: Exactly two parameters must be specified out of $(F, m, a)$.
- **Rule 7.2**: Mass must be strictly positive ($m > 0$).
- **Rule 7.3**: When solving for acceleration ($a = F / m$), $m = 0$ raises `ZeroDenominatorError`.
- **Rule 7.4**: When solving for mass ($m = F / a$), $a = 0$ raises `ZeroDenominatorError`.
- **Rule 7.5**: Directional collinearity: $F$ and $a$ must have the same directional sign, preventing non-physical negative inertial mass.

### 3.4 Astrophysics & Orbital Mechanics

#### Schwarzschild Radius ($R_s = \frac{2GM}{c^2}$)
- **Rule 8.1**: Mass $M$ must be physically non-negative ($M \ge 0$). Negative mass black holes are impossible in general relativity and are rejected with `ValueError`.

#### Kepler's Third Law ($T^2 = \frac{4\pi^2 a^3}{GM}$)
- **Rule 9.1**: At least two parameters must be specified out of $(T, a, M)$.
- **Rule 9.2**: Orbital period $T$, semi-major axis $a$, and central body mass $M$ must all be strictly positive ($> 0$). Zero or negative values are rejected.

#### Drake Equation
- **Rule 10.1**: Star formation rate $R^*$ must be strictly positive ($R^* > 0$).
- **Rule 10.2**: Probabilistic fractions $f_p, f_l, f_i, f_c$ must each be bounded within $[0.0, 1.0]$.
- **Rule 10.3**: Average habitable planets per star $n_e$ must be non-negative ($n_e \ge 0$).
- **Rule 10.4**: Civilization communicative longevity $L$ must be strictly positive ($L > 0$).

### 3.5 Physical Chemistry & Kinetics

#### Nernst Equation ($E = E^0 - \frac{RT}{nF} \ln Q$)
- **Rule 11.1**: Electron count $n$ must be a strictly positive integer ($n \in \{1, 2, 3, \dots\}$). Fractional, negative, or zero electrons raise `ValueError`.
- **Rule 11.2**: Reaction quotient $Q = \frac{[\text{Products}]}{[\text{Reactants}]}$ must be strictly positive ($Q > 0$). Non-positive values cause a logarithmic singularity ($\ln Q \to -\infty$) and raise `ValueError`.
- **Rule 11.3**: Temperature $T$ must be strictly above absolute zero in Kelvin ($T > 0\text{ K}$).

#### Gibbs Free Energy ($\Delta G = \Delta H - T \Delta S$)
- **Rule 12.1**: Enthalpy $\Delta H$ and entropy $\Delta S$ may be positive or negative (representing endothermic/exothermic and order/disorder transitions).
- **Rule 12.2**: Absolute temperature $T$ must satisfy $T \ge 0\text{ K}$. Negative absolute temperatures are rejected.

#### First-Order Reaction Kinetics ($[A] = [A_0] e^{-kt}$)
- **Rule 13.1**: Reaction rate constant $k$ must be strictly positive ($k > 0$).
- **Rule 13.2**: Elapsed time $t$ must be non-negative ($t \ge 0$).
- **Rule 13.3**: Initial concentration $[A_0]$ must be non-negative ($[A_0] \ge 0$).

### 3.6 Quantitative Finance & Options

#### Net Present Value (NPV)
- **Rule 14.1**: Discount rate $r$ must be strictly greater than $-1.0$ ($-100\%$). At $r = -1.0$, $(1 + r) = 0$, creating a division by zero singularity. For $r < -1.0$, alternating signs or complex values emerge.
- **Rule 14.2**: Legitimate negative economic scenarios (e.g. negative central bank interest rates $r = -0.005$) are fully supported.
- **Rule 14.3**: Cash flows series permits negative outlays and positive revenues.

#### Internal Rate of Return (IRR)
- **Rule 15.1**: Cash flow sequence must have at least 2 periods.
- **Rule 15.2**: Cash flows must contain at least one sign change (both positive inflows and negative outflows). Series that are all-positive or all-negative have no real IRR solution and raise `ValueError`.

#### Weighted Average Cost of Capital (WACC)
- **Rule 16.1**: Market equity $E \ge 0$ and debt $D \ge 0$.
- **Rule 16.2**: Total capital $E + D$ must be strictly positive ($E + D > 0$). A total capital of zero raises `ZeroDenominatorError`.
- **Rule 16.3**: Corporate tax rate $t$ must be bounded within $[0.0, 1.0]$.

#### Black-Scholes European Options
- **Rule 17.1**: Asset spot price $S$ and strike price $K$ must be strictly positive ($S > 0, K > 0$).
- **Rule 17.2**: Time to maturity $T$ must be strictly positive ($T > 0$ years).
- **Rule 17.3**: Volatility $\sigma$ must be strictly positive ($\sigma > 0$).
- **Rule 17.4**: Risk-free interest rate $r$ can be positive, zero, or negative, but must be a finite number.
- **Rule 17.5**: Option type must be `'call'` or `'put'` (case-insensitive).

---

## 4. Verification and Regression Suite

All rules are verified through automated regression suites:
- [`tests/test_validation.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_validation.py): 23 unit tests covering common, numerical, probability, physical, and financial validation utilities.
- [`tests/test_biology.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_biology.py): Regression tests for Hardy-Weinberg and Michaelis-Menten edge cases.
- [`tests/test_cs.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_cs.py): Regression tests for Shannon entropy probability limits and Big-O parameter validation.
- [`tests/test_physics.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_physics.py): Regression tests for Newton's 2nd law, Planck-scale uncertainty, and zero denominators.
- [`tests/test_astrophysics.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_astrophysics.py): Regression tests for Schwarzschild negative mass, Kepler parameters, and Drake bounds.
- [`tests/test_chemistry.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_chemistry.py): Regression tests for Nernst electron integers, temperatures, and rate constants.
- [`tests/test_finance.py`](file:///e:/Github/GitProjects/SuperCalcee/tests/test_finance.py): Regression tests for discount rate singularities, IRR sign changes, WACC capital, and option parameters.

Total test count: **298 passing tests** (Python backend) and **57 passing tests** (Electron security and renderer suite).
