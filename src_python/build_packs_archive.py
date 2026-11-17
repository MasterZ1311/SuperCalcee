"""
SuperCalcee Formula Pack Archive Generator
==========================================

Generates standard compressed .zip archives for all 14 domain-specific formula packs.
Each .zip archive contains:
  1. formulas.json - Array of verified formula definitions
  2. manifest.json - Package metadata including id, title, category, description,
                     formula count, version, and SHA256 integrity checksum.

Output Directories:
  - formula_packs_archive/ (Project root)
  - src_python/formula_packs_archive/ (Python backend bundle)
  - src_electron/public/formula_packs_archive/ (Frontend public/dist bundle)
"""

import hashlib
import json
import pathlib
import zipfile

# Mapping from pack_id to source filename and metadata
PACK_METADATA = [
    {
        "id": "pack_physics_mech",
        "file": "physics_mechanics.json",
        "title": "Physics: Classical Mechanics",
        "category": "Physics",
        "desc": "Kinematics, Newton Laws, Energy, Momentum, Torque, and Gravitation.",
        "source": "GeeksForGeeks Physics Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_physics_thermo",
        "file": "physics_thermo.json",
        "title": "Physics: Thermodynamics & Heat",
        "category": "Physics",
        "desc": "Ideal Gas Law, Specific Heat, Thermal Expansion, Carnot Efficiency, and First Law.",
        "source": "GeeksForGeeks Physics Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_physics_electro",
        "file": "physics_electro.json",
        "title": "Physics: Electromagnetism & Circuits",
        "category": "Physics",
        "desc": "Coulomb Law, Electric Fields, Capacitors, Magnetic Force, and Transformer Ratio.",
        "source": "GeeksForGeeks Physics Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_physics_optics",
        "file": "physics_optics.json",
        "title": "Physics: Optics & Modern Physics",
        "category": "Physics",
        "desc": "Snell Law, Lens Formula, De Broglie Wavelength, Photoelectric Effect, and Mass-Energy.",
        "source": "GeeksForGeeks Physics Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_finance_banking",
        "file": "finance_banking.json",
        "title": "Finance: Banking & Interest Rates",
        "category": "Accounts",
        "desc": "Compound Interest, Continuous Compounding, Effective Annual Rate, Rule of 72, and Simple Annuity.",
        "source": "FinanceFormulas.net & Corporate Finance Institute",
        "version": "1.0.0",
    },
    {
        "id": "pack_finance_corp",
        "file": "finance_corporate.json",
        "title": "Finance: Corporate Finance",
        "category": "Accounts",
        "desc": "WACC, Degree of Operating Leverage, Altman Z-Score, Free Cash Flow to Firm, and DuPont 3-Step.",
        "source": "Corporate Finance Institute & Damodaran Online",
        "version": "1.0.0",
    },
    {
        "id": "pack_finance_investing",
        "file": "finance_investing.json",
        "title": "Finance: Valuation & Investing Ratios",
        "category": "Accounts",
        "desc": "PEG Ratio, Gordon Growth Model, Enterprise Value, Sharpe Ratio, and Treynor Ratio.",
        "source": "Investopedia & Corporate Finance Institute",
        "version": "1.0.0",
    },
    {
        "id": "pack_math_geom2d",
        "file": "math_geometry2d.json",
        "title": "Math: 2D Geometry (Areas & Perimeters)",
        "category": "Math",
        "desc": "Triangle, Circle, Trapezoid, Ellipse, Rhombus, Regular Polygon, and Parallelogram formulas.",
        "source": "GeeksForGeeks Geometry Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_math_geom3d",
        "file": "math_geometry3d.json",
        "title": "Math: 3D Geometry (Volumes & Surface Areas)",
        "category": "Math",
        "desc": "Sphere, Cylinder, Cone, Rectangular Prism, Torus, Pyramid, and Ellipsoid formulas.",
        "source": "GeeksForGeeks Geometry Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_math_algebra",
        "file": "math_algebra.json",
        "title": "Math: Algebra & Trigonometry",
        "category": "Math",
        "desc": "Quadratic Formula, Distance Formula, Logarithm Change of Base, Law of Cosines, and Combinations.",
        "source": "GeeksForGeeks Math Formulas",
        "version": "1.0.0",
    },
    {
        "id": "pack_astro_stellar",
        "file": "astro_stellar.json",
        "title": "Astrophysics: Stellar & Planetary Physics",
        "category": "Astrophysics",
        "desc": "Schwarzschild radius, Orbital velocity, Hubble law, Stefan-Boltzmann luminosity, and Jeans mass.",
        "source": "Carroll & Ostlie Intro to Modern Astrophysics",
        "version": "1.0.0",
    },
    {
        "id": "pack_chem_reactions",
        "file": "chem_reactions.json",
        "title": "Chemistry: Reaction Kinetics & Solutions",
        "category": "Chemistry",
        "desc": "Arrhenius equation, Henderson-Hasselbalch, Beer-Lambert, Molarity, and Osmotic pressure.",
        "source": "IUPAC Gold Book & General Chemistry Compendium",
        "version": "1.0.0",
    },
    {
        "id": "pack_bio_population",
        "file": "bio_population.json",
        "title": "Biology: Population Ecology & Physiology",
        "category": "Biology",
        "desc": "Exponential/Logistic growth, BMI, Cardiac Output, Fick diffusion, and Basal Metabolic Rate.",
        "source": "Campbell Biology & Medical Physiology Reference",
        "version": "1.0.0",
    },
    {
        "id": "pack_cs_systems",
        "file": "cs_systems.json",
        "title": "Computer Science: Architecture & Info Theory",
        "category": "ComputerScience",
        "desc": "CPU execution time, Shannon capacity, AMAT, RAM bandwidth, and Amdahl speedup law.",
        "source": "Patterson & Hennessy Computer Architecture",
        "version": "1.0.0",
    },
]


