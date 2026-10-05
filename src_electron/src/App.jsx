/**
 * SuperCalcee Root Application Component
 * ========================================
 * 
 * Main shell component orchestrating multi-domain calculator modes:
 *  - Standard Mode: iPhone iOS-inspired scientific keypad with state machine & memory
 *  - Unit Converter Mode: 12 scientific/engineering dimensional conversion categories
 *  - CAS Studio: Analytical algebra, derivatives, integrals, limits, factoring via SymPy
 *  - Physics Mode: Core physics formulas + modular Mechanics, Thermo, Electro, & Optics packs
 *  - Astrophysics Mode: Schwarzschild radius, orbital velocity, Hubble law, stellar luminosity
 *  - Chemistry Mode: Nernst potential, Arrhenius rate, Henderson-Hasselbalch, Beer-Lambert
 *  - Biology Mode: Michaelis-Menten, exponential/logistic growth, BMI, cardiac output
 *  - Finance Mode: Accounting, ROI, WACC, CAGR, EMI, Black-Scholes, NPV, IRR
 *  - Computer Science Mode: Shannon Entropy, CPU execution time, AMAT, RAM bandwidth
 *  - Math Mode: Geometry, Pythagorean, Algebra, Trigonometry, & 3D Volume packs
 *  - Custom Mode: User-created formula builder with live simulation, editing & persistence
 *  - Formula Store Mode: 14 modular downloadable/enableable section packs
 * 
 * Features global calculation history, instant search filters, and backend auto-health tracking.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Ruler,
  Sparkles,
  Atom, 
  Telescope,
  FlaskConical,
  Dna,
  DollarSign, 
  Cpu,
  Settings2,
  PlusCircle,
  DownloadCloud,
  History,
  Search,
  Edit3,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import './index.css';

import IPhoneKeypad from './components/IPhoneKeypad';
import UnitConverter from './components/UnitConverter';
import FormulaCalculator from './components/FormulaCalculator';
import CustomFormulaBuilder from './components/CustomFormulaBuilder';
import FormulaStore from './components/FormulaStore';
import HistoryPanel from './components/HistoryPanel';
import CASStudio from './components/CASStudio';
import BackendStatusBanner from './components/BackendStatusBanner';
import { PRESET_FORMULAS } from './data/presetFormulas';
import { FORMULA_PACKS, loadMultiplePacks } from './data/packRegistry';

/**
 * Sidebar navigation tab item configuration list.
 */
const navItems = [
  { id: 'standard', label: 'Standard', icon: <Calculator size={22} /> },
  { id: 'units', label: 'Unit Converter', icon: <Ruler size={22} /> },
  { id: 'cas', label: 'CAS Studio', icon: <Sparkles size={22} /> },
  { id: 'physics', label: 'Physics', icon: <Atom size={22} /> },
  { id: 'astrophysics', label: 'Astrophysics', icon: <Telescope size={22} /> },
  { id: 'chemistry', label: 'Chemistry', icon: <FlaskConical size={22} /> },
  { id: 'biology', label: 'Biology', icon: <Dna size={22} /> },
  { id: 'accounts', label: 'Finance', icon: <DollarSign size={22} /> },
  { id: 'cs', label: 'Comp Sci', icon: <Cpu size={22} /> },
  { id: 'math', label: 'Math', icon: <Settings2 size={22} /> },
  { id: 'custom', label: 'Custom', icon: <PlusCircle size={22} /> },
  { id: 'store', label: 'Formula Store', icon: <DownloadCloud size={22} /> },
];

