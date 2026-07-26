# Understanding SuperCalcee: Architectural Principles & Design Philosophy

SuperCalcee is built on a design philosophy that prioritizes mathematical exactness, dimensional consistency, and modular extensibility.

---

## 1. Mathematical Exactness

Unlike standard calculators that immediately convert inputs into IEEE 754 floating-point numbers, SuperCalcee maintains exact symbolic representations for as long as possible.

* **Radicals and Fractions**: Expressions like $\sqrt{2}$ or $\frac{1}{3}$ are preserved symbolically.
* **Controlled Evaluation**: Numerical evaluation occurs only when explicitly requested by the user or required for visual rendering.
* **Floating-Point Precision Guarding**: Symbolic simplify passes precede numerical evaluation to eliminate catastrophic cancellation errors.

---

## 2. Dimensional Awareness

Physical quantities are not scalar numbers; they are physical entities governed by SI dimension vectors:

$$\text{Dimension} = [L]^\alpha [M]^\beta [T]^\gamma [I]^\delta [\Theta]^\epsilon [N]^\zeta [J]^\eta$$

SuperCalcee validates dimension vectors before mathematical evaluation. If an illegal dimensional operation is attempted (such as adding meters to seconds), the execution pipeline raises a dimensional exception with detailed unit mismatch diagnostics.

---

## 3. Modular Decoupling

SuperCalcee isolates concerns into clean layers:

1. **Frontend Presentation (Electron & React)**: Responsible for rendering, state management, and user interaction.
2. **REST API Transport (FastAPI)**: Translates JSON HTTP payloads into strongly typed Python Pydantic objects.
3. **Symbolic Core (SymPy Engine)**: Evaluates algebraic structures.
4. **Domain Engines**: Implements domain-specific scientific equations.

This separation ensures that updates to the UI shell do not risk corrupting core mathematical algorithms.
