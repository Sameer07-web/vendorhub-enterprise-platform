import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './features/public/components/PublicLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loader from './components/common/Loader';

// Public/Marketing routes (Keep landing page fast)
import LandingPage from './features/public/pages/LandingPage';
const Architecture = lazy(() => import('./features/public/pages/Architecture'));
const NotFound = lazy(() => import('./features/public/pages/NotFound'));
const Forbidden = lazy(() => import('./features/public/pages/Forbidden'));

// Auth routes
const Login = lazy(() => import('./features/auth/pages/Login'));
const Register = lazy(() => import('./features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/pages/ResetPassword'));

// Protected Routes (Lazy loaded)
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));
const VendorList = lazy(() => import('./features/vendors/pages/VendorList'));
const CreateVendor = lazy(() => import('./features/vendors/pages/CreateVendor'));
const EditVendor = lazy(() => import('./features/vendors/pages/EditVendor'));
const VendorDetails = lazy(() => import('./features/vendors/pages/VendorDetails'));

const PurchaseRequestList = lazy(() => import('./features/purchaseRequests/pages/PurchaseRequestList'));
const CreatePurchaseRequest = lazy(() => import('./features/purchaseRequests/pages/CreatePurchaseRequest'));
const EditPurchaseRequest = lazy(() => import('./features/purchaseRequests/pages/EditPurchaseRequest'));
const PurchaseRequestDetails = lazy(() => import('./features/purchaseRequests/pages/PurchaseRequestDetails'));
const ManagerApprovalQueue = lazy(() => import('./features/purchaseRequests/pages/ManagerApprovalQueue'));

const RFQList = lazy(() => import('./features/rfq/pages/RFQList'));
const CreateRFQ = lazy(() => import('./features/rfq/pages/CreateRFQ'));
const EditRFQ = lazy(() => import('./features/rfq/pages/EditRFQ'));
const RFQDetails = lazy(() => import('./features/rfq/pages/RFQDetails'));
const QuoteComparison = lazy(() => import('./features/rfq/pages/QuoteComparison'));
const QuotationList = lazy(() => import('./features/rfq/pages/QuotationList'));

const Profile = lazy(() => import('./features/profile/pages/Profile'));
const Settings = lazy(() => import('./features/settings/pages/Settings'));
const Help = lazy(() => import('./features/help/pages/Help'));

// Placeholder component for other routes
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64 border-2 border-dashed border-surface-200 rounded-lg bg-white">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-surface-700">{title}</h2>
      <p className="text-surface-500 mt-2">This module is under construction.</p>
    </div>
  </div>
);

// PrivateRoute to ensure user is authenticated
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route loader
const RouteLoader = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
    <Loader />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public Marketing Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="architecture" element={<Architecture />} />
                <Route path="features" element={<Placeholder title="Features" />} />
                <Route path="security" element={<Placeholder title="Security" />} />
                <Route path="docs" element={<Placeholder title="Documentation" />} />
                <Route path="api" element={<Placeholder title="API Reference" />} />
                <Route path="contact" element={<Placeholder title="Contact Support" />} />
                <Route path="privacy" element={<Placeholder title="Privacy Policy" />} />
                <Route path="terms" element={<Placeholder title="Terms of Service" />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Root redirects to AppLayout counterparts */}
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
              <Route path="/vendors" element={<Navigate to="/app/vendors" replace />} />
              <Route path="/purchase-requests" element={<Navigate to="/app/purchase-requests" replace />} />
              <Route path="/rfqs" element={<Navigate to="/app/rfqs" replace />} />
              <Route path="/quotations" element={<Navigate to="/app/quotations" replace />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/app" element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                
                <Route path="vendors" element={<VendorList />} />
                <Route path="vendors/new" element={<CreateVendor />} />
                <Route path="vendors/:id" element={<VendorDetails />} />
                <Route path="vendors/:id/edit" element={<EditVendor />} />
                
                <Route path="purchase-requests" element={<PurchaseRequestList />} />
                <Route path="purchase-requests/new" element={<CreatePurchaseRequest />} />
                <Route path="purchase-requests/approval" element={<ManagerApprovalQueue />} />
                <Route path="purchase-requests/:id" element={<PurchaseRequestDetails />} />
                <Route path="purchase-requests/:id/edit" element={<EditPurchaseRequest />} />
                
                <Route path="rfqs" element={<RFQList />} />
                <Route path="rfqs/new" element={<CreateRFQ />} />
                <Route path="rfqs/:id" element={<RFQDetails />} />
                <Route path="rfqs/:id/edit" element={<EditRFQ />} />
                <Route path="rfqs/:id/compare" element={<QuoteComparison />} />
                
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                
                <Route path="purchase-orders" element={<Navigate to="/app/purchase-requests" replace />} />
                <Route path="quotations" element={<QuotationList />} />
              </Route>

              {/* Error Pages */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
