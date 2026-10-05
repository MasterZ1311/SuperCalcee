/**
 * SuperCalcee Backend Connection & Recovery Status Banner
 * =======================================================
 * 
 * Monitors the health and latency of the local FastAPI computational core.
 * Displays real-time operational status (Online, Checking, Offline) and provides
 * a 1-click recovery retry trigger if the backend process terminates or fails to respond.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, RefreshCw, CheckCircle2, Server, Settings, Check } from 'lucide-react';
import { health } from '../api/index.js';
import { apiClient } from '../api/client.js';

/**
 * Backend Status & Recovery Component.
 * 
 * @param {Object} props
 * @param {(isOnline: boolean) => void} [props.onStatusChange] - Optional callback when status updates.
 * @returns {JSX.Element}
 */
const BackendStatusBanner = ({ onStatusChange }) => {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [latency, setLatency] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => apiClient.getBaseUrl());

  const performHealthCheck = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await health.checkHealth({ timeout: 4000 });
      if (res.online) {
        setStatus('online');
        setLatency(res.latencyMs);
        setErrorMessage(null);
        if (onStatusChange) onStatusChange(true);
      } else {
        setStatus('offline');
        setLatency(null);
        setErrorMessage(res.error || 'Server returned non-healthy response.');
        if (onStatusChange) onStatusChange(false);
      }
    } catch (err) {
      setStatus('offline');
      setLatency(null);
      setErrorMessage(err.message || 'Cannot connect to port 8000.');
      if (onStatusChange) onStatusChange(false);
    } finally {
      setIsRetrying(false);
    }
  }, [onStatusChange]);

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    if (serverUrl.trim()) {
      apiClient.setBaseUrl(serverUrl.trim());
      setShowConfig(false);
      performHealthCheck();
    }
  };

  const handleResetServerUrl = () => {
    const defaultUrl = 'http://127.0.0.1:8000';
    setServerUrl(defaultUrl);
    apiClient.setBaseUrl(defaultUrl);
    setShowConfig(false);
    performHealthCheck();
  };

  // Initial check on mount + periodic polling every 12 seconds
  useEffect(() => {
    let isMounted = true;
    const checkAsync = async () => {
      if (isMounted) {
        await performHealthCheck();
      }
    };

    const timer = setTimeout(checkAsync, 0);
    const interval = setInterval(checkAsync, 12000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [performHealthCheck]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Topbar Inline Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {status === 'online' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>Python Core Online ({latency}ms)</span>
          </div>
        )}

        {status === 'checking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Verifying Core...</span>
          </div>
        )}

        {status === 'offline' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
            <span>Core Offline</span>
            <button
              onClick={performHealthCheck}
              disabled={isRetrying}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '2px 8px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} style={{ animation: isRetrying ? 'spin 1s linear infinite' : 'none' }} />
              Retry
            </button>
          </div>
        )}

        <button
          onClick={() => setShowConfig(!showConfig)}
          title="Configure API Endpoint (for Mobile or Remote Server)"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#A5A5A5',
            padding: '4px 8px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Server size={12} />
          <span>Server</span>
        </button>
      </div>

      {/* Endpoint Configuration Popover */}
      {showConfig && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          width: '320px',
          maxWidth: '90vw',
          background: '#1C1C1E',
          border: '1px solid rgba(255, 149, 0, 0.4)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
          zIndex: 110,
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#FF9500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} /> Computational Server URL
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#A5A5A5', margin: '0 0 0.8rem 0' }}>
            For mobile or remote access, enter your host IP (e.g. <code>http://192.168.1.50:8000</code>) or cloud API URL.
          </p>
          <form onSubmit={handleSaveServerUrl}>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://192.168.1.x:8000"
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.85rem',
                background: '#000',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                marginBottom: '0.8rem',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button
                type="button"
                onClick={handleResetServerUrl}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#A5A5A5',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Reset Local
              </button>
              <button
                type="submit"
                style={{
                  background: '#FF9500',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Save & Connect
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recoverable Offline Alert Banner */}
      {status === 'offline' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderLeft: '4px solid #ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '0.8rem 1rem',
          marginTop: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                Python Computational Core Unreachable ({apiClient.getBaseUrl()})
              </strong>
              <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                Symbolic CAS, verified numerical solvers, and advanced scientific algorithms are running in offline fallback mode.
                {errorMessage && ` (${errorMessage})`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowConfig(true)}
              style={{
                background: '#2C2C2E',
                color: '#FF9500',
                border: '1px solid rgba(255,149,0,0.4)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Change Server
            </button>
            <button
              onClick={performHealthCheck}
              disabled={isRetrying}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} style={{ animation: isRetrying ? 'spin 1s linear infinite' : 'none' }} />
              {isRetrying ? 'Connecting...' : 'Reconnect Core'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatusBanner;
