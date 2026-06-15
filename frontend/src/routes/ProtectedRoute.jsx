import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import { ROUTES, USER_ROLES } from '../utils/constants';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <Loader fullScreen size="lg" text="Loading..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }
  
  // Redirect to role-specific dashboard if accessing generic dashboard
  if (location.pathname === ROUTES.DASHBOARD) {
    if (user?.role === USER_ROLES.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    } else if (user?.role === USER_ROLES.ACCOUNTANT) {
      return <Navigate to={ROUTES.ACCOUNTANT_DASHBOARD} replace />;
    }
  }
  
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedRoute;