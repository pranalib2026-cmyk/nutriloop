import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

export default function FoodHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listings, setListings] = useState([]);
  
  // Filter & Pagination
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Expired', 'Cancelled'];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/food/my/listings');
      setListings(res.data.listings || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(l => filter === 'All' || l.status === filter.toLowerCase());
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const displayedListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        backgroundColor: style.bg, color: style.col, padding: '4px 12px', 
        borderRadius: '9999px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: '#F0F4F0', minHeight: '100vh', paddingBottom: '60px' }}>
      <nav style={{
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E5E7EB', padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.3px', cursor: 'pointer' }} onClick={() => navigate('/restaurant/dashboard')}>
          🌱 ZeroWaste AI
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
          <span onClick={() => navigate('/restaurant/dashboard')} style={{ color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>Dashboard</span>
          <span onClick={() => navigate('/restaurant/add-food')} style={{ color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>Post Food</span>
          <span style={{ color: '#16A34A', fontWeight: 700, borderBottom: '2px solid #16A34A', paddingBottom: '3px', cursor: 'pointer' }}>History</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 14px',
            fontSize: '13px', color: '#6B7280', cursor: 'pointer', fontWeight: 600
          }}>Logout</button>
        </div>
      </nav>

      {/* Deep green gradient header banner */}
      <div style={{ background: 'linear-gradient(135deg, #14532D 0%, #064E3B 100%)', padding: '48px 40px', color: 'white', marginBottom: '32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>My Food Listings</h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.8)' }}>Track all your past and active surplus food donations.</p>
        </div>
      </div>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px' }}>
        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500 }}>{error}</div>}
        
        {/* Filter Tab Pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
          {tabs.map(t => (
            <button 
              key={t} onClick={() => { setFilter(t); setCurrentPage(1); }}
              style={{
                background: filter === t ? '#16A34A' : '#FFFFFF',
                color: filter === t ? '#FFFFFF' : '#4B5563',
                border: filter === t ? '1px solid #16A34A' : '1px solid #D1D5DB',
                padding: '8px 20px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, 
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                boxShadow: filter === t ? '0 4px 12px rgba(22,163,74,0.2)' : 'none'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LISTINGS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#16A34A', fontSize: '18px', fontWeight: 600 }}>Loading history...</div>
        ) : displayedListings.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍱</div>
            <p style={{ color: '#4B5563', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 500 }}>No listings found for "{filter}".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayedListings.map(listing => {
              const catIcons = { cooked: '🍱', raw: '🥬', packaged: '📦', bakery: '🥐', beverages: '🧃', other: '📋' };
              const catBgs = { cooked: '#FEF3C7', raw: '#DCFCE7', packaged: '#DBEAFE', bakery: '#FEF3C7', beverages: '#CFFAFE', other: '#F3F4F6' };
              
              return (
              <div key={listing._id} style={{ 
                backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB',
                display: 'flex', gap: '24px', alignItems: 'center', transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '56px', height: '56px', background: catBgs[listing.category] || '#F3F4F6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                  {catIcons[listing.category] || '📋'}
                </div>

                <div style={{ flex: 1.5 }}>
                  <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '17px', fontWeight: 700 }}>{listing.title}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#6B7280', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                    {listing.description || 'No description provided.'}
                  </p>
                  <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{listing.category}</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', color: '#4B5563', fontSize: '13px', fontWeight: 500 }}>
                  <div><span style={{color:'#9CA3AF', marginRight:'6px'}}>Qty:</span> {listing.quantity} {listing.unit}</div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{color:'#9CA3AF', marginRight:'6px'}}>Loc:</span> {listing.pickupAddress}</div>
                  <div><span style={{color:'#9CA3AF', marginRight:'6px'}}>Exp:</span> {new Date(listing.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>

                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  {getStatusBadge(listing.status)}
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
            <button 
              disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '10px 20px', background: 'white', color: currentPage === 1 ? '#D1D5DB' : '#374151', border: '1px solid #E5E7EB', borderRadius: '99px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'white')}
            >
              ← Prev
            </button>
            <span style={{ color: '#4B5563', fontSize: '14px', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              style={{ padding: '10px 20px', background: 'white', color: currentPage === totalPages ? '#D1D5DB' : '#374151', border: '1px solid #E5E7EB', borderRadius: '99px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'white')}
            >
              Next →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
