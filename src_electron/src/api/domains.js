/**
 * SuperCalcee Scientific, Financial & Domain API Module
 * ======================================================
 * 
 * Provides client methods for specialized scientific domain calculations:
 *  - Physics (Einstein, Heisenberg, Newton)
 *  - Astrophysics (Schwarzschild, Kepler, Drake)
 *  - Chemistry (Nernst, Gibbs, Kinetics)
 *  - Biology (Hardy-Weinberg, Michaelis-Menten)
 *  - Finance (Black-Scholes, WACC, NPV, IRR)
 *  - Computer Science (Big-O limit, Shannon Entropy)
 *  - Dimensional Unit Conversion
 *  - Multi-variable Formula Algebraic Isolation
 *  - Verified Numerical Solvers (Roots, Quadrature, Derivatives, Limits)
 * 
 * @module api/domains
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import { apiClient } from './client.js';

// --- Physics ---

export const physics = {
  emc2: (data, options = {}) => apiClient.post('/physics/emc2', data, options),
  heisenberg: (data, options = {}) => apiClient.post('/physics/heisenberg', data, options),
  newton: (data, options = {}) => apiClient.post('/physics/newton', data, options),
};

// --- Astrophysics ---

export const astrophysics = {
  schwarzschild: (mass, options = {}) => apiClient.post('/astro/schwarzschild', { mass }, options),
  kepler: (data, options = {}) => apiClient.post('/astro/kepler', data, options),
  drake: (data, options = {}) => apiClient.post('/astro/drake', data, options),
};

// --- Chemistry ---

export const chemistry = {
  nernst: (data, options = {}) => apiClient.post('/chem/nernst', data, options),
  gibbs: (data, options = {}) => apiClient.post('/chem/gibbs', data, options),
  kinetics: (data, options = {}) => apiClient.post('/chem/kinetics', data, options),
};

// --- Biology ---

export const biology = {
  hardyWeinberg: (data, options = {}) => apiClient.post('/bio/hardy-weinberg', data, options),
  michaelisMenten: (data, options = {}) => apiClient.post('/bio/michaelis-menten', data, options),
};

// --- Finance ---

export const finance = {
  blackScholes: (data, options = {}) => apiClient.post('/finance/black-scholes', data, options),
  wacc: (data, options = {}) => apiClient.post('/finance/wacc', data, options),
  npv: (data, options = {}) => apiClient.post('/finance/npv', data, options),
  irr: (data, options = {}) => apiClient.post('/finance/irr', data, options),
};

// --- Computer Science ---

export const computerScience = {
  bigO: (f_n, g_n, options = {}) => apiClient.post('/cs/big-o', { f_n, g_n }, options),
  entropy: (probabilities, options = {}) => apiClient.post('/cs/entropy', { probabilities }, options),
};

// --- Unit Conversion ---

export const units = {
  convert: (expr, target_unit, options = {}) => apiClient.post('/units/convert', { expr, target_unit }, options),
};

// --- Formula Engine ---

export const formulaEngine = {
  solve: (equation, solve_for, given, options = {}) => apiClient.post('/formula/solve', { equation, solve_for, given }, options),
};

// --- Logic ---

export const logic = {
  simplify: (expr, options = {}) => apiClient.post('/logic/simplify', { expr }, options),
};

// --- Numerical Solvers ---

export const numerical = {
  root: (data, options = {}) => apiClient.post('/numerical/root', data, options),
  integrate: (data, options = {}) => apiClient.post('/numerical/integrate', data, options),
  differentiate: (data, options = {}) => apiClient.post('/numerical/differentiate', data, options),
  limit: (data, options = {}) => apiClient.post('/numerical/limit', data, options),
};
