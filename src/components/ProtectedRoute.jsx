import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
  // Check if user is logged in based on userType
  const isLoggedIn = 
    localStorage.getItem(`${userType}_logged_in`) === 'true' || 
    sessionStorage.getItem(`${userType}_logged_in`) === 'true';

  // If not logged in, redirect to the appropriate login page
  if (!isLoggedIn) {
    return <Navigate to={`/${userType}/login`} replace />;
  }

  // If logged in, render the protected component
  return children;
};

export default ProtectedRoute;