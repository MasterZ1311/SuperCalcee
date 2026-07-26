/**
 * SuperCalcee Root Application Component
 * ========================================
 * 
 * Main shell component orchestrating multi-domain calculator modes:
 *  - Standard Mode: iPhone iOS-inspired scientific keypad.
 *  - Physics Mode: Core physics formulas + modular Classical Mechanics, Thermo, Electro, & Optics packs.
 *  - Finance Mode: Accounting, ROI, WACC, Black-Scholes, Banking, Corporate, & Valuation packs.
 *  - Math Mode: Geometry, Pythagorean, Algebra, Trigonometry, & 3D Volume packs.
 *  - Custom Mode: User-created formula builder with local browser persistence.
 *  - Formula Store Mode: Downloadable modular section packs referenced from GeeksForGeeks and FinanceFormulas.net.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Atom, 
  DollarSign, 
  Settings2,
  Activity,
  PlusCircle,
  DownloadCloud
} from 'lucide-react';
import './index.css';

import IPhoneKeypad from './components/IPhoneKeypad';
import FormulaCalculator from './components/FormulaCalculator';
import CustomFormulaBuilder from './components/CustomFormulaBuilder';
import FormulaStore from './components/FormulaStore';
import { PRESET_FORMULAS } from './data/presetFormulas';
import { FORMULA_PACKS } from './data/packRegistry';

/**
 * Sidebar navigation tab item configuration list.
 */
const navItems = [
  { id: 'standard', label: 'Standard', icon: <Calculator size={24} /> },
  { id: 'physics', label: 'Physics', icon: <Atom size={24} /> },
  { id: 'accounts', label: 'Finance', icon: <DollarSign size={24} /> },
  { id: 'math', label: 'Math', icon: <Settings2 size={24} /> },
  { id: 'custom', label: 'Custom', icon: <PlusCircle size={24} /> },
  { id: 'store', label: 'Formula Store', icon: <DownloadCloud size={24} /> },
];

/**
 * Root Application React Component.
 * 
 * @returns {JSX.Element} Rendered application shell with navigation sidebar and active content pane.
 */
function App() {
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Currently selected tab ID */
  const [activeTab, setActiveTab] = useState('standard');

  /** @type {[Array<import('./data/presetFormulas').FormulaDefinition>, React.Dispatch<React.SetStateAction<Array<any>>>]} Custom formulas list */
  const [customFormulas, setCustomFormulas] = useState([]);

  /** @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]} Installed Formula Pack IDs list */
  const [installedPackIds, setInstalledPackIds] = useState([]);

  // Load custom formulas and installed formula pack IDs from browser localStorage on mount
  useEffect(() => {
    const storedCustom = localStorage.getItem('supercalcee_custom_formulas');
    if (storedCustom) {
      try {
        setCustomFormulas(JSON.parse(storedCustom));
      } catch (e) {
        console.error("Error loading custom formulas from localStorage:", e);
      }
    }

    const storedPacks = localStorage.getItem('supercalcee_installed_pack_ids');
    if (storedPacks) {
      try {
        setInstalledPackIds(JSON.parse(storedPacks));
      } catch (e) {
        console.error("Error loading installed formula packs from localStorage:", e);
      }
    }
  }, []);

  /**
   * Saves a new custom formula to state and persists it to browser localStorage.
   * 
   * @param {import('./data/presetFormulas').FormulaDefinition} newFormula - Custom formula object.
   */
  const handleSaveCustomFormula = (newFormula) => {
    const updated = [...customFormulas, newFormula];
    setCustomFormulas(updated);
    localStorage.setItem('supercalcee_custom_formulas', JSON.stringify(updated));
  };

  /**
   * Deletes a custom formula by ID and updates localStorage.
   * 
   * @param {string} id - Formula ID to remove.
   */
  const deleteCustomFormula = (id) => {
    const updated = customFormulas.filter(f => f.id !== id);
    setCustomFormulas(updated);
    localStorage.setItem('supercalcee_custom_formulas', JSON.stringify(updated));
  };

  /**
   * Toggles installation status of a formula pack by ID and updates localStorage.
   * 
   * @param {string} packId - Unique ID of the target formula pack.
   */
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

  /**
   * Computes the combined formula array for the active domain tab (Physics, Finance, Math),
   * dynamically merging core preset formulas with downloaded section packs.
   */
  const activeDomainFormulas = useMemo(() => {
    const categoryMap = {
      'physics': 'Physics',
      'accounts': 'Accounts',
      'math': 'Math'
    };
    const catName = categoryMap[activeTab];
    if (!catName) return [];

    const builtIn = PRESET_FORMULAS[catName] || [];

    // Filter installed section packs matching active category
    const installedFromPacks = FORMULA_PACKS
      .filter(pack => pack.category === catName && installedPackIds.includes(pack.id))
      .flatMap(pack => pack.formulas);

    return [...builtIn, ...installedFromPacks];
  }, [activeTab, installedPackIds]);

  /**
   * Renders active mode view content based on `activeTab` state.
   * 
   * @returns {JSX.Element} Rendered mode view panel.
   */
  const renderContent = () => {
    if (activeTab === 'standard') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <IPhoneKeypad />
        </div>
      );
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
          <CustomFormulaBuilder onSave={handleSaveCustomFormula} />
          
          <h3 style={{ marginBottom: '1rem' }}>Saved Custom Operations</h3>
          {customFormulas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No custom operations saved yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {customFormulas.map(f => (
                <div key={f.id} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => deleteCustomFormula(f.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: '#EF4444', padding: '0.3rem 0.6rem', fontSize: '0.8rem', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', zIndex: 10 }}
                  >
                    Delete
                  </button>
                  <FormulaCalculator formula={f} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        {/* Active Domain Info Banner */}
        <div style={{ 
          background: 'rgba(255, 149, 0, 0.1)', 
          borderLeft: '4px solid #FF9500', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#FF9500' }}>Active Domain Formulas ({activeDomainFormulas.length})</strong>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Showing core formulas + your downloaded sections. Want more formulas from GeeksForGeeks or FinanceFormulas.net?
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('store')} 
            style={{ background: '#FF9500', color: '#000', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            + Browse Formula Store
          </button>
        </div>

        {/* Formula Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {activeDomainFormulas.map(formula => (
            <FormulaCalculator key={formula.id} formula={formula} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h1>SuperCalcee</h1>
        {navItems.map(item => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="topbar">
          <h2>
            {navItems.find(i => i.id === activeTab)?.label} Mode
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
            <Activity size={20} />
            <span style={{ fontSize: '0.9rem' }}>Offline Engine Active</span>
          </div>
        </header>

        <section>
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

export default App;
