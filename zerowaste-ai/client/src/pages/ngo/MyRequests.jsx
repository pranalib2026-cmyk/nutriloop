import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

export default function MyRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  
  const [filter, setFilter] = useState('All');
  const tabs = ['All', 'Active', 'Completed', 'Cancelled'];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/my');
      setRequests(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, qReq) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'completed') payload.quantityReceived = qReq;
      
      const res = await api.patch(`/requests/${id}/status`, payload);
      setRequests(prev => prev.map(r => r._id === id ? res.data.data : r));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'All') return requests;
    if (filter === 'Active') return requests.filter(r => ['pending', 'accepted', 'in_transit'].includes(r.status));
    return requests.filter(r => r.status === filter.toLowerCase());
  };

  const filteredRequests = getFilteredRequests();

  const Stepper = ({ currentStatus }) => {
    const steps = ['requested', 'accepted', 'in_transit', 'completed'];
    // Pending requests in our DB flow generally skip 'requested' direct to 'accepted' instantly on POST
    // We'll map statuses linearly: pending/accepted -> 1, in_transit -> 2, completed -> 3
    const currentIndex = ['pending', 'accepted'].includes(currentStatus) ? 1 : steps.indexOf(currentStatus);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '24px 0' }}>
        {/* Background line */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: '#E5E7EB', zIndex: 0, transform: 'translateY(-50%)' }} />
        
        {['Requested', 'Accepted', 'In Transit', 'Completed'].map((label, idx) => {
          let stateColor = '#D1D5DB'; // future
          let textColor = '#9CA3AF';
          if (idx < currentIndex) { stateColor = '#16A34A'; textColor = '#111827'; } // past
          else if (idx === currentIndex) { stateColor = '#2563EB'; textColor = '#2563EB'; } // current
          
          if (currentStatus === 'cancelled') {
             stateColor = '#EF4444'; textColor = '#EF4444';
          }

          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, background: 'white', padding: '0 8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: stateColor, border: `2px solid white`, boxShadow: '0 0 0 2px ' + stateColor }} />
              <span style={{ fontSize: '12px', marginTop: '8px', color: textColor, fontWeight: idx === currentIndex ? 700 : 500 }}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#F0FDF4', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar>
        <Link to="/ngo/feed" style={{ textDecoration: 'none', color: '#6B7280', fontWeight: 600, fontSize: '15px' }}>Back to Feed</Link>
      </Navbar>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#111827' }}>My Pickup Requests</h1>
        
        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '24px', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button 
              key={t} onClick={() => setFilter(t)}
              style={{
                background: filter === t ? '#16A34A' : '#F3F4F6', color: filter === t ? 'white' : '#374151',
                border: 'none', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* REQUESTS LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading your requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#6B7280', margin: '0 0 16px 0', fontSize: '16px' }}>No requests yet. Accept food from the feed to see it here.</p>
            <Link to="/ngo/feed" style={{ background: '#16A34A', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>Browse Food Feed</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredRequests.map(req => {
              const listing = req.foodListingId || {};
              const rest = req.restaurantId || {};
              return (
                <div key={req._id} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>{listing.title || 'Unknown Listing'}</h3>
                      <p style={{ margin: 0, color: '#4B5563', fontSize: '14px', fontWeight: 500 }}>{rest.restaurantName || rest.name}</p>
                      <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>📍 {listing.pickupAddress}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>{req.quantityRequested} {listing.unit || 'units'}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Requested on {new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <Stepper currentStatus={req.status} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    {req.status === 'accepted' && (
                      <button onClick={() => handleStatusUpdate(req._id, 'in_transit', req.quantityRequested)} style={{ padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        Mark as Picked Up
                      </button>
                    )}
                    {req.status === 'in_transit' && (
                      <button onClick={() => handleStatusUpdate(req._id, 'completed', req.quantityRequested)} style={{ padding: '10px 20px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
