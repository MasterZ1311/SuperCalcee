/**
 * Frontend Unit Tests: Calculator Keypad State Logic & Glyph Sanitization
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../src/utils/mathEngine.js';

describe('Calculator Keypad State & Formatting', () => {
  /**
   * Helper function replicating handlePress logic from IPhoneKeypad.jsx
   */
  function simulateKeyPress(initialDisplay, key) {
    if (key === 'AC') return '0';
    if (key === 'C') return initialDisplay.slice(0, -1) || '0';
    if (key === '+/-') {
      if (initialDisplay === '0') return '0';
      return initialDisplay.startsWith('-') ? initialDisplay.slice(1) : `-${initialDisplay}`;
    }
    if (initialDisplay === '0' && key !== '.') {
      return key;
    }
    return initialDisplay + key;
  }

  it('replaces leading zero with single digit input', () => {
    assert.equal(simulateKeyPress('0', '7'), '7');
    assert.equal(simulateKeyPress('0', '9'), '9');
  });

  it('preserves leading zero when decimal point is pressed', () => {
    assert.equal(simulateKeyPress('0', '.'), '0.');
  });

  it('appends consecutive digits properly', () => {
    let display = '0';
    display = simulateKeyPress(display, '1');
    display = simulateKeyPress(display, '2');
    display = simulateKeyPress(display, '3');
    assert.equal(display, '123');
  });

  it('handles All Clear (AC) and backspace (C)', () => {
    assert.equal(simulateKeyPress('12345', 'AC'), '0');
    assert.equal(simulateKeyPress('12345', 'C'), '1234');
    assert.equal(simulateKeyPress('5', 'C'), '0');
  });

  it('handles sign toggling (+/-)', () => {
    assert.equal(simulateKeyPress('42', '+/-'), '-42');
    assert.equal(simulateKeyPress('-42', '+/-'), '42');
    assert.equal(simulateKeyPress('0', '+/-'), '0');
  });

  it('sanitizes multiplication and division glyphs for mathEngine evaluation', () => {
    const rawDisplay = '12 × 4 ÷ 2';
    const sanitized = rawDisplay.replace(/×/g, '*').replace(/÷/g, '/');
    assert.equal(sanitized, '12 * 4 / 2');

    const result = evaluateExpression(sanitized);
    assert.equal(result, 24);
  });
});
