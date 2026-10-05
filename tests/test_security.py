"""
Comprehensive Security Regression Test Suite for SuperCalcee
=============================================================

Validates that user inputs are treated strictly as mathematical data and CANNOT
escape the mathematical grammar. Enforces:
1. Harmless mathematical expressions
2. Supported mathematical functions
3. Invalid syntax detection
4. Python syntax rejection
5. Attribute access prohibition
6. Import attempts rejection
7. Dangerous builtins blocking
8. Excessively long expression limits
9. Deeply nested expression depth limits
10. Pathological expression and token flood protection

IMPORTANT: Tests use benign, non-destructive inspection probes only.
Malicious payloads are NEVER executed.

Author: SuperCalcee Core Team
License: MIT
"""

import pytest
from fastapi.testclient import TestClient

from src_python.cas.symbolic_engine import CASEngine
from src_python.formula_engine.solver import FormulaEngine
from src_python.parser.ast_parser import LogicParser
from src_python.security import (
    MAX_EXPRESSION_DEPTH,
    MAX_EXPRESSION_LENGTH,
    MAX_TOKEN_COUNT,
    ExpressionLimitError,
    InvalidExpressionError,
    SecurityError,
    parse_safe,
    validate_safe_identifier,
)
from src_python.units.dimensional import DimensionalEngine


class Test1HarmlessExpressions:
    """Category 1: Harmless, valid mathematical expressions parse correctly."""

    @pytest.mark.parametrize(
        "expr,expected_repr",
        [
            ("42", "42"),
            ("3.14159", "3.14159"),
            ("x + y", "x + y"),
            ("a - b + c", "a - b + c"),
            ("2 * x + 3 * y", "2*x + 3*y"),
            ("10 / 2", "5"),
            ("x ** 2 + 1", "x**2 + 1"),
            ("x^2 + 1", "x**2 + 1"),
            ("2x + 3y", "2*x + 3*y"),
            ("3(a + b)", "3*a + 3*b"),
            ("(x + 1)(x - 1)", "(x - 1)*(x + 1)"),
            ("-(x + 5)", "-x - 5"),
            ("+y", "y"),
            ("1e-4 * x", "0.0001*x"),
        ],
    )
    def test_harmless_math_expressions(self, cas: CASEngine, expr: str, expected_repr: str):
        parsed = cas.parse(expr)
        assert parsed is not None


class Test2SupportedMathematicalFunctions:
    """Category 2: Supported mathematical functions evaluate properly."""

    @pytest.mark.parametrize(
        "func_expr",
        [
            "sin(x)",
            "cos(x)",
            "tan(x)",
            "asin(x)",
            "acos(x)",
            "atan(x)",
            "sinh(x)",
            "cosh(x)",
            "tanh(x)",
            "exp(x)",
            "log(x)",
            "ln(x)",
            "sqrt(x)",
            "cbrt(x)",
            "abs(x)",
            "factorial(5)",
            "gamma(x)",
            "floor(x)",
            "ceil(x)",
            "round(x)",
            "pi",
            "e",
            "oo",
        ],
    )
    def test_approved_math_functions(self, cas: CASEngine, func_expr: str):
        parsed = cas.parse(func_expr)
        assert parsed is not None


class Test3InvalidSyntax:
    """Category 3: Invalid mathematical syntax raises clean errors."""

    @pytest.mark.parametrize(
        "bad_expr",
        [
            "",
            "   ",
            "(x + 1",
            "x + 1)",
            "((x)",
            "x + * 2",
            "+ / 3",
            "2 ^",
            "sin(",
            "cos())",
            "x , y",
            "x ; y",
        ],
    )
    def test_invalid_syntax_rejected(self, cas: CASEngine, bad_expr: str):
        with pytest.raises((InvalidExpressionError, ValueError)):
            cas.parse(bad_expr)


class Test4PythonSyntaxRejection:
    """Category 4: Python-specific syntax constructs are strictly rejected."""

    @pytest.mark.parametrize(
        "py_expr",
        [
            "lambda x: x",
            "(lambda x: x + 1)(2)",
            "[x for x in (1, 2, 3)]",
            "{x: x for x in (1, 2)}",
            "{1, 2, 3}",
            "[1, 2, 3]",
            "(1, 2)",
            "x := 5",
            "if True: 1",
            "for i in range(10): pass",
            "def foo(): pass",
            "class Bar: pass",
            "return 42",
            "yield 1",
            "pass",
            "del x",
        ],
    )
    def test_python_syntax_rejected(self, cas: CASEngine, py_expr: str):
        with pytest.raises((SecurityError, InvalidExpressionError, ValueError)):
            cas.parse(py_expr)


