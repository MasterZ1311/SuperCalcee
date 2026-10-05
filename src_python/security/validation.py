"""
AST Validation & Allowlist Enforcement for SuperCalcee
======================================================

Strictly validates Python abstract syntax trees (AST) in 'eval' mode.
Enforces that user-provided mathematical expressions contain ONLY allowlisted
nodes, operators, functions, constants, and safe variable identifiers.

Rejects all forms of attribute access ('.'), object instantiation,
comprehensions, lambdas, dangerous builtins, dunder names, and statements.

Author: SuperCalcee Core Team
License: MIT
"""

import ast
import re
from typing import Any, Callable, Dict, Optional, Set

import sympy as sp

from src_python.security.limits import (
    MAX_EXPRESSION_DEPTH,
    MAX_IDENTIFIER_LENGTH,
    MAX_NODE_COUNT,
    ExpressionLimitError,
    SecurityError,
)

# Regular expression strictly matching safe variable identifiers
IDENTIFIER_REGEX = re.compile(r"^[a-zA-Z][a-zA-Z0-9_]*$")

# Disallowed Python keywords, builtins, and dangerous namespaces
DISALLOWED_NAMES: Set[str] = {
    # Dunder and introspection
    "__import__",
    "__builtins__",
    "__class__",
    "__bases__",
    "__subclasses__",
    "__mro__",
    "__globals__",
    "__code__",
    "__reduce__",
    "__reduce_ex__",
    "__getattribute__",
    "__getattr__",
    "__setattr__",
    "__delattr__",
    "__dict__",
    "__init__",
    "__new__",
    "__dir__",
    "__doc__",
    "__file__",
    "__loader__",
    "__spec__",
    "__package__",
    "__annotations__",
    # Built-in execution and inspection functions
    "eval",
    "exec",
    "compile",
    "open",
    "input",
    "print",
    "breakpoint",
    "globals",
    "locals",
    "vars",
    "dir",
    "getattr",
    "setattr",
    "delattr",
    "hasattr",
    "callable",
    "isinstance",
    "issubclass",
    "super",
    "memoryview",
    "bytearray",
    "bytes",
    "object",
    "type",
    "id",
    "hash",
    "help",
    "exit",
    "quit",
    "format",
    "iter",
    "next",
    "slice",
    # Dangerous system and standard library modules
    "import",
    "os",
    "sys",
    "subprocess",
    "socket",
    "posix",
    "nt",
    "shutil",
    "pathlib",
    "io",
    "builtins",
    "platform",
    "ctypes",
    "signal",
    "tempfile",
    "inspect",
    "dis",
    "pdb",
    "urllib",
    "http",
    # Python keywords and control flow
    "lambda",
    "yield",
    "await",
    "async",
    "def",
    "class",
    "return",
    "from",
    "as",
    "global",
    "nonlocal",
    "assert",
    "del",
    "pass",
    "break",
    "continue",
    "try",
    "except",
    "finally",
    "raise",
    "with",
    "while",
    "for",
    "in",
    "is",
}

# Explicit allowlist of approved mathematical functions mapped to SymPy callables
ALLOWED_MATH_FUNCTIONS: Dict[str, Callable[..., Any]] = {
    # Trigonometric functions
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,
    "atan2": sp.atan2,
    "sec": sp.sec,
    "csc": sp.csc,
    "cot": sp.cot,
    "asec": sp.asec,
    "acsc": sp.acsc,
    "acot": sp.acot,
    # Hyperbolic functions
    "sinh": sp.sinh,
    "cosh": sp.cosh,
    "tanh": sp.tanh,
    "asinh": sp.asinh,
    "acosh": sp.acosh,
    "atanh": sp.atanh,
    "sech": sp.sech,
    "csch": sp.csch,
    "coth": sp.coth,
    "asech": sp.asech,
    "acsch": sp.acsch,
    "acoth": sp.acoth,
    # Exponential and Logarithmic
    "exp": sp.exp,
    "log": sp.log,
    "ln": sp.log,
    "log10": lambda x: sp.log(x, 10),
    "log2": lambda x: sp.log(x, 2),
    # Roots and Absolute value
    "sqrt": sp.sqrt,
    "cbrt": sp.cbrt,
    "root": sp.root,
    "abs": sp.Abs,
    "Abs": sp.Abs,
    # Rounding and Bounds
    "floor": sp.floor,
    "ceil": sp.ceiling,
    "ceiling": sp.ceiling,
    "round": lambda x: sp.floor(x + sp.Rational(1, 2)),
    "sign": sp.sign,
    # Special mathematical functions
    "factorial": sp.factorial,
    "gamma": sp.gamma,
    "erf": sp.erf,
    # Boolean logic functions
    "And": sp.And,
    "Or": sp.Or,
    "Not": sp.Not,
    "Xor": sp.Xor,
    "Nand": sp.Nand,
    "Nor": sp.Nor,
    "Implies": sp.Implies,
    "Equivalent": sp.Equivalent,
}

