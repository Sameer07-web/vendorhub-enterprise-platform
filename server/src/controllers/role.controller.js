const dynamicRoleService = require('../services/dynamicRole.service');
const OrganizationRoleRepository = require('../repositories/OrganizationRoleRepository');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getRoles = catchAsync(async (req, res) => {
  const roles = await OrganizationRoleRepository.findMany(req.organization._id, { status: 'ACTIVE' });
  res.status(200).json(new ApiResponse(200, 'Roles retrieved successfully', roles));
});

const createRole = catchAsync(async (req, res) => {
  const role = await dynamicRoleService.createRole(req.organization._id, req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Role created successfully', role));
});

const updateRole = catchAsync(async (req, res) => {
  const role = await dynamicRoleService.updateRole(req.organization._id, req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Role updated successfully', role));
});

const cloneRole = catchAsync(async (req, res) => {
  const { name } = req.body;
  const role = await dynamicRoleService.cloneRole(req.organization._id, req.params.id, name, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Role cloned successfully', role));
});

const archiveRole = catchAsync(async (req, res) => {
  const role = await dynamicRoleService.archiveRole(req.organization._id, req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Role archived successfully', role));
});

const deleteRole = catchAsync(async (req, res) => {
  // Archive by default or check if isSystem first
  const role = await dynamicRoleService.archiveRole(req.organization._id, req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Role deleted successfully', role));
});

const assignRole = catchAsync(async (req, res) => {
  const { memberId, roleId } = req.body;
  const assignment = await dynamicRoleService.assignRoleToMember(req.organization._id, memberId, roleId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Role assigned successfully', assignment));
});

const removeRole = catchAsync(async (req, res) => {
  const { memberId, roleId } = req.body;
  const result = await dynamicRoleService.removeRoleFromMember(req.organization._id, memberId, roleId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Role removed successfully', result));
});

const getMemberRoles = catchAsync(async (req, res) => {
  const roles = await dynamicRoleService.getMemberRoles(req.organization._id, req.params.memberId);
  res.status(200).json(new ApiResponse(200, 'Member roles retrieved successfully', roles));
});

module.exports = {
  getRoles,
  createRole,
  updateRole,
  cloneRole,
  archiveRole,
  deleteRole,
  assignRole,
  removeRole,
  getMemberRoles,
};
