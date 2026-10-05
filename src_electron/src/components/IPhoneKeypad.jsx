/**
 * SuperCalcee iPhone-Style Keypad Component
 * =========================================
 * 
 * High-fidelity iOS inspired calculator featuring:
 *  - Strict operand/operator state machine with operator chaining & repeated equals
 *  - Memory registers (MC, M+, M-, MR) with active memory indicator
 *  - Contextual AC (All Clear) vs C (Clear current entry)
 *  - iOS-accurate percentage calculations (context-aware of pending operator)
 *  - Expandable Scientific Mode with trigonometric (DEG/RAD), logarithmic, 
 *    exponential, root, and factorial operations
 *  - Full physical keyboard listener support
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Helper to compute single-argument scientific functions.
 */
const computeScientific = (op, val, angleMode = 'deg') => {
  const num = parseFloat(val);
  if (isNaN(num)) return 'Error';

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  try {
    switch (op) {
      case 'sin':
        return String(parseFloat(Math.sin(angleMode === 'deg' ? toRad(num) : num).toFixed(10)));
      case 'cos':
        return String(parseFloat(Math.cos(angleMode === 'deg' ? toRad(num) : num).toFixed(10)));
      case 'tan': {
        const rad = angleMode === 'deg' ? toRad(num) : num;
        if (Math.abs(Math.cos(rad)) < 1e-12) return 'Error';
        return String(parseFloat(Math.tan(rad).toFixed(10)));
      }
      case 'asin': {
        if (num < -1 || num > 1) return 'Error';
        const rad = Math.asin(num);
        return String(parseFloat((angleMode === 'deg' ? toDeg(rad) : rad).toFixed(10)));
      }
      case 'acos': {
        if (num < -1 || num > 1) return 'Error';
        const rad = Math.acos(num);
        return String(parseFloat((angleMode === 'deg' ? toDeg(rad) : rad).toFixed(10)));
      }
      case 'atan': {
        const rad = Math.atan(num);
        return String(parseFloat((angleMode === 'deg' ? toDeg(rad) : rad).toFixed(10)));
      }
      case 'ln':
        if (num <= 0) return 'Error';
        return String(parseFloat(Math.log(num).toFixed(10)));
      case 'log10':
        if (num <= 0) return 'Error';
        return String(parseFloat(Math.log10(num).toFixed(10)));
      case 'sqrt':
        if (num < 0) return 'Error';
        return String(parseFloat(Math.sqrt(num).toFixed(10)));
      case 'cbrt':
        return String(parseFloat(Math.cbrt(num).toFixed(10)));
      case 'sqr':
        return String(parseFloat((num * num).toFixed(10)));
      case 'cube':
        return String(parseFloat((num * num * num).toFixed(10)));
      case 'inv':
        if (num === 0) return 'Error';
        return String(parseFloat((1 / num).toFixed(10)));
      case 'exp':
        return String(parseFloat(Math.exp(num).toFixed(10)));
      case 'pow10':
        return String(parseFloat(Math.pow(10, num).toFixed(10)));
      case 'fact': {
        if (num < 0 || !Number.isInteger(num) || num > 170) return 'Error';
        let res = 1;
        for (let i = 2; i <= num; i++) res *= i;
        return String(res);
      }
      default:
        return val;
    }
  } catch {
    return 'Error';
  }
};

/**
 * Executes a binary arithmetic operation.
 */
const performCalculation = (operator, firstOperand, secondOperand) => {
  const a = parseFloat(firstOperand);
  const b = parseFloat(secondOperand);
  if (isNaN(a) || isNaN(b)) return 'Error';

  switch (operator) {
    case '+':
      return String(parseFloat((a + b).toFixed(10)));
    case '-':
      return String(parseFloat((a - b).toFixed(10)));
    case '×':
    case '*':
      return String(parseFloat((a * b).toFixed(10)));
    case '÷':
    case '/':
      if (b === 0) return 'Error';
      return String(parseFloat((a / b).toFixed(10)));
    case '^':
      return String(parseFloat(Math.pow(a, b).toFixed(10)));
    default:
      return secondOperand;
  }
};

