const express = require('express');
const router = express.Router();
const invitationService = require('../services/invitation.service');
const organizationAdminService = require('../services/organizationAdmin.service');
const organizationSettingsService = require('../services/organizationSettings.service');
const { requirePermission } = require('../middleware/authorization.middleware');
const { Permissions } = require('../constants/permissions.registry');
const ApiResponse = require('../utils/ApiResponse');

// ── Invitation Lifecycle Routing ────────────────────────────────────

router.post('/invitations', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const invite = await invitationService.inviteUser(req.organization._id, email, role, req.user._id);
    res.status(201).json(new ApiResponse(201, 'Invitation generated successfully', invite));
  } catch (error) {
    next(error);
  }
});

router.post('/invitations/:id/resend', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const invite = await invitationService.resendInvitation(req.organization._id, req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Invitation resent successfully', invite));
  } catch (error) {
    next(error);
  }
});

router.delete('/invitations/:id', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const invite = await invitationService.revokeInvitation(req.organization._id, req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Invitation revoked successfully', invite));
  } catch (error) {
    next(error);
  }
});

// Endpoint accepts invitations anonymously/publicly using secure token
router.post('/invitations/accept', async (req, res, next) => {
  try {
    const { invitationToken, password, fullName } = req.body;
    const result = await invitationService.acceptInvitation(invitationToken, password, fullName);
    res.status(200).json(new ApiResponse(200, 'Invitation accepted and membership initialized', result));
  } catch (error) {
    next(error);
  }
});

router.post('/api/v1/organizations/invitations/accept', async (req, res, next) => {
  try {
    const { invitationToken, password, fullName } = req.body;
    const result = await invitationService.acceptInvitation(invitationToken, password, fullName);
    res.status(200).json(new ApiResponse(200, 'Invitation accepted and membership initialized', result));
  } catch (error) {
    next(error);
  }
});

// ── Member Management Routing ───────────────────────────────────────

router.get('/members', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const members = await organizationAdminService.listMembers(req.organization._id);
    res.status(200).json(new ApiResponse(200, 'Members listed successfully', members));
  } catch (error) {
    next(error);
  }
});

router.patch('/members/:id/role', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const { role } = req.body;
    const member = await organizationAdminService.updateRole(req.organization._id, req.params.id, role, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Member role updated successfully', member));
  } catch (error) {
    next(error);
  }
});

router.patch('/members/:id/suspend', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const member = await organizationAdminService.suspendMember(req.organization._id, req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Member suspended successfully', member));
  } catch (error) {
    next(error);
  }
});

router.patch('/members/:id/reactivate', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const member = await organizationAdminService.reactivateMember(req.organization._id, req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Member reactivated successfully', member));
  } catch (error) {
    next(error);
  }
});

router.delete('/members/:id', requirePermission(Permissions.USER_MANAGE), async (req, res, next) => {
  try {
    const member = await organizationAdminService.removeMember(req.organization._id, req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Member removed successfully', member));
  } catch (error) {
    next(error);
  }
});

router.post('/members/:id/transfer-ownership', async (req, res, next) => {
  try {
    const AuthorizationService = require('../services/AuthorizationService');
    const member = await AuthorizationService.resolveMembership(req.organization._id, req.user._id);
    if (!member) {
      return res.status(403).json({ success: false, error: 'Member not found' });
    }
    
    const result = await organizationAdminService.transferOwnership(req.organization._id, member, req.params.id);
    res.status(200).json(new ApiResponse(200, 'Ownership transferred successfully', result));
  } catch (error) {
    next(error);
  }
});

// ── Settings Administration Routing ──────────────────────────────────

router.patch('/settings', requirePermission(Permissions.SETTINGS_EDIT), async (req, res, next) => {
  try {
    const settings = await organizationSettingsService.updateSettings(req.organization._id, req.body, req.user._id);
    res.status(200).json(new ApiResponse(200, 'Settings updated successfully', settings));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
