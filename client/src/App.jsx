import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/layout/AdminLayout';
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

// Placeholder component for other routes
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-lg bg-white">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      <p className="text-slate-500 mt-2">This module is under construction.</p>
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
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/vendors" replace />} />
          
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
          
          <Route path="purchase-orders" element={<Placeholder title="Purchase Orders" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
