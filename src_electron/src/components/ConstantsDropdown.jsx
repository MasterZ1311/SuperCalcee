/**
 * SuperCalcee Physical & Mathematical Constants Dropdown Popover
 * =============================================================
 * 
 * Interactive popover component listing 85+ CODATA physical, astronomical, quantum,
 * chemical, mathematical, computer science, and financial constants.
 * 
 * Features:
 *  - Domain category navigation (Math, Physics, Quantum, Electromagnetism, Astrophysics, Chemistry, ComputerScience, Finance)
 *  - Instant search filtering by name, symbol, description, or unit
 *  - One-click insertion into formula input fields or calculator keypad
 *  - Exact high-precision values and SI unit representations
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useMemo } from 'react';
import { CONSTANTS } from '../data/constants';
import { Search, Sparkles, X } from 'lucide-react';

/**
 * @param {{ onSelect: (value: number, symbol: string) => void }} props
 * @returns {JSX.Element} Rendered Constants Dropdown Popover Component.
 */
const ConstantsDropdown = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => ['All', ...Object.keys(CONSTANTS)], []);

  // Filter constants across all domains or active category matching search query
  const filteredConstants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = [];

    const domainsToScan = category === 'All' 
      ? Object.keys(CONSTANTS) 
      : [category];

    for (const dom of domainsToScan) {
      const list = CONSTANTS[dom] || [];
      for (const c of list) {
        if (!q || 
            c.name.toLowerCase().includes(q) || 
            c.symbol.toLowerCase().includes(q) || 
            (c.unit && c.unit.toLowerCase().includes(q)) ||
            (c.desc && c.desc.toLowerCase().includes(q))) {
          result.push({ ...c, domain: dom });
        }
      }
    }

    return result;
  }, [category, searchQuery]);

  return (
    <div className="constants-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      {/* Dropdown Toggle Button */}
      <button 
        className="btn-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? '#FF9500' : 'rgba(255, 149, 0, 0.12)',
          color: isOpen ? '#000' : '#FF9500',
          border: '1px solid #FF9500',
          padding: '0.45rem 0.9rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        <Sparkles size={14} />
        Insert Constant â–¾
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div 
          className="dropdown-menu glass-panel"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: '380px',
            maxWidth: '90vw',
            background: '#1C1C1E',
            border: '1px solid rgba(255, 149, 0, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.85)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#2C2C2E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FF9500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} />
                Scientific Constants ({filteredConstants.length})
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              padding: '6px 8px'
            }}>
              <Search size={14} color="#8E8E93" />
              <input
                type="text"
                placeholder="Search symbol, name (e.g. h, c, G, pi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  width: '100%',
                  outline: 'none',
                  padding: 0
                }}
              />
            </div>
          </div>

          {/* Domain Category Pills */}
          <div style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            padding: '6px 8px',
            background: '#1C1C1E',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat ? '#FF9500' : 'rgba(255, 255, 255, 0.05)',
                  color: category === cat ? '#000' : '#E5E5EA',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {cat === 'ComputerScience' ? 'CS' : cat}
              </button>
            ))}
          </div>

          {/* Constant List Pane */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {filteredConstants.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93', fontSize: '0.85rem' }}>
                No constants match "{searchQuery}"
              </div>
            ) : (
              filteredConstants.map(c => (
                <div 
                  key={`${c.domain}_${c.symbol}`}
                  onClick={() => {
                    onSelect(c.value, c.symbol);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 149, 0, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{c.name}</strong>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#FF9500', 
                      fontFamily: 'monospace', 
                      background: 'rgba(255,149,0,0.15)', 
                      padding: '1px 5px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {c.symbol}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A5A5A5' }}>
                    <span style={{ fontFamily: 'monospace' }}>
                      {typeof c.value === 'number' && Math.abs(c.value) < 1e-4 ? c.value.toExponential(6) : c.value} {c.unit ? c.unit : ''}
                    </span>
                    <span style={{ color: '#636366', fontSize: '0.7rem' }}>{c.domain}</span>
                  </div>
                  {c.desc && (
                    <div style={{ fontSize: '0.7rem', color: '#8E8E93', marginTop: '2px', lineHeight: '1.2' }}>
                      {c.desc}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstantsDropdown;
