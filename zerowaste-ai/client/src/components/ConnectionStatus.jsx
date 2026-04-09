import React, { useState, useEffect, useRef, useCallback } from 'react';

const HEALTH_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')
  .replace(/\/api\/v1\/?$/, '') + '/health';

const POLL_INTERVAL = 10000;   // 10s when connected
const RETRY_INTERVAL = 5000;   // 5s when disconnected

/**
 * Live connection status indicator.
 * Shows a small dot in the bottom-right corner:
 *   🟢 Connected (fades out after 3s)
 *   🔴 Disconnected (stays visible with reconnecting message)
 */
const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');   // 'checking' | 'connected' | 'disconnected'
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        setStatus(prev => {
          if (prev === 'disconnected') {
            // Just reconnected — show briefly
            setVisible(true);
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = setTimeout(() => setVisible(false), 3000);
          }
          return 'connected';
        });
      } else {
        setStatus('disconnected');
        setVisible(true);
      }
    } catch {
      setStatus('disconnected');
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkHealth();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [checkHealth]);

  // Adjust poll rate based on status
  useEffect(() => {
    clearInterval(intervalRef.current);
    const interval = status === 'disconnected' ? RETRY_INTERVAL : POLL_INTERVAL;
    intervalRef.current = setInterval(checkHealth, interval);
    return () => clearInterval(intervalRef.current);
  }, [status, checkHealth]);

  // Don't render anything during initial check or when hidden and connected
  if (status === 'checking') return null;
  if (status === 'connected' && !visible) return null;

  const isConnected = status === 'connected';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: isConnected
          ? 'rgba(22, 163, 74, 0.95)'
          : 'rgba(220, 38, 38, 0.95)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        animation: 'slideUp 0.3s ease',
      }}
    >
      {/* Pulsing dot */}
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'white',
        display: 'inline-block',
        animation: isConnected ? 'none' : 'pulse 1.5s infinite',
      }} />

      {isConnected ? 'Connected' : 'Reconnecting to server...'}

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;
