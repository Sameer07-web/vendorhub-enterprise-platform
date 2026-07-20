import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import SpendAnalyticsChart from '../components/SpendAnalyticsChart';
import VendorDistributionChart from '../components/VendorDistributionChart';
import RecentPurchaseTable from '../components/RecentPurchaseTable';
import PendingApprovals from '../components/PendingApprovals';
import ActivityTimeline from '../components/ActivityTimeline';
import QuickActions from '../components/QuickActions';

import { Users, FileText, Activity, DollarSign } from 'lucide-react';
import { getDashboardStats } from '../../../api/dashboard.api';
import { getCurrentUser } from '../../../utils/auth';
import { formatCurrency } from '../../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-surface-200 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="w-10 h-10 bg-surface-200 rounded-xl" />
                  <div className="w-16 h-6 bg-surface-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-surface-200 rounded w-20" />
                  <div className="h-4 bg-surface-200 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-lg h-80" />
                <div className="bg-surface border border-border rounded-lg h-80" />
              </div>
              <div className="bg-surface border border-border rounded-lg h-64" />
            </div>
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-lg h-64" />
              <div className="bg-surface border border-border rounded-lg h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <p className="text-surface-500">Unable to load dashboard. Please try again.</p>
      </div>
    );
  }

  const { kpiData, spendAnalyticsData, vendorDistributionData, recentPurchaseRequests, pendingApprovals, activityTimelineData } = stats;

  const formatSpend = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      <DashboardHeader greeting="Welcome back" userName={user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard 
          title="Total Vendors"
          value={kpiData.vendors.total}
          icon={Users}
          colorClass="bg-primary-600 text-primary-600"
        />
        <StatCard 
          title="Purchase Requests"
          value={kpiData.purchaseRequests.total}
          icon={FileText}
          label={kpiData.purchaseRequests.pending > 0 ? `${kpiData.purchaseRequests.pending} pending approval` : null}
          colorClass="bg-warning-500 text-warning-500"
        />
        <StatCard 
          title="Active RFQs"
          value={kpiData.activeRfqs.total}
          icon={Activity}
          colorClass="bg-violet-500 text-violet-500"
        />
        <StatCard 
          title="Total Spend"
          value={formatSpend(kpiData.totalSpend.total)}
          icon={DollarSign}
          label={`${kpiData.quotations.total} quotations`}
          colorClass="bg-success-500 text-success-500"
        />
      </div>

      {/* Main Content Grid (2/3 Left | 1/3 Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Analytics) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Spend Analytics">
              <SpendAnalyticsChart data={spendAnalyticsData} />
            </ChartCard>
            <ChartCard title="Vendor Distribution">
              <VendorDistributionChart data={vendorDistributionData} />
            </ChartCard>
          </div>
          
          <RecentPurchaseTable data={recentPurchaseRequests} />
        </div>

        {/* Right Column (Actions & Activity) */}
        <div className="space-y-6">
          <PendingApprovals data={pendingApprovals} />
          <QuickActions />
          <ActivityTimeline data={activityTimelineData} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
