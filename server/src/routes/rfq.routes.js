const express = require("express");
const router = express.Router();

const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  sendRFQ,
  closeRFQ,
  cancelRFQ,
  deleteRFQ
} = require("../controllers/rfq.controller");

const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { 
  createRFQSchema, 
  updateRFQSchema, 
  sendRFQSchema,
  closeRFQSchema,
  cancelRFQSchema
} = require("../validations/rfq.validation");

// All RFQ routes require authentication
router.use(protect);

router
  .route("/")
  .post(authorize("Manager", "Admin"), validate(createRFQSchema), createRFQ)
  .get(authorize("Employee", "Manager", "Admin"), getRFQs);

router
  .route("/:id")
  .get(authorize("Employee", "Manager", "Admin"), getRFQById)
  .patch(authorize("Manager", "Admin"), validate(updateRFQSchema), updateRFQ)
  .delete(authorize("Admin"), deleteRFQ);

router
  .route("/:id/send")
  .patch(authorize("Manager", "Admin"), validate(sendRFQSchema), sendRFQ);

router
  .route("/:id/close")
  .patch(authorize("Manager", "Admin"), validate(closeRFQSchema), closeRFQ);

router
  .route("/:id/cancel")
  .patch(authorize("Manager", "Admin"), validate(cancelRFQSchema), cancelRFQ);

module.exports = router;