const IPhoneKeypad = ({ onCalculationComplete }) => {
  // Primary State
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [historyExpression, setHistoryExpression] = useState('');

  // Repeated equals tracking
  const [lastOperator, setLastOperator] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);

  // Memory & Mode State
  const [memory, setMemory] = useState(0);
  const [isScientific, setIsScientific] = useState(false);
  const [angleMode, setAngleMode] = useState('deg'); // 'deg' | 'rad'

  /**
   * Input Digit or Decimal Dot
   */
  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplayValue(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(prev => (prev === '0' || prev === 'Error' ? String(digit) : prev + digit));
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(prev => (prev === 'Error' ? '0.' : prev + '.'));
    }
  }, [waitingForOperand, displayValue]);

  /**
   * Clear operations:
   * If display is not '0', pressing C clears display to '0'.
   * If display is already '0', pressing AC clears everything.
   */
  const clearEntry = useCallback(() => {
    if (displayValue !== '0' && !waitingForOperand) {
      setDisplayValue('0');
    } else {
      setDisplayValue('0');
      setFirstOperand(null);
      setOperator(null);
      setWaitingForOperand(false);
      setLastOperator(null);
      setLastOperand(null);
      setHistoryExpression('');
    }
  }, [displayValue, waitingForOperand]);

  /**
   * Toggle Positive / Negative
   */
  const toggleSign = useCallback(() => {
    if (displayValue === '0' || displayValue === 'Error') return;
    setDisplayValue(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  }, [displayValue]);

  /**
   * iOS Context-Aware Percent
   */
  const inputPercent = useCallback(() => {
    const current = parseFloat(displayValue);
    if (isNaN(current)) return;

    if (operator && firstOperand !== null) {
      // In addition or subtraction: a + b% = a + (a * b / 100)
      if (operator === '+' || operator === '-') {
        const percentVal = (parseFloat(firstOperand) * current) / 100;
        setDisplayValue(String(parseFloat(percentVal.toFixed(10))));
      } else {
        // Multiplication or division: a * b% = a * (b / 100)
        const percentVal = current / 100;
        setDisplayValue(String(parseFloat(percentVal.toFixed(10))));
      }
    } else {
      setDisplayValue(String(parseFloat((current / 100).toFixed(10))));
    }
  }, [displayValue, operator, firstOperand]);

  /**
   * Handle Binary Operator (+, -, ×, ÷, ^)
   */
  const handleOperator = useCallback((nextOperator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForOperand) {
      setOperator(nextOperator);
      setHistoryExpression(`${firstOperand} ${nextOperator}`);
      return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
      setFirstOperand(displayValue);
      setHistoryExpression(`${displayValue} ${nextOperator}`);
    } else if (operator) {
      const result = performCalculation(operator, firstOperand, displayValue);
      setDisplayValue(result);
      setFirstOperand(result);
      setHistoryExpression(`${result} ${nextOperator}`);

      if (onCalculationComplete && result !== 'Error') {
        onCalculationComplete({
          timestamp: new Date().toLocaleTimeString(),
          formulaName: 'Standard Calculation',
          expression: `${firstOperand} ${operator} ${displayValue}`,
          result
        });
      }
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
    setLastOperator(null);
    setLastOperand(null);
  }, [displayValue, operator, waitingForOperand, firstOperand, onCalculationComplete]);

  /**
   * Handle Equals (=)
   */
  const handleEquals = useCallback(() => {
    if (operator) {
      const secondOperand = displayValue;
      const result = performCalculation(operator, firstOperand, secondOperand);

      setHistoryExpression(`${firstOperand} ${operator} ${secondOperand} =`);
      setDisplayValue(result);
      setFirstOperand(result);
      setLastOperator(operator);
      setLastOperand(secondOperand);
      setOperator(null);
      setWaitingForOperand(true);

      if (onCalculationComplete && result !== 'Error') {
        onCalculationComplete({
          timestamp: new Date().toLocaleTimeString(),
          formulaName: 'Standard Calculation',
          expression: `${firstOperand} ${operator} ${secondOperand}`,
          result
        });
      }
    } else if (lastOperator && lastOperand) {
      // Repeated equals press repeats the last operator & operand
      const result = performCalculation(lastOperator, displayValue, lastOperand);
      setHistoryExpression(`${displayValue} ${lastOperator} ${lastOperand} =`);
      setDisplayValue(result);

      if (onCalculationComplete && result !== 'Error') {
        onCalculationComplete({
          timestamp: new Date().toLocaleTimeString(),
          formulaName: 'Standard Calculation',
          expression: `${displayValue} ${lastOperator} ${lastOperand}`,
          result
        });
      }
    }
  }, [operator, displayValue, firstOperand, lastOperator, lastOperand, onCalculationComplete]);

  /**
   * Handle Instant Scientific Operations
   */
  const handleScientific = useCallback((op) => {
    if (op === 'pi') {
      setDisplayValue(String(parseFloat(Math.PI.toFixed(10))));
      setWaitingForOperand(false);
      return;
    }
    if (op === 'e') {
      setDisplayValue(String(parseFloat(Math.E.toFixed(10))));
      setWaitingForOperand(false);
      return;
    }
    if (op === 'pow') {
      handleOperator('^');
      return;
    }

    const res = computeScientific(op, displayValue, angleMode);
    setHistoryExpression(`${op}(${displayValue}) =`);
    setDisplayValue(res);
    setWaitingForOperand(true);

    if (onCalculationComplete && res !== 'Error') {
      onCalculationComplete({
        timestamp: new Date().toLocaleTimeString(),
        formulaName: `Scientific: ${op}`,
        expression: `${op}(${displayValue})`,
        result: res
      });
    }
  }, [displayValue, angleMode, handleOperator, onCalculationComplete]);

  /**
   * Memory Registers
   */
  const handleMemory = useCallback((action) => {
    const val = parseFloat(displayValue) || 0;
    switch (action) {
      case 'mc':
        setMemory(0);
        break;
      case 'm+':
        setMemory(prev => prev + val);
        setWaitingForOperand(true);
        break;
      case 'm-':
        setMemory(prev => prev - val);
        setWaitingForOperand(true);
        break;
      case 'mr':
        setDisplayValue(String(parseFloat(memory.toFixed(10))));
        setWaitingForOperand(true);
        break;
      default:
        break;
    }
  }, [displayValue, memory]);

  /**
   * Physical Keyboard Listener
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if focus is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-') {
        handleOperator(key);
      } else if (key === '*' || key === 'x' || key === 'X') {
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '^') {
        handleOperator('^');
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Escape') {
        clearEntry();
      } else if (key === 'Backspace') {
        setDisplayValue(prev => (prev.length > 1 && prev !== 'Error' ? prev.slice(0, -1) : '0'));
      } else if (key === '%') {
        inputPercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clearEntry, inputPercent]);

  // Button styling helpers
  const btnStyle = (type, isActive = false) => {
    const base = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isScientific ? '1.1rem' : '1.5rem',
      borderRadius: '50%',
      cursor: 'pointer',
      userSelect: 'none',
      border: 'none',
      aspectRatio: '1/1',
      transition: 'all 0.15s ease',
      fontWeight: '500'
    };

    if (type === 'op') {
      return {
        ...base,
        background: isActive ? '#fff' : '#FF9500',
        color: isActive ? '#FF9500' : '#fff'
      };
    }
    if (type === 'func') {
      return {
        ...base,
        background: '#A5A5A5',
        color: '#000'
      };
    }
    if (type === 'sci') {
      return {
        ...base,
        background: '#2C2C2E',
        color: '#E5E5EA',
        fontSize: '0.95rem'
      };
    }
    if (type === 'zero') {
      return {
        ...base,
        background: '#333333',
        color: '#fff',
        aspectRatio: 'auto',
        borderRadius: '40px',
        paddingLeft: '28px',
        justifyContent: 'flex-start'
      };
    }
    return { ...base, background: '#333333', color: '#fff' };
  };

  const isClearAll = displayValue === '0' || waitingForOperand;

  return (
    <div style={{
      width: isScientific ? '580px' : '360px',
      maxWidth: '100%',
      boxSizing: 'border-box',
      background: '#000',
      borderRadius: '36px',
      padding: '20px 16px',
      margin: '0 auto',
      boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Top Utility Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px 12px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsScientific(!isScientific)}
            style={{
              background: isScientific ? '#FF9500' : '#2C2C2E',
              color: isScientific ? '#000' : '#FF9500',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={14} />
            {isScientific ? 'Scientific On' : 'Scientific Mode'}
          </button>

          {isScientific && (
            <button
              onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
              style={{
                background: '#2C2C2E',
                color: '#A5A5A5',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {angleMode.toUpperCase()}
            </button>
          )}
        </div>

        {memory !== 0 && (
          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
            M = {parseFloat(memory.toFixed(4))}
          </span>
        )}
      </div>

      {/* Screen Display */}
      <div style={{
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: '12px 14px',
        marginBottom: '16px'
      }}>
        <div style={{ color: '#8E8E93', fontSize: '1.1rem', minHeight: '1.4rem', fontFamily: 'monospace' }}>
          {historyExpression}
        </div>
        <div style={{
          color: '#fff',
          fontSize: displayValue.length > 9 ? '2.4rem' : displayValue.length > 6 ? '3.2rem' : '4rem',
          fontWeight: '300',
          lineHeight: '1.1',
          wordBreak: 'break-all',
          letterSpacing: '-1px'
        }}>
          {displayValue}
        </div>
      </div>

      {/* Calculator Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isScientific ? 'repeat(7, 1fr)' : 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {/* Scientific Columns (Rendered if isScientific === true) */}
        {isScientific && (
          <>
            <button style={btnStyle('sci')} onClick={() => handleScientific('sin')}>sin</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('cos')}>cos</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('tan')}>tan</button>
          </>
        )}
        <button style={btnStyle('func')} onClick={clearEntry}>{isClearAll ? 'AC' : 'C'}</button>
        <button style={btnStyle('func')} onClick={toggleSign}>+/-</button>
        <button style={btnStyle('func')} onClick={inputPercent}>%</button>
        <button style={btnStyle('op', operator === '÷')} onClick={() => handleOperator('÷')}>÷</button>

        {isScientific && (
          <>
            <button style={btnStyle('sci')} onClick={() => handleScientific('asin')}>sin⁻¹</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('acos')}>cos⁻¹</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('atan')}>tan⁻¹</button>
          </>
        )}
        <button style={btnStyle('num')} onClick={() => inputDigit('7')}>7</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('8')}>8</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('9')}>9</button>
        <button style={btnStyle('op', operator === '×')} onClick={() => handleOperator('×')}>×</button>

        {isScientific && (
          <>
            <button style={btnStyle('sci')} onClick={() => handleScientific('ln')}>ln</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('log10')}>log₁₀</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('sqrt')}>√x</button>
          </>
        )}
        <button style={btnStyle('num')} onClick={() => inputDigit('4')}>4</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('5')}>5</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('6')}>6</button>
        <button style={btnStyle('op', operator === '-')} onClick={() => handleOperator('-')}>-</button>

        {isScientific && (
          <>
            <button style={btnStyle('sci')} onClick={() => handleScientific('sqr')}>x²</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('cube')}>x³</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('pow')}>xʸ</button>
          </>
        )}
        <button style={btnStyle('num')} onClick={() => inputDigit('1')}>1</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('2')}>2</button>
        <button style={btnStyle('num')} onClick={() => inputDigit('3')}>3</button>
        <button style={btnStyle('op', operator === '+')} onClick={() => handleOperator('+')}>+</button>

        {isScientific && (
          <>
            <button style={btnStyle('sci')} onClick={() => handleScientific('pi')}>π</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('e')}>e</button>
            <button style={btnStyle('sci')} onClick={() => handleScientific('fact')}>n!</button>
          </>
        )}
        <button
          style={{ ...btnStyle('zero'), gridColumn: isScientific ? 'span 2' : 'span 2' }}
          onClick={() => inputDigit('0')}
        >
          0
        </button>
        <button style={btnStyle('num')} onClick={inputDecimal}>.</button>
        <button style={btnStyle('op')} onClick={handleEquals}>=</button>
      </div>

      {/* Memory Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        {['mc', 'm+', 'm-', 'mr'].map(memOp => (
          <button
            key={memOp}
            onClick={() => handleMemory(memOp)}
            style={{
              background: 'transparent',
              color: '#8E8E93',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              padding: '6px 12px',
              borderRadius: '6px'
            }}
          >
            {memOp}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IPhoneKeypad;
