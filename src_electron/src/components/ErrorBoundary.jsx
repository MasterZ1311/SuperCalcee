import { Component } from 'react';

/**
 * React ErrorBoundary — catches render errors and shows a fallback UI.
 * Wraps the entire App to prevent white-screen crashes.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SuperCalcee ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', background: '#000',
          color: '#FF9500', fontFamily: 'system-ui, sans-serif', padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>Something went wrong</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: '400px', margin: '0 0 1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#FF9500', color: '#000', border: 'none',
              padding: '0.6rem 1.5rem', borderRadius: '8px',
              fontSize: '1rem', cursor: 'pointer', fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
