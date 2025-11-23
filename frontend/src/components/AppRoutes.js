import React from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import LandingPage from './LandingPage';
// NavComp removed; AppShell provides the main navigation UI
import AppShell from './AppShell';
import Home from './Home';
import AdminDashboard from './AdminDashboard'; // Ajout du composant admin

// Vérifie si un utilisateur est connecté
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Retourne true si le token existe, false sinon
};

// Vérifie le rôle stocké localement (remarque: côté client seulement)
const hasRole = (role) => {
  const userRole = localStorage.getItem('role') || localStorage.getItem('userRole');
  return userRole === role;
};

// Composant pour les routes protégées avec rôle optionnel
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // If a token is present in the query string (redirect from Google OAuth), persist it
  try {
    const params = new URLSearchParams(location.search);
    const qToken = params.get('token');
    if (qToken && !localStorage.getItem('token')) {
      localStorage.setItem('token', qToken);
      // try to decode JWT payload to extract role/name
      try {
        const payload = JSON.parse(atob(qToken.split('.')[1]));
        if (payload.role) localStorage.setItem('role', payload.role);
        if (payload.name) localStorage.setItem('userName', payload.name);
        if (payload.userId) localStorage.setItem('userId', payload.userId);
      } catch (e) {
        // ignore decode errors
      }
      // remove token from URL
      navigate(location.pathname, { replace: true });
    }
  } catch (e) {
    // ignore
  }

  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Route protégée pour les prédictions (avec NavComp) */}
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />

      {/* Route protégée pour l'administrateur */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
