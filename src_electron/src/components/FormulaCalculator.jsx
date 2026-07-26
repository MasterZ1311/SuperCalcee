/**
 * SuperCalcee Interactive Formula Calculator Component
 * ====================================================
 * 
 * Dynamic React component that renders input fields for any preset or custom multi-variable formula.
 * Supports constant insertion dropdowns for physical/mathematical parameters and displays calculated output.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';
import { evaluateExpression } from '../utils/mathEngine';
import ConstantsDropdown from './ConstantsDropdown';

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
 * @param {{ formula: FormulaProps }} props - Component props containing formula definition.
 * @returns {JSX.Element} Rendered formula card with input fields and result pane.
 */
const FormulaCalculator = ({ formula }) => {
  /** @type {[Record<string, string>, React.Dispatch<React.SetStateAction<Record<string, string>>>]} Input state map */
  const [inputs, setInputs] = useState(
    formula.variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {})
  );

  /** @type {[number | string | null, React.Dispatch<React.SetStateAction<number | string | null>>]} Result state */
  const [result, setResult] = useState(null);

  /**
   * Updates state value for a given variable.
   * 
   * @param {string} variable - Target variable name.
   * @param {string | number} value - Input string or numerical value.
   */
  const handleInputChange = (variable, value) => {
    setInputs(prev => ({ ...prev, [variable]: String(value) }));
  };

  /**
   * Evaluates the formula expression with current user inputs.
   */
  const handleCalculate = () => {
    const scope = {};
    for (const v of formula.variables) {
      if (inputs[v] === '' || inputs[v] === undefined) {
        setResult('Error: Missing Input');
        return;
      }
      scope[v] = parseFloat(inputs[v]);
    }

    const res = evaluateExpression(formula.expression, scope);
    setResult(res);
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
        <button onClick={handleCalculate} style={{ flex: 1, background: '#FF9500' }}>
          Calculate
        </button>
        {result !== null && (
          <div style={{ flex: 1, padding: '0.8rem', background: '#000', borderRadius: '8px', border: '1px solid #333', textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>
              {result} {formula.unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaCalculator;
