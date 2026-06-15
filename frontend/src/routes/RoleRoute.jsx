import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissions';

const RoleRoute = ({ children, permission }) => {
  const { user } = useAuth();
  
  if (!hasPermission(user?.role, permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default RoleRoute;