// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ isConnected, children }) {
  const location = useLocation();
  
  if (!isConnected) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
}