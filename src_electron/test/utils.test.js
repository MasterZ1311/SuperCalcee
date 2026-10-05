/**
 * Frontend Unit Tests: Scientific Constants & Utility Helpers
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONSTANTS } from '../src/data/constants.js';

describe('Scientific Constants Registry & Utilities', () => {
  it('validates categories in client CONSTANTS database', () => {
    const categories = Object.keys(CONSTANTS);
    assert.ok(categories.includes('Math'));
    assert.ok(categories.includes('Physics'));
    assert.ok(categories.includes('Finance'));
  });

  it('validates physical constants values and symbols', () => {
    const physics = CONSTANTS.Physics;
    assert.ok(Array.isArray(physics));

    const c = physics.find(item => item.symbol === 'c');
    assert.ok(c);
    assert.equal(c.value, 299792458);
    assert.equal(c.unit, 'm/s');

    const h = physics.find(item => item.symbol === 'h');
    assert.ok(h);
    assert.equal(h.value, 6.62607015e-34);
    assert.equal(h.unit, 'J·s');

    const G = physics.find(item => item.symbol === 'G');
    assert.ok(G);
    assert.equal(G.value, 6.6743e-11);
  });

  it('ensures all constants have valid finite numerical values', () => {
    for (const [cat, list] of Object.entries(CONSTANTS)) {
      for (const item of list) {
        assert.ok(item.name, `Missing name in ${cat}`);
        assert.ok(item.symbol, `Missing symbol in ${cat}`);
        assert.ok(typeof item.value === 'number' && Number.isFinite(item.value), `Invalid value for ${item.symbol} in ${cat}`);
        assert.ok(item.desc, `Missing description for ${item.symbol}`);
      }
    }
  });

  it('finds constant by symbol across categories', () => {
    function findConstant(symbol) {
      for (const list of Object.values(CONSTANTS)) {
        const found = list.find(item => item.symbol === symbol);
        if (found) return found;
      }
      return null;
    }

    const pi = findConstant('pi');
    assert.ok(pi);
    assert.equal(pi.value, Math.PI);

    const unknown = findConstant('xyz_non_existent');
    assert.equal(unknown, null);
  });
});
