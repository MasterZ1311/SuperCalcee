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

        <section className="glass-panel">
          <h3>Compute Expression</h3>
          <p style={{color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '0.5rem'}}>
            Enter your symbolic equation or expression (e.g. <code>x**2 + 2*x + 1</code>, <code>T**2 = (4*pi**2 * a**3) / (G * M)</code>):
          </p>
          <input 
            type="text" 
            placeholder="Expression..."
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompute()}
          />
          <button onClick={handleCompute} disabled={loading}>
            {loading ? 'Computing...' : 'Evaluate'}
          </button>

          {result !== null && (
            <div className="result-box">
              <strong>Result: </strong> {typeof result === 'object' ? JSON.stringify(result) : result}
            </div>
          )}
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
