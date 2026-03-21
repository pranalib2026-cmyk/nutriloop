import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import FoodFeed from './pages/ngo/FoodFeed';
import MyRequests from './pages/ngo/MyRequests';
import AddFood from './pages/restaurant/AddFood';
import FoodHistory from './pages/restaurant/FoodHistory';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F0FDF4' }}>
        <p style={{ color: '#16A34A', fontWeight: 'bold' }}>Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    const unsubscribe = init();
    return () => unsubscribe();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Restaurant Routes */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/add-food"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <AddFood />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/history"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <FoodHistory />
            </ProtectedRoute>
          }
        />

        {/* NGO Routes */}
        <Route
          path="/ngo/feed"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <FoodFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/requests"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
