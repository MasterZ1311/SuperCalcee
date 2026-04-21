import sympy as sp

class BiologyEngine:
    def michaelis_menten(self, Vmax: float, Km: float, S: float) -> float:
        """
        v = (Vmax * [S]) / (Km + [S])
        """
        return (Vmax * S) / (Km + S)

    def hardy_weinberg(self, p: float = None, q: float = None):
        """
        p + q = 1
        p^2 + 2pq + q^2 = 1
        If p is given, returns q, p^2, 2pq, q^2
        If q is given, returns p, p^2, 2pq, q^2
        """
        if p is not None and q is None:
            q = 1 - p
        elif q is not None and p is None:
            p = 1 - q
        elif p is None and q is None:
            raise ValueError("Must provide either p or q")
        
        return {
            "p": p,
            "q": q,
            "p_squared (homozygous dominant)": p**2,
            "2pq (heterozygous)": 2 * p * q,
            "q_squared (homozygous recessive)": q**2
        }

bio_engine = BiologyEngine()
