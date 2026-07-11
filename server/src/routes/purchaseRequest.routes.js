const express = require("express");
const router = express.Router();

const {
  createPurchaseRequest,
  getPurchaseRequests,
  getPurchaseRequestById,
  updatePurchaseRequest,
  submitPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  deletePurchaseRequest
} = require("../controllers/purchaseRequest.controller");

const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { 
  createPurchaseRequestSchema, 
  updatePurchaseRequestSchema, 
  approvalSchema 
} = require("../validations/purchaseRequest.validation");

// All PR routes require authentication
router.use(protect);

router
  .route("/")
  .post(authorize("Employee", "Manager", "Admin"), validate(createPurchaseRequestSchema), createPurchaseRequest)
  .get(authorize("Employee", "Manager", "Admin"), getPurchaseRequests);

router
  .route("/:id")
  .get(authorize("Employee", "Manager", "Admin"), getPurchaseRequestById)
  .patch(authorize("Employee", "Manager", "Admin"), validate(updatePurchaseRequestSchema), updatePurchaseRequest)
  .delete(authorize("Admin"), deletePurchaseRequest);

router
  .route("/:id/submit")
  .patch(authorize("Employee", "Manager", "Admin"), submitPurchaseRequest);

router
  .route("/:id/approve")
  .patch(authorize("Manager", "Admin"), validate(approvalSchema), approvePurchaseRequest);

router
  .route("/:id/reject")
  .patch(authorize("Manager", "Admin"), validate(approvalSchema), rejectPurchaseRequest);

module.exports = router;
