/**
 * SuperCalcee Physical & Mathematical Constants Dropdown Popover
 * =============================================================
 * 
 * Interactive popover component listing CODATA constants categorized by domain (Physics, Math, Finance).
 * Allows users to inspect constant values, standard units, symbols, and insert values directly into formula input fields.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';
import { CONSTANTS } from '../data/constants';

/**
 * @param {{ onSelect: (value: number, symbol: string) => void }} props
 * @returns {JSX.Element} Rendered Constants Dropdown Popover Component.
 */
const ConstantsDropdown = ({ onSelect }) => {
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} Popover visibility state */
  const [isOpen, setIsOpen] = useState(false);

  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Selected category tab state */
  const [category, setCategory] = useState('Physics');

  const categories = Object.keys(CONSTANTS);

  return (
    <div className="constants-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      {/* Dropdown Toggle Button */}
      <button 
        className="btn-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--panel-bg)',
          color: 'var(--accent-color)',
          border: '1px solid var(--accent-color)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Insert Constant ▼
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div 
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '300px',
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            zIndex: 100,
            marginTop: '0.5rem',
            overflow: 'hidden'
          }}
        >
          {/* Domain Category Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            {categories.map(cat => (
              <div 
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  background: category === cat ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: category === cat ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Constant List Pane */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {CONSTANTS[category].map(c => (
              <div 
                key={c.symbol}
                onClick={() => {
                  onSelect(c.value, c.symbol);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.8rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <strong style={{ color: 'var(--accent-color)' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.9rem', color: '#10b981' }}>{c.symbol}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {c.value} {c.unit && `(${c.unit})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstantsDropdown;
