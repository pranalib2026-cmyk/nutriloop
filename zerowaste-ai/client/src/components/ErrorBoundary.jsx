import React from 'react';

/**
 * Global Error Boundary — catches React rendering crashes
 * and shows a friendly recovery UI instead of a white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          fontFamily: "'Inter', -apple-system, sans-serif",
          padding: '24px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '48px 40px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Icon */}
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px',
            }}>
              ⚠️
            </div>

            <h1 style={{
              fontSize: '22px', fontWeight: 700,
              color: 'white', marginBottom: '12px',
            }}>
              Something went wrong
            </h1>

            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.6, marginBottom: '32px',
            }}>
              The app encountered an unexpected error. This is usually temporary
              — reloading should fix it.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
                  transition: 'transform 0.15s',
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
              >
                🔄 Reload App
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                🏠 Go Home
              </button>
            </div>

            {/* Debug info (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <details style={{
                marginTop: '24px', textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '10px', padding: '12px 16px',
              }}>
                <summary style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '12px', cursor: 'pointer',
                }}>
                  Developer details
                </summary>
                <pre style={{
                  color: '#F87171', fontSize: '11px',
                  marginTop: '8px', whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
