const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');
const { requirePermission } = require('../middleware/authorization.middleware');
const { Permissions } = require('../constants/permissions.registry');

router.route('/')
  .get(requirePermission(Permissions.USER_MANAGE), policyController.getPolicies)
  .post(requirePermission(Permissions.USER_MANAGE), policyController.createPolicy);

router.route('/:id')
  .patch(requirePermission(Permissions.USER_MANAGE), policyController.updatePolicy)
  .delete(requirePermission(Permissions.USER_MANAGE), policyController.deletePolicy);

module.exports = router;
