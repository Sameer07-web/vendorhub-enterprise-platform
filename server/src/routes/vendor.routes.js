const express = require("express");
const router = express.Router();

const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendor.controller");

const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createVendorSchema, updateVendorSchema } = require("../validations/vendor.validation");

router.use(protect); // All vendor routes require authentication

router
  .route("/")
  .post(authorize("Admin", "Manager"), validate(createVendorSchema), createVendor)
  .get(getVendors);

router
  .route("/:id")
  .get(getVendorById)
  .patch(authorize("Admin", "Manager"), validate(updateVendorSchema), updateVendor)
  .delete(authorize("Admin"), deleteVendor);

module.exports = router;
