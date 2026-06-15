import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Settings, 
  Shield,
  Eye,
  Download
} from 'lucide-react';
import { FaNairaSign } from "react-icons/fa6";
import StatsCard from '../../components/dashboard/StatsCard';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import invoiceService from '../../services/invoiceService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, invoicesData] = await Promise.all([
        invoiceService.getStats(),
        invoiceService.getRecent(5)
      ]);

      setStats(statsData?.data || statsData?.stats || statsData);
      setRecentInvoices(invoicesData.data || invoicesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Monitor and oversee all system activities
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            icon={<Users className="w-4 h-4" />}
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="flex items-start gap-3 bg-blue-50 shadow-sm p-4 border border-blue-200 rounded-lg">
        <Shield className="mt-0.5 w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 text-sm">Admin View Mode</h3>
          <p className="mt-1 text-blue-700 text-sm">
            You're viewing the system as an administrator. You can monitor all activities, 
            manage users, and configure settings, but cannot create or modify invoices or clients.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`₦${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={<FaNairaSign className="w-6 h-6 text-green-500" />}
          trend="+12.5%"
          trendUp={true}
        />
        <StatsCard
          title="Total Invoices"
          value={stats?.totalInvoices || 0}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Pending Revenue"
          value={`₦${stats?.pendingRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="-3.2%"
          trendUp={false}
        />
      </div>

      {/* Status Overview */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Paid Invoices</h3>
            <div className="bg-green-100 px-2 py-1 rounded text-green-800 text-xs">
              {stats?.paidPercentage || 0}%
            </div>
          </div>
          <p className="mt-2 font-semibold text-gray-900 text-2xl">
            {stats?.paidInvoices || 0}
          </p>
        </div>

        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Pending Invoices</h3>
          </div>
          <p className="mt-2 font-semibold text-gray-900 text-2xl">
            {stats?.pendingInvoices || 0}
          </p>
        </div>

        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Overdue Invoices</h3>
          </div>
          <p className="mt-2 font-semibold text-red-600 text-2xl">
            {stats?.overdueInvoices || 0}
          </p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900 text-xl">Recent Invoices</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => navigate('/export')}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => navigate('/invoices')}
            >
              View All
            </Button>
          </div>
        </div>
        <RecentInvoices invoices={recentInvoices} readOnly={true} />
      </div>

      {/* Quick Actions for Admin */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <div 
          className="bg-linear-to-br from-blue-500 to-blue-600 hover:shadow-lg p-6 rounded-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/users')}
        >
          <Users className="mb-3 w-8 h-8 text-white" />
          <h3 className="mb-2 font-semibold text-white text-xl">Manage Users</h3>
          <p className="text-blue-100 text-sm">
            Create accountants, manage user roles and permissions
          </p>
        </div>

        <div 
          className="bg-linear-to-br from-purple-500 to-purple-600 hover:shadow-lg p-6 rounded-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mb-3 w-8 h-8 text-white" />
          <h3 className="mb-2 font-semibold text-white text-xl">System Settings</h3>
          <p className="text-purple-100 text-sm">
            Configure bank details, email templates, and system preferences
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;