"""
Edge case and extreme boundary tests across mathematical parsing and evaluation.
"""

import math

import pytest

from src_python.cas.symbolic_engine import CASEngine
from src_python.constants.loader import ConstantsDatabase
from src_python.parser.ast_parser import LogicParser


class TestExtremeFloatsAndNumbers:
    """Tests extreme IEEE 754 floating point values and numerical limits."""

    def test_extreme_float_overflow(self, cas: CASEngine):
        """Values near 1e308 should not cause unhandled crashes."""
        res = cas.simplify("1e308 + 1e308")
        assert res is not None

    def test_extreme_float_underflow(self, cas: CASEngine):
        """Values near 1e-308 should evaluate to zero or tiny float."""
        res = cas.simplify("1e-308 / 1e10")
        assert res is not None

    def test_constants_db_known_and_unknown(self, constants_db: ConstantsDatabase):
        """Constants retrieval bounds."""
        c = constants_db.get_value("c")
        assert c == 299792458
        with pytest.raises(KeyError):
            constants_db.get_value("non_existent_constant")


class TestLogicParserGlyphsAndEdgeCases:
    """Tests formal logic operator glyph translation and edge cases in ast_parser.py."""

    def test_logic_conjunction_and_disjunction(self, logic: LogicParser):
        """Unicode AND (∧) and OR (∨) simplification."""
        # A ∧ (A ∨ B) -> A
        res = logic.simplify("A ∧ (A ∨ B)")
        assert res == "A"

    def test_logic_implication(self, logic: LogicParser):
        """Unicode implication (→) translates to (>>)."""
        # A → B is equivalent to ~A | B
        parsed = logic.parse("A → B")
        assert parsed is not None

    def test_logic_equivalence(self, logic: LogicParser):
        """Unicode equivalence (↔) translates to (==)."""
        parsed = logic.parse("A ↔ B")
        assert parsed is not None

    def test_logic_xor(self, logic: LogicParser):
        """Unicode XOR (⊕) translates to (^)."""
        parsed = logic.parse("A ⊕ B")
        assert parsed is not None

    def test_logic_nand_glyph(self, logic: LogicParser):
        """
        Unicode NAND (↑) expansion.
        NOTE: In baseline ast_parser.py, ↑ is replaced with ' ~& ' which causes SyntaxError.
        This test checks whether the glyph can be parsed.
        """
        # A ↑ B represents ~(A & B)
        parsed = logic.parse("A ↑ B")
        assert parsed is not None

    def test_logic_nor_glyph(self, logic: LogicParser):
        """
        Unicode NOR (↓) expansion.
        NOTE: In baseline ast_parser.py, ↓ is replaced with ' ~| ' which causes SyntaxError.
        This test checks whether the glyph can be parsed.
        """
        # A ↓ B represents ~(A | B)
        parsed = logic.parse("A ↓ B")
        assert parsed is not None

    def test_logic_evaluate_truth_table(self, logic: LogicParser):
        """Evaluating truth values for Boolean AST."""
        val = logic.evaluate("A & B", {"A": True, "B": False})
        assert val is False
        val2 = logic.evaluate("A | B", {"A": True, "B": False})
        assert val2 is True


class TestParenthesesAndEmptyInputs:
    """Tests deeply nested structures and malformed inputs."""

    def test_deeply_nested_parentheses(self, cas: CASEngine):
        """50 levels of nested parentheses."""
        expr = "(" * 50 + "x + 1" + ")" * 50
        res = cas.simplify(expr)
        assert res == "x + 1"

    def test_cas_empty_and_whitespace(self, cas: CASEngine):
        """Empty and whitespace strings should fail cleanly."""
        with pytest.raises(Exception):
            cas.parse("")
        with pytest.raises(Exception):
            cas.parse("   \t\n  ")
