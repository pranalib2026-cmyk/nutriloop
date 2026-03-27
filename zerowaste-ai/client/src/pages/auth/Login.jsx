import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api, { checkBackendHealth, waitForBackend } from '../../services/api';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const setProfile = useAuthStore((state) => state.setProfile);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');  // friendly status like "Connecting..."

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setStatusMsg('');
    setLoading(true);

    // 1. Check internet
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network and try again.');
      setLoading(false);
      return;
    }

    // 2. Ensure backend is reachable (wait up to ~10s)
    setStatusMsg('Connecting to server...');
    const backendUp = await waitForBackend(5, 2000);
    if (!backendUp) {
      setError('Unable to reach the server. Please make sure the app is started with "npm run dev" from the project root.');
      setStatusMsg('');
      setLoading(false);
      return;
    }

    // 3. Firebase sign-in with retry
    setStatusMsg('Signing in...');
    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 4. Fetch profile from backend
        setStatusMsg('Loading your profile...');
        try {
          const { data } = await api.get('/auth/me');
          setProfile(data.user);

          // 5. Redirect by role
          const role = data.user.role;
          if (role === 'restaurant')    navigate('/restaurant/dashboard');
          else if (role === 'ngo')      navigate('/ngo/feed');
          else if (role === 'admin')    navigate('/admin/dashboard');
          else                          navigate('/dashboard');

          setLoading(false);
          return;

        } catch (backendErr) {
          const status = backendErr.response?.status;
          if (status === 401) {
            setError('Your account exists but is not registered in the system. Please sign up first.');
          } else if (status === 404) {
            setError('Profile not found. Please create a new account.');
          } else {
            setError('Could not load your profile. Please try again in a moment.');
          }
          setStatusMsg('');
          setLoading(false);
          return;
        }

      } catch (err) {
        lastError = err;
        const code = err.code || '';

        // Only retry network errors
        if (code === 'auth/network-request-failed' && attempt < MAX_RETRIES) {
          setStatusMsg(`Connection issue, retrying... (${attempt}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        break;
      }
    }

    // Final error handling — all retries exhausted
    setLoading(false);
    setStatusMsg('');
    const code = lastError?.code || '';

    const errorMessages = {
      'auth/network-request-failed': 'Network error — please check your internet connection and try again.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/invalid-email': 'Please enter a valid email address.',
    };

    setError(errorMessages[code] || 'Sign in failed. Please check your credentials and try again.');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 40%, #2563EB 80%, #3B82F6 100%)',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px', background: 'rgba(59,130,246,0.15)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', right: '-30px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px', marginBottom: '40px' }}>
            🌱 ZeroWaste AI
          </div>

          {/* Headline */}
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Every meal saved<br />
            is a <span style={{ color: '#93C5FD' }}>family fed</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '32px', maxWidth: '320px' }}>
            Join 240+ restaurants and 180+ NGOs fighting food waste together across India.
          </div>

          {/* Feature cards */}
          {[
            { icon: '✅', title: 'Free for NGOs', sub: 'Always free, no hidden charges' },
            { icon: '🤖', title: 'AI-Powered Matching', sub: 'Smart location-based matching' },
            { icon: '📍', title: 'Real-Time Discovery', sub: 'Find food within 10km instantly' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{f.title}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '14px',
            padding: '16px',
          }}>
            {[['12K+', 'Meals Saved'], ['240+', 'Restaurants'], ['180+', 'NGOs']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#93C5FD' }}>{num}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div style={{
        background: '#F8FAFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '360px' }} autoComplete="on">

          {/* Heading */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', marginBottom: '6px' }}>
              Welcome back 👋
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Sign in to continue to ZeroWaste AI</div>
          </div>

          {/* Status message (Connecting..., Signing in...) */}
          {statusMsg && !error && (
            <div style={{
              background: '#EFF6FF',
              color: '#1E40AF',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              marginBottom: '16px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease',
            }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              {statusMsg}
              <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
              `}</style>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              marginBottom: '16px',
              border: '1px solid #FECACA',
              lineHeight: '1.6',
              animation: 'fadeIn 0.2s ease',
            }}>
              ❌ {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="restaurant1@demo.com"
              style={{
                width: '100%', padding: '12px 16px',
                border: '1.5px solid #E5E7EB',
                borderRadius: '10px', fontSize: '14px',
                background: '#FAFAFA', outline: 'none',
                boxSizing: 'border-box', color: '#111827',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px',
                border: '1.5px solid #E5E7EB',
                borderRadius: '10px', fontSize: '14px',
                background: '#FAFAFA', outline: 'none',
                boxSizing: 'border-box', color: '#111827',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>
              Forgot password?
            </span>
          </div>

          {/* Offline warning */}
          {!navigator.onLine && (
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#92400E',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠️ You appear to be offline. Check your internet connection.
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              background: (loading || !email || !password)
                ? '#93C5FD'
                : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
              marginBottom: '20px',
              transition: 'all 0.2s',
            }}>
            {loading ? (statusMsg || '🔄 Signing in...') : 'Sign In →'}
          </button>

          {/* Divider */}
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            — or —
          </div>

          {/* Sign up link */}
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign up free
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