# Standard mathematical and physical constants
ALLOWED_CONSTANTS: Dict[str, Any] = {
    "pi": sp.pi,
    "PI": sp.pi,
    "e": sp.E,
    "E": sp.E,
    "oo": sp.oo,
    "inf": sp.oo,
    "infinity": sp.oo,
    "I": sp.I,
    "True": sp.true,
    "False": sp.false,
}

# Allowed AST node classes
ALLOWED_NODE_TYPES = (
    ast.Expression,
    ast.Constant,
    ast.Name,
    ast.UnaryOp,
    ast.UAdd,
    ast.USub,
    ast.Invert,
    ast.Not,
    ast.BinOp,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.Pow,
    ast.Mod,
    ast.FloorDiv,
    ast.BitAnd,
    ast.BitOr,
    ast.BitXor,
    ast.RShift,
    ast.MatMult,
    ast.Call,
    ast.Compare,
    ast.Eq,
    ast.BoolOp,
    ast.And,
    ast.Or,
    ast.Load,
)


def validate_safe_identifier(name: str) -> str:
    """
    Validates that a symbol or variable identifier conforms strictly to safe naming rules.

    Args:
        name (str): Identifier name to check.

    Returns:
        str: Validated clean identifier.

    Raises:
        SecurityError: If the identifier violates security constraints.
        ExpressionLimitError: If the identifier length exceeds MAX_IDENTIFIER_LENGTH.
    """
    if not isinstance(name, str):
        raise SecurityError(f"Identifier must be a string, got {type(name).__name__}")

    clean_name = name.strip()
    if not clean_name:
        raise SecurityError("Identifier cannot be empty.")

    if len(clean_name) > MAX_IDENTIFIER_LENGTH:
        raise ExpressionLimitError(
            f"Identifier '{clean_name[:16]}...' exceeds maximum length of {MAX_IDENTIFIER_LENGTH} characters."
        )

    if clean_name.startswith("_") or "__" in clean_name:
        raise SecurityError(f"Identifier '{clean_name}' cannot start with an underscore or contain dunder ('__').")

    if not IDENTIFIER_REGEX.match(clean_name):
        raise SecurityError(f"Invalid identifier '{clean_name}'. Must be an alphanumeric name starting with a letter.")

    if clean_name.lower() in DISALLOWED_NAMES or clean_name in DISALLOWED_NAMES:
        raise SecurityError(f"Identifier '{clean_name}' is a reserved or disallowed keyword.")

    return clean_name


