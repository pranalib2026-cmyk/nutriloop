import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const setProfile = useAuthStore((state) => state.setProfile);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Wait a moment for Firebase auth state to settle, though API interceptor uses current user
      const { data } = await api.get('/auth/me');
      setProfile(data.user);

      // Redirect based on role
      const role = data.user.role;
      if (role === 'restaurant') navigate('/restaurant/dashboard');
      else if (role === 'ngo') navigate('/ngo/feed');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/'); // fallback
    } catch (err) {
      console.error(err);
      if (err.code) {
        // Firebase error
        setError(`Firebase Error: ${err.message.replace('Firebase: ', '')}`);
      } else if (err.response) {
        // Backend API error
        setError(`Backend Error: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        // Network or other error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
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
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', marginBottom: '6px' }}>
              Welcome back 👋
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Sign in to continue to ZeroWaste AI</div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#FEE2E2', color: '#991B1B',
              borderRadius: '10px', padding: '12px 16px',
              fontSize: '13px', marginBottom: '16px',
              border: '1px solid #FECACA',
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Email address
            </label>
            <input
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

          {/* Submit button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              color: 'white', border: 'none',
              borderRadius: '10px', padding: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
              marginBottom: '20px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
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

        </div>
      </div>
    </div>
  );
};

export default Login;
