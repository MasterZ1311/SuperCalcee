# SuperCalcee Domain-Specific Engine Specifications

SuperCalcee is an advanced, domain-aware calculator platform built for multi-disciplinary scientific computation. This document provides detailed technical specifications for each domain engine supported by the application.

---

## 1. Computer Algebra System (CAS)

The CAS module powers symbolic algebra operations using Python's `SymPy` backend.

* **Symbolic Differentiation**: Computes exact derivative expressions across scalar and multi-variable functions.
* **Symbolic Integration**: Evaluates analytical definite and indefinite integrals.
* **Equation Root Solving**: Finds exact symbolic and numerical solutions for linear, quadratic, polynomial, and transcendental equations.
* **Expression Simplification**: Reduces complex algebraic expressions using trigonometric identities, logarithmic expansion, and factorization.

---

## 2. Physics & Astrophysics Engine

The physics engine combines physical laws with SI unit validation.

* **Classical Mechanics**: Kinematic equations, Newton's laws of motion, work-energy theorem, momentum conservation, gravitational forces.
* **Electromagnetism**: Coulomb's Law, Ohm's Law, electric field intensity, magnetic flux, Maxwell equation helpers.
* **Optics & Waves**: Snell's law of refraction, lens equations, wave speed, interference conditions.
* **Thermodynamics**: Ideal Gas Law ($PV = nRT$), Carnot engine efficiency, heat transfer equations, entropy changes.
* **Astrophysics**: Schwarzschild radius calculation ($R_s = \frac{2GM}{c^2}$), Kepler's third law of planetary motion, Hubble's law, stellar luminosity.

---

## 3. Chemistry & Biology Engine

* **Solution Chemistry**: Molarity ($M = \frac{n}{V}$), molality, dilution formula ($M_1 V_1 = M_2 V_2$), pH and pOH calculations ($pH = -\log_{10}[H^+]$).
* **Stoichiometry & Gas Laws**: Gas density calculations, molar mass conversions, reaction stoichiometry ratios.
* **Enzyme Kinetics**: Michaelis-Menten kinetics ($v = \frac{V_{max}[S]}{K_m + [S]}$), Lineweaver-Burk transformations.
* **Population Genetics**: Hardy-Weinberg equilibrium allele frequencies ($p^2 + 2pq + q^2 = 1$).

---

## 4. Computer Science & Cryptography Engine

* **Information Theory**: Shannon Entropy ($H(X) = -\sum P(x_i) \log_2 P(x_i)$), binary channel capacity.
* **Algorithmic Analysis**: Asymptotic time complexity functions (Big O evaluation), recursion tree formulas.
* **Binary & Bitwise Operations**: Floating point bit manipulation, base representations (Hexadecimal, Binary, Octal).

---

## 5. Finance & Quantitative Engine

* **Time Value of Money**: Compound Interest ($A = P(1 + \frac{r}{n})^{nt}$), Present Value ($PV$), Future Value ($FV$).
* **Investment Analysis**: Net Present Value ($NPV$), Internal Rate of Return ($IRR$), Loan Amortization schedule calculations.
* **Option Pricing**: Black-Scholes European call and put options pricing model.
