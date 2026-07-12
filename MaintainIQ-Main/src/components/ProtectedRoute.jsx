import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('maintainiq_user');
  
  if (!user) {
    // Save the attempted URL path to redirect back after login (optional but nice)
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
