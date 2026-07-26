"""
Logic & AST Parsing Module
==========================

Provides Boolean logic parsing, logic gate replacement (AND, OR, XOR, NOT, IMPLIES, EQUIV, NAND, NOR),
truth evaluation, and boolean simplification (CNF/DNF).
"""

from src_python.parser.ast_parser import LogicParser, logic_parser, parse_equation

__all__ = ["LogicParser", "logic_parser", "parse_equation"]
