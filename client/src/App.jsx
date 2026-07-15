import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './features/public/components/PublicLayout';
import LandingPage from './features/public/pages/LandingPage';
import Architecture from './features/public/pages/Architecture';
import NotFound from './features/public/pages/NotFound';
import Forbidden from './features/public/pages/Forbidden';
import Dashboard from './features/dashboard/pages/Dashboard';
import VendorList from './features/vendors/pages/VendorList';
import CreateVendor from './features/vendors/pages/CreateVendor';
import EditVendor from './features/vendors/pages/EditVendor';
import VendorDetails from './features/vendors/pages/VendorDetails';
import PurchaseRequestList from './features/purchaseRequests/pages/PurchaseRequestList';
import CreatePurchaseRequest from './features/purchaseRequests/pages/CreatePurchaseRequest';
import EditPurchaseRequest from './features/purchaseRequests/pages/EditPurchaseRequest';
import PurchaseRequestDetails from './features/purchaseRequests/pages/PurchaseRequestDetails';
import ManagerApprovalQueue from './features/purchaseRequests/pages/ManagerApprovalQueue';

import RFQList from './features/rfq/pages/RFQList';
import CreateRFQ from './features/rfq/pages/CreateRFQ';
import EditRFQ from './features/rfq/pages/EditRFQ';
import RFQDetails from './features/rfq/pages/RFQDetails';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Profile from './features/profile/pages/Profile';
import Settings from './features/settings/pages/Settings';
import Help from './features/help/pages/Help';

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
    // Redirect to login if token is missing
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
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
          
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          
          <Route path="purchase-orders" element={<Placeholder title="Purchase Orders" />} />
        </Route>

        {/* Error Pages */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
