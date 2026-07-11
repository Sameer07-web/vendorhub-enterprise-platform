import { hasRole, getCurrentUser } from './auth';

// Base Roles
export const isEmployee = () => hasRole('Employee');
export const isManager = () => hasRole('Manager');
export const isAdmin = () => hasRole('Admin');

// Purchase Requests
export const canCreatePurchaseRequest = () => {
  return true; // Employee, Manager, Admin can create
};

export const canEditPurchaseRequest = (pr) => {
  if (!pr) return false;
  const user = getCurrentUser();
  if (!user) return false;
  // Only editable if DRAFT and user is the creator
  return pr.status === 'DRAFT' && pr.createdBy?._id === user._id;
};

export const canSubmitPurchaseRequest = (pr) => {
  if (!pr) return false;
  const user = getCurrentUser();
  if (!user) return false;
  return pr.status === 'DRAFT' && pr.createdBy?._id === user._id;
};

export const canApprovePurchaseRequest = () => {
  return isManager() || isAdmin();
};

export const canRejectPurchaseRequest = () => {
  return isManager() || isAdmin();
};

export const canDeletePurchaseRequest = () => {
  return isAdmin();
};

// Reusable generic permissions for future modules
export const canCreate = () => true;
export const canEdit = () => true;
export const canDelete = () => isAdmin();
export const canApprove = () => isManager() || isAdmin();
export const canReject = () => isManager() || isAdmin();
