const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { requirePermission } = require('../middleware/authorization.middleware');
const { Permissions } = require('../constants/permissions.registry');

router.route('/')
  .get(requirePermission(Permissions.USER_MANAGE), roleController.getRoles)
  .post(requirePermission(Permissions.USER_MANAGE), roleController.createRole);

router.route('/:id')
  .patch(requirePermission(Permissions.USER_MANAGE), roleController.updateRole)
  .delete(requirePermission(Permissions.USER_MANAGE), roleController.deleteRole);

router.post('/:id/clone', requirePermission(Permissions.USER_MANAGE), roleController.cloneRole);
router.post('/:id/archive', requirePermission(Permissions.USER_MANAGE), roleController.archiveRole);

router.post('/assign', requirePermission(Permissions.USER_MANAGE), roleController.assignRole);
router.post('/remove', requirePermission(Permissions.USER_MANAGE), roleController.removeRole);
router.get('/member/:memberId', requirePermission(Permissions.USER_MANAGE), roleController.getMemberRoles);

module.exports = router;
