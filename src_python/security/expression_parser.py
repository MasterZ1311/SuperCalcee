"""
Safe Mathematical & Logical Expression Parser for SuperCalcee
=============================================================

Parses untrusted user input strictly as mathematical data.
Replaces SymPy's unsafe `parse_expr` (which uses Python's `eval()`) with
an AST-allowlist and direct SymPy AST constructor architecture:

    User input
        ↓
    Sanitization & Tokenizer (implicit multiplication & limit validation)
        ↓
    Python AST ('eval' mode)
        ↓
    SafeExpressionValidator (strict allowlist, depth & complexity bounds)
        ↓
    Direct AST-to-SymPy Transformation (Zero-eval construction)
        ↓
    SymPy Expr

Author: SuperCalcee Core Team
License: MIT
"""

import ast
import io
import tokenize
from typing import Any, Dict, Optional, Set

import sympy as sp

from src_python.security.limits import (
    MAX_EXPRESSION_DEPTH,
    MAX_EXPRESSION_LENGTH,
    MAX_TOKEN_COUNT,
    ExpressionLimitError,
    InvalidExpressionError,
    SecurityError,
)
from src_python.security.validation import (
    ALLOWED_CONSTANTS,
    ALLOWED_MATH_FUNCTIONS,
    SafeExpressionValidator,
)

# Standard Unicode boolean logic replacement mappings
LOGIC_GLYPH_REPLACEMENTS: Dict[str, str] = {
    "∧": "&",
    "∨": "|",
    "⊕": "^",
    "~": "~",
    "→": ">>",
    "↔": "==",
    "↑": "@",  # NAND mapped to MatMult for AST parsing
    "↓": "//",  # NOR mapped to FloorDiv for AST parsing
}


def preprocess_expression(
    expr_str: str,
    logic_mode: bool = False,
    known_functions: Optional[Set[str]] = None,
) -> str:
    """
    Preprocesses raw user input:
    - Validates length against MAX_EXPRESSION_LENGTH.
    - Translates Unicode logic glyphs.
    - Normalizes exponentiation ('^' -> '**') in math mode.
    - Tokenizes and validates token count against MAX_TOKEN_COUNT.
    - Inserts explicit multiplication operators for implicit math syntax (e.g. '2x' -> '2 * x').

    Args:
        expr_str (str): Raw expression input.
        logic_mode (bool): If True, preserves '^' as XOR instead of exponentiation.
        known_functions (Set[str], optional): Set of function names to avoid inserting '*' after.

    Returns:
        str: Cleaned, tokenized string ready for AST parsing.

    Raises:
        ExpressionLimitError: If length or token count limits are exceeded.
        InvalidExpressionError: If tokenization fails due to syntax errors.
    """
    if not isinstance(expr_str, str):
        raise SecurityError(f"Expression must be a string, got {type(expr_str).__name__}")

    s = expr_str.strip()
    if not s:
        raise InvalidExpressionError("Expression cannot be empty.")

    if len(s) > MAX_EXPRESSION_LENGTH:
        raise ExpressionLimitError(
            f"Expression length ({len(s)} chars) exceeds maximum allowed length of {MAX_EXPRESSION_LENGTH} characters."
        )

    # Replace Unicode logic glyphs
    for glyph, repl in LOGIC_GLYPH_REPLACEMENTS.items():
        if glyph in s:
            s = s.replace(glyph, f" {repl} ")

    # Exponentiation normalization in math mode
    if not logic_mode:
        # Convert '^' to '**' (preserving any already existing '**')
        # We replace single '^' with '**'
        s = s.replace("^", "**")

    # Set of function names that should NOT have implicit '*' inserted after them
    fn_names = set(ALLOWED_MATH_FUNCTIONS.keys())
    if known_functions:
        fn_names.update(known_functions)

    # Tokenize input using Python standard library tokenizer
    try:
        raw_tokens = list(tokenize.tokenize(io.BytesIO(s.encode("utf-8")).readline))
    except tokenize.TokenError as te:
        raise InvalidExpressionError(f"Lexical tokenization error: {te}")
    except IndentationError as ie:
        raise InvalidExpressionError(f"Invalid expression syntax: {ie}")

    # Filter out metadata tokens (ENCODING, NEWLINE, NL, COMMENT, ENDMARKER)
    tokens = [
        t
        for t in raw_tokens
        if t.type not in (tokenize.ENCODING, tokenize.NEWLINE, tokenize.NL, tokenize.COMMENT, tokenize.ENDMARKER)
    ]

    if len(tokens) > MAX_TOKEN_COUNT:
        raise ExpressionLimitError(
            f"Expression contains {len(tokens)} tokens, exceeding limit of {MAX_TOKEN_COUNT} tokens."
        )

    # Check parenthesis nesting depth and balance
    paren_depth = 0
    for t in tokens:
        if t.string == "(":
            paren_depth += 1
            if paren_depth > MAX_EXPRESSION_DEPTH:
                raise ExpressionLimitError(f"Parenthesis nesting depth exceeds limit of {MAX_EXPRESSION_DEPTH} levels.")
        elif t.string == ")":
            paren_depth -= 1
            if paren_depth < 0:
                raise InvalidExpressionError("Unmatched closing parenthesis.")
    if paren_depth != 0:
        raise InvalidExpressionError("Unclosed parenthesis in expression.")

    # Insert implicit multiplication where standard mathematical syntax omits '*'
    out_parts = []
    for i, curr in enumerate(tokens):
        out_parts.append(curr.string)
        if i + 1 < len(tokens):
            nxt = tokens[i + 1]
            insert_star = False

            # Case 1: NUMBER followed by NAME (e.g. "2x" -> "2 * x")
            if curr.type == tokenize.NUMBER and nxt.type == tokenize.NAME:
                insert_star = True

            # Case 2: NUMBER followed by '(' (e.g. "2(x)" -> "2 * (x)")
            elif curr.type == tokenize.NUMBER and nxt.string == "(":
                insert_star = True

            # Case 3: ')' followed by '(' (e.g. "(a)(b)" -> "(a) * (b)")
            elif curr.string == ")" and nxt.string == "(":
                insert_star = True

            # Case 4: ')' followed by NAME (e.g. "(x)y" -> "(x) * y")
            elif curr.string == ")" and nxt.type == tokenize.NAME:
                insert_star = True

            # Case 5: ')' followed by NUMBER (e.g. "(x)2" -> "(x) * 2")
            elif curr.string == ")" and nxt.type == tokenize.NUMBER:
                insert_star = True

            # Case 6: NAME (not a function) followed by '(' (e.g. "x(y)" -> "x * (y)")
            elif curr.type == tokenize.NAME and curr.string not in fn_names and nxt.string == "(":
                insert_star = True

            # Case 7: NAME (not a function) followed by NAME (e.g. "x y" -> "x * y")
            elif curr.type == tokenize.NAME and nxt.type == tokenize.NAME and curr.string not in fn_names:
                insert_star = True

            if insert_star and not logic_mode:
                out_parts.append("*")

    return " ".join(out_parts)


