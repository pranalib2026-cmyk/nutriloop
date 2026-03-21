import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const Signup = () => {
  const navigate = useNavigate();
  const setProfile = useAuthStore((state) => state.setProfile);

  const [role, setRole] = useState('restaurant'); // 'restaurant' or 'ngo'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;
      const idToken = await userCredential.user.getIdToken();

      const payload = {
        firebaseUid,
        email,
        name,
        role,
      };

      if (role === 'restaurant') payload.restaurantName = orgName;
      if (role === 'ngo') payload.ngoName = orgName;

      // Note: we can override Authorization here because the interceptor will also do it, 
      // but explicitly supplying it makes sure we don't race condition on first render
      const { data } = await api.post('/auth/register', payload, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setProfile(data.user);

      if (data.user.role === 'restaurant') navigate('/restaurant/dashboard');
      else if (data.user.role === 'ngo') navigate('/ngo/feed');
      else if (data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to sign up.');
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
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', background: 'rgba(59,130,246,0.15)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '32px' }}>
            🌱 ZeroWaste AI
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Start making a<br />
            <span style={{ color: '#93C5FD' }}>difference today</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '28px' }}>
            Create your free account and join the movement against food waste in India.
          </div>

          {/* Today's impact box */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Today's Impact
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[['47', 'Meals posted'], ['12', 'Pickups done'], ['118', 'People fed']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#93C5FD' }}>{num}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bullet points */}
          {['100% free for NGOs forever', 'AI matches surplus to nearest NGO', 'Impact tracked automatically'].map(text => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '20px', height: '20px', background: 'rgba(147,197,253,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#93C5FD', fontSize: '11px', fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div style={{
        background: '#F8FAFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 40px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            Create your account
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            Join ZeroWaste AI for free
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { value: 'restaurant', icon: '🍽', label: 'Restaurant', sub: 'Post surplus food' },
              { value: 'ngo', icon: '🤝', label: 'NGO', sub: 'Collect food free' },
            ].map(r => (
              <div
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  background: role === r.value ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'white',
                  border: role === r.value ? '2px solid #2563EB' : '2px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{r.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: role === r.value ? '#1D4ED8' : '#374151' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{r.sub}</div>
              </div>
            ))}
          </div>

          {/* Error */}
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

          {/* Input helper */}
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            ...(role === 'restaurant' ? [{ label: 'Restaurant Name', key: 'orgName', type: 'text', placeholder: 'Spice Garden Restaurant' }] : []),
            ...(role === 'ngo' ? [{ label: 'Organization Name', key: 'orgName', type: 'text', placeholder: 'Feeding Hope Foundation' }] : []),
            { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={eval(field.key)}
                onChange={e => eval(`set${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`)(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px', fontSize: '14px',
                  background: '#FAFAFA', outline: 'none',
                  boxSizing: 'border-box', color: '#111827',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              color: 'white', border: 'none',
              borderRadius: '10px', padding: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
              marginBottom: '16px', marginTop: '4px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
