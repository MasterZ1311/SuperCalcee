/**
 * SuperCalcee Symbolic CAS Studio Component
 * =========================================
 * 
 * Interactive symbolic mathematics workbench backed by SymPy through FastAPI.
 * Supports:
 *  - Algebraic simplification
 *  - Polynomial factorization
 *  - Product & power expansion
 *  - Symbolic differentiation
 *  - Indefinite integration
 *  - Limit evaluation
 *  - Equation root solving
 * 
 * Features active cancellation (AbortController), timeout protection,
 * quick-preset expressions, loading indicators, and structured error alerts.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useRef } from 'react';
import { Sparkles, Play, XCircle, Copy, Check, Info, Code2 } from 'lucide-react';
import { cas } from '../api/index.js';

const OPERATIONS = [
  { id: 'simplify', label: 'Simplify', desc: 'Algebraically reduce expression to simplest canonical form', placeholder: '(x^2 - 1)/(x - 1)', hasVar: false, hasApproach: false },
  { id: 'factor', label: 'Factor', desc: 'Factor polynomial into irreducible algebraic factors', placeholder: 'x^2 - 4', hasVar: false, hasApproach: false },
  { id: 'expand', label: 'Expand', desc: 'Multiply out products and powers into expanded polynomials', placeholder: '(x + 2)^3', hasVar: false, hasApproach: false },
  { id: 'differentiate', label: 'Differentiate', desc: 'Compute symbolic derivative with respect to variable', placeholder: 'sin(x) * x^2', hasVar: true, hasApproach: false },
  { id: 'integrate', label: 'Integrate', desc: 'Compute symbolic indefinite integral with respect to variable', placeholder: '3*x^2 + 2*x', hasVar: true, hasApproach: false },
  { id: 'limit', label: 'Limit', desc: 'Compute symbolic limit as variable approaches a point', placeholder: 'sin(x)/x', hasVar: true, hasApproach: true },
  { id: 'solve', label: 'Solve Equation', desc: 'Find algebraic roots of equation for target variable', placeholder: 'x^2 - 9 = 0', hasVar: true, hasApproach: false },
];

const PRESETS = {
  simplify: ['(x**2 - 1)/(x - 1)', 'cos(x)**2 + sin(x)**2', '(x**3 - 8)/(x - 2)'],
  factor: ['x**2 - 4', 'x**3 - 8', 'x**2 + 5*x + 6', 'x**4 - 16'],
  expand: ['(x + 2)**3', '(a + b)**2', '(x - 1)*(x + 1)*(x**2 + 1)'],
  differentiate: ['sin(x)*x**2', 'exp(-x**2)', 'log(x)/x', 'tan(x)'],
  integrate: ['3*x**2 + 2*x', '1/x', 'exp(2*x)', 'sin(x)**2'],
  limit: ['sin(x)/x', '(1 + 1/x)**x', '(x**2 - 4)/(x - 2)'],
  solve: ['x**2 - 9 = 0', '2*x + 5 = 15', 'x**3 - 4*x = 0', 'exp(x) - 1 = 0'],
};

const CASStudio = () => {
  const [activeOp, setActiveOp] = useState('simplify');
  const [expr, setExpr] = useState(PRESETS.simplify[0]);
  const [variable, setVariable] = useState('x');
  const [approach, setApproach] = useState('0');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Reference to current AbortController for in-flight cancellation
  const abortControllerRef = useRef(null);

  const currentOpConfig = OPERATIONS.find(o => o.id === activeOp) || OPERATIONS[0];

  const handleSelectOp = (opId) => {
    setActiveOp(opId);
    setError(null);
    setResult(null);
    const opPresets = PRESETS[opId] || [];
    if (opPresets.length > 0) {
      setExpr(opPresets[0]);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleCompute = async () => {
    if (!expr.trim()) {
      setError({ message: 'Expression string cannot be empty.' });
      return;
    }

    // Cancel any previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    const start = performance.now();

    try {
      let res;
      const options = { signal: controller.signal, timeout: 10000 };

      switch (activeOp) {
        case 'simplify':
          res = await cas.simplify(expr, options);
          break;
        case 'factor':
          res = await cas.factor(expr, options);
          break;
        case 'expand':
          res = await cas.expand(expr, options);
          break;
        case 'differentiate':
          res = await cas.differentiate(expr, variable, options);
          break;
        case 'integrate':
          res = await cas.integrate(expr, variable, options);
          break;
        case 'limit':
          res = await cas.limit(expr, variable, approach, options);
          break;
        case 'solve':
          res = await cas.solve(expr, variable, options);
          break;
        default:
          res = await cas.simplify(expr, options);
      }

      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setRequestId(res.requestId);

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError({ message: err.message || 'Unexpected calculation error.' });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = () => {
    if (result !== null) {
      const textToCopy = Array.isArray(result) ? result.join(', ') : String(result);
      navigator.clipboard?.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Studio Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF9500', margin: '0 0 0.5rem 0' }}>
          <Sparkles size={24} />
          Symbolic CAS Studio
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          High-performance analytical algebra, exact calculus, and polynomial factoring powered by SymPy.
        </p>
      </div>

      {/* Operation Tabs Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '6px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '1.5rem',
      }}>
        {OPERATIONS.map(op => (
          <button
            key={op.id}
            onClick={() => handleSelectOp(op.id)}
            style={{
              flex: '1 1 auto',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: activeOp === op.id ? '#FF9500' : 'transparent',
              color: activeOp === op.id ? '#000' : '#cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Main Studio Card */}
      <div className="glass-panel" style={{ background: 'rgba(30, 41, 59, 0.85)', padding: '1.5rem', borderRadius: '16px' }}>
        {/* Operation Description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <Info size={16} />
          <span>{currentOpConfig.desc}</span>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
              Mathematical Expression:
            </label>
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder={currentOpConfig.placeholder}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1.1rem',
                fontFamily: 'monospace',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Secondary parameters (variable, approach point) */}
          {(currentOpConfig.hasVar || currentOpConfig.hasApproach) && (
            <div style={{ display: 'grid', gridTemplateColumns: currentOpConfig.hasApproach ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              {currentOpConfig.hasVar && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    Target Variable:
                  </label>
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => setVariable(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {currentOpConfig.hasApproach && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    Point of Approach:
                  </label>
                  <input
                    type="text"
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="0, oo, -oo, or value"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Preset Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Quick Presets:</span>
          {(PRESETS[activeOp] || []).map((preset) => (
            <button
              key={preset}
              onClick={() => setExpr(preset)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Action Button Row with Cancellation */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleCompute}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: '#FF9500',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(255, 149, 0, 0.3)',
            }}
          >
            <Play size={18} fill="#000" />
            {isLoading ? 'Computing with SymPy...' : `Compute ${currentOpConfig.label}`}
          </button>

          {isLoading && (
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 20px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <XCircle size={18} />
              Cancel
            </button>
          )}
        </div>

        {/* Error Alert Display */}
        {error && (
          <div style={{
            marginTop: '1.2rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            borderLeft: '4px solid #ef4444',
            borderRadius: '6px',
            color: '#fca5a5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#ef4444',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {error.code || 'ERROR'}
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Calculation Failed</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{error.message}</p>
          </div>
        )}

        {/* Result Display Box */}
        {result !== null && !error && (
          <div style={{
            marginTop: '1.5rem',
            background: '#090d16',
            border: '1px solid rgba(255, 149, 0, 0.4)',
            borderRadius: '12px',
            padding: '1.2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={16} color="#FF9500" />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Exact Analytical Result</span>
                {latency !== null && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {latency}ms
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{
              fontSize: '1.4rem',
              fontFamily: 'monospace',
              color: '#fff',
              wordBreak: 'break-all',
              padding: '0.5rem 0',
            }}>
              {Array.isArray(result) ? `[ ${result.join(', ')} ]` : String(result)}
            </div>

            {requestId && (
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '6px' }}>
                Correlation ID: <code>{requestId}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CASStudio;
