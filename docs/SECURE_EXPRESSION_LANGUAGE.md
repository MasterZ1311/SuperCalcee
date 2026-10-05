# SuperCalcee Secure Mathematical Expression Language Specification

## 1. Overview & Security Invariant

The SuperCalcee Secure Expression Language is a domain-specific mathematical grammar designed to eliminate arbitrary code execution, injection, and resource exhaustion vulnerabilities. 

### Core Security Invariant
> **User input is treated strictly as DATA.** User-provided expression strings are never passed to Python's `eval()`, `exec()`, or SymPy's `parse_expr()`. Expressions are tokenized, validated against a strict AST allowlist, and transformed directly into symbolic SymPy nodes without Python runtime code execution.

```
                    Untrusted User Input
                            │
                            ▼
              Tokenizer & Preprocessor
              - Length check (<= 2048 chars)
              - Token limit (<= 300 tokens)
              - Parenthesis balance & depth check (<= 64)
              - Exponentiation normalization ('^' -> '**')
              - Implicit multiplication insertion ('2x' -> '2 * x')
                            │
                            ▼
                     Python AST ('eval' mode)
                            │
                            ▼
                 SafeExpressionValidator
              - Strict node allowlist (only BinOp, UnaryOp, Call, Name, Constant)
              - Complexity limit (<= 500 AST nodes)
              - Nesting depth limit (<= 64 levels)
              - Direct function allowlist validation
              - Rejection of '.', '[]', lambdas, comprehensions, dunder
                            │
                            ▼
                 Direct AST-to-SymPy Builder
              - Recursive constructor: sp.Add, sp.Mul, sp.Pow, sp.sin, etc.
              - Zero Python code generation or eval()
                            │
                            ▼
                 Safe SymPy Expression Object
```

---

## 2. Lexical Grammar & Syntax

### 2.1 Numeric Literals
- **Integers**: `0`, `42`, `1000`
- **Floating-Point**: `3.14159`, `0.005`, `.5`
- **Scientific Notation**: `1e-5`, `2.5E+10`, `6.67430e-11`

### 2.2 Identifiers (Variables & Symbols)
- Variable names must match the regex `^[a-zA-Z][a-zA-Z0-9_]*$`.
- Maximum identifier length: **64 characters**.
- Identifiers cannot start with an underscore (`_`) or contain dunder sequences (`__`).
- Reserved Python keywords, runtime internals, and dangerous namespaces are strictly forbidden.

### 2.3 Binary & Unary Operators
| Operation | Syntax | Example | AST Representation |
| :--- | :--- | :--- | :--- |
| Addition | `+` | `x + y` | `ast.Add` |
| Subtraction | `-` | `x - y` | `ast.Sub` |
| Multiplication | `*` | `x * y` | `ast.Mult` |
| Division | `/` | `x / y` | `ast.Div` (exact `sp.Rational` for integers) |
| Exponentiation | `^` or `**` | `x^2`, `x**3` | `ast.Pow` |
| Modulo | `%` | `x % 2` | `ast.Mod` |
| Positive Sign | `+` | `+x` | `ast.UAdd` |
| Negative Sign | `-` | `-x` | `ast.USub` |
| Parentheses | `(` `)` | `(a + b) / 2` | Grouping / precedence |

### 2.4 Implicit Multiplication
To maintain full parity with natural scientific notation and desktop calculator UX, the tokenizer automatically inserts explicit multiplication (`*`) for standard implicit mathematical patterns:
- **Number followed by Identifier**: `2x` $\to$ `2 * x`
- **Number followed by Opening Parenthesis**: `3(a + b)` $\to$ `3 * (a + b)`
- **Closing Parenthesis followed by Opening Parenthesis**: `(x + 1)(x - 1)` $\to$ `(x + 1) * (x - 1)`
- **Closing Parenthesis followed by Identifier**: `(x)y` $\to$ `(x) * y`
- **Closing Parenthesis followed by Number**: `(x)2` $\to$ `(x) * 2`
- **Non-function Identifier followed by Opening Parenthesis**: `x(x + 1)` $\to$ `x * (x + 1)`
- **Identifier followed by Identifier**: `x y` $\to$ `x * y`

---

## 3. Approved Functions Table

Only explicitly approved functions are permitted. Any attempt to invoke an unlisted callable is rejected immediately during AST validation before evaluation.

### 3.1 Trigonometric Functions
- `sin(x)`, `cos(x)`, `tan(x)`
- `asin(x)`, `acos(x)`, `atan(x)`, `atan2(y, x)`
- `sec(x)`, `csc(x)`, `cot(x)`
- `asec(x)`, `acsc(x)`, `acot(x)`

### 3.2 Hyperbolic Functions
- `sinh(x)`, `cosh(x)`, `tanh(x)`
- `asinh(x)`, `acosh(x)`, `atanh(x)`
- `sech(x)`, `csch(x)`, `coth(x)`
- `asech(x)`, `acsch(x)`, `acoth(x)`

### 3.3 Exponential & Logarithmic
- `exp(x)`: Natural exponential $e^x$
- `log(x)`: Natural logarithm $\ln(x)$ (or `log(x, base)`)
- `ln(x)`: Natural logarithm $\ln(x)$
- `log10(x)`: Common logarithm $\log_{10}(x)$
- `log2(x)`: Binary logarithm $\log_2(x)$