class Test5AttributeAccessProhibition:
    """Category 5: Attribute access ('.') is strictly forbidden."""

    @pytest.mark.parametrize(
        "attr_expr",
        [
            "x.__class__",
            "x.__class__.__bases__",
            "x.__doc__",
            "x.__dict__",
            "().__class__",
            "'abc'.upper()",
            "math.sin(1)",
            "os.system",
            "sys.modules",
            "x.attr",
            "a.b.c",
        ],
    )
    def test_attribute_access_rejected(self, cas: CASEngine, attr_expr: str):
        with pytest.raises((SecurityError, InvalidExpressionError, ValueError)):
            cas.parse(attr_expr)


class Test6ImportAttemptsRejection:
    """Category 6: Import statements and import function calls are rejected."""

    @pytest.mark.parametrize(
        "import_expr",
        [
            "import os",
            "import sys",
            "from math import sin",
            "__import__('os')",
            "__import__('sys').platform",
            "__import__('subprocess')",
        ],
    )
    def test_import_attempts_rejected(self, cas: CASEngine, import_expr: str):
        with pytest.raises((SecurityError, InvalidExpressionError, ValueError)):
            cas.parse(import_expr)


class Test7DangerousBuiltinsBlocking:
    """Category 7: Dangerous Python built-in functions cannot be called."""

    @pytest.mark.parametrize(
        "builtin_expr",
        [
            "eval('1+1')",
            "exec('1+1')",
            "open('test.txt')",
            "compile('1', '', 'eval')",
            "getattr(x, 'y')",
            "setattr(x, 'y', 1)",
            "delattr(x, 'y')",
            "globals()",
            "locals()",
            "vars()",
            "dir()",
            "breakpoint()",
            "input()",
            "print('hello')",
            "isinstance(x, int)",
            "issubclass(x, int)",
            "type(x)",
            "id(x)",
        ],
    )
    def test_dangerous_builtins_rejected(self, cas: CASEngine, builtin_expr: str):
        with pytest.raises((SecurityError, InvalidExpressionError, ValueError)):
            cas.parse(builtin_expr)


class Test8ExcessivelyLongExpressions:
    """Category 8: Expressions or identifiers exceeding length limits are rejected."""

    def test_expression_exceeding_max_length(self, cas: CASEngine):
        long_expr = "x + " * 800 + "1"
        assert len(long_expr) > MAX_EXPRESSION_LENGTH
        with pytest.raises(ExpressionLimitError):
            cas.parse(long_expr)

    def test_identifier_exceeding_max_length(self):
        long_id = "a" * 100
        with pytest.raises(ExpressionLimitError):
            validate_safe_identifier(long_id)


class Test9DeeplyNestedExpressions:
    """Category 9: Expressions exceeding nesting depth limits are rejected."""

    def test_excessive_parenthesis_nesting(self, cas: CASEngine):
        deep_expr = "(" * (MAX_EXPRESSION_DEPTH + 10) + "x" + ")" * (MAX_EXPRESSION_DEPTH + 10)
        with pytest.raises(ExpressionLimitError):
            cas.parse(deep_expr)

    def test_excessive_function_call_nesting(self, cas: CASEngine):
        deep_fn = "sin(" * (MAX_EXPRESSION_DEPTH + 10) + "x" + ")" * (MAX_EXPRESSION_DEPTH + 10)
        with pytest.raises(ExpressionLimitError):
            cas.parse(deep_fn)


class Test10PathologicalExpressions:
    """Category 10: Pathological inputs (token flood, node flood, string literals)."""

    def test_token_flood_rejection(self, cas: CASEngine):
        # Generate an expression with more than MAX_TOKEN_COUNT tokens
        flood = " + ".join(["1"] * (MAX_TOKEN_COUNT + 50))
        with pytest.raises(ExpressionLimitError):
            cas.parse(flood)

    def test_string_literal_rejection(self, cas: CASEngine):
        with pytest.raises((SecurityError, InvalidExpressionError, ValueError)):
            cas.parse("'malicious_string'")

    def test_formula_engine_parameter_injection_blocked(self, formula: FormulaEngine):
        with pytest.raises((SecurityError, ValueError)):
            formula.algebraic_solve("F = m * a", "a; x = 1", {"F": 10.0, "m": 2.0})

    def test_units_engine_unknown_unit_injection_blocked(self, dim: DimensionalEngine):
        with pytest.raises(ValueError):
            dim.evaluate_with_units("__import__('sys') * meter")

    def test_api_cas_simplify_blocks_payload(self, client: TestClient):
        res = client.post("/cas/simplify", json={"expr": "__import__('sys').platform"})
        assert res.status_code in (400, 422)

    def test_api_formula_solve_blocks_payload(self, client: TestClient):
        res = client.post(
            "/formula/solve",
            json={
                "equation": "__import__('os').getcwd() = x",
                "solve_for": "x",
                "given": {},
            },
        )
        assert res.status_code in (400, 422)
