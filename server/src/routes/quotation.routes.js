const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const quotationValidation = require('../validations/quotation.validation');
const quotationController = require('../controllers/quotation.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .post(
    authorize('Manager', 'Admin'),
    validate(quotationValidation.createQuotationSchema),
    quotationController.createQuotation
  )
  .get(
    authorize('Employee', 'Manager', 'Admin'),
    quotationController.getQuotations
  );

router
  .route('/:id')
  .get(
    authorize('Employee', 'Manager', 'Admin'),
    quotationController.getQuotationById
  )
  .patch(
    authorize('Manager', 'Admin'),
    validate(quotationValidation.updateQuotationSchema),
    quotationController.updateQuotation
  )
  .delete(
    authorize('Admin'),
    quotationController.deleteQuotation
  );

router.patch(
  '/:id/review',
  authorize('Manager', 'Admin'),
  validate(quotationValidation.reviewQuotationSchema),
  quotationController.reviewQuotation
);

router.patch(
  '/:id/select',
  authorize('Manager', 'Admin'),
  validate(quotationValidation.selectWinnerSchema),
  quotationController.selectWinningQuotation
);

module.exports = router;
