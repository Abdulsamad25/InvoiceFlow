/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { canCreateInvoice, canCreateClient, canManageSettings, canManageUsers, hasPermission, PERMISSIONS } from '../../utils/permissions';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.SELECT_ROLE);
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isAccountant = user?.role === USER_ROLES.ACCOUNTANT;

  const menuItems = [
    {
      name: 'Dashboard',
      path: isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.ACCOUNTANT_DASHBOARD,
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Invoices',
      path: ROUTES.INVOICES,
      icon: isAccountant ? FileText : Eye,
      show: true,
    },
    {
      name: 'Clients',
      path: ROUTES.CLIENTS,
      icon: isAccountant ? Users : Eye,
      show: true,
    },
     {
      name: 'Users',
      path: ROUTES.USERS,
      icon: Users,
      show: canManageUsers(user?.role),
    },
    {
      name: 'Settings',
      path: ROUTES.SETTINGS,
      icon: Settings,
      show: hasPermission(user?.role, PERMISSIONS.MANAGE_SETTINGS) || hasPermission(user?.role, PERMISSIONS.VIEW_SETTINGS),
    },
   
  ];

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden z-20 fixed inset-0 bg-white/30 backdrop-blur-md"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white/95 backdrop-blur-lg border-r border-white/20 shadow-lg
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-gray-200 border-b">
            <h1 className="font-bold text-gray-900 text-2xl">
              <span className="text-blue-400">Invoice</span>Flow
            </h1>
            <p className="mt-1 text-gray-600 text-sm">
              {isAdmin ? 'Admin Panel' : 'Invoice Management'}
            </p>
          </div>

          {isAccountant && (
            <div className="space-y-2 p-4 border-gray-200 border-b">
              <button
                onClick={() => {
                  navigate(ROUTES.CREATE_INVOICE);
                  onClose();
                }}
                className="flex items-center bg-blue-400 hover:bg-blue-500 p-3 rounded-lg w-full font-medium text-white transition-colors"
              >
                <Plus className="mr-2 w-5 h-5" />
                Create Invoice
              </button>
            </div>
          )}

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              if (!item.show) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-3 rounded-lg font-medium transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-gray-200 border-t">
            <div className="bg-gray-50 mb-3 p-3 rounded-lg">
              <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
              <p className="text-gray-600 text-xs">{user?.email}</p>
              <p className="mt-1 font-medium text-blue-400 text-xs">
                {user?.role === USER_ROLES.ADMIN ? 'Administrator' : 'Accountant'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center hover:bg-red-50 px-4 py-2 rounded-lg w-full font-medium text-red-600 transition-colors"
            >
              <LogOut className="mr-2 w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;