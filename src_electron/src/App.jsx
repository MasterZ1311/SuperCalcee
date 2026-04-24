import React, { useState } from 'react';
import { 
  Calculator, 
  Atom, 
  Telescope, 
  FlaskConical, 
  Dna, 
  DollarSign, 
  Terminal,
  Activity
} from 'lucide-react';
import './index.css';

const navItems = [
  { id: 'math', label: 'Symbolic Math', icon: <Calculator size={24} /> },
  { id: 'physics', label: 'Physics', icon: <Atom size={24} /> },
  { id: 'astrophysics', label: 'Astrophysics', icon: <Telescope size={24} /> },
  { id: 'chemistry', label: 'Chemistry', icon: <FlaskConical size={24} /> },
  { id: 'biology', label: 'Biology', icon: <Dna size={24} /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={24} /> },
  { id: 'cs', label: 'Comp Sci', icon: <Terminal size={24} /> },
];

const keypadLayouts = {
  math: [
    { label: 'sin', val: 'sin(', type: 'func' }, { label: 'cos', val: 'cos(', type: 'func' }, { label: 'tan', val: 'tan(', type: 'func' }, { label: 'diff', val: 'diff(', type: 'calc' }, { label: 'int', val: 'integrate(', type: 'calc' }, { label: 'lim', val: 'limit(', type: 'calc' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'asin', val: 'asin(', type: 'func' }, { label: 'acos', val: 'acos(', type: 'func' }, { label: 'atan', val: 'atan(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'simplify', val: 'simplify(', type: 'calc' }, { label: 'factor', val: 'factor(', type: 'calc' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'sinh', val: 'sinh(', type: 'func' }, { label: 'cosh', val: 'cosh(', type: 'func' }, { label: 'tanh', val: 'tanh(', type: 'func' }, { label: 'sum', val: 'sum(', type: 'calc' }, { label: 'expand', val: 'expand(', type: 'calc' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: 'log', val: 'log(', type: 'func' }, { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'π', val: 'pi', type: 'symbol' }, { label: 'e', val: 'E', type: 'symbol' }, { label: 'i', val: 'I', type: 'symbol' }, { label: '∞', val: 'oo', type: 'symbol' }, { label: '×', val: '*', type: 'operator' },
    { label: 'α', val: 'alpha', type: 'symbol' }, { label: 'β', val: 'beta', type: 'symbol' }, { label: 'γ', val: 'gamma', type: 'symbol' }, { label: 'θ', val: 'theta', type: 'symbol' }, { label: 'x', val: 'x', type: 'symbol' }, { label: 'y', val: 'y', type: 'symbol' }, { label: 'z', val: 'z', type: 'symbol' }, { label: '-', val: '-', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '+', val: '+', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: 'abs', val: 'abs(', type: 'func' }, { label: '=', val: '=', type: 'evaluate' }
  ],
  physics: [
    { label: '∇', val: 'nabla', type: 'calc' }, { label: 'Δ', val: 'laplacian', type: 'calc' }, { label: '·', val: 'dot(', type: 'calc' }, { label: '×', val: 'cross(', type: 'calc' }, { label: 'diff', val: 'diff(', type: 'calc' }, { label: 'int', val: 'integrate(', type: 'calc' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'sin', val: 'sin(', type: 'func' }, { label: 'cos', val: 'cos(', type: 'func' }, { label: 'tan', val: 'tan(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'simplify', val: 'simplify(', type: 'calc' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'c', val: 'c', type: 'symbol' }, { label: 'G', val: 'G', type: 'symbol' }, { label: 'h', val: 'h', type: 'symbol' }, { label: 'ℏ', val: 'hbar', type: 'symbol' }, { label: 'k', val: 'k', type: 'symbol' }, { label: 'e', val: 'e', type: 'symbol' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: 'm_e', val: 'm_e', type: 'symbol' }, { label: 'm_p', val: 'm_p', type: 'symbol' }, { label: 'μ₀', val: 'mu_0', type: 'symbol' }, { label: 'ε₀', val: 'epsilon_0', type: 'symbol' }, { label: 'g', val: 'g', type: 'symbol' }, { label: 'π', val: 'pi', type: 'symbol' }, { label: '∞', val: 'oo', type: 'symbol' }, { label: '×', val: '*', type: 'operator' },
    { label: 'v', val: 'v', type: 'symbol' }, { label: 'a', val: 'a', type: 'symbol' }, { label: 't', val: 't', type: 'symbol' }, { label: 'F', val: 'F', type: 'symbol' }, { label: 'm', val: 'm', type: 'symbol' }, { label: 'E', val: 'E', type: 'symbol' }, { label: 'p', val: 'p', type: 'symbol' }, { label: '-', val: '-', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '+', val: '+', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: 'θ', val: 'theta', type: 'symbol' }, { label: '=', val: '=', type: 'evaluate' }
  ],
  astrophysics: [
    { label: 'G', val: 'G', type: 'symbol' }, { label: 'c', val: 'c', type: 'symbol' }, { label: 'M_☉', val: 'M_sun', type: 'symbol' }, { label: 'R_☉', val: 'R_sun', type: 'symbol' }, { label: 'L_☉', val: 'L_sun', type: 'symbol' }, { label: 'H₀', val: 'H_0', type: 'symbol' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'M', val: 'M', type: 'symbol' }, { label: 'R', val: 'R', type: 'symbol' }, { label: 'L', val: 'L', type: 'symbol' }, { label: 'T', val: 'T', type: 'symbol' }, { label: 'd', val: 'd', type: 'symbol' }, { label: 'v', val: 'v', type: 'symbol' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'AU', val: 'AU', type: 'symbol' }, { label: 'pc', val: 'pc', type: 'symbol' }, { label: 'ly', val: 'ly', type: 'symbol' }, { label: 'z', val: 'z', type: 'symbol' }, { label: 'ρ', val: 'rho', type: 'symbol' }, { label: 'a', val: 'a', type: 'symbol' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: 'log10', val: 'log10(', type: 'func' }, { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'simplify', val: 'simplify(', type: 'calc' }, { label: 'π', val: 'pi', type: 'symbol' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '×', val: '*', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: '-', val: '-', type: 'operator' }, { label: '+', val: '+', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '=', val: '=', type: 'evaluate' }
  ],
  chemistry: [
    { label: 'R', val: 'R', type: 'symbol' }, { label: 'N_A', val: 'N_A', type: 'symbol' }, { label: 'k_B', val: 'k_B', type: 'symbol' }, { label: 'h', val: 'h', type: 'symbol' }, { label: 'c', val: 'c', type: 'symbol' }, { label: 'F', val: 'F', type: 'symbol' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'P', val: 'P', type: 'symbol' }, { label: 'V', val: 'V', type: 'symbol' }, { label: 'T', val: 'T', type: 'symbol' }, { label: 'n', val: 'n', type: 'symbol' }, { label: 'C', val: 'C', type: 'symbol' }, { label: 'k', val: 'k', type: 'symbol' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'E_a', val: 'E_a', type: 'symbol' }, { label: 'pH', val: 'pH', type: 'symbol' }, { label: 'pOH', val: 'pOH', type: 'symbol' }, { label: '[H+]', val: 'H_plus', type: 'symbol' }, { label: '[OH-]', val: 'OH_minus', type: 'symbol' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: 'log10', val: 'log10(', type: 'func' }, { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'simplify', val: 'simplify(', type: 'calc' }, { label: 'e', val: 'e', type: 'symbol' }, { label: 'm_e', val: 'm_e', type: 'symbol' }, { label: '×', val: '*', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: '-', val: '-', type: 'operator' }, { label: '+', val: '+', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '=', val: '=', type: 'evaluate' }
  ],
  biology: [
    { label: 'N_A', val: 'N_A', type: 'symbol' }, { label: 'R', val: 'R', type: 'symbol' }, { label: 'T', val: 'T', type: 'symbol' }, { label: 'p', val: 'p', type: 'symbol' }, { label: 'q', val: 'q', type: 'symbol' }, { label: 'N', val: 'N', type: 'symbol' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'r', val: 'r', type: 'symbol' }, { label: 'K', val: 'K', type: 'symbol' }, { label: 't', val: 't', type: 'symbol' }, { label: 'V_max', val: 'V_max', type: 'symbol' }, { label: 'K_m', val: 'K_m', type: 'symbol' }, { label: '[S]', val: 'S_conc', type: 'symbol' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'simplify', val: 'simplify(', type: 'calc' }, { label: 'factor', val: 'factor(', type: 'calc' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: '×', val: '*', type: 'operator' }, { label: '-', val: '-', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '=', val: '=', type: 'evaluate' }, { label: '+', val: '+', type: 'operator' }
  ],
  finance: [
    { label: 'NPV', val: 'NPV(', type: 'func' }, { label: 'IRR', val: 'IRR(', type: 'func' }, { label: 'WACC', val: 'WACC(', type: 'func' }, { label: 'BS_call', val: 'bs_call(', type: 'func' }, { label: 'BS_put', val: 'bs_put(', type: 'func' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'r', val: 'r', type: 'symbol' }, { label: 't', val: 't', type: 'symbol' }, { label: 'CF', val: 'CF', type: 'symbol' }, { label: 'PV', val: 'PV', type: 'symbol' }, { label: 'FV', val: 'FV', type: 'symbol' }, { label: 'PMT', val: 'PMT', type: 'symbol' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'S', val: 'S', type: 'symbol' }, { label: 'K', val: 'K', type: 'symbol' }, { label: 'σ', val: 'sigma', type: 'symbol' }, { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'sqrt', val: 'sqrt(', type: 'func' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: '×', val: '*', type: 'operator' }, { label: '-', val: '-', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '=', val: '=', type: 'evaluate' }, { label: '+', val: '+', type: 'operator' }
  ],
  cs: [
    { label: 'log2', val: 'log2(', type: 'func' }, { label: 'ln', val: 'ln(', type: 'func' }, { label: 'exp', val: 'exp(', type: 'func' }, { label: 'O(', val: 'O(', type: 'func' }, { label: 'Θ(', val: 'Theta(', type: 'func' }, { label: 'Ω(', val: 'Omega(', type: 'func' }, { label: 'C', val: 'C', type: 'action' }, { label: 'DEL', val: 'DEL', type: 'action' },
    { label: 'AND', val: ' AND ', type: 'calc' }, { label: 'OR', val: ' OR ', type: 'calc' }, { label: 'XOR', val: ' XOR ', type: 'calc' }, { label: 'NOT', val: 'NOT ', type: 'calc' }, { label: 'NAND', val: ' NAND ', type: 'calc' }, { label: 'NOR', val: ' NOR ', type: 'calc' }, { label: '(', val: '(', type: 'operator' }, { label: ')', val: ')', type: 'operator' },
    { label: 'n', val: 'n', type: 'symbol' }, { label: 'k', val: 'k', type: 'symbol' }, { label: 'T(n)', val: 'T(n)', type: 'symbol' }, { label: 'p', val: 'p', type: 'symbol' }, { label: 'H', val: 'H', type: 'symbol' }, { label: 'solve', val: 'solve(', type: 'calc' }, { label: '^', val: '**', type: 'operator' }, { label: '÷', val: '/', type: 'operator' },
    { label: '7', val: '7', type: '' }, { label: '8', val: '8', type: '' }, { label: '9', val: '9', type: '' }, { label: '4', val: '4', type: '' }, { label: '5', val: '5', type: '' }, { label: '6', val: '6', type: '' }, { label: '×', val: '*', type: 'operator' }, { label: '-', val: '-', type: 'operator' },
    { label: '1', val: '1', type: '' }, { label: '2', val: '2', type: '' }, { label: '3', val: '3', type: '' }, { label: '0', val: '0', type: '' }, { label: '.', val: '.', type: '' }, { label: ',', val: ',', type: 'operator' }, { label: '=', val: '=', type: 'evaluate' }, { label: '+', val: '+', type: 'operator' }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState('math');
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      if (activeTab === 'math') {
        endpoint = 'http://127.0.0.1:8000/cas/simplify';
        payload = { expr: expr, variable: 'x' };
      } else {
        // Fallback symbolic solving for other domains
        endpoint = 'http://127.0.0.1:8000/formula/solve';
        payload = { equation: expr, solve_for: 'x', given: {} };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setResult("Error communicating with computation engine");
    }
    setLoading(false);
  };

  const handleKeyClick = (val) => {
    if (val === 'C') {
      setExpr('');
      setResult(null);
    } else if (val === 'DEL') {
      setExpr(prev => prev.slice(0, -1));
    } else if (val === '=') {
      handleCompute();
    } else {
      setExpr(prev => prev + val);
    }
  };

  const getDomainVariables = () => {
    switch(activeTab) {
      case 'math': return ['x', 'y', 'z', 'pi', 'sin(', 'cos(', 'tan('];
      case 'physics': return ['m', 'v', 'a', 'F', 't', 'G', 'c'];
      case 'astrophysics': return ['M', 'R', 'G', 'c', 'T', 'a'];
      case 'chemistry': return ['n', 'R', 'T', 'P', 'V', 'k'];
      case 'biology': return ['p', 'q', 'N', 'r', 'K'];
      case 'finance': return ['NPV', 'IRR', 'r', 't', 'CF'];
      case 'cs': return ['n', 'log(n)', 'O(', 'T(n)'];
      default: return ['x', 'y'];
    }
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
            onClick={() => { setActiveTab(item.id); setResult(null); setExpr(''); }}
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
            {navItems.find(i => i.id === activeTab)?.label} Engine
          </h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981'}}>
            <Activity size={20} />
            <span style={{fontSize: '0.9rem'}}>Offline Engine Active</span>
          </div>
        </header>

        <section className="calculator-container glass-panel">
          
          <div className="domain-toolbar">
            {getDomainVariables().map(v => (
              <button key={v} className="domain-var-btn" onClick={() => handleKeyClick(v)}>
                {v}
              </button>
            ))}
          </div>

          <div className="calculator-screen">
            <input 
              type="text" 
              className="calc-input"
              placeholder="0"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompute()}
            />
            <div className="calc-result">
              {loading ? 'Computing...' : (result !== null ? (typeof result === 'object' ? JSON.stringify(result) : `= ${result}`) : '')}
            </div>
          </div>

          <div className="calculator-keypad">
            {keypadLayouts[activeTab]?.map((btn, index) => (
              <div 
                key={index} 
                className={`calc-btn ${btn.type}`} 
                onClick={() => handleKeyClick(btn.val)}
              >
                {btn.label}
              </div>
            ))}
          </div>
        </section>

        {activeTab === 'finance' && (
          <section className="glass-panel">
            <h3>Finance Modules</h3>
            <p style={{color: 'var(--text-secondary)'}}>
              NPV, IRR, WACC and Black-Scholes solver available via the offline Formula engine. Input parameter mappings.
            </p>
            {/* Future iteration expands domain inputs here */}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