function App() {
  const [activeTab, setActiveTab] = useState('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Custom formulas state
  const [customFormulas, setCustomFormulas] = useState(() => {
    try {
      const stored = localStorage.getItem('supercalcee_custom_formulas');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [editingCustomFormula, setEditingCustomFormula] = useState(null);

  // Installed formula pack IDs state
  const [installedPackIds, setInstalledPackIds] = useState(() => {
    try {
      const stored = localStorage.getItem('supercalcee_installed_pack_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Loaded pack formulas cache (loaded dynamically from packRegistry)
  const [loadedPackFormulas, setLoadedPackFormulas] = useState({});

  // Calculation history state
  const [calcHistory, setCalcHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('supercalcee_calc_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load installed packs dynamically
  useEffect(() => {
    let isMounted = true;
    if (installedPackIds.length > 0) {
      loadMultiplePacks(installedPackIds).then(formulasMap => {
        if (isMounted) setLoadedPackFormulas(formulasMap);
      });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setLoadedPackFormulas({});
      });
    }
    return () => {
      isMounted = false;
    };
  }, [installedPackIds]);

  // Record calculation in history
  const handleAddHistory = (entry) => {
    setCalcHistory(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      localStorage.setItem('supercalcee_calc_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your calculation history?")) {
      setCalcHistory([]);
      localStorage.removeItem('supercalcee_calc_history');
    }
  };

  const handleSaveCustomFormula = (newFormula) => {
    let updated;
    if (editingCustomFormula) {
      updated = customFormulas.map(f => f.id === newFormula.id ? newFormula : f);
      setEditingCustomFormula(null);
    } else {
      updated = [...customFormulas, newFormula];
    }
    setCustomFormulas(updated);
    localStorage.setItem('supercalcee_custom_formulas', JSON.stringify(updated));
  };

  const deleteCustomFormula = (id) => {
    const updated = customFormulas.filter(f => f.id !== id);
    setCustomFormulas(updated);
    localStorage.setItem('supercalcee_custom_formulas', JSON.stringify(updated));
    if (editingCustomFormula?.id === id) {
      setEditingCustomFormula(null);
    }
  };

  const handleToggleInstallPack = (packId) => {
    let updated;
    if (installedPackIds.includes(packId)) {
      updated = installedPackIds.filter(id => id !== packId);
    } else {
      updated = [...installedPackIds, packId];
    }
    setInstalledPackIds(updated);
    localStorage.setItem('supercalcee_installed_pack_ids', JSON.stringify(updated));
  };

  // Compute active domain formulas dynamically
  const activeDomainFormulas = useMemo(() => {
    const categoryMap = {
      'physics': 'Physics',
      'astrophysics': 'Astrophysics',
      'chemistry': 'Chemistry',
      'biology': 'Biology',
      'accounts': 'Accounts',
      'cs': 'ComputerScience',
      'math': 'Math',
    };
    const catName = categoryMap[activeTab];
    if (!catName) return [];

    const builtIn = PRESET_FORMULAS[catName] || [];

    // Filter installed section packs matching active category
    const installedFromPacks = FORMULA_PACKS
      .filter(pack => pack.category === catName && installedPackIds.includes(pack.id))
      .flatMap(pack => loadedPackFormulas[pack.id] || []);

    // Also include user custom formulas assigned to this category
    const categoryCustom = customFormulas.filter(f => f.category === catName);

    const combined = [...builtIn, ...installedFromPacks, ...categoryCustom];

    if (!searchQuery.trim()) return combined;

    const q = searchQuery.toLowerCase();
    return combined.filter(f => 
      f.name?.toLowerCase().includes(q) || 
      f.desc?.toLowerCase().includes(q) || 
      f.expression?.toLowerCase().includes(q)
    );
  }, [activeTab, installedPackIds, loadedPackFormulas, customFormulas, searchQuery]);

  const renderContent = () => {
    if (activeTab === 'standard') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <IPhoneKeypad onCalculationComplete={handleAddHistory} />
        </div>
      );
    }

    if (activeTab === 'units') {
      return <UnitConverter />;
    }

    if (activeTab === 'cas') {
      return <CASStudio />;
    }

    if (activeTab === 'store') {
      return (
        <FormulaStore 
          installedPackIds={installedPackIds} 
          onToggleInstall={handleToggleInstallPack} 
        />
      );
    }

    if (activeTab === 'custom') {
      return (
        <div>
          <CustomFormulaBuilder 
            onSave={handleSaveCustomFormula} 
            editingFormula={editingCustomFormula}
            onCancelEdit={() => setEditingCustomFormula(null)}
          />
          
          <h3 style={{ marginBottom: '1rem', color: '#E5E5EA' }}>Saved Custom Operations</h3>
          {customFormulas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No custom operations saved yet. Build one above to persist it locally!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '1.5rem' }}>
              {customFormulas.map(f => (
                <div key={f.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px', zIndex: 10 }}>
                    <button 
                      onClick={() => setEditingCustomFormula(f)}
                      style={{ background: '#2C2C2E', border: '1px solid #FF9500', color: '#FF9500', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Edit Custom Formula"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCustomFormula(f.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                      title="Delete Formula"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <FormulaCalculator formula={f} onCalculationComplete={handleAddHistory} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default domain mode rendering (Physics, Astrophysics, Chemistry, Biology, Accounts, CS, Math)
    return (
      <div>
        {/* Active Domain Info & Search Banner */}
        <div style={{ 
          background: 'rgba(255, 149, 0, 0.08)', 
          borderLeft: '4px solid #FF9500', 
          padding: '1.2rem', 
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ color: '#FF9500', fontSize: '1.05rem' }}>
              {navItems.find(i => i.id === activeTab)?.label} Formulas ({activeDomainFormulas.length})
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#A5A5A5', marginTop: '0.2rem' }}>
              Includes core scientific formulas, custom operations, and enabled modular packs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1C1C1E',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '6px 12px'
            }}>
              <Search size={14} color="#8E8E93" />
              <input
                type="text"
                placeholder="Search formulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  padding: 0,
                  margin: 0,
                  width: '180px'
                }}
              />
            </div>

            <button 
              onClick={() => { setActiveTab('store'); setSearchQuery(''); }} 
              style={{ background: '#FF9500', color: '#000', fontSize: '0.85rem', fontWeight: 'bold', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
            >
              + Enable Packs
            </button>
          </div>
        </div>

        {/* Formula Cards Grid */}
        {activeDomainFormulas.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8E8E93', padding: '40px' }}>
            No formulas match your search query.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '1.5rem' }}>
            {activeDomainFormulas.map(formula => (
              <FormulaCalculator 
                key={formula.id} 
                formula={formula} 
                onCalculationComplete={handleAddHistory}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Mobile Navigation Drawer Backdrop */}
      {isMobileNavOpen && (
        <div 
          className="mobile-nav-backdrop" 
          onClick={() => setIsMobileNavOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, textAlign: 'left' }}>SuperCalcee</h1>
          <button
            className="mobile-nav-close"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {navItems.map(item => {
          const isStore = item.id === 'store';
          return (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { 
                setActiveTab(item.id); 
                setSearchQuery(''); 
                setIsMobileNavOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {isStore && installedPackIds.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#FF9500',
                  color: '#000',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {installedPackIds.length}
                </span>
              )}
            </div>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="mobile-nav-toggle"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <h2>{navItems.find(i => i.id === activeTab)?.label} Mode</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsHistoryOpen(true)}
              style={{
                background: '#2C2C2E',
                color: '#FF9500',
                border: '1px solid rgba(255,149,0,0.3)',
                padding: '6px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Open Calculation History"
            >
              <History size={16} />
              History ({calcHistory.length})
            </button>

            <BackendStatusBanner />
          </div>
        </header>

        <section>
          {renderContent()}
        </section>
      </main>

      {/* Slide-over Calculation History Panel */}
      <HistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={calcHistory}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

export default App;
