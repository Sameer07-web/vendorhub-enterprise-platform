import React from 'react';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, FileText, ArrowRight, Plus, ExternalLink, ShieldAlert } from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Table from '../../../components/common/Table';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, subtitle }) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardBody className="p-5 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 ring-1 ring-inset ${colorClass.replace('bg-', 'ring-').replace('500', '500/20').replace('600', '600/20')}`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'} flex items-center`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-bold text-surface-900 tracking-tight">{value}</h4>
        <p className="text-sm font-medium text-surface-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
      </div>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for the Action Required table
  const pendingApprovals = [
    { id: 'PR-1042', title: 'MacBook Pro M3 Max for Engineering', requester: 'Sarah Chen', amount: '$4,200.00', urgency: 'High', date: '2 hours ago' },
    { id: 'PR-1043', title: 'Q3 Cloud Infrastructure Renewal', requester: 'DevOps Team', amount: '$12,500.00', urgency: 'Critical', date: '4 hours ago' },
    { id: 'PR-1044', title: 'Annual Figma Enterprise License', requester: 'Design Dept', amount: '$3,600.00', urgency: 'Normal', date: '1 day ago' },
  ];

  const approvalColumns = [
    { 
      key: 'title', 
      label: 'Request', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-surface-900">{row.title}</span>
          <span className="text-xs text-surface-500">{row.id} • {row.requester}</span>
        </div>
      ) 
    },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => <span className="font-medium text-surface-900">{row.amount}</span> },
    { 
      key: 'urgency', 
      label: 'Urgency', 
      render: (row) => (
        <Badge variant={row.urgency === 'Critical' ? 'danger' : row.urgency === 'High' ? 'warning' : 'secondary'}>
          {row.urgency}
        </Badge>
      ) 
    },
    { key: 'date', label: 'Submitted', align: 'right', render: (row) => <span className="text-surface-500">{row.date}</span> },
    {
      key: 'actions',
      label: '',
      stickyRight: true,
      align: 'right',
      render: () => (
        <Button variant="secondary" size="sm" endIcon={ArrowRight}>
          Review
        </Button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header section - Setting the context "Where am I?" */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Here is what requires your attention today, October 24.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" startIcon={FileText}>Generate Report</Button>
          <Button variant="primary" startIcon={Plus} onClick={() => navigate('/purchase-requests/new')}>New Request</Button>
        </div>
      </div>

      {/* KPI Cards - "What is the high level status?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Pending Approvals" 
          value="8" 
          icon={Clock} 
          colorClass="bg-warning-500 text-warning-500"
          subtitle="3 require immediate action"
        />
        <StatCard 
          title="Active RFQs" 
          value="14" 
          icon={Activity} 
          trend="up"
          trendValue="4%"
          colorClass="bg-primary-500 text-primary-500"
          subtitle="2 closing this week"
        />
        <StatCard 
          title="Total Vendors" 
          value="124" 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
          colorClass="bg-primary-600 text-primary-600"
          subtitle="4 new this month"
        />
        <StatCard 
          title="Procurement Health" 
          value="94%" 
          icon={ShieldAlert} 
          colorClass="bg-success-500 text-success-500"
          subtitle="API & ERP sync operational"
        />
      </div>

      {/* Main Content Grid - "What requires my attention?" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Action Required */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900">Action Required</h2>
            <Link to="/purchase-requests/approval" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 focus-ring rounded transition-colors">
              View approval queue <ArrowRight size={16} />
            </Link>
          </div>
          
          <Table 
            columns={approvalColumns}
            data={pendingApprovals}
            onRowClick={(row) => navigate(`/purchase-requests/${row.id}`)}
          />
        </div>

        {/* Right Column (1/3 width) - "What should I do next?" / "Quick Workflows" */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-surface-900">Quick Actions</h2>
          
          <Card className="bg-gradient-to-br from-surface-900 to-surface-800 text-white border-transparent">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-2">Vendor Onboarding</h3>
              <p className="text-surface-300 text-sm mb-6 leading-relaxed">
                Invite a new vendor to the platform. They will receive a secure portal link to submit their compliance documents.
              </p>
              <Button 
                variant="primary" 
                className="w-full bg-white text-surface-900 hover:bg-surface-50 border-transparent"
                onClick={() => navigate('/vendors/new')}
                endIcon={ExternalLink}
              >
                Onboard New Vendor
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <div className="px-5 pb-5">
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-surface-100">
                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-success-100 text-success-600 flex items-center justify-center shrink-0 ring-4 ring-white z-10">
                    <CheckCircle size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">RFQ-2024-08 Awarded</p>
                    <p className="text-xs text-surface-500">Awarded to Acme Corp • 2h ago</p>
                  </div>
                </div>
                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 ring-4 ring-white z-10">
                    <FileText size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">New PR Submitted</p>
                    <p className="text-xs text-surface-500">Marketing Q4 Budget • 5h ago</p>
                  </div>
                </div>
                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center shrink-0 ring-4 ring-white z-10">
                    <AlertTriangle size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Vendor Compliance Expiring</p>
                    <p className="text-xs text-surface-500">Global Tech Inc • 1d ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

