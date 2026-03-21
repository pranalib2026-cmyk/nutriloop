import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function FoodFeed() {
  const profile = useAuthStore(state => state.profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listings, setListings] = useState([]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Expiring Soon'); // 'Expiring Soon', 'Most Quantity'
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/food?status=pending');
      console.log('Feed response:', res.data);
      setListings(res.data.listings || []);
    } catch (err) {
      setError('Failed to load food listings. Make sure the backend is running.');
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (listing) => {
    if (accepting === listing._id) return;
    
    const confirmed = window.confirm(
      `Accept pickup of "${listing.title}" from ${listing.restaurantId?.restaurantName || listing.restaurantId?.name}?\n\nQuantity: ${listing.quantity} ${listing.unit}`
    );
    if (!confirmed) return;
    
    setAccepting(listing._id);
    try {
      await api.post('/requests', {
        foodListingId: listing._id,
        quantityRequested: listing.quantity
      });
      // Remove from feed immediately
      setListings(prev => prev.filter(l => l._id !== listing._id));
      alert('✅ Pickup accepted! Check My Requests to track it.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to accept pickup';
      alert('❌ ' + msg);
    } finally {
      setAccepting(null);
    }
  };

  // Filter & Sort Logic
  let displayData = listings.filter(l => categoryFilter === 'All' || l.category === categoryFilter);
  if (sortOrder === 'Expiring Soon') {
    displayData.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  } else if (sortOrder === 'Most Quantity') {
    displayData.sort((a, b) => b.quantity - a.quantity);
  }

  const Pill = ({ label, active, onClick }) => (
    <button 
      onClick={onClick}
      style={{
        background: active ? '#16A34A' : '#F3F4F6',
        color: active ? 'white' : '#374151',
        border: 'none', padding: '6px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ backgroundColor: '#F0FDF4', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar>
        <Link to="/ngo/requests" style={{ textDecoration: 'none', color: '#6B7280', fontWeight: 600, fontSize: '15px' }}>My Requests</Link>
      </Navbar>

      {/* FILTER BAR - Sticky */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', zIndex: 10, backdropFilter: 'blur(4px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
             <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Hello, {profile?.ngoName || profile?.name}</h1>
             <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '15px' }}>Find surplus food near you</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Category:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Cooked Meal', 'Raw Ingredients', 'Packaged', 'Bakery'].map(c => (
                  <Pill key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Sort:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Pill label="Expiring Soon" active={sortOrder === 'Expiring Soon'} onClick={() => setSortOrder('Expiring Soon')} />
                <Pill label="Most Quantity" active={sortOrder === 'Most Quantity'} onClick={() => setSortOrder('Most Quantity')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
             {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '250px', backgroundColor: '#E5E7EB', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
             ))}
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽</div>
            <p style={{ color: '#6B7280', margin: '0 0 16px 0', fontSize: '18px' }}>No food available nearby right now. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {displayData.map(listing => {
              const expiresAt = new Date(listing.expiresAt);
              const hrsToExpiry = (expiresAt - new Date()) / (1000 * 60 * 60);
              const isUrgent = hrsToExpiry > 0 && hrsToExpiry <= 2;

              return (
                <div key={listing._id} style={{ 
                  backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderBottom: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#111827', fontWeight: 600 }}>{listing.title}</h3>
                    {isUrgent && <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>🔥 URGENT</span>}
                  </div>
                  
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', color: '#4B5563', fontSize: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      Building: {listing.restaurantId?.restaurantName || listing.restaurantId?.name || 'Unknown Restaurant'}
                    </div>
                    <div>🍱 {listing.quantity} {listing.unit}</div>
                    <div>📦 {listing.category}</div>
                    <div>📍 {listing.pickupAddress}</div>
                    <div style={{ color: isUrgent ? '#DC2626' : '#4B5563', fontWeight: isUrgent ? 600 : 400 }}>
                      ⏰ Expires: {expiresAt.toLocaleString()}
                    </div>
                    {listing.pickupWindow?.start && (
                      <div>🕐 Pickup: {listing.pickupWindow.start} - {listing.pickupWindow.end}</div>
                    )}
                  </div>
                  
                  <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <button 
                      onClick={() => handleAccept(listing)}
                      disabled={accepting === listing._id}
                      style={{ 
                        width: '100%', padding: '12px', 
                        background: accepting === listing._id ? '#9CA3AF' : '#16A34A', 
                        color: 'white', border: 'none', borderRadius: '8px', 
                        fontWeight: 600, fontSize: '15px', 
                        cursor: accepting === listing._id ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {accepting === listing._id ? 'Accepting...' : 'Accept Pickup'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
