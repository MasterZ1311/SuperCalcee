/**
 * SuperCalcee Formula Pack Registry & Offline Archive Manager (Option B)
 * ======================================================================
 * 
 * Modular catalog of downloadable/installable formula packs covering:
 *  - Physics: Classical Mechanics, Thermodynamics, Electromagnetism, Optics & Modern Physics
 *  - Finance: Banking & Interest, Corporate Finance, Valuation & Investing
 *  - Math: 2D Geometry, 3D Geometry, Algebra & Trigonometry
 *  - Astrophysics: Stellar Astrophysics & Cosmology
 *  - Chemistry: Reaction Kinetics, Buffers & Solutions
 *  - Biology: Population Genetics & Human Physiology
 *  - Computer Science: Systems Architecture & Information Theory
 * 
 * Architecture (Option B - Offline Compressed Archives):
 *  - Master formula packages are archived as compressed .zip files with metadata manifests.
 *  - Unzipping occurs on-demand to persistent local application storage (AppData).
 *  - Users can uninstall packs to purge unzipped files and reclaim disk storage.
 *  - Works 100% offline without requiring internet access or remote servers.
 * 
 * @module data/packRegistry
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

/**
 * @typedef {Object} FormulaPackDefinition
 * @property {string} id - Unique identifier string (e.g. 'pack_physics_mech').
 * @property {string} title - Human readable display title.
 * @property {'Physics' | 'Accounts' | 'Math' | 'Astrophysics' | 'Chemistry' | 'Biology' | 'ComputerScience'} category - Domain category string.
 * @property {string} desc - Comprehensive description of covered topic areas.
 * @property {string} source - Attribution source (e.g. GeeksForGeeks, FinanceFormulas.net).
 * @property {number} count - Number of formulas contained in the pack.
 * @property {string} archiveFilename - Compressed archive filename (.zip).
 * @property {number} archiveSizeBytes - Compressed .zip size in bytes.
 * @property {number} uncompressedBytes - Extracted size in bytes.
 * @property {() => Promise<import('./presetFormulas').FormulaDefinition[]>} loadFormulas - Dynamic import loader fallback.
 */

