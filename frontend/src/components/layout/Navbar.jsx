import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  
  return (
    <header className="top-0 z-10 sticky bg-white border-gray-200 border-b">
      <div className="flex justify-between items-center px-4 lg:px-6 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="top-1 right-1 absolute bg-blue-400 rounded-full w-2 h-2"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="font-medium text-gray-900 text-sm">{user?.name || 'User'}</p>
              <p className="text-gray-500 text-xs">{user?.email || ''}</p>
            </div>
            <div className="flex justify-center items-center bg-blue-100 rounded-full w-10 h-10">
              <User className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;