"""
SuperCalcee Formula Pack Storage & Lifecycle Manager
===================================================

Implements offline-first, on-demand compressed archive package management (Option B):
  - Pre-packaged formula packs are archived as compressed .zip files.
  - When the user installs/enables a pack, it is extracted on-demand into local storage:
      Windows: %APPDATA%/SuperCalcee/installed_packs/<pack_id>/
      POSIX:   ~/.config/SuperCalcee/installed_packs/<pack_id>/
      Override: SUPERCALCEE_STORAGE_DIR environment variable
  - When the user uninstalls a pack, its extracted files are purged from disk,
    reclaiming storage space while keeping the compressed archive available for future offline use.
  - Verification & integrity checks ensure formulas are not corrupted during extraction.

Author: SuperCalcee Open Source Team
License: MIT
"""

import json
import os
import pathlib
import shutil
import sys
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List


def get_archive_dir() -> pathlib.Path:
    """
    Locates the formula pack archives directory across development and production layouts.
    """
    base_dir = pathlib.Path(__file__).resolve().parent

    candidates = [
        base_dir / "formula_packs_archive",
        base_dir.parent / "formula_packs_archive",
        base_dir.parent / "src_electron" / "public" / "formula_packs_archive",
    ]

    # In packaged electron environment
    if "resources" in sys.path or os.environ.get("RESOURCES_PATH"):
        res = pathlib.Path(os.environ.get("RESOURCES_PATH", ""))
        candidates.extend([res / "formula_packs_archive", res / "src_python" / "formula_packs_archive"])

    for c in candidates:
        if c.exists() and (c / "catalog.json").exists():
            return c

    # Fallback to first existing directory or default
    for c in candidates:
        if c.exists():
            return c

    return candidates[0]


def get_storage_dir() -> pathlib.Path:
    """
    Returns the target local storage directory where extracted packs reside.
    Honors SUPERCALCEE_STORAGE_DIR environment variable for custom paths or automated testing.
    """
    custom = os.environ.get("SUPERCALCEE_STORAGE_DIR")
    if custom:
        path = pathlib.Path(custom).resolve()
        path.mkdir(parents=True, exist_ok=True)
        return path

    if sys.platform == "win32":
        app_data = os.environ.get("APPDATA")
        if app_data:
            base = pathlib.Path(app_data) / "SuperCalcee" / "installed_packs"
        else:
            base = pathlib.Path.home() / "AppData" / "Roaming" / "SuperCalcee" / "installed_packs"
    else:
        base = pathlib.Path.home() / ".config" / "SuperCalcee" / "installed_packs"

    base.mkdir(parents=True, exist_ok=True)
    return base


def _dir_size(path: pathlib.Path) -> int:
    """Calculates recursive size in bytes of a directory."""
    if not path.exists():
        return 0
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            p = pathlib.Path(root) / f
            try:
                total += p.stat().st_size
            except OSError:
                pass
    return total


def list_packs() -> List[Dict[str, Any]]:
    """
    Lists all available formula packs, combining archive metadata with local AppData installation status.
    """
    archive_dir = get_archive_dir()
    storage_dir = get_storage_dir()

    catalog_file = archive_dir / "catalog.json"
    catalog_entries: List[Dict[str, Any]] = []

    if catalog_file.exists():
        try:
            catalog_entries = json.loads(catalog_file.read_text(encoding="utf-8"))
        except Exception:
            catalog_entries = []

    # Map catalog entries by ID
    catalog_map = {item["id"]: item for item in catalog_entries}

    # Discover any .zip files in the archive dir
    zip_files = list(archive_dir.glob("*.zip"))
    results = []

    for z in sorted(zip_files):
        pack_id = z.stem
        meta = catalog_map.get(pack_id, {})

        installed_dir = storage_dir / pack_id
        is_installed = (installed_dir / "formulas.json").exists()

        installed_size = _dir_size(installed_dir) if is_installed else 0
        installed_at = None

        if is_installed:
            info_file = installed_dir / "install_info.json"
            if info_file.exists():
                try:
                    info_data = json.loads(info_file.read_text(encoding="utf-8"))
                    installed_at = info_data.get("installed_at")
                except Exception:
                    pass

        results.append(
            {
                "id": pack_id,
                "title": meta.get("title", pack_id.replace("_", " ").title()),
                "category": meta.get("category", "General"),
                "description": meta.get("description", ""),
                "source": meta.get("source", "SuperCalcee Formula Library"),
                "version": meta.get("version", "1.0.0"),
                "formula_count": meta.get("formula_count", 0),
                "archive_filename": z.name,
                "archive_size_bytes": z.stat().st_size,
                "uncompressed_bytes": meta.get("uncompressed_bytes", installed_size),
                "is_installed": is_installed,
                "installed_size_bytes": installed_size,
                "installed_path": str(installed_dir) if is_installed else None,
                "installed_at": installed_at,
            }
        )

    return results


