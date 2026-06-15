import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Users, TrendingUp } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentInvoices from '../../components/dashboard/RecentInvoices';
import Loader from '../../components/common/Loader';
import invoiceService from '../../services/invoiceService';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
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
    return <Loader fullScreen size="lg" text="Loading dashboard..." />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-bold text-gray-900 text-2xl">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your invoices.</p>
      </div>
      
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<DollarSign className="w-5 h-5 text-rose-400" />}
          trend="up"
          trendValue="+12% from last month"
        />
        
        <StatsCard
          title="Total Invoices"
          value={stats?.totalInvoices || 0}
          icon={<FileText className="w-5 h-5 text-rose-400" />}
        />
        
        <StatsCard
          title="Paid Invoices"
          value={stats?.paidInvoices || 0}
          icon={<TrendingUp className="w-5 h-5 text-rose-400" />}
          trend="up"
          trendValue={`${stats?.paidPercentage || 0}% paid rate`}
        />
        
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={<Users className="w-5 h-5 text-rose-400" />}
        />
      </div>
      
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <RecentInvoices invoices={recentInvoices} />
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/invoices/create'}
              className="bg-rose-400 hover:bg-rose-500 p-4 rounded-md w-full font-medium text-white text-left transition-colors"
            >
              Create New Invoice
            </button>
            <button
              onClick={() => window.location.href = '/clients'}
              className="bg-white hover:shadow-md p-4 rounded-md w-full font-medium text-gray-900 text-left transition-shadow"
            >
              Manage Clients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;