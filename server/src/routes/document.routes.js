const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const documentController = require('../controllers/document.controller');

// Use memory storage for ephemeral AI processing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.post('/quotation', upload.single('file'), documentController.extractQuotation);

module.exports = router;
