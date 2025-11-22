import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import LandingPage from './LandingPage';
import NavComp from './NavComp';
import Home from './Home';
import AdminDashboard from './AdminDashboard'; // Ajout du composant admin

// Vérifie si un utilisateur est connecté
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Retourne true si le token existe, false sinon
};

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
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
            <NavComp />
          </ProtectedRoute>
        }
      />

      {/* Route protégée pour l'administrateur */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
