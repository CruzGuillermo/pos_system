// ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
