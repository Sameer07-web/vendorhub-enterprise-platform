/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, FileText, Activity, Clock, Trophy, Building2, AlertTriangle, Zap, TrendingUp, Sparkles } from 'lucide-react';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import SpendAnalyticsChart from './SpendAnalyticsChart';
import VendorDistributionChart from './VendorDistributionChart';
import DepartmentSpendChart from './DepartmentSpendChart';
import ProcurementStatusChart from './ProcurementStatusChart';
import AIInsightsWidget from './widgets/AIInsightsWidget';
import { formatCurrency } from '../../../utils/formatCurrency';

// Helper for Drill-down navigation
export const buildReportFilters = (type, filters) => {
  const params = new URLSearchParams(filters);
  return `/reports?type=${type}&${params.toString()}`;
};

const formatSpendStr = (amount) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
};

// Widget Components
const TotalSpendWidget = ({ data }) => {
  const kpis = data?.kpis;
  if (!kpis) return null;
  return (
    <StatCard 
      title="Total Spend"
      value={formatSpendStr(kpis.totalSpend.value)}
      icon={DollarSign}
      label={`${kpis.awardedQuotations.value} awarded`}
      colorClass="bg-success-500 text-success-500"
    />
  );
};

const VendorsWidget = ({ data }) => {
  const kpis = data?.kpis;
  if (!kpis) return null;
  return (
    <StatCard 
      title="Vendors"
      value={kpis.vendors.value}
      icon={Users}
      label={`${kpis.activeVendors.value} active`}
      colorClass="bg-primary-600 text-primary-600"
    />
  );
};

const PRWidget = ({ data }) => {
  const kpis = data?.kpis;
  if (!kpis) return null;
  return (
    <StatCard 
      title="Purchase Requests"
      value={kpis.purchaseRequests.value}
      icon={FileText}
      label={`${kpis.pendingApprovals.value} pending`}
      colorClass="bg-warning-500 text-warning-500"
    />
  );
};

const RFQWidget = ({ data }) => {
  const kpis = data?.kpis;
  if (!kpis) return null;
  return (
    <StatCard 
      title="Total RFQs"
      value={kpis.rfqs.value}
      icon={Activity}
      label={`${kpis.quotations.value} quotes`}
      colorClass="bg-violet-500 text-violet-500"
    />
  );
};