def ast_to_sympy(
    node: ast.AST,
    allowed_symbols: Optional[Dict[str, Any]] = None,
    allow_free_symbols: bool = True,
    logic_mode: bool = False,
    approved_functions: Optional[Dict[str, Any]] = None,
) -> sp.Expr:
    """
    Recursively transforms a pre-validated Python AST into a SymPy expression object.
    Never calls eval(), exec(), or any Python code generation.

    Args:
        node (ast.AST): Root or sub-node of validated AST.
        allowed_symbols (Dict[str, Any], optional): Allowed symbol map.
        allow_free_symbols (bool): Whether unmapped names become new sp.Symbol instances.
        logic_mode (bool): Whether logic operator semantics apply.
        approved_functions (Dict[str, Any], optional): Approved function registry.

    Returns:
        sp.Expr: Constructed SymPy expression.

    Raises:
        SecurityError: If an unexpected or unauthorized node is encountered.
    """
    symbols = allowed_symbols or {}
    funcs = approved_functions if approved_functions is not None else ALLOWED_MATH_FUNCTIONS

    if isinstance(node, ast.Expression):
        return ast_to_sympy(
            node.body,
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )

    # Literals / Constants
    if isinstance(node, ast.Constant):
        val = node.value
        if isinstance(val, bool):
            return sp.true if val else sp.false
        elif isinstance(val, int):
            return sp.Integer(val)
        elif isinstance(val, float):
            return sp.Float(val)
        elif isinstance(val, complex):
            return sp.I * sp.Float(val.imag) + sp.Float(val.real)
        else:
            raise SecurityError(f"Unsupported constant type: {type(val).__name__}")

    # Identifiers / Variables / Constants
    if isinstance(node, ast.Name):
        var_name = node.id
        if var_name in symbols:
            return symbols[var_name]
        elif var_name in ALLOWED_CONSTANTS:
            return ALLOWED_CONSTANTS[var_name]
        elif allow_free_symbols:
            return sp.Symbol(var_name)
        else:
            raise SecurityError(f"Symbol '{var_name}' is not recognized or allowed in this context.")

    # Unary Operators
    if isinstance(node, ast.UnaryOp):
        operand = ast_to_sympy(
            node.operand,
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )
        if isinstance(node.op, ast.UAdd):
            return +operand
        elif isinstance(node.op, ast.USub):
            return -operand
        elif isinstance(node.op, ast.Invert):
            return sp.Not(operand) if logic_mode else ~operand
        elif isinstance(node.op, ast.Not):
            return sp.Not(operand)
        else:
            raise SecurityError(f"Unsupported unary operator: {type(node.op).__name__}")

    # Binary Operators
    if isinstance(node, ast.BinOp):
        left = ast_to_sympy(
            node.left,
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )
        right = ast_to_sympy(
            node.right,
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )

        if isinstance(node.op, ast.Add):
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            return left / right
        elif isinstance(node.op, ast.Pow):
            return left**right
        elif isinstance(node.op, ast.Mod):
            return left % right
        elif isinstance(node.op, ast.FloorDiv):
            # In logic mode, '//' represents NOR (from '↓')
            return sp.Nor(left, right) if logic_mode else (left // right)
        elif isinstance(node.op, ast.MatMult):
            # In logic mode, '@' represents NAND (from '↑')
            return sp.Nand(left, right) if logic_mode else (left @ right)
        elif isinstance(node.op, ast.BitAnd):
            return sp.And(left, right) if logic_mode else (left & right)
        elif isinstance(node.op, ast.BitOr):
            return sp.Or(left, right) if logic_mode else (left | right)
        elif isinstance(node.op, ast.BitXor):
            return sp.Xor(left, right) if logic_mode else (left ^ right)
        elif isinstance(node.op, ast.RShift):
            return sp.Implies(left, right) if logic_mode else (left >> right)
        else:
            raise SecurityError(f"Unsupported binary operator: {type(node.op).__name__}")

    # Comparisons (e.g. '==' in logic or equations)
    if isinstance(node, ast.Compare):
        if len(node.ops) != 1 or not isinstance(node.ops[0], ast.Eq):
            raise SecurityError("Only '==' equality comparisons are supported.")
        left = ast_to_sympy(
            node.left,
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )
        right = ast_to_sympy(
            node.comparators[0],
            allowed_symbols=symbols,
            allow_free_symbols=allow_free_symbols,
            logic_mode=logic_mode,
            approved_functions=funcs,
        )
        return sp.Equivalent(left, right) if logic_mode else sp.Eq(left, right)

    # Boolean Operations (and / or)
    if isinstance(node, ast.BoolOp):
        args = [
            ast_to_sympy(
                val,
                allowed_symbols=symbols,
                allow_free_symbols=allow_free_symbols,
                logic_mode=logic_mode,
                approved_functions=funcs,
            )
            for val in node.values
        ]
        if isinstance(node.op, ast.And):
            return sp.And(*args)
        elif isinstance(node.op, ast.Or):
            return sp.Or(*args)
        else:
            raise SecurityError(f"Unsupported boolean operator: {type(node.op).__name__}")

    # Function Calls
    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name):
            raise SecurityError("Function calls must be direct approved function names.")
        func_name = node.func.id
        if func_name not in funcs:
            raise SecurityError(f"Function '{func_name}' is not permitted.")

        fn_target = funcs[func_name]
        arg_exprs = [
            ast_to_sympy(
                arg,
                allowed_symbols=symbols,
                allow_free_symbols=allow_free_symbols,
                logic_mode=logic_mode,
                approved_functions=funcs,
            )
            for arg in node.args
        ]
        return fn_target(*arg_exprs)

    raise SecurityError(f"AST node construct '{type(node).__name__}' is not permitted.")


