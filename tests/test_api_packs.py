"""
Integration Tests for Formula Pack API Endpoints (Option B)
===========================================================

Verifies REST endpoints:
  - GET /api/v1/packs
  - GET /api/v1/packs/storage-summary
  - POST /api/v1/packs/{pack_id}/install
  - DELETE /api/v1/packs/{pack_id}
  - GET /api/v1/packs/{pack_id}/formulas
"""

import pytest
from fastapi.testclient import TestClient

from src_python.api import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    test_storage = tmp_path / "test_api_installed_packs"
    test_storage.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("SUPERCALCEE_STORAGE_DIR", str(test_storage))
    return TestClient(app)


def test_api_list_packs(client):
    response = client.get("/api/v1/packs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["packs"]) == 14
    assert any(p["id"] == "pack_physics_mech" for p in data["packs"])


def test_api_storage_summary(client):
    response = client.get("/api/v1/packs/storage-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_packs_available"] == 14
    assert "reclaimable_space_bytes" in data


def test_api_pack_install_and_uninstall_lifecycle(client):
    pack_id = "pack_physics_thermo"

    # Install pack
    install_res = client.post(f"/api/v1/packs/{pack_id}/install")
    assert install_res.status_code == 200
    install_data = install_res.json()
    assert install_data["success"] is True
    assert install_data["pack_id"] == pack_id
    assert install_data["formula_count"] == 20

    # Fetch formulas
    fetch_res = client.get(f"/api/v1/packs/{pack_id}/formulas")
    assert fetch_res.status_code == 200
    fetch_data = fetch_res.json()
    assert fetch_data["success"] is True
    assert len(fetch_data["formulas"]) == 20

    # Verify list shows installed
    list_res = client.get("/api/v1/packs")
    packs = list_res.json()["packs"]
    installed = [p for p in packs if p["id"] == pack_id][0]
    assert installed["is_installed"] is True
    assert installed["installed_size_bytes"] > 0

    # Uninstall pack
    uninst_res = client.delete(f"/api/v1/packs/{pack_id}")
    assert uninst_res.status_code == 200
    uninst_data = uninst_res.json()
    assert uninst_data["success"] is True
    assert uninst_data["freed_bytes"] > 0

    # Fetch formulas after uninstall should 404
    fetch_after = client.get(f"/api/v1/packs/{pack_id}/formulas")
    assert fetch_after.status_code == 404


def test_api_install_invalid_pack_404(client):
    res = client.post("/api/v1/packs/pack_non_existent/install")
    assert res.status_code == 404
