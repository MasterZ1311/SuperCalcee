"""
Dimensional Analysis & Unit Conversion Engine
==============================================

Leverages SymPy's physical units module (`sympy.physics.units`) to parse expressions
with explicit units and convert quantities between compatible dimensions.

Supported Quantities:
    - Length (meter, kilometer, foot, inch, mile, etc.)
    - Mass (gram, kilogram, pound, etc.)
    - Time (second, minute, hour, day, etc.)
    - Energy (joule, calorie, electronvolt, kWh, etc.)
    - Force, Pressure, Velocity, Frequency, Voltage, and more.

Author: SuperCalcee Core Team
License: MIT
"""

from typing import Any

import sympy.physics.units as u
from sympy.physics.units import convert_to
from sympy.physics.units.systems.si import SI

from src_python.security import parse_safe


class DimensionalEngine:
    """
    Handles physical unit parsing and dimensional unit conversion
    using safe expression parsing and dimensional compatibility validation.
    """

    def __init__(self) -> None:
        """
        Populates a local namespace dictionary mapping standard unit symbols
        from `sympy.physics.units` for seamless expression parsing.
        """
        self.unit_namespace = {dir_name: getattr(u, dir_name) for dir_name in dir(u) if not dir_name.startswith("_")}

    def evaluate_with_units(self, expr_str: str) -> Any:
        """
        Parses an expression string containing unit symbols into a physical quantity object.
        Rejects unknown unit symbols and arbitrary expressions.

        Args:
            expr_str (str): Mathematical expression with units (e.g., "5 * meter / second").

        Returns:
            Any: SymPy unit-bound expression instance.

        Raises:
            ValueError: If the expression contains invalid syntax or unknown unit symbols.
        """
        try:
            expr = parse_safe(
                expr_str,
                allowed_symbols=self.unit_namespace,
                allow_free_symbols=False,
            )
            return expr
        except Exception as e:
            raise ValueError(f"Failed to parse unit expression '{expr_str}': {e}")

    def convert_units(self, expr_str: str, target_unit_str: str) -> Any:
        """
        Converts a physical quantity from its current units to target compatible units.
        Validates dimensional compatibility before conversion.

        Args:
            expr_str (str): Source quantity expression (e.g., "100 * kilometer / hour").
            target_unit_str (str): Target unit expression (e.g., "meter / second").

        Returns:
            Any: Converted physical quantity SymPy expression.

        Raises:
            ValueError: If conversion fails due to dimensional mismatch or parsing errors.

        Example:
            >>> dim_engine = DimensionalEngine()
            >>> dim_engine.convert_units("1 * kilometer", "meter")
            1000*meter
        """
        expr = self.evaluate_with_units(expr_str)
        target = self.evaluate_with_units(target_unit_str)

        # Validate dimensional compatibility using SI system
        dim_expr = SI.get_dimensional_expr(expr)
        dim_target = SI.get_dimensional_expr(target)
        if dim_expr != dim_target:
            raise ValueError(
                f"Unit conversion failed from '{expr_str}' to '{target_unit_str}'. "
                f"Incompatible dimensions: cannot convert '{dim_expr}' to '{dim_target}'."
            )

        try:
            return convert_to(expr, target)
        except Exception as e:
            raise ValueError(
                f"Unit conversion failed from '{expr_str}' to '{target_unit_str}'. "
                f"Possible dimensional mismatch. Error: {e}"
            )


# Global singleton instance for unit operations
dim_engine = DimensionalEngine()