def parse_safe(
    expr_str: str,
    allowed_symbols: Optional[Dict[str, Any]] = None,
    allow_free_symbols: bool = True,
    logic_mode: bool = False,
    extra_functions: Optional[Dict[str, Any]] = None,
) -> sp.Expr:
    """
    Safely parses an untrusted mathematical or logical expression into a SymPy expression.

    Guarantees:
    - Zero Python eval() / exec() execution.
    - Strict allowlist of AST nodes, operations, and mathematical functions.
    - Rejection of attribute access, lambdas, comprehensions, imports, and dunder attributes.
    - Enforcement of defensive limits (length, depth, token count, AST node complexity).

    Args:
        expr_str (str): Input expression string.
        allowed_symbols (Dict[str, Any], optional): Pre-defined symbol dictionary (e.g. units or specific variables).
        allow_free_symbols (bool): If True, identifiers not in allowed_symbols are treated as sp.Symbol.
                                  If False, unknown identifiers raise a SecurityError.
        logic_mode (bool): If True, parses boolean logic with bitwise and logic operators.
        extra_functions (Dict[str, Any], optional): Additional safe functions to permit.

    Returns:
        sp.Expr: Validated SymPy expression.

    Raises:
        SecurityError: If unsafe syntax or code execution attempts are detected.
        ExpressionLimitError: If expression bounds are exceeded.
        InvalidExpressionError: If expression syntax is malformed.
    """
    known_fn_names = set(extra_functions.keys()) if extra_functions else None

    # Step 1: Preprocess string and tokenize with implicit multiplication
    preprocessed = preprocess_expression(
        expr_str,
        logic_mode=logic_mode,
        known_functions=known_fn_names,
    )

    # Step 2: Parse into Python AST in 'eval' mode
    try:
        tree = ast.parse(preprocessed, mode="eval")
    except SyntaxError as se:
        raise InvalidExpressionError(f"Syntax error in expression: {se.msg}")

    # Step 3: Strictly validate AST against security allowlist and complexity bounds
    validator = SafeExpressionValidator(
        extra_functions=extra_functions,
        allowed_symbols=allowed_symbols,
        allow_free_symbols=allow_free_symbols,
    )
    validator.visit(tree)

    # Step 4: Recursively transform validated AST directly into SymPy expression
    approved_funcs = validator.approved_functions
    return ast_to_sympy(
        tree.body,
        allowed_symbols=allowed_symbols,
        allow_free_symbols=allow_free_symbols,
        logic_mode=logic_mode,
        approved_functions=approved_funcs,
    )