def install_pack(pack_id: str) -> Dict[str, Any]:
    """
    Extracts a compressed .zip pack into the persistent storage directory (AppData).
    Validates formulas.json and returns extracted formulas.
    """
    archive_dir = get_archive_dir()
    storage_dir = get_storage_dir()

    zip_path = archive_dir / f"{pack_id}.zip"
    if not zip_path.exists():
        raise FileNotFoundError(f"Compressed archive not found for pack: {pack_id} at {zip_path}")

    target_dir = storage_dir / pack_id
    target_dir.mkdir(parents=True, exist_ok=True)

    # Extract zip archive
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(target_dir)

    formulas_file = target_dir / "formulas.json"
    if not formulas_file.exists():
        shutil.rmtree(target_dir, ignore_errors=True)
        raise ValueError(f"Extracted pack {pack_id} is missing required formulas.json")

    try:
        raw_text = formulas_file.read_text(encoding="utf-8")
        formulas = json.loads(raw_text)
        if not isinstance(formulas, list):
            raise ValueError("formulas.json must contain a JSON array of formula objects")
    except Exception as e:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise ValueError(f"Failed to parse formulas.json in pack {pack_id}: {str(e)}")

    # Write install receipt
    receipt = {
        "pack_id": pack_id,
        "installed_at": datetime.now(timezone.utc).isoformat(),
        "formula_count": len(formulas),
        "source_archive": str(zip_path),
        "bytes_installed": _dir_size(target_dir),
    }
    (target_dir / "install_info.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")

    return {
        "success": True,
        "pack_id": pack_id,
        "formula_count": len(formulas),
        "formulas": formulas,
        "installed_size_bytes": receipt["bytes_installed"],
        "storage_path": str(target_dir),
    }


def uninstall_pack(pack_id: str) -> Dict[str, Any]:
    """
    Deletes an installed pack from local storage (AppData) to reclaim disk space.
    The compressed .zip in the archive remains intact for future offline installations.
    """
    storage_dir = get_storage_dir()
    target_dir = storage_dir / pack_id

    if not target_dir.exists():
        return {"success": True, "pack_id": pack_id, "message": "Pack was not currently installed", "freed_bytes": 0}

    freed = _dir_size(target_dir)
    shutil.rmtree(target_dir, ignore_errors=True)

    return {
        "success": True,
        "pack_id": pack_id,
        "freed_bytes": freed,
        "message": f"Pack {pack_id} successfully uninstalled. Reclaimed {freed} bytes.",
    }


def get_installed_formulas(pack_id: str) -> List[Dict[str, Any]]:
    """
    Reads formula definitions from an installed pack in AppData.
    """
    storage_dir = get_storage_dir()
    target_dir = storage_dir / pack_id
    formulas_file = target_dir / "formulas.json"

    if not formulas_file.exists():
        raise FileNotFoundError(f"Pack {pack_id} is not installed in local storage ({target_dir})")

    return json.loads(formulas_file.read_text(encoding="utf-8"))


def get_all_installed_formulas() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retrieves all formulas across all currently installed packs, keyed by pack_id.
    """
    storage_dir = get_storage_dir()
    result: Dict[str, List[Dict[str, Any]]] = {}

    if not storage_dir.exists():
        return result

    for d in storage_dir.iterdir():
        if d.is_dir():
            f = d / "formulas.json"
            if f.exists():
                try:
                    result[d.name] = json.loads(f.read_text(encoding="utf-8"))
                except Exception:
                    pass

    return result


def get_storage_summary() -> Dict[str, Any]:
    """
    Returns aggregate storage metrics comparing compressed archives vs uncompressed active storage.
    """
    packs = list_packs()
    archive_dir = get_archive_dir()
    storage_dir = get_storage_dir()

    total_archive_size = sum(p["archive_size_bytes"] for p in packs)
    installed_packs = [p for p in packs if p["is_installed"]]
    total_installed_size = sum(p["installed_size_bytes"] for p in installed_packs)
    total_uncompressed_estimate = sum(p["uncompressed_bytes"] for p in packs)

    return {
        "total_packs_available": len(packs),
        "installed_packs_count": len(installed_packs),
        "total_archive_size_bytes": total_archive_size,
        "total_installed_size_bytes": total_installed_size,
        "total_uncompressed_estimate_bytes": total_uncompressed_estimate,
        "reclaimable_space_bytes": total_installed_size,
        "storage_mode": "Offline Compressed Archives (Option B)",
        "archive_directory": str(archive_dir),
        "storage_directory": str(storage_dir),
    }
