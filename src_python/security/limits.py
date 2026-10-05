"""
Defensive Limits & Security Exceptions for SuperCalcee Expression Parser
========================================================================

Defines resource boundaries and custom security exception classes to prevent
Denial-of-Service (DoS), stack overflow via deeply nested trees, and code injection.

Author: SuperCalcee Core Team
License: MIT
"""

# Maximum length of an expression string in characters
MAX_EXPRESSION_LENGTH: int = 2048

# Maximum AST nesting depth (parentheses, nested function calls, nested operations)
MAX_EXPRESSION_DEPTH: int = 64

# Maximum number of lexical tokens allowed in an expression
MAX_TOKEN_COUNT: int = 300

# Maximum number of AST nodes allowed in an expression
MAX_NODE_COUNT: int = 500

# Maximum identifier length (symbol or function name)
MAX_IDENTIFIER_LENGTH: int = 64


class SecurityError(ValueError):
    """
    Base exception raised when an expression violates security boundaries,
    attempts arbitrary code execution, uses disallowed syntax, or accesses forbidden resources.
    Inherits from ValueError for backward-compatible error handling.
    """

    pass


class ExpressionLimitError(SecurityError):
    """
    Raised when an expression exceeds defensive length, depth, token, or AST complexity limits.
    """

    pass


class InvalidExpressionError(ValueError):
    """
    Raised when an expression contains invalid mathematical syntax or cannot be tokenized/parsed.
    """

    pass
