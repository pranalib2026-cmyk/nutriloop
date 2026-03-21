import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function RoleRoute({ children, roles }) {
  const { user, profile, loading } = useAuthStore();
  if (loading)                        return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (!user)                          return <Navigate to="/login" replace />;
  if (!roles.includes(profile?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
