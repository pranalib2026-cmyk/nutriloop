import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import axios from 'axios';

export default function RestaurantDashboard() {
  const profile = useAuthStore(state => state.profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeListings, setActiveListings] = useState(0);
  const [completedPickups, setCompletedPickups] = useState(0);
  const [totalMealsDonated, setTotalMealsDonated] = useState(0);
  const [recentListings, setRecentListings] = useState([]);
  
  // AI Prediction State
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [restaurantType, setRestaurantType] = useState('cafe');
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState('');
  
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [pendingRes, completedRes, recentRes] = await Promise.all([
        api.get('/food/my/listings?status=pending'),
        api.get('/food/my/listings?status=completed'),
        api.get('/food/my/listings?limit=5')
      ]);

      setActiveListings(pendingRes.data.total || 0);
      setCompletedPickups(completedRes.data.total || 0);
      
      // Calculate total meals
      let meals = 0;
      if (completedRes.data.listings) {
        completedRes.data.listings.forEach(listing => {
           // We sum quantity from completed listings
           if (listing.unit === 'servings') meals += listing.quantity;
           else meals += (listing.quantity * 2); // Approximate if not servings
        });
      }
      setTotalMealsDonated(meals);
      
      setRecentListings(recentRes.data.listings || []);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    setPredictionResult('');
    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          month: new Date().getMonth() + 1,
          restaurant_type: restaurantType
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPredictionResult(`Predicted surplus: ${data.predicted_quantity} servings. Recommendation: ${data.recommendation}`);
    } catch (err) {
      setPredictionResult('❌ AI service unavailable. Make sure python app.py is running on port 5001.');
    } finally {
      setPredicting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#FEF3C7', col: '#92400E' },
      accepted: { bg: '#DBEAFE', col: '#1E40AF' },
      completed: { bg: '#DCFCE7', col: '#14532D' },
      expired: { bg: '#F3F4F6', col: '#6B7280' },
      cancelled: { bg: '#FEE2E2', col: '#991B1B' }
    };
    const style = badges[status] || badges.pending;
    return (
      <span style={{ 
        backgroundColor: style.bg, 
        color: style.col, 
        padding: '4px 12px', 
        borderRadius: '9999px', 
        fontSize: '12px', 
        fontWeight: 600,
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    );
  };

  if (loading) return (
    <div style={{ backgroundColor: '#F0FDF4', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h2 style={{ color: '#16A34A' }}>Loading Dashboard...</h2>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F0FDF4', minHeight: '100vh' }}>
      <nav style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 40px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.3px' }}>
          🌱 ZeroWaste AI
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
          <span style={{ color: '#16A34A', fontWeight: 700, borderBottom: '2px solid #16A34A', paddingBottom: '3px', cursor: 'pointer' }}>Dashboard</span>
          <span onClick={() => navigate('/restaurant/add-food')} style={{ color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>Post Food</span>
          <span onClick={() => navigate('/restaurant/history')} style={{ color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>History</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: 'white',
          }}>
            {profile?.restaurantName?.charAt(0) || profile?.name?.charAt(0) || 'R'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            {profile?.restaurantName || profile?.name}
          </span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid #E5E7EB',
            borderRadius: '8px', padding: '6px 14px',
            fontSize: '13px', color: '#6B7280', cursor: 'pointer',
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0 0 24px 24px', minHeight: '220px' }}>
        {/* Background image — food distribution/community */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        {/* Dark overlay — left darker for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(5,46,22,0.88) 0%, rgba(5,46,22,0.65) 50%, rgba(5,46,22,0.2) 100%)',
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px', marginBottom: '6px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              Good morning, {profile?.restaurantName || profile?.name} 👋
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
              You've helped save <strong style={{ color: '#86EFAC' }}>{totalMealsDonated || 0}</strong> meals. Keep it going!
            </div>
            <button onClick={() => navigate('/restaurant/add-food')} style={{
              background: '#F59E0B', color: 'white', border: 'none',
              borderRadius: '99px', padding: '11px 24px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + Post Surplus Food →
            </button>
          </div>
          {/* Meals saved counter */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px', padding: '20px 28px',
            textAlign: 'center', minWidth: '140px',
          }}>
            <div style={{ fontSize: '44px', fontWeight: 800, color: '#86EFAC', lineHeight: 1 }}>
              {totalMealsDonated || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontWeight: 500 }}>
              Total meals saved
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0' }}>
          {[
            { icon: '📋', iconBg: '#DCFCE7', value: activeListings || 0, label: 'Active Listings', trend: '+2 this week', trendColor: '#16A34A', valueColor: '#16A34A' },
            { icon: '✅', iconBg: '#DBEAFE', value: completedPickups || 0, label: 'Completed Pickups', trend: '↑ 4 this month', trendColor: '#2563EB', valueColor: '#2563EB' },
            { icon: '🍽', iconBg: '#FEF3C7', value: totalMealsDonated || 0, label: 'Meals Donated', trend: '↑ 60 this week', trendColor: '#F59E0B', valueColor: '#F59E0B' },
          ].map(card => (
            <div key={card.label} style={{
              background: 'white', borderRadius: '18px', padding: '22px 20px',
              border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'all 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: '40px', height: '40px', background: card.iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: card.valueColor, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: card.trendColor, marginTop: '6px', fontWeight: 600 }}>{card.trend}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Recent Listings</div>
            <span onClick={() => navigate('/restaurant/history')} style={{ fontSize: '13px', color: '#16A34A', cursor: 'pointer', fontWeight: 600 }}>View All →</span>
          </div>

          {recentListings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍱</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>No listings yet</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Post your first surplus food to connect with nearby NGOs</div>
              <button onClick={() => navigate('/restaurant/add-food')} style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', color: 'white', border: 'none', borderRadius: '99px', padding: '11px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Post Surplus Food</button>
            </div>
          ) : (
            recentListings.slice(0, 5).map(listing => {
              const catIcons = { cooked: '🍱', raw: '🥬', packaged: '📦', bakery: '🥐', beverages: '🧃', other: '📋' };
              const catBgs = { cooked: '#FEF3C7', raw: '#DCFCE7', packaged: '#DBEAFE', bakery: '#FEF3C7', beverages: '#CFFAFE', other: '#F3F4F6' };
              const statusStyles = {
                pending:   { bg: '#DCFCE7', color: '#14532D', border: '#16A34A' },
                accepted:  { bg: '#DBEAFE', color: '#1E40AF', border: '#2563EB' },
                completed: { bg: '#DCFCE7', color: '#14532D', border: '#16A34A' },
                expired:   { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' },
                cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#DC2626' },
              };
              const s = statusStyles[listing.status] || statusStyles.pending;
              return (
                <div key={listing._id} style={{
                  background: 'white', borderRadius: '14px', padding: '14px 18px',
                  border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center',
                  gap: '14px', marginBottom: '10px', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '44px', height: '44px', background: catBgs[listing.category] || '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {catIcons[listing.category] || '📋'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '3px' }}>{listing.title}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      🍱 {listing.quantity} {listing.unit} &nbsp;·&nbsp; 📍 {listing.pickupAddress} &nbsp;·&nbsp; ⏰ {new Date(listing.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '99px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    {listing.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(99,102,241,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '22px' }}>🤖</span>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>AI Surplus Predictor</div>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>
              Predict today's surplus based on day and restaurant type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d,i) => (
                  <option key={d} value={d} style={{ background: '#1E1B4B', color: 'white' }}>{d}</option>
                ))}
              </select>
              <select value={restaurantType} onChange={e => setRestaurantType(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {['fast_food','fine_dining','buffet','cafe','bakery'].map(t => (
                  <option key={t} value={t} style={{ background: '#1E1B4B', color: 'white' }}>
                    {t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handlePredict} disabled={predicting}
              style={{ background: predicting ? '#D97706' : '#F59E0B', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '14px', fontWeight: 700, cursor: predicting ? 'not-allowed' : 'pointer', marginBottom: predictionResult ? '16px' : '0', transition: 'all 0.2s' }}>
              {predicting ? 'Predicting...' : 'Predict Surplus →'}
            </button>
            {predictionResult && !predictionResult.includes('❌') && (
              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '16px 20px', marginTop: '4px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#FCD34D', lineHeight: 1, marginBottom: '6px' }}>
                  {predictionResult.split(' servings')[0]?.replace('Predicted surplus: ', '')} servings
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                  {predictionResult.includes('Recommendation') && predictionResult.split('Recommendation: ')[1]}
                </div>
              </div>
            )}
            {predictionResult && predictionResult.includes('❌') && (
              <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#FCA5A5', marginTop: '4px' }}>
                {predictionResult}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