const ExecutiveSummaryWidget = ({ data }) => {
  const { kpis, procurement, vendors, departments } = data || {};
  if (!kpis) return null;
  const topVendor = vendors?.length > 0 ? vendors[0].vendorName : 'None';
  const topDepartment = departments?.length > 0 ? departments[0].department : 'None';

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 h-full justify-center sm:justify-start text-center sm:text-left shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-surface-500 truncate">Avg PR Approval</p>
            <p className="text-lg font-bold text-surface-900 truncate">{kpis.avgApprovalTimeHours.value} hrs</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 h-full justify-center sm:justify-start text-center sm:text-left shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-surface-500 truncate">Avg RFQ Lifecycle</p>
            <p className="text-lg font-bold text-surface-900 truncate">{procurement.avgRfqLifecycleDays.value} days</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 h-full justify-center sm:justify-start text-center sm:text-left shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs sm:text-sm font-medium text-surface-500 truncate">Top Vendor</p>
            <p className="text-lg font-bold text-surface-900 truncate" title={topVendor}>{topVendor}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 h-full justify-center sm:justify-start text-center sm:text-left shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs sm:text-sm font-medium text-surface-500 truncate">Top Department</p>
            <p className="text-lg font-bold text-surface-900 truncate" title={topDepartment}>{topDepartment}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpendTrendWidget = ({ data }) => {
  const spend = data?.spend || [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendTrendData = spend.map(s => ({
    name: `${monthNames[s.month - 1]} ${s.year}`,
    spend: s.amount
  }));

  return (
    <ChartCard title="Spend Trend (12 Months)">
      {spendTrendData.length > 0 ? (
        <SpendAnalyticsChart data={spendTrendData} />
      ) : (
        <div className="flex items-center justify-center h-full text-surface-500">No spend data</div>
      )}
    </ChartCard>
  );
};

const DepartmentSpendWidget = ({ data }) => {
  const navigate = useNavigate();
  const departments = data?.departments || [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];
  const departmentBarData = departments.slice(0, 5).map((d, i) => ({
    name: d.department,
    spend: d.totalSpend,
    color: colors[i % colors.length]
  }));

  return (
    <ChartCard title="Department Spend">
      {departmentBarData.length > 0 ? (
        <div onClick={() => {
          navigate(buildReportFilters('purchaseRequests', {})); 
        }} className="h-full cursor-pointer" title="Click to view all requests">
          <DepartmentSpendChart data={departmentBarData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-surface-500">No department data</div>
      )}
    </ChartCard>
  );
};

const VendorDistributionWidget = ({ data }) => {
  const navigate = useNavigate();
  const vendors = data?.vendors || [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];
  const vendorPieData = vendors.slice(0, 5).map((v, i) => ({
    name: v.vendorName,
    value: v.totalSpend,
    color: colors[i % colors.length]
  }));

  return (
    <ChartCard title="Top Vendor Distribution">
      {vendorPieData.length > 0 ? (
        <div onClick={() => navigate(buildReportFilters('vendors', {}))} className="h-full cursor-pointer" title="Click to view all vendors">
          <VendorDistributionChart data={vendorPieData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-surface-500">No vendor data</div>
      )}
    </ChartCard>
  );
};

const ProcurementStatusWidget = ({ data }) => {
  const navigate = useNavigate();
  const procurement = data?.procurement;
  if (!procurement) return null;
  const procurementPieData = [
    { name: 'Pending RFQs', value: procurement.pendingWorkload.value, color: '#F59E0B' },
    { name: 'Completed RFQs', value: procurement.completedProcurement.value, color: '#10B981' }
  ].filter(d => d.value > 0);
  if (procurementPieData.length === 0) procurementPieData.push({ name: 'No Data', value: 1, color: '#E4E4E7' });

  return (
    <ChartCard title="Procurement Status">
      <div onClick={() => navigate(buildReportFilters('rfqs', {}))} className="h-full cursor-pointer" title="Click to view RFQs">
        <ProcurementStatusChart data={procurementPieData} />
      </div>
    </ChartCard>
  );
};

const OverdueApprovalsWidget = ({ data }) => {
  const count = data?.overdueCount || 0;
  return (
    <StatCard 
      title="Overdue Approvals"
      value={count}
      icon={AlertTriangle}
      label="Requires attention"
      colorClass="bg-danger-500 text-danger-500"
    />
  );
};

const AutomationSuccessWidget = ({ data }) => {
  const automation = data?.automation;
  if (!automation) return null;
  return (
    <StatCard 
      title="Automation Success"
      value={`${automation.successRate}%`}
      icon={Zap}
      label={`${automation.successCount} executions`}
      colorClass="bg-primary-500 text-primary-500"
    />
  );
};

const EscalationRateWidget = ({ data }) => {
  const slaHealth = data?.slaHealth;
  if (!slaHealth) return null;
  const rate = slaHealth.totalProcesses > 0 ? ((slaHealth.escalatedProcesses / slaHealth.totalProcesses) * 100).toFixed(1) : 0;
  return (
    <StatCard 
      title="Escalation Rate"
      value={`${rate}%`}
      icon={TrendingUp}
      label={`${slaHealth.escalatedProcesses} escalations`}
      colorClass="bg-warning-500 text-warning-500"
    />
  );
};


export const WidgetRegistry = {
  totalSpend: {
    id: 'totalSpend',
    title: 'Total Spend (KPI)',
    component: TotalSpendWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  vendors: {
    id: 'vendors',
    title: 'Vendors (KPI)',
    component: VendorsWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  purchaseRequests: {
    id: 'purchaseRequests',
    title: 'Purchase Requests (KPI)',
    component: PRWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  totalRfqs: {
    id: 'totalRfqs',
    title: 'Total RFQs (KPI)',
    component: RFQWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  executiveSummary: {
    id: 'executiveSummary',
    title: 'Executive Summary',
    component: ExecutiveSummaryWidget,
    minW: 4, minH: 3,
    defaultW: 12, defaultH: 4
  },
  spendTrend: {
    id: 'spendTrend',
    title: 'Spend Trend Chart',
    component: SpendTrendWidget,
    minW: 4, minH: 8,
    defaultW: 6, defaultH: 10
  },
  departmentSpend: {
    id: 'departmentSpend',
    title: 'Department Spend Chart',
    component: DepartmentSpendWidget,
    minW: 4, minH: 8,
    defaultW: 6, defaultH: 10
  },
  vendorDistribution: {
    id: 'vendorDistribution',
    title: 'Vendor Distribution Chart',
    component: VendorDistributionWidget,
    minW: 4, minH: 8,
    defaultW: 6, defaultH: 10
  },
  procurementStatus: {
    id: 'procurementStatus',
    title: 'Procurement Status Chart',
    component: ProcurementStatusWidget,
    minW: 4, minH: 8,
    defaultW: 6, defaultH: 10
  },
  overdueApprovals: {
    id: 'overdueApprovals',
    title: 'Overdue Approvals',
    component: OverdueApprovalsWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  automationSuccess: {
    id: 'automationSuccess',
    title: 'Automation Success Rate',
    component: AutomationSuccessWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  escalationRate: {
    id: 'escalationRate',
    title: 'Escalation Rate',
    component: EscalationRateWidget,
    minW: 2, minH: 3,
    defaultW: 3, defaultH: 4
  },
  aiInsights: {
    id: 'aiInsights',
    title: 'AI Operations Intelligence',
    component: AIInsightsWidget,
    minW: 4, minH: 6,
    defaultW: 12, defaultH: 8
  }
};
