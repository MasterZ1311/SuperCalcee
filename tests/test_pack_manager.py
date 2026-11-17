"""
Unit Tests for Formula Pack Storage & Lifecycle Manager (Option B)
==================================================================

Verifies:
  1. Discovery and integrity of all 14 compressed .zip archives.
  2. Installation and extraction into isolated local storage (AppData).
  3. Formula content validation and parsing.
  4. Uninstallation and storage reclamation.
  5. Accurate storage metrics and summaries.
"""

import os
import pathlib

import pytest

from src_python import pack_manager as pm


@pytest.fixture
def temp_storage(tmp_path, monkeypatch):
    """Isolates pack storage to a clean temporary directory for testing."""
    test_storage = tmp_path / "test_installed_packs"
    test_storage.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("SUPERCALCEE_STORAGE_DIR", str(test_storage))
    return test_storage


def test_list_packs_discovers_all_14_archives():
    packs = pm.list_packs()
    assert len(packs) == 14

    for p in packs:
        assert p["id"].startswith("pack_")
        assert p["archive_filename"].endswith(".zip")
        assert p["archive_size_bytes"] > 0
        assert p["formula_count"] > 0
        assert p["category"] in [
            "Physics",
            "Accounts",
            "Math",
            "Astrophysics",
            "Chemistry",
            "Biology",
            "ComputerScience",
        ]


def test_storage_summary_initial(temp_storage):
    summary = pm.get_storage_summary()
    assert summary["total_packs_available"] == 14
    assert summary["installed_packs_count"] == 0
    assert summary["total_archive_size_bytes"] > 10000
    assert summary["total_installed_size_bytes"] == 0
    assert summary["storage_mode"] == "Offline Compressed Archives (Option B)"


def test_install_pack_lifecycle(temp_storage):
    pack_id = "pack_physics_mech"

    # Install mechanics pack
    res = pm.install_pack(pack_id)
    assert res["success"] is True
    assert res["pack_id"] == pack_id
    assert res["formula_count"] == 25
    assert len(res["formulas"]) == 25
    assert res["installed_size_bytes"] > 0

    # Verify extracted directory on disk
    target_dir = temp_storage / pack_id
    assert target_dir.exists()
    assert (target_dir / "formulas.json").exists()
    assert (target_dir / "manifest.json").exists()
    assert (target_dir / "install_info.json").exists()

    # Query installed status
    packs = pm.list_packs()
    installed = [p for p in packs if p["id"] == pack_id][0]
    assert installed["is_installed"] is True
    assert installed["installed_size_bytes"] > 0

    # Query installed formulas
    formulas = pm.get_installed_formulas(pack_id)
    assert len(formulas) == 25
    assert any(f["id"] == "mech_newton_second" for f in formulas)

    # Uninstall pack
    uninst = pm.uninstall_pack(pack_id)
    assert uninst["success"] is True
    assert uninst["freed_bytes"] > 0
    assert not target_dir.exists()

    # Verify status after uninstall
    packs_after = pm.list_packs()
    uninstalled = [p for p in packs_after if p["id"] == pack_id][0]
    assert uninstalled["is_installed"] is False
    assert uninstalled["installed_size_bytes"] == 0


def test_install_nonexistent_pack_raises_error(temp_storage):
    with pytest.raises(FileNotFoundError):
        pm.install_pack("pack_non_existent_domain_xyz")


def test_get_formulas_for_uninstalled_pack_raises_error(temp_storage):
    with pytest.raises(FileNotFoundError):
        pm.get_installed_formulas("pack_physics_optics")


def test_uninstall_uninstalled_pack_is_idempotent(temp_storage):
    res = pm.uninstall_pack("pack_cs_systems")
    assert res["success"] is True
    assert res["freed_bytes"] == 0