def build_archives() -> None:
    base_dir = pathlib.Path(__file__).resolve().parent.parent
    src_packs_dir = base_dir / "src_electron" / "src" / "data" / "formula_packs"

    target_dirs = [
        base_dir / "formula_packs_archive",
        base_dir / "src_python" / "formula_packs_archive",
        base_dir / "src_electron" / "public" / "formula_packs_archive",
    ]

    for d in target_dirs:
        d.mkdir(parents=True, exist_ok=True)

    print(f"Building archives from: {src_packs_dir}")
    print(f"Output targets: {len(target_dirs)} directories")

    manifest_catalog = []

    for item in PACK_METADATA:
        json_path = src_packs_dir / item["file"]
        if not json_path.exists():
            raise FileNotFoundError(f"Source JSON not found: {json_path}")

        raw_bytes = json_path.read_bytes()
        formulas = json.loads(raw_bytes.decode("utf-8"))
        checksum = hashlib.sha256(raw_bytes).hexdigest()

        manifest = {
            "id": item["id"],
            "title": item["title"],
            "category": item["category"],
            "description": item["desc"],
            "source": item["source"],
            "version": item["version"],
            "formula_count": len(formulas),
            "sha256": checksum,
            "archive_filename": f"{item['id']}.zip",
            "uncompressed_bytes": len(raw_bytes),
        }

        manifest_catalog.append(manifest)

        # Build .zip in memory
        zip_filename = f"{item['id']}.zip"

        for target_dir in target_dirs:
            zip_dest = target_dir / zip_filename
            with zipfile.ZipFile(zip_dest, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
                # Store formulas.json
                zf.writestr("formulas.json", raw_bytes)
                # Store manifest.json
                zf.writestr("manifest.json", json.dumps(manifest, indent=2))

            zip_size = zip_dest.stat().st_size
            ratio = (zip_size / len(raw_bytes)) * 100
            print(
                f"  [ZIP] {zip_filename:26s} | {len(raw_bytes):5d}B -> {zip_size:4d}B ({ratio:4.1f}%) -> {target_dir.name}"
            )

    # Also write a master catalog index.json into each archive directory
    for target_dir in target_dirs:
        catalog_path = target_dir / "catalog.json"
        catalog_path.write_text(json.dumps(manifest_catalog, indent=2), encoding="utf-8")
        print(f"  [CATALOG] Generated {catalog_path}")

    print("\n[SUCCESS] All 14 formula pack zip archives generated successfully!")


if __name__ == "__main__":
    build_archives()
