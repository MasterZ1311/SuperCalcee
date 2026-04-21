import sympy.physics.units as u
from sympy.physics.units import convert_to
from sympy.parsing.sympy_parser import parse_expr

class DimensionalEngine:
    def __init__(self):
        self.unit_namespace = {
            dir_name: getattr(u, dir_name)
            for dir_name in dir(u)
            if not dir_name.startswith('_')
        }
        
    def evaluate_with_units(self, expr_str: str):
        """Evaluate an expression containing units."""
        # Need to parse expression carefully with unit symbols context
        expr = parse_expr(expr_str, local_dict=self.unit_namespace)
        return expr

    def convert_units(self, expr_str: str, target_unit_str: str):
        """Convert expr to target units."""
        expr = self.evaluate_with_units(expr_str)
        target = self.evaluate_with_units(target_unit_str)
        
        # Verify valid dimensions using get_dimensional_expr or similar
        # SymPy units can be tricky; let's use the simplest version
        try:
            return convert_to(expr, target)
        except Exception as e:
            raise ValueError(f"Conversion failed. Possibly dimension mismatch. Error: {e}")

dim_engine = DimensionalEngine()
