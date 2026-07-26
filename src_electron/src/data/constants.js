/**
 * SuperCalcee Physical & Mathematical Constants Registry
 * =======================================================
 * 
 * Standard CODATA physical constants, astronomical figures, and fundamental 
 * mathematical constants categorized for UI insertion and computation.
 * 
 * @module data/constants
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

/**
 * @typedef {Object} ConstantDefinition
 * @property {string} name - Human readable name of the constant.
 * @property {string} symbol - Variable symbol used in mathematical formulas.
 * @property {number} value - SI numerical value.
 * @property {string} [unit] - Standard SI unit string.
 * @property {string} desc - Description explaining physical or mathematical significance.
 */

/** @type {Record<string, ConstantDefinition[]>} Categorized database of physical and mathematical constants */
export const CONSTANTS = {
  Math: [
    { name: 'Pi', symbol: 'pi', value: Math.PI, desc: "Ratio of a circle's circumference to its diameter" },
    { name: "Euler's Number", symbol: 'e', value: Math.E, desc: 'Base of the natural logarithm' },
    { name: 'Golden Ratio', symbol: 'phi', value: 1.618033988749895, desc: 'Golden ratio (Phi)' },
    { name: 'Square Root of 2', symbol: 'sqrt2', value: Math.SQRT2, desc: 'Pythagoras constant √2' },
  ],
  Physics: [
    { name: 'Speed of Light', symbol: 'c', value: 299792458, unit: 'm/s', desc: 'Exact speed of light in vacuum' },
    { name: 'Gravitational Constant', symbol: 'G', value: 6.67430e-11, unit: 'm³/kg·s²', desc: 'Newtonian constant of gravitation' },
    { name: 'Standard Gravity', symbol: 'g', value: 9.80665, unit: 'm/s²', desc: 'Earth standard acceleration due to gravity' },
    { name: 'Planck Constant', symbol: 'h', value: 6.62607015e-34, unit: 'J·s', desc: 'Fundamental quantum action constant' },
    { name: 'Boltzmann Constant', symbol: 'k', value: 1.380649e-23, unit: 'J/K', desc: 'Thermodynamic energy-temperature relation' },
    { name: 'Avogadro Constant', symbol: 'NA', value: 6.02214076e23, unit: '1/mol', desc: 'Number of constituent particles in one mole' },
    { name: 'Electron Mass', symbol: 'me', value: 9.1093837015e-31, unit: 'kg', desc: 'Rest mass of an electron' },
    { name: 'Proton Mass', symbol: 'mp', value: 1.67262192369e-27, unit: 'kg', desc: 'Rest mass of a proton' },
    { name: 'Elementary Charge', symbol: 'q', value: 1.602176634e-19, unit: 'C', desc: 'Electric charge carried by a single proton' },
    { name: 'Vacuum Permittivity', symbol: 'e0', value: 8.8541878128e-12, unit: 'F/m', desc: 'Electric constant / vacuum permittivity' },
    { name: 'Vacuum Permeability', symbol: 'u0', value: 1.25663706212e-6, unit: 'N/A²', desc: 'Magnetic constant / vacuum permeability' },
    { name: 'Ideal Gas Constant', symbol: 'R', value: 8.314462618, unit: 'J/(mol·K)', desc: 'Universal gas constant' },
    { name: 'Stefan-Boltzmann Constant', symbol: 'sigma', value: 5.670374419e-8, unit: 'W/(m²·K⁴)', desc: 'Blackbody radiation constant' },
  ],
  Finance: [
    { name: 'Days in Year', symbol: 'days', value: 365, desc: 'Standard days in a calendar year' },
    { name: 'Months in Year', symbol: 'months', value: 12, desc: 'Standard months in a year' },
    { name: 'Average Inflation Rate', symbol: 'inf', value: 0.03, desc: 'Benchmark historical average inflation rate (3%)' },
  ]
};
