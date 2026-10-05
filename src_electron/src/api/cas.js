/**
 * SuperCalcee Symbolic Computer Algebra System (CAS) API Module
 * =============================================================
 * 
 * Provides client methods for symbolic mathematics powered by the SymPy engine:
 *  - Algebraic simplification
 *  - Polynomial factorization
 *  - Algebraic expansion
 *  - Symbolic differentiation
 *  - Indefinite integration
 *  - Analytical limits
 *  - Algebraic equation solving
 * 
 * @module api/cas
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import { apiClient } from './client.js';

/**
 * Algebraically simplifies a mathematical expression.
 * 
 * @param {string} expr - Expression string (e.g. "(x^2 - 1)/(x - 1)").
 * @param {Object} [options={}] - Execution options (timeout, signal, retries).
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const simplify = async (expr, options = {}) => {
  return apiClient.post('/cas/simplify', { expr }, options);
};

/**
 * Factors a polynomial expression into irreducible factors.
 * 
 * @param {string} expr - Polynomial expression (e.g. "x**2 - 4").
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const factor = async (expr, options = {}) => {
  return apiClient.post('/cas/factor', { expr }, options);
};

/**
 * Expands algebraic products and powers into polynomial terms.
 * 
 * @param {string} expr - Expression string (e.g. "(x + 2)**2").
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const expand = async (expr, options = {}) => {
  return apiClient.post('/cas/expand', { expr }, options);
};

/**
 * Computes the symbolic derivative of an expression with respect to a variable.
 * 
 * @param {string} expr - Mathematical expression (e.g. "x**3").
 * @param {string} [variable='x'] - Target variable for differentiation.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const differentiate = async (expr, variable = 'x', options = {}) => {
  return apiClient.post('/cas/differentiate', { expr, variable }, options);
};

/**
 * Computes the symbolic indefinite integral of an expression with respect to a variable.
 * 
 * @param {string} expr - Mathematical expression (e.g. "3*x**2").
 * @param {string} [variable='x'] - Target variable for integration.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const integrate = async (expr, variable = 'x', options = {}) => {
  return apiClient.post('/cas/integrate', { expr, variable }, options);
};

/**
 * Evaluates the symbolic mathematical limit lim_{x -> approach} expr.
 * 
 * @param {string} expr - Mathematical expression (e.g. "sin(x)/x").
 * @param {string} [variable='x'] - Variable taking the limit.
 * @param {string} [approach='0'] - Approach point (e.g. '0', 'oo', '-oo').
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string, error?: any, requestId?: string }>}
 */
export const limit = async (expr, variable = 'x', approach = '0', options = {}) => {
  return apiClient.post('/cas/limit', { expr, variable, approach }, options);
};

/**
 * Solves an algebraic equation for the specified variable.
 * 
 * @param {string} expr - Equation or expression string (e.g. "x**2 - 9 = 0").
 * @param {string} [variable='x'] - Target variable to solve for.
 * @param {Object} [options={}] - Execution options.
 * @returns {Promise<{ success: boolean, data?: string[], error?: any, requestId?: string }>}
 */
export const solve = async (expr, variable = 'x', options = {}) => {
  return apiClient.post('/cas/solve', { expr, variable }, options);
};
