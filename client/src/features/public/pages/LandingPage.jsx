import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Users, ArrowRight } from 'lucide-react';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';

const LandingPage = () => {
  const navigate = useNavigate();

  const previewColumns = [
    { key: 'req', label: 'Request', render: (row) => <span className="font-semibold text-surface-900">{row.req}</span> },
    { key: 'dept', label: 'Department' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Approved' ? 'success' : 'warning'}>{row.status}</Badge> }
  ];

  const previewData = [
    { req: 'PR-1042', dept: 'Engineering', amount: '$4,200.00', status: 'Pending' },
    { req: 'PR-1043', dept: 'DevOps', amount: '$12,500.00', status: 'Approved' },
    { req: 'PR-1044', dept: 'Marketing', amount: '$3,600.00', status: 'Approved' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-surface-200">
        <div className="absolute inset-0 bg-surface-50/50 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold text-surface-900 tracking-tight mb-6 leading-tight">
              Enterprise Procurement, <br/>
              <span className="text-primary-600">Engineered for Speed.</span>
            </h1>
            <p className="text-xl text-surface-600 mb-10 leading-relaxed">
              VendorHub centralizes vendor management, purchase requests, and RFQs into a single, highly-performant interface designed for Fortune 500 procurement teams.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary" size="lg" onClick={() => navigate('/register')} endIcon={ArrowRight}>
                Start Free Trial
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/architecture')}>
                View Architecture
              </Button>
            </div>
          </div>

          {/* Interactive UI Preview */}
          <div className="mt-20 mx-auto max-w-4xl bg-white rounded-xl shadow-floating border border-surface-200 overflow-hidden">
            <div className="bg-surface-50 border-b border-surface-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error-400" />
                <div className="w-3 h-3 rounded-full bg-warning-400" />
                <div className="w-3 h-3 rounded-full bg-success-400" />
              </div>
              <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Live Preview</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Recent Purchase Requests</h3>
              <Table columns={previewColumns} data={previewData} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">Built for Scale and Compliance</h2>
            <p className="text-surface-600 mt-4 max-w-2xl mx-auto">
              We eliminated the clutter of legacy software. Every interaction is optimized for density, readability, and speed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-primary-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Vendor Management</h3>
              <p className="text-surface-600 leading-relaxed">
                Maintain a single source of truth for vendor compliance, contracts, and performance metrics.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center mb-6">
                <Activity className="text-success-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Approval Workflows</h3>
              <p className="text-surface-600 leading-relaxed">
                Accelerate purchase requests with automated, multi-tier approval routing and deep ERP integration.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow duration-150">
              <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="text-warning-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Enterprise Security</h3>
              <p className="text-surface-600 leading-relaxed">
                Role-based access control (RBAC), audit logging, and SOC2 compliant architecture by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to upgrade your procurement?</h2>
          <p className="text-primary-200 mb-10 text-lg">
            Join the organizations optimizing their vendor spend and reducing compliance risk with VendorHub.
          </p>
          <Button variant="primary" size="lg" className="bg-white text-primary-900 hover:bg-surface-50 border-transparent" onClick={() => navigate('/login')}>
            Try the Demo Dashboard
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
