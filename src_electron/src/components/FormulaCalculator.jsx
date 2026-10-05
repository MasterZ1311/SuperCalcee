/**
 * SuperCalcee Interactive Formula Calculator Component
 * ====================================================
 * 
 * Dynamic React component that renders input fields for any preset or custom multi-variable formula.
 * Supports constant insertion dropdowns for physical/mathematical parameters, loading state,
 * cancellation support, and displays calculated output with unit annotations.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useRef } from 'react';
import { domainsApi } from '../api';
import { evaluateExpression } from '../utils/mathEngine';
import ConstantsDropdown from './ConstantsDropdown';
import { RefreshCw, XCircle, Copy, Check } from 'lucide-react';

/**
 * @typedef {Object} FormulaProps
 * @property {string} id - Formula identifier.
 * @property {string} name - Formula display title.
 * @property {string} desc - Mathematical description or equation identity.
 * @property {string} expression - Math expression string evaluated by mathEngine.
 * @property {string[]} variables - Variable names requiring user input.
 * @property {string} unit - Output unit of measurement.
 */

/**
 * Formula Calculator Card Component.
 * 
 * @param {{ formula: FormulaProps, onCalculationComplete?: (entry: any) => void }} props - Component props containing formula definition.
 * @returns {JSX.Element} Rendered formula card with input fields and result pane.
 */
const FormulaCalculator = ({ formula, onCalculationComplete }) => {
  /** @type {[Record<string, string>, React.Dispatch<React.SetStateAction<Record<string, string>>>]} Input state map */
  const [inputs, setInputs] = useState(
    formula.variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {})
  );

  /** @type {[number | string | null, React.Dispatch<React.SetStateAction<number | string | null>>]} Result state */
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);

  const abortControllerRef = useRef(null);

  /**
   * Updates state value for a given variable.
   * 
   * @param {string} variable - Target variable name.
   * @param {string | number} value - Input string or numerical value.
   */
  const handleInputChange = (variable, value) => {
    setInputs(prev => ({ ...prev, [variable]: String(value) }));
    setIsError(false);
  };

  /**
   * Cancels any active calculation.
   */
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setResult('Cancelled');
      setIsError(true);
    }
  };

  const copyResult = () => {
    if (result !== null && !isError) {
      navigator.clipboard.writeText(String(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Evaluates the formula expression with current user inputs.
   */
  const handleCalculate = async () => {
    const scope = {};
    for (const v of formula.variables) {
      if (inputs[v] === '' || inputs[v] === undefined) {
        setResult('Error: Missing Input');
        setIsError(true);
        return;
      }
      const num = parseFloat(inputs[v]);
      if (isNaN(num)) {
        setResult(`Error: Invalid number for '${v}'`);
        setIsError(true);
        return;
      }
      scope[v] = num;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setIsError(false);

    try {
      let calculatedVal = null;
      let backendSuccess = false;

      // If expression is an equation with '=', use backend symbolic/numeric solver
      if (formula.expression.includes('=')) {
        try {
          const parts = formula.expression.split('=');
          const solveFor = parts[0].trim();
          const res = await domainsApi.formulaEngine.solve(
            formula.expression,
            solveFor,
            scope,
            { signal: controller.signal, timeout: 8000 }
          );
          if (res && res.success && res.result !== undefined) {
            calculatedVal = res.result;
            backendSuccess = true;
          }
        } catch (apiErr) {
          if (apiErr.name === 'AbortError' || apiErr.code === 'CANCELLED') {
            throw apiErr;
          }
          // Non-abort errors fall back to local evaluation
        }
      }

      // If not an equation or backend unavailable, evaluate with client mathEngine
      if (!backendSuccess) {
        const res = evaluateExpression(formula.expression, scope);
        if (typeof res === 'string' && res.startsWith('Error:')) {
          setResult(res);
          setIsError(true);
          return;
        }
        calculatedVal = res;
      }

      setResult(calculatedVal);
      setIsError(false);

      if (onCalculationComplete && calculatedVal !== null) {
        onCalculationComplete({
          timestamp: new Date().toLocaleTimeString(),
          formulaName: formula.name,
          expression: formula.expression,
          inputs: scope,
          result: calculatedVal,
          unit: formula.unit || ''
        });
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'CANCELLED') {
        setResult('Cancelled');
        setIsError(true);
      } else {
        setResult(`Error: ${err.message || 'Calculation failed'}`);
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.9)' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.2rem' }}>{formula.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {formula.desc} <br />
            <code>{formula.expression}</code>
          </p>
        </div>
      </div>

      {/* Dynamic Input Grid */}
      <div className="formula-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {formula.variables.map(v => (
          <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{v}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                value={inputs[v]} 
                onChange={(e) => handleInputChange(v, e.target.value)}
                placeholder={`Enter ${v}`}
                style={{ flex: 1, margin: 0 }}
              />
              {/* CODATA Constant Insertion Popover */}
              <ConstantsDropdown 
                onSelect={(val) => handleInputChange(v, val)} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Calculation & Result Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={handleCalculate} 
          disabled={isLoading}
          style={{ flex: 1, background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
        >
          {isLoading && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>

        {isLoading && (
          <button
            onClick={handleCancel}
            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <XCircle size={16} />
          </button>
        )}

        {result !== null && (
          <div style={{
            flex: 1,
            padding: '0.8rem 1rem',
            background: '#000',
            borderRadius: '8px',
            border: isError ? '1px solid #ef4444' : '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '600', color: isError ? '#ef4444' : '#fff' }}>
              {result} {!isError && formula.unit ? formula.unit : ''}
            </span>
            {!isError && (
              <button
                onClick={copyResult}
                style={{
                  background: 'transparent',
                  color: copied ? '#10b981' : '#8E8E93',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy Result"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaCalculator;