### 3.4 Roots, Powers & Absolute Values
- `sqrt(x)`: Square root $\sqrt{x}$
- `cbrt(x)`: Cube root $\sqrt[3]{x}$
- `root(x, n)`: $n$-th root $\sqrt[n]{x}$
- `abs(x)`: Absolute value $|x|$
- `sign(x)`: Signum function

### 3.5 Rounding & Truncation
- `floor(x)`: Greatest integer $\le x$
- `ceil(x)` or `ceiling(x)`: Least integer $\ge x$
- `round(x)`: Nearest integer rounding

### 3.6 Special Mathematical Functions
- `factorial(n)`: Factorial $n!$
- `gamma(x)`: Euler Gamma function $\Gamma(x)$
- `erf(x)`: Gauss Error function $\text{erf}(x)$

---

## 4. Formal Boolean Logic Grammar

When running in logic mode (`logic_parser.simplify`, `logic_parser.parse`, `POST /logic/simplify`), the language parses Boolean algebraic expressions into SymPy boolean expressions:

### 4.1 Logic Glyphs & Infix Operators
| Logic Operation | Unicode Glyph | ASCII Operator | SymPy Function |
| :--- | :--- | :--- | :--- |
| Conjunction (AND) | `∧` | `&` | `sp.And(A, B)` |
| Disjunction (OR) | `∨` | `\|` | `sp.Or(A, B)` |
| Exclusive OR (XOR) | `⊕` | `^` | `sp.Xor(A, B)` |
| Negation (NOT) | `~` | `~` | `sp.Not(A)` |
| Implication | `→` | `>>` | `sp.Implies(A, B)` |
| Equivalence | `↔` | `==` | `sp.Equivalent(A, B)` |
| Alternative Denial (NAND) | `↑` | `@` | `sp.Nand(A, B)` |
| Joint Denial (NOR) | `↓` | `//` | `sp.Nor(A, B)` |

---

## 5. Built-In Mathematical Constants

The following constants are recognized and mapped to SymPy exact symbolic representations:
- `pi`, `PI`: Ratio of circumference to diameter ($\pi \approx 3.14159...$)
- `e`, `E`: Euler's number ($e \approx 2.71828...$)
- `oo`, `inf`, `infinity`: Positive infinity ($\infty$)
- `I`: Imaginary unit ($i = \sqrt{-1}$)
- `True`, `False`: Boolean truth literals

---

## 6. Prohibited Constructs & Attack Mitigations

The following constructs are strictly blocked and raise a `SecurityError`:

1. **Attribute Access (`.`)**:
   - `x.__class__`, `().__class__.__bases__`, `math.sin(x)`, `os.system`
   - *Decimal points in numbers (e.g. `3.14`) are numeric literals and are fully permitted.*
2. **Indexing & Subscripts (`[]`)**:
   - `x[0]`, `globals()['__builtins__']`
3. **Module Imports**:
   - `import os`, `from sys import *`, `__import__('os')`
4. **Dangerous Built-In Calls**:
   - `eval()`, `exec()`, `compile()`, `open()`, `input()`, `print()`, `breakpoint()`
   - `globals()`, `locals()`, `vars()`, `dir()`, `getattr()`, `setattr()`, `delattr()`
5. **Lambdas & Object Construction**:
   - `lambda x: x`, `type('X', (), {})`
6. **Comprehensions & Containers**:
   - `[x for x in ...]`, `{k: v for ...}`, `(1, 2, 3)`, `[1, 2, 3]`, `{1, 2}`
7. **Statements & Control Flow**:
   - `def`, `class`, `return`, `yield`, `if`, `while`, `for`, `pass`, `del`
8. **Assignments**:
   - `x = 5`, `x := 5`, `x += 1`
9. **String Literals**:
   - `'malicious'`, `"probe"` (numeric inputs must be numbers, not strings)

---

## 7. Defensive Resource Limits

To safeguard the application against Denial of Service (DoS) attacks, CPU spikes, and C-stack overflows from hostile or pathological inputs, the engine enforces strict defensive boundaries:

| Parameter | Limit | Description |
| :--- | :--- | :--- |
| `MAX_EXPRESSION_LENGTH` | `2048` chars | Maximum permitted length of an expression string. |
| `MAX_EXPRESSION_DEPTH` | `64` levels | Maximum parenthesis nesting and recursive AST depth. |
| `MAX_TOKEN_COUNT` | `300` tokens | Maximum number of lexical tokens allowed. |
| `MAX_NODE_COUNT` | `500` nodes | Maximum number of AST nodes permitted. |
| `MAX_IDENTIFIER_LENGTH` | `64` chars | Maximum length of a variable or symbol name. |

---

## 8. Exception Hierarchy

All security and parsing errors are organized under a clear exception hierarchy:

```
Exception
 └── ValueError
      ├── InvalidExpressionError     (Syntax errors, mismatched parens, bad tokens)
      └── SecurityError              (Security boundary violations, disallowed syntax)
           └── ExpressionLimitError  (Length, depth, token count, or node complexity limits)
```

Because `SecurityError` and `InvalidExpressionError` inherit from `ValueError`, existing calling code and API error handlers (`HTTPException(status_code=400, detail=str(e))`) capture and surface friendly error messages to clients without modification.
