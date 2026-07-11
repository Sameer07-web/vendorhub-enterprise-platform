const express = require('express');
const { auth, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const quotationValidation = require('../validations/quotation.validation');
const quotationController = require('../controllers/quotation.controller');

const router = express.Router();

// All routes require authentication
router.use(auth);

router
  .route('/')
  .post(
    restrictTo('Manager', 'Admin'),
    validate(quotationValidation.createQuotationSchema),
    quotationController.createQuotation
  )
  .get(
    restrictTo('Employee', 'Manager', 'Admin'),
    quotationController.getQuotations
  );

router
  .route('/:id')
  .get(
    restrictTo('Employee', 'Manager', 'Admin'),
    quotationController.getQuotationById
  )
  .patch(
    restrictTo('Manager', 'Admin'),
    validate(quotationValidation.updateQuotationSchema),
    quotationController.updateQuotation
  )
  .delete(
    restrictTo('Admin'),
    quotationController.deleteQuotation
  );

router.patch(
  '/:id/review',
  restrictTo('Manager', 'Admin'),
  validate(quotationValidation.reviewQuotationSchema),
  quotationController.reviewQuotation
);

router.patch(
  '/:id/select',
  restrictTo('Manager', 'Admin'),
  validate(quotationValidation.selectWinnerSchema),
  quotationController.selectWinningQuotation
);

module.exports = router;
