import React from 'react';
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
import { 
  kpiData, 
  spendAnalyticsData, 
  vendorDistributionData, 
  recentPurchaseRequests, 
  pendingApprovals, 
  activityTimelineData 
} from '../data/dashboardData';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      <DashboardHeader greeting="Welcome back" userName="Sarah" />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard 
          title="Total Vendors"
          value={kpiData.vendors.total}
          icon={Users}
          trend={kpiData.vendors.trend}
          percentage={kpiData.vendors.percentage}
          label={kpiData.vendors.label}
          colorClass="bg-primary-600 text-primary-600"
        />
        <StatCard 
          title="Purchase Requests"
          value={kpiData.purchaseRequests.total}
          icon={FileText}
          trend={kpiData.purchaseRequests.trend}
          percentage={kpiData.purchaseRequests.percentage}
          label={kpiData.purchaseRequests.label}
          colorClass="bg-warning-500 text-warning-500"
        />
        <StatCard 
          title="Active RFQs"
          value={kpiData.activeRfqs.total}
          icon={Activity}
          trend={kpiData.activeRfqs.trend}
          percentage={kpiData.activeRfqs.percentage}
          label={kpiData.activeRfqs.label}
          colorClass="bg-violet-500 text-violet-500"
        />
        <StatCard 
          title="Total Spend"
          value={kpiData.totalSpend.total}
          icon={DollarSign}
          trend={kpiData.totalSpend.trend}
          percentage={kpiData.totalSpend.percentage}
          label={kpiData.totalSpend.label}
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
