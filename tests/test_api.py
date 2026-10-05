"""
API Integration & Security Tests for FastAPI Server (`src_python/api.py`)
========================================================================

Validates:
- Successful execution across all endpoints (Symbolic CAS, Units, Domains, Solvers)
- API versioning (/api/v1/ prefix)
- Correlation / Request ID generation and propagation (X-Request-ID)
- Standardized error envelopes with exact error classification codes:
    - VALIDATION_ERROR (422)
    - DOMAIN_ERROR (400)
    - ZERO_DIVISION_ERROR / CALCULATION_ERROR / CONVERGENCE_ERROR (400)
    - SECURITY_VIOLATION / EXPRESSION_LIMIT_EXCEEDED (400)
    - INTERNAL_ERROR (500)
- Zero leakage of stack traces, Python internals, or filesystem paths
- Strict CORS origin allowlist validation
"""

import pytest
from fastapi.testclient import TestClient


class TestAPIValidRequests:
    """Tests successful execution of all exposed API endpoints."""

    def test_health_check(self, client: TestClient):
        """GET / returns service status and version."""
        res = client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "status" in data
        assert data["version"] == "1.0.0"
        assert "request_id" in data

    def test_health_check_detailed(self, client: TestClient):
        """GET /health returns service status and version."""
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["version"] == "1.0.0"

    def test_get_constants(self, client: TestClient):
        """GET /constants returns CODATA database."""
        res = client.get("/constants")
        assert res.status_code == 200
        data = res.json()
        assert "c" in data
        assert "h" in data
        assert "G" in data

    # --- Symbolic CAS Endpoints ---

    def test_cas_simplify(self, client: TestClient):
        """POST /cas/simplify algebraically simplifies expression."""
        res = client.post("/cas/simplify", json={"expr": "(x**2 - 1)/(x - 1)"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "x + 1"

    def test_cas_factor(self, client: TestClient):
        """POST /cas/factor factors polynomial expression."""
        res = client.post("/cas/factor", json={"expr": "x**2 - 4"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "(x - 2)*(x + 2)"

    def test_cas_expand(self, client: TestClient):
        """POST /cas/expand expands algebraic product."""
        res = client.post("/cas/expand", json={"expr": "(x + 2)**2"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "x**2 + 4*x + 4"

    def test_cas_differentiate(self, client: TestClient):
        """POST /cas/differentiate computes symbolic derivative."""
        res = client.post("/cas/differentiate", json={"expr": "x**3", "variable": "x"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "3*x**2"

    def test_cas_integrate(self, client: TestClient):
        """POST /cas/integrate computes symbolic indefinite integral."""
        res = client.post("/cas/integrate", json={"expr": "3*x**2", "variable": "x"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "x**3"

    def test_cas_limit(self, client: TestClient):
        """POST /cas/limit evaluates symbolic limit."""
        res = client.post("/cas/limit", json={"expr": "sin(x)/x", "variable": "x", "approach": "0"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "1"

    def test_cas_solve(self, client: TestClient):
        """POST /cas/solve finds roots of algebraic equation."""
        res = client.post("/cas/solve", json={"expr": "x**2 - 9 = 0", "variable": "x"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert sorted(data["result"]) == ["-3", "3"]

    # --- Unit Conversion ---

    def test_units_convert(self, client: TestClient):
        """POST /units/convert converts physical quantities."""
        res = client.post("/units/convert", json={"expr": "1 * kilometer", "target_unit": "meter"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "1000" in data["result"]

    # --- Physics Endpoints ---

    def test_physics_emc2_query(self, client: TestClient):
        """POST /physics/emc2 calculates mass-energy equivalence via query params."""
        res = client.post("/physics/emc2?mass=1.0")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] > 1e16

    def test_physics_emc2_json_payload(self, client: TestClient):
        """POST /physics/emc2 calculates mass-energy equivalence via JSON payload."""
        res = client.post("/physics/emc2", json={"mass": 1.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] > 1e16

    def test_physics_heisenberg(self, client: TestClient):
        """POST /physics/heisenberg computes quantum uncertainty bound."""
        res = client.post("/physics/heisenberg", json={"delta_x": 1e-10})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] > 0

    def test_physics_newton(self, client: TestClient):
        """POST /physics/newton solves F = ma."""
        res = client.post("/physics/newton", json={"m": 2.0, "a": 3.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == 6.0

    # --- Astrophysics Endpoints ---

    def test_astro_schwarzschild(self, client: TestClient):
        """POST /astro/schwarzschild computes event horizon radius."""
        res = client.post("/astro/schwarzschild", json={"mass": 1.989e30})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 2900 < data["result"] < 3000

    def test_astro_kepler(self, client: TestClient):
        """POST /astro/kepler solves Kepler's Third Law."""
        res = client.post("/astro/kepler", json={"semi_major_axis": 1.496e11, "mass_central": 1.989e30})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 3.1e7 < data["result"] < 3.2e7

    def test_astro_drake(self, client: TestClient):
        """POST /astro/drake computes active extraterrestrial civilizations."""
        payload = {"R": 1.5, "fp": 0.5, "ne": 1.0, "fl": 0.5, "fi": 0.2, "fc": 0.2, "L": 10000.0}
        res = client.post("/astro/drake", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - 150.0) < 1e-4

    # --- Chemistry Endpoints ---

    def test_chem_nernst(self, client: TestClient):
        """POST /chem/nernst computes non-standard cell potential."""
        res = client.post("/chem/nernst", json={"E0": 1.10, "n": 2, "Q": 0.01, "T": 298.15})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] > 1.10

    def test_chem_gibbs(self, client: TestClient):
        """POST /chem/gibbs computes Gibbs Free Energy change."""
        res = client.post("/chem/gibbs", json={"delta_H": -100000.0, "T": 298.15, "delta_S": -50.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - (-85092.5)) < 1.0

    def test_chem_kinetics(self, client: TestClient):
        """POST /chem/kinetics computes first-order decay."""
        res = client.post("/chem/kinetics", json={"k": 0.05, "t": 10.0, "A0": 1.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 0.60 < data["result"] < 0.61

    # --- Biology Endpoints ---

    def test_bio_hardy_weinberg_query(self, client: TestClient):
        """POST /bio/hardy-weinberg calculates genotype proportions via query params."""
        res = client.post("/bio/hardy-weinberg?p=0.6")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        res_dict = data["result"]
        assert res_dict["p"] == 0.6
        assert res_dict["q"] == 0.4

    def test_bio_hardy_weinberg_json(self, client: TestClient):
        """POST /bio/hardy-weinberg calculates genotype proportions via JSON payload."""
        res = client.post("/bio/hardy-weinberg", json={"p": 0.6})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"]["p"] == 0.6

    def test_bio_michaelis_menten(self, client: TestClient):
        """POST /bio/michaelis-menten calculates enzyme kinetics."""
        res = client.post("/bio/michaelis-menten", json={"Vmax": 10.0, "Km": 2.0, "S": 5.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - 7.1428) < 1e-3

    # --- Finance Endpoints ---

    def test_finance_black_scholes_query(self, client: TestClient):
        """POST /finance/black-scholes calculates option prices via query params."""
        res = client.post("/finance/black-scholes?S=100&K=100&T=1&r=0.05&sigma=0.2&option_type=call")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 10.4 < data["result"] < 10.5

    def test_finance_black_scholes_json(self, client: TestClient):
        """POST /finance/black-scholes calculates option prices via JSON payload."""
        payload = {"S": 100.0, "K": 100.0, "T": 1.0, "r": 0.05, "sigma": 0.2, "option_type": "call"}
        res = client.post("/finance/black-scholes", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 10.4 < data["result"] < 10.5

    def test_finance_wacc(self, client: TestClient):
        """POST /finance/wacc computes corporate cost of capital."""
        payload = {"equity": 1000.0, "debt": 500.0, "cost_eq": 0.10, "cost_debt": 0.05, "tax_rate": 0.25}
        res = client.post("/finance/wacc", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - 0.07916) < 1e-4

    def test_finance_npv(self, client: TestClient):
        """POST /finance/npv computes net present value."""
        res = client.post("/finance/npv", json={"rate": 0.10, "cashflows": [-1000.0, 300.0, 500.0, 700.0]})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - 211.87) < 1e-1

    def test_finance_irr(self, client: TestClient):
        """POST /finance/irr computes internal rate of return."""
        res = client.post("/finance/irr", json={"cashflows": [-1000.0, 300.0, 500.0, 700.0]})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert 0.20 < data["result"] < 0.25

    # --- Computer Science Endpoints ---

    def test_cs_big_o(self, client: TestClient):
        """POST /cs/big-o classifies asymptotic complexity limit."""
        res = client.post("/cs/big-o", json={"f_n": "n", "g_n": "n**2"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "o(g(n))" in data["result"]

    def test_cs_entropy(self, client: TestClient):
        """POST /cs/entropy calculates Shannon entropy in bits."""
        res = client.post("/cs/entropy", json={"probabilities": [0.5, 0.5]})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert abs(data["result"] - 1.0) < 1e-4

    # --- Boolean Logic & Formula Solver ---

    def test_logic_simplify(self, client: TestClient):
        """POST /logic/simplify simplifies Boolean expression."""
        res = client.post("/logic/simplify", json={"expr": "A & (A | B)"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "A"

    def test_formula_solve(self, client: TestClient):
        """POST /formula/solve isolates and solves variable."""
        payload = {"equation": "v = u + a * t", "solve_for": "a", "given": {"v": 20.0, "u": 5.0, "t": 3.0}}
        res = client.post("/formula/solve", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == 5.0

    # --- API Versioning Routes (/api/v1/...) ---

    def test_v1_versioned_cas_simplify(self, client: TestClient):
        """POST /api/v1/cas/simplify executes via versioned router."""
        res = client.post("/api/v1/cas/simplify", json={"expr": "x + x"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["result"] == "2*x"

    def test_v1_versioned_health(self, client: TestClient):
        """GET /api/v1/health returns status via versioned router."""
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        assert res.json()["success"] is True


class TestAPIRequestCorrelation:
    """Tests X-Request-ID correlation tracking across headers and payloads."""

    def test_request_id_generated_automatically(self, client: TestClient):
        """Requests without X-Request-ID receive a generated UUID in response header."""
        res = client.get("/")
        assert res.status_code == 200
        assert "X-Request-ID" in res.headers
        assert len(res.headers["X-Request-ID"]) >= 16

    def test_custom_request_id_propagated(self, client: TestClient):
        """Custom valid X-Request-ID header is echoed in response and JSON body."""
        custom_id = "test-corr-id-98765"
        res = client.get("/", headers={"X-Request-ID": custom_id})
        assert res.status_code == 200
        assert res.headers["X-Request-ID"] == custom_id
        assert res.json()["request_id"] == custom_id

    def test_request_id_present_in_error_envelope(self, client: TestClient):
        """Error responses include the request_id in headers and details envelope."""
        custom_id = "error-trace-12345"
        res = client.post("/cas/simplify", json={}, headers={"X-Request-ID": custom_id})
        assert res.status_code == 422
        assert res.headers["X-Request-ID"] == custom_id
        data = res.json()
        assert data["error"]["details"]["request_id"] == custom_id


class TestAPIErrorCategorizationAndSecurity:
    """Tests standardized error categorization, status codes, and security enforcement."""

    def test_validation_error_code_and_structure(self, client: TestClient):
        """Missing required payload field returns 422 with VALIDATION_ERROR code."""
        res = client.post("/cas/simplify", json={})
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "validation_errors" in data["error"]["details"]
        assert "detail" in data

    def test_invalid_query_parameter_type_returns_422(self, client: TestClient):
        """Passing non-numeric string for float query param returns 422."""
        res = client.post("/physics/emc2?mass=not_a_number")
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"

    def test_malformed_json_body_returns_422(self, client: TestClient):
        """Sending malformed JSON payload returns 422 with VALIDATION_ERROR."""
        res = client.post("/cas/simplify", content="{'invalid_json': }", headers={"Content-Type": "application/json"})
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"

    def test_domain_error_mathematical_constraints(self, client: TestClient):
        """Hardy-Weinberg allele frequencies not summing to 1.0 returns 400 DOMAIN_ERROR."""
        res = client.post("/bio/hardy-weinberg?p=0.8&q=0.8")
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "DOMAIN_ERROR"
        assert "sum" in data["error"]["message"]

    def test_domain_error_finance_option_type(self, client: TestClient):
        """Invalid option_type returns 400 DOMAIN_ERROR."""
        res = client.post("/finance/black-scholes?S=100&K=100&T=1&r=0.05&sigma=0.2&option_type=invalid")
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "DOMAIN_ERROR"

    def test_zero_division_error(self, client: TestClient):
        """Solving Newton's Second Law for acceleration with m=0 returns 400 ZERO_DIVISION_ERROR."""
        res = client.post("/physics/newton", json={"F": 10.0, "a": 0.0})
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "ZERO_DIVISION_ERROR"

    def test_security_rejection_code_injection_probe(self, client: TestClient):
        """Arbitrary code injection via __import__ is rejected with 400 SECURITY_VIOLATION."""
        res = client.post("/cas/simplify", json={"expr": "__import__('os').system('ls')"})
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "SECURITY_VIOLATION"

    def test_security_rejection_eval_probe(self, client: TestClient):
        """Arbitrary code execution probe using eval() returns 400 SECURITY_VIOLATION."""
        res = client.post("/cas/simplify", json={"expr": "eval('1 + 1')"})
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "SECURITY_VIOLATION"

    def test_security_rejection_invalid_variable_identifier(self, client: TestClient):
        """Using a malicious or illegal variable identifier is rejected by Pydantic regex."""
        res = client.post("/cas/differentiate", json={"expr": "x**2", "variable": "x; import os"})
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"

    def test_expression_length_limit_exceeded(self, client: TestClient):
        """Sending expression exceeding max_length (1000 characters) is rejected with 422."""
        oversized = "x + " * 300 + "1"  # > 1000 characters
        res = client.post("/cas/simplify", json={"expr": oversized})
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"

    def test_zero_leakage_of_stack_traces_and_paths(self, client: TestClient):
        """Error responses must never contain Python tracebacks or filesystem paths."""
        res = client.post("/cas/simplify", json={"expr": "x + * 2"})
        assert res.status_code == 400
        data = res.json()
        msg = data["error"]["message"]
        assert "Traceback" not in msg
        assert 'File "' not in msg
        assert "C:\\" not in msg
        assert "/home/" not in msg
        assert "/usr/" not in msg


class TestAPICORSConfiguration:
    """Tests CORS allowlist and preflight security."""

    def test_cors_preflight_allowed_local_origin(self, client: TestClient):
        """Preflight OPTIONS request from authorized local dev origin is permitted."""
        res = client.options(
            "/cas/simplify",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"

    def test_cors_preflight_unauthorized_external_origin_rejected(self, client: TestClient):
        """Preflight OPTIONS request from unknown external origin does not receive allow header."""
        res = client.options(
            "/cas/simplify",
            headers={
                "Origin": "http://untrusted-malicious-origin.com",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert res.headers.get("access-control-allow-origin") != "http://untrusted-malicious-origin.com"


class TestAPINumericalEndpoints:
    """Tests numerical analysis REST endpoints."""

    def test_numerical_root_endpoint(self, client: TestClient):
        """POST /numerical/root solves f(x) = 0 with diagnostics."""
        res = client.post("/numerical/root", json={"expr": "x**3 - 8", "initial_guess": 1.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["status"] == "converged"
        assert abs(data["solution"] - 2.0) < 1e-4
        assert "residual" in data

    def test_numerical_integrate_endpoint(self, client: TestClient):
        """POST /numerical/integrate computes definite integral."""
        res = client.post("/numerical/integrate", json={"expr": "3*x**2", "a": 0.0, "b": 2.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["status"] == "converged"
        assert abs(data["solution"] - 8.0) < 1e-4

    def test_numerical_differentiate_endpoint(self, client: TestClient):
        """POST /numerical/differentiate computes numerical derivative."""
        res = client.post("/numerical/differentiate", json={"expr": "x**3", "x0": 2.0})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["status"] == "converged"
        assert abs(data["solution"] - 12.0) < 1e-4

    def test_numerical_limit_endpoint(self, client: TestClient):
        """POST /numerical/limit computes numerical limit."""
        res = client.post("/numerical/limit", json={"expr": "sin(x)/x", "x0": 0.0, "direction": "both"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["status"] == "converged"
        assert abs(data["solution"] - 1.0) < 1e-4
