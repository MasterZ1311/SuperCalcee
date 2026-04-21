import sympy as sp
from scipy.optimize import fsolve

class FormulaEngine:
    def __init__(self):
        pass

    def algebraic_solve(self, eq_str: str, variable_to_solve: str, given_values: dict) -> float:
        """
        Symbolically solves the equation for the target variable, 
        then substitutes the given values.
        """
        if "=" in eq_str:
            lhs, rhs = eq_str.split("=")
            eq = sp.Eq(sp.parse_expr(lhs), sp.parse_expr(rhs))
        else:
            eq = sp.parse_expr(eq_str) # Assumed to equal 0
            
        target = sp.Symbol(variable_to_solve)
        
        # Substitute all given values
        subs_dict = {sp.Symbol(k): v for k, v in given_values.items()}
        eq_subbed = eq.subs(subs_dict)
        
        # Solve for target
        solutions = sp.solve(eq_subbed, target)
        if not solutions:
            raise ValueError(f"Could not solve {eq_str} for {variable_to_solve}")
        
        # Return the first real solution if multiple exist
        for sol in solutions:
            if sol.is_real:
                return float(sol)
                
        return float(solutions[0]) # Fallback

    def numeric_solve(self, func, initial_guess: float) -> float:
        """
        Uses scipy fsolve for complex root-finding (like IRR).
        """
        result = fsolve(func, initial_guess)
        return result[0]

formula_engine = FormulaEngine()
