import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

export default function AddFood() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'cooked',
    quantity: 1,
    unit: 'servings',
    description: '',
    pickupAddress: '',
    expiresAt: '',
    pickupStart: '',
    pickupEnd: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate expiresAt > 30 mins
      const expiresDate = new Date(formData.expiresAt);
      const thirtyMinsFromNow = new Date(Date.now() + 30 * 60000);
      if (expiresDate < thirtyMinsFromNow) {
        throw new Error('Expiry time must be at least 30 minutes from now');
      }

      await api.post('/food', {
        title: formData.title,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        pickupAddress: formData.pickupAddress,
        expiresAt: formData.expiresAt,
        pickupWindow: {
          start: formData.pickupStart,
          end: formData.pickupEnd
        },
        location: { coordinates: [72.8777, 19.0760] }
      });

      setSuccess('Surplus food posted successfully!');
      setTimeout(() => navigate('/restaurant/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to post food listing');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '14px' };
  const inputContainerStyle = { display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', transition: 'border-color 0.2s', marginBottom: '16px' };
  const getIcon = (name) => {
    switch (name) {
      case 'title': return '🍱';
      case 'quantity': return '🍽';
      case 'pickupAddress': return '📍';
      case 'expiresAt':
      case 'pickupStart':
      case 'pickupEnd': return '🕐';
      default: return '✏️';
    }
  };

  const handleFocus = (e) => e.currentTarget.parentElement.style.borderColor = '#16A34A';
  const handleBlur = (e) => e.currentTarget.parentElement.style.borderColor = '#D1D5DB';

  const InputField = ({ label, name, type = 'text', required, ...props }) => (
    <div>
      <label style={labelStyle}>{label} {required && <span style={{color: '#DC2626'}}>*</span>}</label>
      <div style={inputContainerStyle}>
        <span style={{ fontSize: '18px', marginRight: '8px', color: '#6B7280' }}>{getIcon(name)}</span>
        <input 
          name={name} type={type} required={required}
          value={formData[name]} onChange={handleChange}
          onFocus={handleFocus} onBlur={handleBlur}
          style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }}
          {...props}
        />
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F0F4F0', minHeight: '100vh', paddingBottom: '40px' }}>
      <nav style={{
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E5E7EB', padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div 
          onClick={() => navigate('/restaurant/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: 600, fontSize: '15px' }}
        >
          ← Back to Dashboard
        </div>
      </nav>

      <main style={{ maxWidth: '640px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '28px' }}>🌿</span>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#14532D', fontWeight: 800 }}>Post Surplus Food</h1>
          </div>
          
          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500, fontSize: '14px', borderLeft: '4px solid #EF4444' }}>{error}</div>}
          {success && <div style={{ background: '#DCFCE7', color: '#15803D', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 600, fontSize: '14px', borderLeft: '4px solid #22C55E' }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <InputField label="Food Title" name="title" required placeholder="e.g. Leftover Biryani — 40 servings" />

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['cooked', 'raw', 'packaged', 'bakery', 'beverages', 'other'].map(cat => (
                  <div 
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    style={{
                      padding: '8px 16px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      background: formData.category === cat ? '#16A34A' : '#DCFCE7',
                      color: formData.category === cat ? '#FFFFFF' : '#14532D',
                      border: formData.category === cat ? '1px solid #16A34A' : '1px solid transparent'
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <InputField label="Quantity" name="quantity" type="number" min="1" required />
              <div>
                <label style={labelStyle}>Unit</label>
                <div style={{ ...inputContainerStyle, padding: 0 }}>
                  <select name="unit" value={formData.unit} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                    style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent', cursor: 'pointer' }}>
                    <option value="servings">Servings</option>
                    <option value="kg">Kg</option>
                    <option value="litres">Litres</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <div style={{ ...inputContainerStyle, alignItems: 'flex-start', padding: '12px' }}>
                <span style={{ fontSize: '18px', marginRight: '8px', color: '#6B7280', marginTop: '2px' }}>📝</span>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                  placeholder="Any details, allergens, packaging..." 
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>

            <InputField label="Pickup Address" name="pickupAddress" required placeholder="Full pickup address" />
            <InputField label="Expires At" name="expiresAt" type="datetime-local" required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <InputField label="Pickup Window Start" name="pickupStart" type="time" />
              <InputField label="Pickup Window End" name="pickupEnd" type="time" />
            </div>

            <button 
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px', background: loading ? '#86EFAC' : '#15803D', color: 'white', 
                border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px', transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(21, 128, 61, 0.3)'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Posting...' : 'Post Surplus Food'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
