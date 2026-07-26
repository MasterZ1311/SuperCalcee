/**
 * SuperCalcee Formula Store Component
 * ====================================
 * 
 * Modular Formula Store library allowing users to browse and download domain-specific
 * section packs (e.g. Classical Mechanics, Thermodynamics, Corporate Finance, Geometry).
 * Packs are referenced from open sources like GeeksForGeeks and FinanceFormulas.net.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';
import { FORMULA_PACKS } from '../data/packRegistry';

/**
 * @typedef {Object} FormulaStoreProps
 * @property {string[]} installedPackIds - Array of currently installed pack IDs.
 * @property {(packId: string) => void} onToggleInstall - Callback function to install or uninstall a pack.
 */

/**
 * Formula Store React Component.
 * 
 * @param {FormulaStoreProps} props - Component properties.
 * @returns {JSX.Element} Rendered Formula Store catalog UI.
 */
const FormulaStore = ({ installedPackIds, onToggleInstall }) => {
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Active category filter state */
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter packs based on selected category tab
  const filteredPacks = selectedCategory === 'All' 
    ? FORMULA_PACKS 
    : FORMULA_PACKS.filter(p => p.category === selectedCategory);

  return (
    <div>
      {/* Store Header & Category Filter Panel */}
      <div className="glass-panel" style={{ marginBottom: '2rem', background: '#1c1c1e', border: '1px solid #FF9500' }}>
        <h3 style={{ color: '#FF9500', marginBottom: '0.5rem' }}>Formula Pack Download Library</h3>
        <p style={{ color: '#a5a5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Additional formulas are stored section-wise in separate JSON modules so they do not consume default storage. 
          Download only the sections you need from GeeksForGeeks and FinanceFormulas.net references!
        </p>

        {/* Filter Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {['All', 'Physics', 'Accounts', 'Math'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#FF9500' : 'transparent',
                color: selectedCategory === cat ? '#000' : '#fff',
                border: '1px solid #FF9500',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {cat === 'Accounts' ? 'Finance' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Pack Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {filteredPacks.map(pack => {
          const isInstalled = installedPackIds.includes(pack.id);
          return (
            <div 
              key={pack.id} 
              className="glass-panel"
              style={{
                background: isInstalled ? 'rgba(255, 149, 0, 0.15)' : 'rgba(28, 28, 30, 0.8)',
                border: isInstalled ? '2px solid #FF9500' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#FF9500', fontSize: '1.1rem' }}>{pack.title}</h4>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px',
                    color: '#10b981'
                  }}>
                    {pack.count} formulas
                  </span>
                </div>
                
                <p style={{ color: '#a5a5a5', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {pack.desc}
                </p>
                
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                  Source: <em>{pack.source}</em>
                </div>

                {/* Preview Sample Formula Titles */}
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem', background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '6px' }}>
                  <strong>Included: </strong>
                  {pack.formulas.slice(0, 3).map(f => f.name).join(', ')}
                  {pack.formulas.length > 3 && ` ... +${pack.formulas.length - 3} more`}
                </div>
              </div>

              {/* Install / Uninstall Toggle Button */}
              <button
                onClick={() => onToggleInstall(pack.id)}
                style={{
                  width: '100%',
                  background: isInstalled ? '#ef4444' : '#10b981',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isInstalled ? '✓ Installed (Click to Uninstall)' : '↓ Download & Install Pack'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormulaStore;