class SafeExpressionValidator(ast.NodeVisitor):
    """
    AST Visitor that verifies an expression AST contains ONLY permitted nodes,
    approved function calls, safe identifiers, and stays within complexity limits.
    """

    def __init__(
        self,
        extra_functions: Optional[Dict[str, Any]] = None,
        allowed_symbols: Optional[Dict[str, Any]] = None,
        allow_free_symbols: bool = True,
    ) -> None:
        super().__init__()
        self.node_count: int = 0
        self.current_depth: int = 0
        self.max_depth_seen: int = 0
        self.allowed_symbols = allowed_symbols or {}
        self.allow_free_symbols = allow_free_symbols
        self.approved_functions: Dict[str, Any] = {**ALLOWED_MATH_FUNCTIONS}
        if extra_functions:
            for k, v in extra_functions.items():
                validate_safe_identifier(k)
                self.approved_functions[k] = v

    def visit(self, node: ast.AST) -> None:
        """Visits each AST node, verifying node type, depth, and total node count."""
        self.node_count += 1
        if self.node_count > MAX_NODE_COUNT:
            raise ExpressionLimitError(
                f"Expression complexity limit exceeded: AST contains over {MAX_NODE_COUNT} nodes."
            )

        self.current_depth += 1
        if self.current_depth > self.max_depth_seen:
            self.max_depth_seen = self.current_depth
        if self.current_depth > MAX_EXPRESSION_DEPTH:
            raise ExpressionLimitError(f"Expression nesting depth exceeds limit of {MAX_EXPRESSION_DEPTH} levels.")

        # Check node type against strict allowlist
        if not isinstance(node, ALLOWED_NODE_TYPES):
            node_name = type(node).__name__
            if isinstance(node, ast.Attribute):
                raise SecurityError("Attribute access ('.') is strictly forbidden.")
            elif isinstance(node, ast.Subscript):
                raise SecurityError("Indexing / subscript access ('[]') is strictly forbidden.")
            elif isinstance(node, (ast.List, ast.Dict, ast.Set, ast.Tuple)):
                raise SecurityError("Container literals (list, dict, set, tuple) are forbidden.")
            elif isinstance(node, ast.Lambda):
                raise SecurityError("Lambda expressions are strictly forbidden.")
            elif isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                raise SecurityError("Comprehension constructs are strictly forbidden.")
            elif isinstance(node, ast.NamedExpr):
                raise SecurityError("Assignment expressions (':=') are forbidden.")
            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                raise SecurityError("Import statements are strictly forbidden.")
            else:
                raise SecurityError(f"Syntax construct '{node_name}' is not permitted.")

        # Dispatch to specific visitors
        try:
            super().visit(node)
        finally:
            self.current_depth -= 1

    def visit_Constant(self, node: ast.Constant) -> None:
        """Ensures constants are strictly numeric or boolean; rejects strings or arbitrary objects."""
        if not isinstance(node.value, (int, float, complex, bool)):
            raise SecurityError(
                f"Literal value of type '{type(node.value).__name__}' is forbidden. Only numbers and booleans are permitted."
            )

    def visit_Name(self, node: ast.Name) -> None:
        """Validates that variable or symbol names are safe identifiers."""
        validate_safe_identifier(node.id)

        # If free symbols are not allowed (e.g. in unit expressions), verify membership
        if not self.allow_free_symbols:
            if (
                node.id not in self.allowed_symbols
                and node.id not in ALLOWED_CONSTANTS
                and node.id not in self.approved_functions
            ):
                raise SecurityError(f"Symbol '{node.id}' is not recognized or allowed in this context.")

    def visit_Call(self, node: ast.Call) -> None:
        """
        Validates function calls:
        - Function target must be a simple Name (no obj.method() or (lambda)())
        - Function name must be in the approved functions table
        - Keyword arguments and starred arguments are strictly forbidden
        """
        if not isinstance(node.func, ast.Name):
            raise SecurityError("Function calls must be direct approved function names.")

        func_name = node.func.id
        validate_safe_identifier(func_name)

        if func_name not in self.approved_functions:
            raise SecurityError(f"Function '{func_name}' is not an approved mathematical function.")

        if node.keywords:
            raise SecurityError("Keyword arguments in function calls are not permitted.")

        # Visit function arguments
        for arg in node.args:
            self.visit(arg)

    def visit_UnaryOp(self, node: ast.UnaryOp) -> None:
        """Validates unary operator."""
        if not isinstance(node.op, (ast.UAdd, ast.USub, ast.Invert, ast.Not)):
            raise SecurityError(f"Unary operator '{type(node.op).__name__}' is not permitted.")
        self.visit(node.operand)

    def visit_BinOp(self, node: ast.BinOp) -> None:
        """Validates binary operator."""
        if not isinstance(
            node.op,
            (
                ast.Add,
                ast.Sub,
                ast.Mult,
                ast.Div,
                ast.Pow,
                ast.Mod,
                ast.FloorDiv,
                ast.BitAnd,
                ast.BitOr,
                ast.BitXor,
                ast.RShift,
                ast.MatMult,
            ),
        ):
            raise SecurityError(f"Binary operator '{type(node.op).__name__}' is not permitted.")
        self.visit(node.left)
        self.visit(node.right)

    def visit_Compare(self, node: ast.Compare) -> None:
        """Validates comparison operations (only '==' for equations/equivalence)."""
        for op in node.ops:
            if not isinstance(op, ast.Eq):
                raise SecurityError(f"Comparison operator '{type(op).__name__}' is not permitted.")
        self.visit(node.left)
        for comparator in node.comparators:
            self.visit(comparator)

    def visit_BoolOp(self, node: ast.BoolOp) -> None:
        """Validates boolean operations (and / or)."""
        if not isinstance(node.op, (ast.And, ast.Or)):
            raise SecurityError(f"Boolean operator '{type(node.op).__name__}' is not permitted.")
        for val in node.values:
            self.visit(val)
