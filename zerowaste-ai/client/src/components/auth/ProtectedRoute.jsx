import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}
