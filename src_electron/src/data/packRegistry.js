/**
 * SuperCalcee Formula Pack Registry
 * =================================
 * 
 * Central registry importing modular formula JSON packs (Mechanics, Thermo, Electro, Optics,
 * Banking, Corporate, Investing, 2D Geometry, 3D Geometry, Algebra) and mapping metadata.
 * 
 * @module data/packRegistry
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import physicsMechanics from './formula_packs/physics_mechanics.json';
import physicsThermo from './formula_packs/physics_thermo.json';
import physicsElectro from './formula_packs/physics_electro.json';
import physicsOptics from './formula_packs/physics_optics.json';
import financeBanking from './formula_packs/finance_banking.json';
import financeCorporate from './formula_packs/finance_corporate.json';
import financeInvesting from './formula_packs/finance_investing.json';
import mathGeometry2d from './formula_packs/math_geometry2d.json';
import mathGeometry3d from './formula_packs/math_geometry3d.json';
import mathAlgebra from './formula_packs/math_algebra.json';

/**
 * @typedef {Object} FormulaPackDefinition
 * @property {string} id - Unique identifier string (e.g. 'pack_physics_mech').
 * @property {string} title - Human readable display title.
 * @property {'Physics' | 'Accounts' | 'Math'} category - Domain category string.
 * @property {string} desc - Comprehensive description of covered topic areas.
 * @property {string} source - Attribution source (e.g., GeeksForGeeks, FinanceFormulas.net).
 * @property {number} count - Number of formulas contained in the pack.
 * @property {import('./presetFormulas').FormulaDefinition[]} formulas - Array of formula definitions.
 */

/** @type {FormulaPackDefinition[]} Global catalog registry of downloadable formula packs */
export const FORMULA_PACKS = [
  {
    id: 'pack_physics_mech',
    title: 'Physics: Classical Mechanics',
    category: 'Physics',
    desc: 'Kinematics, Newton Laws, Energy, Momentum, Torque, and Gravitation.',
    source: 'GeeksForGeeks Physics Formulas',
    count: physicsMechanics.length,
    formulas: physicsMechanics
  },
  {
    id: 'pack_physics_thermo',
    title: 'Physics: Thermodynamics & Heat',
    category: 'Physics',
    desc: 'Ideal Gas Law, Specific Heat, Thermal Expansion, Carnot Efficiency, and First Law.',
    source: 'GeeksForGeeks Physics Formulas',
    count: physicsThermo.length,
    formulas: physicsThermo
  },
  {
    id: 'pack_physics_electro',
    title: 'Physics: Electromagnetism & Circuits',
    category: 'Physics',
    desc: 'Coulomb Law, Electric Fields, Capacitors, Magnetic Force, and Transformer Ratio.',
    source: 'GeeksForGeeks Physics Formulas',
    count: physicsElectro.length,
    formulas: physicsElectro
  },
  {
    id: 'pack_physics_optics',
    title: 'Physics: Optics & Modern Physics',
    category: 'Physics',
    desc: 'Snell Law, Lens Formula, Photon Energy, de Broglie Wavelength, and Mass-Energy.',
    source: 'GeeksForGeeks Physics Formulas',
    count: physicsOptics.length,
    formulas: physicsOptics
  },
  {
    id: 'pack_finance_banking',
    title: 'Finance: Banking & Interest Rates',
    category: 'Accounts',
    desc: 'Simple/Compound Interest, APY, Continuous Compounding, Rule of 72, Loan EMI, and Balance.',
    source: 'FinanceFormulas.net',
    count: financeBanking.length,
    formulas: financeBanking
  },
  {
    id: 'pack_finance_corp',
    title: 'Finance: Corporate Finance',
    category: 'Accounts',
    desc: 'WACC, CAPM, Net Present Value (NPV), Working Capital, DOL, and Break-Even.',
    source: 'FinanceFormulas.net',
    count: financeCorporate.length,
    formulas: financeCorporate
  },
  {
    id: 'pack_finance_investing',
    title: 'Finance: Valuation & Investing Ratios',
    category: 'Accounts',
    desc: 'P/E Ratio, P/B Ratio, Dividend Yield, Gordon Growth, ROE, ROA, and Sharpe Ratio.',
    source: 'FinanceFormulas.net',
    count: financeInvesting.length,
    formulas: financeInvesting
  },
  {
    id: 'pack_math_geom2d',
    title: 'Math: 2D Geometry (Areas & Perimeters)',
    category: 'Math',
    desc: 'Rectangle, Triangle (Heron Formula), Parallelogram, Trapezoid, Rhombus, Circle, and Ellipse.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: mathGeometry2d.length,
    formulas: mathGeometry2d
  },
  {
    id: 'pack_math_geom3d',
    title: 'Math: 3D Geometry (Volumes & Surface Areas)',
    category: 'Math',
    desc: 'Cube, Rectangular Prism (Cuboid), Cylinder, Cone, Sphere, and Torus.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: mathGeometry3d.length,
    formulas: mathGeometry3d
  },
  {
    id: 'pack_math_algebra',
    title: 'Math: Algebra & Trigonometry',
    category: 'Math',
    desc: 'Quadratic Roots, Arithmetic & Geometric Progression Sums, Sine Law, and Cosine Law.',
    source: 'GeeksForGeeks Basic Geometry Formulas',
    count: mathAlgebra.length,
    formulas: mathAlgebra
  }
];
