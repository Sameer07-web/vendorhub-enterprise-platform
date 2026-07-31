const AuthorizationPolicyRepository = require('../repositories/AuthorizationPolicyRepository');
const policyEngineService = require('../services/policyEngine.service');
const auditLogRepository = require('../repositories/AuditLogRepository');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getPolicies = catchAsync(async (req, res) => {
  const policies = await AuthorizationPolicyRepository.findMany(req.organization._id);
  res.status(200).json(new ApiResponse(200, 'Policies retrieved successfully', policies));
});

const createPolicy = catchAsync(async (req, res) => {
  const orgId = req.organization._id;
  const policy = await AuthorizationPolicyRepository.create(orgId, {
    organization: orgId,
    ...req.body
  });

  await policyEngineService.invalidateCache(orgId);

  await auditLogRepository.create(orgId, {
    user: req.user._id,
    action: 'POLICY_CREATED',
    entityType: 'AuthorizationPolicy',
    entityId: policy._id,
    newValue: req.body
  });

  res.status(201).json(new ApiResponse(201, 'Policy created successfully', policy));
});

const updatePolicy = catchAsync(async (req, res) => {
  const orgId = req.organization._id;
  const policyId = req.params.id;

  const oldPolicy = await AuthorizationPolicyRepository.findOne(orgId, { _id: policyId });
  if (!oldPolicy) {
    return res.status(404).json({ success: false, error: 'Policy not found' });
  }

  const updatedPolicy = await AuthorizationPolicyRepository.update(orgId, policyId, req.body, { new: true });
  await policyEngineService.invalidateCache(orgId);

  await auditLogRepository.create(orgId, {
    user: req.user._id,
    action: 'POLICY_UPDATED',
    entityType: 'AuthorizationPolicy',
    entityId: policyId,
    oldValue: oldPolicy.toObject ? oldPolicy.toObject() : oldPolicy,
    newValue: req.body
  });

  res.status(200).json(new ApiResponse(200, 'Policy updated successfully', updatedPolicy));
});

const deletePolicy = catchAsync(async (req, res) => {
  const orgId = req.organization._id;
  const policyId = req.params.id;

  const policy = await AuthorizationPolicyRepository.findOne(orgId, { _id: policyId });
  if (!policy) {
    return res.status(404).json({ success: false, error: 'Policy not found' });
  }

  await AuthorizationPolicyRepository.delete(orgId, policyId);
  await policyEngineService.invalidateCache(orgId);

  await auditLogRepository.create(orgId, {
    user: req.user._id,
    action: 'POLICY_DELETED',
    entityType: 'AuthorizationPolicy',
    entityId: policyId,
    oldValue: policy.toObject ? policy.toObject() : policy
  });

  res.status(200).json(new ApiResponse(200, 'Policy deleted successfully', { id: policyId }));
});

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
