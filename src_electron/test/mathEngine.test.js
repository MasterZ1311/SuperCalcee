/**
 * Frontend Unit Tests: Math Engine Utility
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../src/utils/mathEngine.js';

describe('mathEngine - evaluateExpression', () => {
  it('evaluates basic arithmetic expressions correctly', () => {
    assert.equal(evaluateExpression('2 + 2'), 4);
    assert.equal(evaluateExpression('10 - 4'), 6);
    assert.equal(evaluateExpression('6 * 7'), 42);
    assert.equal(evaluateExpression('15 / 3'), 5);
  });

  it('evaluates scientific and algebraic expressions', () => {
    assert.equal(evaluateExpression('sqrt(16)'), 4);
    assert.equal(evaluateExpression('2^3'), 8);
    assert.equal(evaluateExpression('sin(0)'), 0);
    assert.equal(evaluateExpression('cos(0)'), 1);
  });

  it('evaluates expressions within a custom variable scope', () => {
    const scope = { m: 10, a: 2.5 };
    assert.equal(evaluateExpression('m * a', scope), 25);

    const kineticScope = { m: 2, v: 3 };
    assert.equal(evaluateExpression('0.5 * m * (v^2)', kineticScope), 9);
  });

  it('handles floating point precision stabilization (rounds to 8 decimal places)', () => {
    // Standard IEEE 754 artifact: 0.1 + 0.2 = 0.30000000000000004
    const res = evaluateExpression('0.1 + 0.2');
    assert.equal(res, 0.3);
  });

  it('returns exact zero for near-zero epsilon noise (< 1e-10)', () => {
    // sin(pi) in floating point is ~1.22e-16
    const res = evaluateExpression('sin(pi)');
    assert.equal(res, 0);
  });

  it('returns human-readable error on syntax error', () => {
    const res = evaluateExpression('5 + * 2');
    assert.ok(typeof res === 'string');
    assert.ok(res.startsWith('Error:'));
  });

  it('handles empty or non-string input safely', () => {
    assert.equal(evaluateExpression(''), '0');
    assert.equal(evaluateExpression(null), '0');
    assert.equal(evaluateExpression(undefined), '0');
    assert.equal(evaluateExpression(123), '0');
  });
});
