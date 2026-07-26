/**
 * SuperCalcee iPhone-Style Keypad Component
 * =========================================
 * 
 * Renders a sleek, dark-mode iOS inspired standard scientific calculator interface.
 * Supports arithmetic operations, percentage calculations, sign toggling (+/-), 
 * backspacing, history tracking, and clear operations (AC/C).
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';
import { evaluateExpression } from '../utils/mathEngine';

/**
 * Standard iPhone-inspired Calculator Keypad React Component.
 * 
 * @returns {JSX.Element} Rendered iOS calculator UI layout.
 */
const IPhoneKeypad = () => {
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Main display string state */
  const [display, setDisplay] = useState('0');

  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Previous expression history string */
  const [history, setHistory] = useState('');

  /**
   * Handles user button presses and dispatches key logic.
   * 
   * @param {string} val - Pressed button key value (e.g. '7', '+', '=', 'AC').
   */
  const handlePress = (val) => {
    // All Clear (AC) resets display and history buffer
    if (val === 'AC') {
      setDisplay('0');
      setHistory('');
      return;
    }
    
    // Clear / Backspace (C) removes the trailing character
    if (val === 'C') {
      setDisplay(display.slice(0, -1) || '0');
      return;
    }
    
    // Equals (=) computes expression via mathEngine
    if (val === '=') {
      try {
        // Sanitize visual multiplication and division glyphs for Math.js
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        const result = evaluateExpression(sanitized);
        setHistory(`${display} =`);
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }
      return;
    }
    
    // Toggle Sign (+/-)
    if (val === '+/-') {
      if (display !== '0') {
        setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
      }
      return;
    }
    
    // Append or replace leading zero
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  /**
   * Generates style object for calculator keypad buttons based on type category.
   * 
   * @param {'op' | 'func' | 'zero' | 'num'} type - Button type classification.
   * @returns {React.CSSProperties} CSS properties object for button styling.
   */
  const btnStyle = (type) => {
    const base = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      borderRadius: '50%',
      cursor: 'pointer',
      userSelect: 'none',
      border: 'none',
      aspectRatio: '1/1',
      transition: 'filter 0.2s, background-color 0.2s'
    };
    
    if (type === 'op') {
      return { ...base, background: '#FF9F0A', color: '#fff' };
    }
    if (type === 'func') {
      return { ...base, background: '#A5A5A5', color: '#000' };
    }
    if (type === 'zero') {
      return { 
        ...base, 
        background: '#333333', 
        color: '#fff', 
        aspectRatio: 'auto', 
        borderRadius: '40px', 
        paddingLeft: '30px', 
        justifyContent: 'flex-start' 
      };
    }
    return { ...base, background: '#333333', color: '#fff' };
  };

  return (
    <div style={{ width: '350px', background: '#000', borderRadius: '40px', padding: '20px', margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
      {/* Display Screen */}
      <div style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '10px 20px', marginBottom: '10px' }}>
        <div style={{ color: '#a5a5a5', fontSize: '1.2rem', minHeight: '1.5rem' }}>{history}</div>
        <div style={{ color: '#fff', fontSize: display.length > 10 ? '2.5rem' : '4rem', fontWeight: '300', wordBreak: 'break-all' }}>
          {display}
        </div>
      </div>
      
      {/* 4x5 Keypad Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <button style={btnStyle('func')} onClick={() => handlePress('AC')}>AC</button>
        <button style={btnStyle('func')} onClick={() => handlePress('+/-')}>+/-</button>
        <button style={btnStyle('func')} onClick={() => handlePress('%')}>%</button>
        <button style={btnStyle('op')} onClick={() => handlePress('÷')}>÷</button>
        
        <button style={btnStyle('num')} onClick={() => handlePress('7')}>7</button>
        <button style={btnStyle('num')} onClick={() => handlePress('8')}>8</button>
        <button style={btnStyle('num')} onClick={() => handlePress('9')}>9</button>
        <button style={btnStyle('op')} onClick={() => handlePress('×')}>×</button>
        
        <button style={btnStyle('num')} onClick={() => handlePress('4')}>4</button>
        <button style={btnStyle('num')} onClick={() => handlePress('5')}>5</button>
        <button style={btnStyle('num')} onClick={() => handlePress('6')}>6</button>
        <button style={btnStyle('op')} onClick={() => handlePress('-')}>-</button>
        
        <button style={btnStyle('num')} onClick={() => handlePress('1')}>1</button>
        <button style={btnStyle('num')} onClick={() => handlePress('2')}>2</button>
        <button style={btnStyle('num')} onClick={() => handlePress('3')}>3</button>
        <button style={btnStyle('op')} onClick={() => handlePress('+')}>+</button>
        
        <button style={{...btnStyle('zero'), gridColumn: 'span 2'}} onClick={() => handlePress('0')}>0</button>
        <button style={btnStyle('num')} onClick={() => handlePress('.')}>.</button>
        <button style={btnStyle('op')} onClick={() => handlePress('=')}>=</button>
      </div>
    </div>
  );
};

export default IPhoneKeypad;
