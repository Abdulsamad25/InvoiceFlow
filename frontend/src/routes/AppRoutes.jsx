import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROUTES } from '../utils/constants';
// Auth Pages
import SelectRole from '../pages/auth/SelectRole';
import AdminLogin from '../pages/auth/AdminLogin';
import AccountantLogin from '../pages/auth/AccountantLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
// Dashboard Pages
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import AccountantDashboard from '../pages/dashboard/AccountantDashboard';
import Dashboard from '../pages/dashboard/Dashboard';
import Invoices from '../pages/invoices/Invoices';
import CreateInvoice from '../pages/invoices/CreateInvoice';
import EditInvoice from '../pages/invoices/EditInvoice';
import InvoiceDetails from '../pages/invoices/InvoiceDetails';
import Clients from '../pages/clients/Clients';
import Settings from '../pages/settings/Settings';
import Users from '../pages/users/Users';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.SELECT_ROLE} replace />} />
      <Route path={ROUTES.SELECT_ROLE} element={<SelectRole />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route path={ROUTES.ACCOUNTANT_LOGIN} element={<AccountantLogin />} />
     
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ACCOUNTANT_DASHBOARD} element={<AccountantDashboard />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.INVOICES} element={<Invoices />} />
        <Route path={ROUTES.CREATE_INVOICE} element={<CreateInvoice />} />
        <Route path="/invoices/edit/:id" element={<EditInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
        <Route path={ROUTES.CLIENTS} element={<Clients />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.USERS} element={
          <RoleRoute permission="manage_users">
            <Users />
          </RoleRoute>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;