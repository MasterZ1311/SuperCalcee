"""
SuperCalcee Security Package
============================

Provides safe mathematical expression parsing, AST allowlist validation,
identifier sanitization, and resource bounding to protect SuperCalcee against
arbitrary code execution and Denial of Service attacks.

Public Exports:
    - parse_safe: Main entry point for safe expression parsing.
    - validate_safe_identifier: Validator for variable and symbol names.
    - SafeExpressionValidator: AST visitor for expression safety checks.
    - SecurityError: Base exception for security and injection violations.
    - ExpressionLimitError: Exception for resource bounding violations.
    - InvalidExpressionError: Exception for mathematical syntax errors.
    - MAX_EXPRESSION_LENGTH, MAX_EXPRESSION_DEPTH, MAX_TOKEN_COUNT, MAX_NODE_COUNT.
"""

from src_python.security.expression_parser import (
    ast_to_sympy,
    parse_safe,
    preprocess_expression,
)
from src_python.security.limits import (
    MAX_EXPRESSION_DEPTH,
    MAX_EXPRESSION_LENGTH,
    MAX_IDENTIFIER_LENGTH,
    MAX_NODE_COUNT,
    MAX_TOKEN_COUNT,
    ExpressionLimitError,
    InvalidExpressionError,
    SecurityError,
)
from src_python.security.validation import (
    ALLOWED_CONSTANTS,
    ALLOWED_MATH_FUNCTIONS,
    DISALLOWED_NAMES,
    SafeExpressionValidator,
    validate_safe_identifier,
)

__all__ = [
    "parse_safe",
    "validate_safe_identifier",
    "preprocess_expression",
    "ast_to_sympy",
    "SafeExpressionValidator",
    "SecurityError",
    "ExpressionLimitError",
    "InvalidExpressionError",
    "MAX_EXPRESSION_LENGTH",
    "MAX_EXPRESSION_DEPTH",
    "MAX_TOKEN_COUNT",
    "MAX_NODE_COUNT",
    "MAX_IDENTIFIER_LENGTH",
    "ALLOWED_MATH_FUNCTIONS",
    "ALLOWED_CONSTANTS",
    "DISALLOWED_NAMES",
]
