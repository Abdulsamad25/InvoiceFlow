import React, { useState, useEffect } from 'react';
import { Plus, FileText, Users, TrendingUp } from 'lucide-react';
import { FaNairaSign } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import Loader from '../../components/common/Loader';
import invoiceService from '../../services/invoiceService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../utils/constants';

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Accountant Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage invoices and clients efficiently</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.CREATE_INVOICE)}
          className="inline-flex items-center bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          <Plus className="mr-2 w-5 h-5" />
          Create Invoice
        </button>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Invoices"
          value={stats?.totalInvoices || 0}
          icon={<FileText className="w-6 h-6 text-blue-400" />}
          trend={null}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0, 'NGN')}
          icon={<FaNairaSign className="w-6 h-6 text-green-500" />}
          trend={null}
        />
        <StatsCard
          title="Pending Amount"
          value={formatCurrency(stats?.pendingRevenue || 0, 'NGN')}
          icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
          trend={null}
        />
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          trend={null}
        />
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900 text-xl">Recent Invoices</h2>
          <button
            onClick={() => navigate(ROUTES.INVOICES)}
            className="font-medium text-blue-400 hover:text-blue-500 text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <RecentInvoices invoices={recentInvoices} />
      </div>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate(ROUTES.CREATE_INVOICE)}
              className="flex items-center bg-white hover:bg-gray-100 p-3 rounded-md w-full text-left transition-colors"
            >
              <Plus className="mr-3 w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-900">Create New Invoice</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.CLIENTS)}
              className="flex items-center bg-white hover:bg-gray-100 p-3 rounded-md w-full text-left transition-colors"
            >
              <Plus className="mr-3 w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-900">Add New Client</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.INVOICES)}
              className="flex items-center bg-white hover:bg-gray-100 p-3 rounded-md w-full text-left transition-colors"
            >
              <FileText className="mr-3 w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-900">View All Invoices</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Invoice Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-md">
              <span className="text-gray-600">Draft</span>
              <span className="font-semibold text-gray-900">{stats?.draftInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-md">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-gray-900">{stats?.pendingInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-md">
              <span className="text-gray-600">Paid</span>
              <span className="font-semibold text-green-600">{stats?.paidInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-md">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{stats?.overdueInvoices || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;