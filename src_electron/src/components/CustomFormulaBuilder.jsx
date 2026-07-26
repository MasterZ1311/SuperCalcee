/**
 * SuperCalcee Custom Formula Builder Component
 * ============================================
 * 
 * Provides an interactive UI form allowing users to define, test, and save custom
 * mathematical formulas. Formulas are persisted locally and added to the user's workspace.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';

/**
 * @param {{ onSave: (formula: import('../data/presetFormulas').FormulaDefinition) => void }} props
 * @returns {JSX.Element} Rendered Custom Formula Builder Form Component.
 */
const CustomFormulaBuilder = ({ onSave }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [expression, setExpression] = useState('');
  const [vars, setVars] = useState('');
  const [unit, setUnit] = useState('');

  /**
   * Validates form inputs, constructs a new formula object, and triggers the `onSave` callback.
   */
  const handleSave = () => {
    if (!name || !expression || !vars) {
      alert("Name, Expression, and Variables fields are required.");
      return;
    }
    
    // Parse comma-separated variable string into clean array
    const varArray = vars.split(',').map(v => v.trim()).filter(Boolean);
    
    const newFormula = {
      id: `custom_${Date.now()}`,
      name,
      desc,
      expression,
      variables: varArray,
      unit,
      isCustom: true
    };
    
    onSave(newFormula);

    // Reset input fields upon successful save
    setName('');
    setDesc('');
    setExpression('');
    setVars('');
    setUnit('');
  };

  return (
    <div className="glass-panel" style={{ background: '#1c1c1e', border: '1px solid #FF9500', marginBottom: '2rem' }}>
      <h3 style={{ color: '#FF9500', marginBottom: '1rem' }}>Build Custom Formula</h3>
      <p style={{ color: '#a5a5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Create and save your custom algebraic formula. Saved operations will be stored in your local browser storage.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Formula Name (e.g. My Profit Formula)" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Description (Optional)" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Expression (e.g. (Rev - Cost) * 1.5)" 
          value={expression} 
          onChange={(e) => setExpression(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Variables (comma separated, e.g. Rev, Cost)" 
          value={vars} 
          onChange={(e) => setVars(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Unit (Optional, e.g. $ or %)" 
          value={unit} 
          onChange={(e) => setUnit(e.target.value)}
        />
        
        <button 
          onClick={handleSave} 
          style={{ background: '#FF9500', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Save Custom Formula
        </button>
      </div>
    </div>
  );
};

export default CustomFormulaBuilder;
