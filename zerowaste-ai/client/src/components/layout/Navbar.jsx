import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import useAuthStore from '../../store/authStore';

export default function Navbar({ children }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

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
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 32px'
    }}>
      <div 
        style={{ color: '#16A34A', fontWeight: 700, fontSize: '20px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        🌱 ZeroWaste AI
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {children}
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#DC2626',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            fontSize: '15px'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
