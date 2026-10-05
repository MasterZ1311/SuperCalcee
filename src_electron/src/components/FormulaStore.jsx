/**
 * SuperCalcee Formula Store Component
 * ====================================
 * 
 * Modular Formula Store library allowing users to browse and enable domain-specific
 * section packs (e.g. Classical Mechanics, Thermodynamics, Corporate Finance, Geometry,
 * Stellar Physics, Reaction Kinetics, Population Genetics, Systems Architecture).
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useMemo } from 'react';
import { FORMULA_PACKS } from '../data/packRegistry';
import { Check, Plus, Trash2, Search, Sparkles, BookOpen } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Physics',
  'Accounts',
  'Math',
  'Astrophysics',
  'Chemistry',
  'Biology',
  'ComputerScience'
];

const FormulaStore = ({ installedPackIds, onToggleInstall }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Total available formulas count across all packs
  const totalFormulasCount = useMemo(() => {
    return FORMULA_PACKS.reduce((sum, p) => sum + p.count, 0);
  }, []);

  // Total installed formulas count
  const installedFormulasCount = useMemo(() => {
    return FORMULA_PACKS
      .filter(p => installedPackIds.includes(p.id))
      .reduce((sum, p) => sum + p.count, 0);
  }, [installedPackIds]);

  // Filter packs based on category and search query
  const filteredPacks = useMemo(() => {
    return FORMULA_PACKS.filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        p.title.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q) || 
        p.source.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Store Header Banner */}
      <div className="glass-panel" style={{ background: '#1C1C1E', border: '1px solid #FF9500' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: '#FF9500', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} />
              Modular Formula Pack Catalog
            </h3>
            <p style={{ color: '#A5A5A5', fontSize: '0.9rem', margin: 0 }}>
              Specialized scientific and financial packs divided section-wise. Enable only what you need to keep your workspace fast and focused!
            </p>
          </div>

          {/* Stats Badges */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: '#2C2C2E', padding: '6px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#8E8E93' }}>AVAILABLE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{totalFormulasCount} formulas</div>
            </div>
            <div style={{ background: 'rgba(255,149,0,0.15)', border: '1px solid #FF9500', padding: '6px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#FF9500' }}>ENABLED</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#FF9500' }}>{installedPackIds.length} packs ({installedFormulasCount} formulas)</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '1rem'
        }}>
          <Search size={16} color="#8E8E93" />
          <input
            type="text"
            placeholder="Search packs by topic, formula name, or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#FF9500' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#000' : '#E5E5EA',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'Accounts' ? 'Finance' : cat === 'ComputerScience' ? 'Comp Sci' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredPacks.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8E8E93', padding: '40px' }}>
            No formula packs match your filter.
          </div>
        ) : (
          filteredPacks.map(pack => {
            const isInstalled = installedPackIds.includes(pack.id);
            return (
              <div 
                key={pack.id} 
                className="glass-panel"
                style={{
                  background: isInstalled ? 'rgba(255, 149, 0, 0.08)' : '#1C1C1E',
                  border: isInstalled ? '1px solid #FF9500' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  padding: '1.4rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>
                      {pack.title}
                    </h4>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(255, 149, 0, 0.15)', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      color: '#FF9500',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {pack.count} formulas
                    </span>
                  </div>
                  
                  <p style={{ color: '#8E8E93', fontSize: '0.85rem', marginBottom: '8px', lineHeight: '1.4' }}>
                    {pack.desc}
                  </p>
                  
                  <div style={{ fontSize: '0.75rem', color: '#636366', marginBottom: '12px' }}>
                    Attribution: <em>{pack.source}</em>
                  </div>
                </div>

                <button
                  onClick={() => onToggleInstall(pack.id)}
                  style={{
                    width: '100%',
                    background: isInstalled ? 'rgba(239, 68, 68, 0.15)' : '#FF9500',
                    border: isInstalled ? '1px solid #ef4444' : 'none',
                    color: isInstalled ? '#ef4444' : '#000',
                    fontWeight: 'bold',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isInstalled ? (
                    <>
                      <Trash2 size={16} />
                      Disable Pack
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Enable Pack
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FormulaStore;
