/**
 * Frontend Unit Tests: Formula Inputs & Validation Logic
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Formula Input Validation', () => {
  /**
   * Helper validating inputs matching FormulaCalculator.jsx:55-64
   */
  function validateFormulaInputs(variables, inputs) {
    const scope = {};
    for (const v of variables) {
      if (inputs[v] === '' || inputs[v] === undefined || inputs[v] === null) {
        return { valid: false, error: 'Error: Missing Input' };
      }
      const parsed = parseFloat(inputs[v]);
      if (isNaN(parsed)) {
        return { valid: false, error: `Error: Invalid Number for ${v}` };
      }
      scope[v] = parsed;
    }
    return { valid: true, scope };
  }

  it('validates and extracts complete numerical inputs', () => {
    const vars = ['m', 'a'];
    const inputs = { m: '10.5', a: '2.0' };
    const res = validateFormulaInputs(vars, inputs);
    assert.equal(res.valid, true);
    assert.deepEqual(res.scope, { m: 10.5, a: 2.0 });
  });

  it('rejects missing or empty string inputs', () => {
    const vars = ['m', 'a'];
    const inputs = { m: '10.5', a: '' };
    const res = validateFormulaInputs(vars, inputs);
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Error: Missing Input');
  });

  it('rejects undefined variable inputs', () => {
    const vars = ['m', 'a'];
    const inputs = { m: '10.5' };
    const res = validateFormulaInputs(vars, inputs);
    assert.equal(res.valid, false);
    assert.equal(res.error, 'Error: Missing Input');
  });

  it('rejects non-numeric string values', () => {
    const vars = ['x'];
    const inputs = { x: 'abc' };
    const res = validateFormulaInputs(vars, inputs);
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('Invalid Number'));
  });

  /**
   * Helper validating CustomFormulaBuilder logic
   */
  function validateCustomFormula(name, expression, varsStr) {
    if (!name || !expression || !varsStr) {
      return { valid: false, error: 'Name, Expression, and Variables fields are required.' };
    }
    const varArray = varsStr.split(',').map(v => v.trim()).filter(Boolean);
    if (varArray.length === 0) {
      return { valid: false, error: 'At least one variable must be specified.' };
    }
    return { valid: true, formula: { name, expression, variables: varArray } };
  }

  it('validates custom formula creation with comma-separated variables', () => {
    const res = validateCustomFormula('Kinetic', '0.5 * m * v^2', 'm, v');
    assert.equal(res.valid, true);
    assert.deepEqual(res.formula.variables, ['m', 'v']);
  });

  it('rejects custom formula with missing required fields', () => {
    assert.equal(validateCustomFormula('', 'm*a', 'm,a').valid, false);
    assert.equal(validateCustomFormula('Force', '', 'm,a').valid, false);
    assert.equal(validateCustomFormula('Force', 'm*a', '').valid, false);
  });
});
