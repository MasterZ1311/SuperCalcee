/**
 * SuperCalcee Global Calculation History Component
 * =================================================
 * 
 * Slide-over drawer displaying past calculations from Standard Keypad,
 * Scientific operations, and Formula calculators.
 * 
 * Features:
 *  - Persistent storage in localStorage ('supercalcee_calc_history')
 *  - Real-time search filter
 *  - One-click copy for expressions and results
 *  - Clear all history with confirmation
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState } from 'react';
import { X, Trash2, Copy, Check, Clock, Search } from 'lucide-react';

const HistoryPanel = ({ isOpen, onClose, history, onClearHistory }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredHistory = history.filter(item => {
    const q = filterQuery.toLowerCase();
    const nameMatch = item.formulaName?.toLowerCase().includes(q);
    const exprMatch = item.expression?.toLowerCase().includes(q);
    const resMatch = String(item.result)?.toLowerCase().includes(q);
    return nameMatch || exprMatch || resMatch;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '380px',
      background: '#141416',
      borderLeft: '1px solid rgba(255, 149, 0, 0.3)',
      boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.25s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#FF9500" />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Calculation History</h3>
          <span style={{ fontSize: '0.8rem', color: '#8E8E93', background: '#2C2C2E', padding: '2px 8px', borderRadius: '12px' }}>
            {history.length}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1C1C1E',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '6px 10px'
        }}>
          <Search size={14} color="#8E8E93" />
          <input
            type="text"
            placeholder="Search calculations..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            title="Clear all calculation history"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#ef4444',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem'
            }}
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Scrollable History List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8E8E93', marginTop: '40px', fontSize: '0.9rem' }}>
            {history.length === 0 ? 'No calculations recorded yet.' : 'No matching calculations found.'}
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#FF9500', fontWeight: '600' }}>
                  {item.formulaName || 'Calculation'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#636366' }}>{item.timestamp}</span>
              </div>

              {item.expression && (
                <div style={{ fontSize: '0.85rem', color: '#A5A5A5', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {item.expression}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '600' }}>
                  = {item.result} {item.unit || ''}
                </span>

                <button
                  onClick={() => copyToClipboard(item.result, index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedId === index ? '#10b981' : '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Copy Result"
                >
                  {copiedId === index ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
