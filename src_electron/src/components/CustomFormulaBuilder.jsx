/**
 * SuperCalcee Custom Formula Builder Component
 * ============================================
 * 
 * Interactive builder enabling users to define, validate, test, and save custom
 * mathematical operations locally.
 * 
 * Features:
 *  - Live expression testing runner with variable value simulation
 *  - Inline non-blocking validation errors (no native browser alerts)
 *  - Domain category classification (Physics, Finance, Math, Astro, etc.)
 *  - Math expression syntax cheat-sheet & helper tooltips
 *  - Support for creating new and editing existing formulas
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { evaluateExpression } from '../utils/mathEngine';
import { Sparkles, Play, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

const CATEGORIES = [
  'Custom',
  'Physics',
  'Accounts',
  'Math',
  'Astrophysics',
  'Chemistry',
  'Biology',
  'ComputerScience'
];

const SYNTAX_TIPS = [
  'Basic: a + b, a - b, a * b, a / b',
  'Powers & Roots: a^2, a^b, sqrt(x), cbrt(x)',
  'Trigonometry: sin(x), cos(x), tan(x)',
  'Logarithms & Exp: log(x) [natural], log10(x), exp(x)',
  'Constants: pi (3.14159...), e (2.71828...)'
];

const CustomFormulaBuilder = ({ onSave, editingFormula, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [expression, setExpression] = useState('');
  const [vars, setVars] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('Custom');

  // Error & Test State
  const [errorMessage, setErrorMessage] = useState('');
  const [testInputs, setTestInputs] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

  // Populate form if editing an existing formula
  useEffect(() => {
    if (editingFormula) {
      Promise.resolve().then(() => {
        setName(editingFormula.name || '');
        setDesc(editingFormula.desc || '');
        setExpression(editingFormula.expression || '');
        setVars(editingFormula.variables ? editingFormula.variables.join(', ') : '');
        setUnit(editingFormula.unit || '');
        setCategory(editingFormula.category || 'Custom');
        setErrorMessage('');
        setTestResult(null);
      });
    }
  }, [editingFormula]);

  // Sync test inputs whenever variables string changes
  const parsedVariables = vars.split(',').map(v => v.trim()).filter(Boolean);

  const handleTestInputChange = (varName, val) => {
    setTestInputs(prev => ({ ...prev, [varName]: val }));
  };

  /**
   * Evaluates the expression in real-time with sample input values.
   */
  const handleTestRun = () => {
    setErrorMessage('');
    if (!expression.trim()) {
      setErrorMessage('Please enter a mathematical expression to test.');
      return;
    }

    const scope = {};
    for (const v of parsedVariables) {
      const val = parseFloat(testInputs[v]);
      if (isNaN(val)) {
        setErrorMessage(`Please provide a numeric test value for '${v}'.`);
        return;
      }
      scope[v] = val;
    }

    const res = evaluateExpression(expression, scope);
    if (typeof res === 'string' && res.startsWith('Error:')) {
      setErrorMessage(res);
      setTestResult(null);
    } else {
      setTestResult(res);
    }
  };

  /**
   * Validates form inputs, constructs a new formula object, and triggers the `onSave` callback.
   */
  const handleSave = () => {
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Formula title is required.');
      return;
    }
    if (!expression.trim()) {
      setErrorMessage('Mathematical expression is required.');
      return;
    }
    if (parsedVariables.length === 0) {
      setErrorMessage('At least one variable name must be specified (e.g. x, y).');
      return;
    }

    // Quick syntax verification before saving
    const dummyScope = {};
    parsedVariables.forEach(v => { dummyScope[v] = 1; });
    const verifyRes = evaluateExpression(expression, dummyScope);
    if (typeof verifyRes === 'string' && verifyRes.startsWith('Error:')) {
      setErrorMessage(`Invalid expression syntax: ${verifyRes}`);
      return;
    }

    const newFormula = {
      id: editingFormula ? editingFormula.id : `custom_${Date.now()}`,
      name: name.trim(),
      desc: desc.trim() || `Custom Formula: ${expression}`,
      expression: expression.trim(),
      variables: parsedVariables,
      unit: unit.trim(),
      category: category,
      isCustom: true
    };

    onSave(newFormula);

    // Reset input fields upon successful save
    if (!editingFormula) {
      setName('');
      setDesc('');
      setExpression('');
      setVars('');
      setUnit('');
      setCategory('Custom');
      setTestInputs({});
      setTestResult(null);
    }
  };

  return (
    <div className="glass-panel" style={{ background: '#1C1C1E', border: '1px solid #FF9500', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: '#FF9500', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          {editingFormula ? 'Edit Custom Formula' : 'Build Custom Formula'}
        </h3>

        <button
          type="button"
          onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#A5A5A5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem'
          }}
        >
          <HelpCircle size={16} />
          {showSyntaxHelp ? 'Hide Syntax Tips' : 'Syntax Guide'}
        </button>
      </div>

      {showSyntaxHelp && (
        <div style={{
          background: 'rgba(255, 149, 0, 0.08)',
          border: '1px solid rgba(255, 149, 0, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: '#E5E5EA'
        }}>
          <strong style={{ color: '#FF9500' }}>Supported Expression Syntax:</strong>
          <ul style={{ margin: '6px 0 0 20px', padding: 0 }}>
            {SYNTAX_TIPS.map((tip, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '1rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Formula Name</label>
            <input 
              type="text" 
              placeholder="e.g. My Profit Margin" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Domain Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                padding: '0.8rem',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'Accounts' ? 'Finance' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Description (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Calculates gross profit percentage after taxes" 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Math Expression</label>
            <input 
              type="text" 
              placeholder="e.g. (Revenue - Cost) / Revenue * 100" 
              value={expression} 
              onChange={(e) => setExpression(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Unit (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. % or $" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>
            Variables Required (comma-separated)
          </label>
          <input 
            type="text" 
            placeholder="e.g. Revenue, Cost" 
            value={vars} 
            onChange={(e) => setVars(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        {/* Live Expression Simulation / Test Runner */}
        {parsedVariables.length > 0 && expression.trim() && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#FF9500', fontWeight: '600' }}>
                🧪 Live Expression Test Runner
              </span>
              <button
                type="button"
                onClick={handleTestRun}
                style={{
                  background: '#2C2C2E',
                  color: '#FF9500',
                  border: '1px solid rgba(255,149,0,0.4)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Play size={12} />
                Test Run
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`, gap: '8px', marginBottom: '8px' }}>
              {parsedVariables.map(v => (
                <div key={v}>
                  <label style={{ fontSize: '0.75rem', color: '#8E8E93' }}>{v}:</label>
                  <input
                    type="number"
                    placeholder="Value"
                    value={testInputs[v] || ''}
                    onChange={(e) => handleTestInputChange(v, e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '0.9rem', margin: 0 }}
                  />
                </div>
              ))}
            </div>

            {testResult !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#10b981',
                fontSize: '0.95rem',
                fontWeight: '600',
                marginTop: '6px'
              }}>
                <CheckCircle2 size={16} />
                <span>Simulation Result: {testResult} {unit}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button 
            type="button"
            onClick={handleSave} 
            style={{
              flex: 1,
              background: '#FF9500',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '12px'
            }}
          >
            {editingFormula ? 'Update Formula' : 'Save Custom Formula'}
          </button>

          {editingFormula && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                background: '#2C2C2E',
                color: '#A5A5A5',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomFormulaBuilder;
