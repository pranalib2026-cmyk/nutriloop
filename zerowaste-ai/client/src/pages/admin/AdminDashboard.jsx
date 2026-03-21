import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const [activeTab, setActiveTab] = useState('Overview');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Navbar */}
      <nav style={{ background: '#111827', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>⚙️ ZeroWaste AI Admin</div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
          Logout
        </button>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '220px', backgroundColor: '#1F2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
          {['Overview', 'Users', 'Listings', 'Activity'].map(tab => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px', cursor: 'pointer', fontWeight: 500,
                backgroundColor: activeTab === tab ? '#16A34A' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => { if(activeTab !== tab) e.currentTarget.style.backgroundColor = '#374151' }}
              onMouseLeave={(e) => { if(activeTab !== tab) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {tab === 'Overview' && '📊 '}
              {tab === 'Users' && '👥 '}
              {tab === 'Listings' && '🍱 '}
              {tab === 'Activity' && '📋 '}
              {tab}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#F3F4F6' }}>
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Users' && <UsersTab />}
          {activeTab === 'Listings' && <ListingsTab />}
          {activeTab === 'Activity' && <ActivityTab />}
        </main>
      </div>
    </div>
  );
}

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
    <span style={{ backgroundColor: style.bg, color: style.col, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
};

// --- TABS ---

function OverviewTab() {
  const [stats, setStats] = useState({ totalMeals: 0, totalUsers: 0, completedPickups: 0, pendingListings: 0 });
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      console.log('Admin stats:', data);
      setStats(data);
      setRecentFoods(data.recentListings || []);
    } catch (err) {
      console.error('Stats error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading overview...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>Platform Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <Stat boxColor="#DCFCE7" textColor="#16A34A" title="Total Meals Saved" icon="🍽" value={stats.totalMealsSaved || 0} />
        <Stat boxColor="#DBEAFE" textColor="#2563EB" title="Total Users" icon="👥" value={stats.totalUsers || 0} />
        <Stat boxColor="#FEF3C7" textColor="#D97706" title="Completed Pickups" icon="✅" value={stats.completedRequests || 0} />
        <Stat boxColor={(stats.pendingListings || 0) > 0 ? "#FEE2E2" : "#F3F4F6"} textColor={(stats.pendingListings || 0) > 0 ? "#DC2626" : "#4B5563"} title="Pending Listings" icon="⏳" value={stats.pendingListings || 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Recent Food Listings</h3>
          {recentFoods.length === 0 ? <p style={{ color: '#6B7280' }}>No recent listings.</p> : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '8px 0', color: '#6B7280' }}>Title</th>
                  <th style={{ padding: '8px 0', color: '#6B7280' }}>Restaurant</th>
                  <th style={{ padding: '8px 0', color: '#6B7280' }}>Status</th>
                  <th style={{ padding: '8px 0', color: '#6B7280' }}>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {recentFoods.map(f => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>{f.title}</td>
                    <td style={{ padding: '12px 0' }}>{f.restaurantId?.restaurantName || f.restaurantId?.name || 'Unknown'}</td>
                    <td style={{ padding: '12px 0' }}>{getStatusBadge(f.status)}</td>
                    <td style={{ padding: '12px 0' }}>{new Date(f.expiresAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Platform Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
              <span style={{ color: '#4B5563' }}>Backend API</span>
              <span>✅ Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
              <span style={{ color: '#4B5563' }}>Database</span>
              <span>✅ Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
              <span style={{ color: '#4B5563' }}>Realtime Sync</span>
              <span>✅ Active</span>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '8px', fontWeight: 600, textAlign: 'center' }}>
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, icon, boxColor, textColor }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: boxColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          {icon}
        </div>
        <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: textColor }}>{value}</div>
    </div>
  );
}


function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(res => {
      setUsers(res.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getRoleBadge = (role) => {
    const bg = role === 'restaurant' ? '#FEF3C7' : role === 'ngo' ? '#DBEAFE' : '#F3F4F6';
    const col = role === 'restaurant' ? '#B45309' : role === 'ngo' ? '#1D4ED8' : '#374151';
    return <span style={{ backgroundColor: bg, color: col, padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{role}</span>;
  };

  const displayedUsers = users
    .filter(u => filter === 'All' || u.role === filter.toLowerCase())
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div>Loading users...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>Manage Users</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', width: '300px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Restaurant', 'NGO', 'Admin'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? '#111827' : 'white', color: filter === f ? 'white' : '#4B5563', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >{f}</button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Name</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Email</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Role</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>City</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Joined</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>{u.restaurantName || u.ngoName || u.name}</td>
                <td style={{ padding: '16px', color: '#6B7280' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>{getRoleBadge(u.role)}</td>
                <td style={{ padding: '16px', color: '#6B7280' }}>{u.city || 'N/A'}</td>
                <td style={{ padding: '16px', color: '#6B7280' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', background: '#DCFCE7', color: '#16A34A', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Verify</button>
                  <button style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Suspend</button>
                </td>
              </tr>
            ))}
            {displayedUsers.length === 0 && <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ListingsTab() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/food?limit=50').then(res => {
      setFoods(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayedFoods = foods.filter(f => filter === 'All' || f.status === filter.toLowerCase());

  if (loading) return <div>Loading listings...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>Platform Food Listings</h2>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {['All', 'Pending', 'Accepted', 'Completed', 'Expired', 'Cancelled'].map(f => (
          <button 
            key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? '#111827' : 'white', color: filter === f ? 'white' : '#4B5563', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
          >{f}</button>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Title</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Restaurant</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Quantity</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Expires</th>
              <th style={{ padding: '16px', color: '#4B5563', fontSize: '14px' }}>Posted</th>
            </tr>
          </thead>
          <tbody>
            {displayedFoods.map(f => (
              <tr key={f._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>{f.title}</td>
                <td style={{ padding: '16px', color: '#4B5563' }}>{f.restaurantId?.restaurantName || f.restaurantId?.name || 'Unknown'}</td>
                <td style={{ padding: '16px', color: '#4B5563' }}>{f.quantity} {f.unit}</td>
                <td style={{ padding: '16px' }}>{getStatusBadge(f.status)}</td>
                <td style={{ padding: '16px', color: '#6B7280' }}>{new Date(f.expiresAt).toLocaleString()}</td>
                <td style={{ padding: '16px', color: '#6B7280' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {displayedFoods.length === 0 && <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>No listings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ActivityTab() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Generate an activity feed from the latest objects since there isn't a dedicated activity event logs table
    const fetchActivities = async () => {
      try {
        const [usersRes, foodRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/food?limit=20')
        ]);
        
        const acts = [];
        (usersRes.data.data || []).forEach(u => acts.push({
          _id: u._id + '_user', date: new Date(u.createdAt),
          desc: `New ${u.role} joined: ${u.restaurantName || u.ngoName || u.name}`,
          role: u.role
        }));
        (foodRes.data.data || []).forEach(f => acts.push({
          _id: f._id + '_food', date: new Date(f.createdAt),
          desc: `${f.restaurantId?.restaurantName || 'A restaurant'} posted ${f.quantity} ${f.unit} of ${f.title}`,
          role: 'restaurant'
        }));
        
        acts.sort((a,b) => b.date - a.date);
        setActivities(acts.slice(0, 30));
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <h2 style={{ margin: 0, fontSize: '24px' }}>Recent Activity Feed</h2>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        {activities.length === 0 ? <p style={{ color: '#6B7280' }}>No recent activity.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activities.map(act => (
              <div key={act._id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {act.role === 'restaurant' ? '🍳' : act.role === 'ngo' ? '🤝' : '⚙️'}
                </div>
                <div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>{act.desc}</div>
                  <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>{act.date.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
