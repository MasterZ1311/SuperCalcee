/**
 * SuperCalcee Formula Pack Registry
 * =================================
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
 * Packs utilize lazy-loading imports to preserve minimal baseline memory and storage footprint.
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
 * @property {() => Promise<import('./presetFormulas').FormulaDefinition[]>} loadFormulas - Dynamic import loader.
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
    count: 14,
    loadFormulas: () => import('./formula_packs/physics_mechanics.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_thermo',
    title: 'Physics: Thermodynamics & Heat',
    category: 'Physics',
    desc: 'Ideal Gas Law, Specific Heat, Thermal Expansion, Carnot Efficiency, and First Law.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 6,
    loadFormulas: () => import('./formula_packs/physics_thermo.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_electro',
    title: 'Physics: Electromagnetism & Circuits',
    category: 'Physics',
    desc: 'Coulomb Law, Electric Fields, Capacitors, Magnetic Force, and Transformer Ratio.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 8,
    loadFormulas: () => import('./formula_packs/physics_electro.json').then(m => m.default || m)
  },
  {
    id: 'pack_physics_optics',
    title: 'Physics: Optics & Modern Physics',
    category: 'Physics',
    desc: 'Snell Law, Lens Formula, Photon Energy, de Broglie Wavelength, and Mass-Energy.',
    source: 'GeeksForGeeks Physics Formulas',
    count: 6,
    loadFormulas: () => import('./formula_packs/physics_optics.json').then(m => m.default || m)
  },

  // --- Finance Packs ---
  {
    id: 'pack_finance_banking',
    title: 'Finance: Banking & Interest Rates',
    category: 'Accounts',
    desc: 'Simple/Compound Interest, APY, Continuous Compounding, Rule of 72, Loan EMI, and Balance.',
    source: 'FinanceFormulas.net',
    count: 7,
    loadFormulas: () => import('./formula_packs/finance_banking.json').then(m => m.default || m)
  },
  {
    id: 'pack_finance_corp',
    title: 'Finance: Corporate Finance',
    category: 'Accounts',
    desc: 'WACC, CAPM, Net Present Value (NPV), Working Capital, DOL, and Break-Even.',
    source: 'FinanceFormulas.net',
    count: 6,
    loadFormulas: () => import('./formula_packs/finance_corporate.json').then(m => m.default || m)
  },
  {
    id: 'pack_finance_investing',
    title: 'Finance: Valuation & Investing Ratios',
    category: 'Accounts',
    desc: 'P/E Ratio, P/B Ratio, Dividend Yield, Gordon Growth, ROE, ROA, and Sharpe Ratio.',
    source: 'FinanceFormulas.net',
    count: 8,
    loadFormulas: () => import('./formula_packs/finance_investing.json').then(m => m.default || m)
  },

  // --- Math Packs ---
  {
    id: 'pack_math_geom2d',
    title: 'Math: 2D Geometry (Areas & Perimeters)',
    category: 'Math',
    desc: 'Rectangle, Triangle (Heron Formula), Parallelogram, Trapezoid, Rhombus, Circle, and Ellipse.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: 10,
    loadFormulas: () => import('./formula_packs/math_geometry2d.json').then(m => m.default || m)
  },
  {
    id: 'pack_math_geom3d',
    title: 'Math: 3D Geometry (Volumes & Surface Areas)',
    category: 'Math',
    desc: 'Cube, Rectangular Prism (Cuboid), Cylinder, Cone, Sphere, and Torus.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: 11,
    loadFormulas: () => import('./formula_packs/math_geometry3d.json').then(m => m.default || m)
  },
  {
    id: 'pack_math_algebra',
    title: 'Math: Algebra & Trigonometry',
    category: 'Math',
    desc: 'Quadratic Roots, Arithmetic & Geometric Progression Sums, Sine Law, and Cosine Law.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: 8,
    loadFormulas: () => import('./formula_packs/math_algebra.json').then(m => m.default || m)
  },

  // --- Astrophysics Pack ---
  {
    id: 'pack_astro_stellar',
    title: 'Astrophysics: Stellar & Planetary Physics',
    category: 'Astrophysics',
    desc: 'Escape velocity, Orbital speed, Hubble expansion, Wien displacement, and Stellar luminosity.',
    source: 'NASA Astrophysics & OpenStax Astronomy',
    count: 8,
    loadFormulas: () => import('./formula_packs/astro_stellar.json').then(m => m.default || m)
  },

  // --- Chemistry Pack ---
  {
    id: 'pack_chem_reactions',
    title: 'Chemistry: Reaction Kinetics & Solutions',
    category: 'Chemistry',
    desc: 'Arrhenius equation, Henderson-Hasselbalch, Beer-Lambert, Molarity, and Osmotic pressure.',
    source: 'IUPAC Gold Book & General Chemistry Compendium',
    count: 8,
    loadFormulas: () => import('./formula_packs/chem_reactions.json').then(m => m.default || m)
  },

  // --- Biology Pack ---
  {
    id: 'pack_bio_population',
    title: 'Biology: Population Ecology & Physiology',
    category: 'Biology',
    desc: 'Exponential/Logistic growth, BMI, Cardiac Output, Fick diffusion, and Basal Metabolic Rate.',
    source: 'Campbell Biology & Medical Physiology Reference',
    count: 8,
    loadFormulas: () => import('./formula_packs/bio_population.json').then(m => m.default || m)
  },

  // --- Computer Science Pack ---
  {
    id: 'pack_cs_systems',
    title: 'Computer Science: Architecture & Info Theory',
    category: 'ComputerScience',
    desc: 'CPU execution time, Shannon capacity, AMAT, RAM bandwidth, and Amdahl speedup law.',
    source: 'Patterson & Hennessy Computer Architecture',
    count: 8,
    loadFormulas: () => import('./formula_packs/cs_systems.json').then(m => m.default || m)
  }
];

/**
 * Loads formulas for an array of pack IDs in parallel.
 * @param {string[]} packIds - Array of pack IDs to load.
 * @returns {Promise<Record<string, import('./presetFormulas').FormulaDefinition[]>>}
 */
export async function loadMultiplePacks(packIds) {
  const result = {};
  const promises = packIds.map(async (id) => {
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