/** @type {FormulaPackDefinition[]} Global catalog registry of modular formula packs */
export const FORMULA_PACKS = [
  // --- Physics Packs ---
  {
    id: 'pack_physics_mech',
    title: 'Physics: Classical Mechanics',
    category: 'Physics',
    desc: 'Kinematics, Newton Laws, Energy, Momentum, Torque, and Gravitation.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 25,
    archiveFilename: 'pack_physics_mech.zip',
    archiveSizeBytes: 1744,
    uncompressedBytes: 5963,
    loadFormulas: () => import('./formula_packs/physics_mechanics.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_thermo',
    title: 'Physics: Thermodynamics & Heat',
    category: 'Physics',
    desc: 'Ideal Gas Law, Specific Heat, Thermal Expansion, Carnot Efficiency, and First Law.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 20,
    archiveFilename: 'pack_physics_thermo.zip',
    archiveSizeBytes: 1666,
    uncompressedBytes: 4953,
    loadFormulas: () => import('./formula_packs/physics_thermo.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_electro',
    title: 'Physics: Electromagnetism & Circuits',
    category: 'Physics',
    desc: 'Coulomb Law, Electric Fields, Capacitors, Magnetic Force, and Transformer Ratio.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 22,
    archiveFilename: 'pack_physics_electro.zip',
    archiveSizeBytes: 1617,
    uncompressedBytes: 5385,
    loadFormulas: () => import('./formula_packs/physics_electro.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_optics',
    title: 'Physics: Optics & Modern Physics',
    category: 'Physics',
    desc: 'Snell Law, Lens Formula, De Broglie Wavelength, Photoelectric Effect, and Mass-Energy.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 20,
    archiveFilename: 'pack_physics_optics.zip',
    archiveSizeBytes: 1699,
    uncompressedBytes: 4945,
    loadFormulas: () => import('./formula_packs/physics_optics.json').then(m => m.default || m)
  },

  // --- Finance Packs ---
  {
    id: 'pack_finance_banking',
    title: 'Finance: Banking & Interest Rates',
    category: 'Accounts',
    desc: 'Compound Interest, Continuous Compounding, Effective Annual Rate, Rule of 72, and Simple Annuity.',
    source: 'FinanceFormulas.net & Corporate Finance Institute',
    count: 20,
    archiveFilename: 'pack_finance_banking.zip',
    archiveSizeBytes: 1525,
    uncompressedBytes: 5227,
    loadFormulas: () => import('./formula_packs/finance_banking.json').then(m => m.default || m)
  },
  {
    id: 'pack_finance_corp',
    title: 'Finance: Corporate Finance',
    category: 'Accounts',
    desc: 'WACC, Degree of Operating Leverage, Altman Z-Score, Free Cash Flow to Firm, and DuPont 3-Step.',
    source: 'Corporate Finance Institute & Damodaran Online',
    count: 20,
    archiveFilename: 'pack_finance_corp.zip',
    archiveSizeBytes: 1842,
    uncompressedBytes: 5561,
    loadFormulas: () => import('./formula_packs/finance_corporate.json').then(m => m.default || m)
  },
  {
    id: 'pack_finance_investing',
    title: 'Finance: Valuation & Investing Ratios',
    category: 'Accounts',
    desc: 'PEG Ratio, Gordon Growth Model, Enterprise Value, Sharpe Ratio, and Treynor Ratio.',
    source: 'Investopedia & Corporate Finance Institute',
    count: 22,
    archiveFilename: 'pack_finance_investing.zip',
    archiveSizeBytes: 1788,
    uncompressedBytes: 6017,
    loadFormulas: () => import('./formula_packs/finance_investing.json').then(m => m.default || m)
  },

  // --- Math Packs ---
  {
    id: 'pack_math_geom2d',
    title: 'Math: 2D Geometry (Areas & Perimeters)',
    category: 'Math',
    desc: 'Triangle, Circle, Trapezoid, Ellipse, Rhombus, Regular Polygon, and Parallelogram formulas.',
    source: 'GeeksForGeeks Geometry Formulas',
    count: 22,
    archiveFilename: 'pack_math_geom2d.zip',
    archiveSizeBytes: 1462,
    uncompressedBytes: 5130,
    loadFormulas: () => import('./formula_packs/math_geometry2d.json').then(m => m.default || m)
  },
  {
    id: 'pack_math_geom3d',
    title: 'Math: 3D Geometry (Volumes & Surface Areas)',
    category: 'Math',
    desc: 'Sphere, Cylinder, Cone, Rectangular Prism, Torus, Pyramid, and Ellipsoid formulas.',
    source: 'GeeksForGeeks Geometry Formulas',
    count: 22,
    archiveFilename: 'pack_math_geom3d.zip',
    archiveSizeBytes: 1337,
    uncompressedBytes: 5075,
    loadFormulas: () => import('./formula_packs/math_geometry3d.json').then(m => m.default || m)
  },
  {
    id: 'pack_math_algebra',
    title: 'Math: Algebra & Trigonometry',
    category: 'Math',
    desc: 'Quadratic Formula, Distance Formula, Logarithm Change of Base, Law of Cosines, and Combinations.',
    source: 'GeeksForGeeks Math Formulas',
    count: 22,
    archiveFilename: 'pack_math_algebra.zip',
    archiveSizeBytes: 1703,
    uncompressedBytes: 5667,
    loadFormulas: () => import('./formula_packs/math_algebra.json').then(m => m.default || m)
  },

  // --- Astrophysics Pack ---
  {
    id: 'pack_astro_stellar',
    title: 'Astrophysics: Stellar & Planetary Physics',
    category: 'Astrophysics',
    desc: 'Schwarzschild radius, Orbital velocity, Hubble law, Stefan-Boltzmann luminosity, and Jeans mass.',
    source: 'Carroll & Ostlie Intro to Modern Astrophysics',
    count: 20,
    archiveFilename: 'pack_astro_stellar.zip',
    archiveSizeBytes: 1758,
    uncompressedBytes: 5384,
    loadFormulas: () => import('./formula_packs/astro_stellar.json').then(m => m.default || m)
  },

  // --- Chemistry Pack ---
  {
    id: 'pack_chem_reactions',
    title: 'Chemistry: Reaction Kinetics & Solutions',
    category: 'Chemistry',
    desc: 'Arrhenius equation, Henderson-Hasselbalch, Beer-Lambert, Molarity, and Osmotic pressure.',
    source: 'IUPAC Gold Book & General Chemistry Compendium',
    count: 20,
    archiveFilename: 'pack_chem_reactions.zip',
    archiveSizeBytes: 1741,
    uncompressedBytes: 5223,
    loadFormulas: () => import('./formula_packs/chem_reactions.json').then(m => m.default || m)
  },

  // --- Biology Pack ---
  {
    id: 'pack_bio_population',
    title: 'Biology: Population Ecology & Physiology',
    category: 'Biology',
    desc: 'Exponential/Logistic growth, BMI, Cardiac Output, Fick diffusion, and Basal Metabolic Rate.',
    source: 'Campbell Biology & Medical Physiology Reference',
    count: 20,
    archiveFilename: 'pack_bio_population.zip',
    archiveSizeBytes: 1808,
    uncompressedBytes: 5280,
    loadFormulas: () => import('./formula_packs/bio_population.json').then(m => m.default || m)
  },

  // --- Computer Science Pack ---
  {
    id: 'pack_cs_systems',
    title: 'Computer Science: Architecture & Info Theory',
    category: 'ComputerScience',
    desc: 'CPU execution time, Shannon capacity, AMAT, RAM bandwidth, and Amdahl speedup law.',
    source: 'Patterson & Hennessy Computer Architecture',
    count: 22,
    archiveFilename: 'pack_cs_systems.zip',
    archiveSizeBytes: 1823,
    uncompressedBytes: 5783,
    loadFormulas: () => import('./formula_packs/cs_systems.json').then(m => m.default || m)
  }
];

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Fetches the live formula pack catalog from the local backend or Electron IPC.
 * @returns {Promise<Array<FormulaPackDefinition & { is_installed: boolean, installed_size_bytes: number }>>}
 */
export async function fetchPacksCatalog() {
  if (typeof window !== 'undefined' && window.electronAPI?.packs?.getPacks) {
    try {
      const res = await window.electronAPI.packs.getPacks();
      if (res?.success && Array.isArray(res.packs)) {
        return res.packs;
      }
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/packs`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.packs)) {
        return data.packs;
      }
    }
  } catch {
    // Fallback to static registry
  }

  return FORMULA_PACKS.map(p => ({
    ...p,
    archive_filename: p.archiveFilename,
    archive_size_bytes: p.archiveSizeBytes,
    is_installed: false,
    installed_size_bytes: 0
  }));
}

/**
 * Fetches storage metrics comparing compressed archives vs uncompressed active storage.
 * @returns {Promise<any>}
 */
export async function fetchStorageSummary() {
  if (typeof window !== 'undefined' && window.electronAPI?.packs?.getStorageSummary) {
    try {
      const res = await window.electronAPI.packs.getStorageSummary();
      if (res?.success) return res;
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/packs/storage-summary`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  const totalArchive = FORMULA_PACKS.reduce((sum, p) => sum + p.archiveSizeBytes, 0);
  return {
    success: true,
    total_packs_available: FORMULA_PACKS.length,
    installed_packs_count: 0,
    total_archive_size_bytes: totalArchive,
    total_installed_size_bytes: 0,
    reclaimable_space_bytes: 0,
    storage_mode: 'Offline Compressed Archives (Option B)'
  };
}

/**
 * Extracts and installs a compressed formula pack into persistent local storage (AppData).
 * @param {string} packId - Unique pack ID.
 * @returns {Promise<{ success: boolean, formulas: Array<any>, formula_count: number }>}
 */
export async function installPackArchive(packId) {
  if (typeof window !== 'undefined' && window.electronAPI?.packs?.installPack) {
    try {
      const res = await window.electronAPI.packs.installPack(packId);
      if (res?.success) return res;
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/packs/${encodeURIComponent(packId)}/install`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to static dynamic loader
  }

  const pack = FORMULA_PACKS.find(p => p.id === packId);
  if (pack && pack.loadFormulas) {
    const formulas = await pack.loadFormulas();
    return { success: true, pack_id: packId, formulas, formula_count: formulas.length };
  }

  throw new Error(`Failed to extract and install formula pack ${packId}`);
}

/**
 * Uninstalls an extracted formula pack from local storage (AppData) to reclaim disk space.
 * @param {string} packId - Unique pack ID.
 * @returns {Promise<{ success: boolean, freed_bytes: number }>}
 */
export async function uninstallPackArchive(packId) {
  if (typeof window !== 'undefined' && window.electronAPI?.packs?.uninstallPack) {
    try {
      const res = await window.electronAPI.packs.uninstallPack(packId);
      if (res?.success) return res;
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/packs/${encodeURIComponent(packId)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return { success: true, pack_id: packId, freed_bytes: 0 };
}

/**
 * Loads formulas for an array of pack IDs in parallel.
 * Tries local extracted storage first, then falls back to bundle loader.
 * @param {string[]} packIds - Array of pack IDs to load.
 * @returns {Promise<Record<string, import('./presetFormulas').FormulaDefinition[]>>}
 */
export async function loadMultiplePacks(packIds) {
  const result = {};
  const promises = packIds.map(async (id) => {
    // 1. Try fetching from installed AppData storage via API
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/packs/${encodeURIComponent(id)}/formulas`, {
        signal: AbortSignal.timeout(1000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.formulas)) {
          result[id] = data.formulas;
          return;
        }
      }
    } catch {
      // Fall through to dynamic import loader
    }

    // 2. Fallback to bundled pack loader
    const pack = FORMULA_PACKS.find(p => p.id === id);
    if (pack && pack.loadFormulas) {
      try {
        const formulas = await pack.loadFormulas();
        result[id] = formulas;
      } catch (err) {
        console.error(`Failed to load formula pack ${id}:`, err);
        result[id] = [];
      }
    }
  });
  await Promise.all(promises);
  return result;
}
