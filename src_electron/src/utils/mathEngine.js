/**
 * SuperCalcee Math Evaluation Engine Utility
 * ===========================================
 * 
 * Safe mathematical expression parser and evaluator wrapping Math.js.
 * Provides support for trigonometric functions, logarithms, scientific notation,
 * exponentiation, custom variable scopes, and automatic floating-point rounding.
 * 
 * @module utils/mathEngine
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import { evaluate } from 'mathjs';

/**
 * Safely evaluates a mathematical expression string within a given variable scope.
 * 
 * Handles floating-point rounding to 8 decimal places to eliminate IEEE 754 precision artifacts
 * (e.g., 0.1 + 0.2 = 0.30000000000000004 -> 0.3).
 * 
 * @param {string} expression - Math expression string (e.g. "sin(45 * deg) + sqrt(16) * x").
 * @param {Record<string, number>} [scope={}] - Map of variable names to numerical values.
 * @returns {number | string} Evaluated numerical result or descriptive error message string.
 * 
 * @example
 * evaluateExpression("m * c^2", { m: 1, c: 299792458 });
 * // returns 8.98755179e+16
 */
export const evaluateExpression = (expression, scope = {}) => {
  try {
    if (!expression || typeof expression !== 'string') {
      return '0';
    }

    // Evaluate expression using Math.js parser within user variable scope
    const result = evaluate(expression, scope);
    
    // Process numerical output with floating-point precision stabilization
    if (typeof result === 'number') {
      // Return exact zero for near-zero epsilon noise
      if (Math.abs(result) < 1e-10) {
        return 0;
      }
      
      // Limit floating point display artifacts to 8 decimal places
      return parseFloat(result.toFixed(8));
    }
    
    return result;
  } catch (err) {
    // Return human-readable error description if evaluation fails
    return `Error: ${err.message}`;
  }
};
