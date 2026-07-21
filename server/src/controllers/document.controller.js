const documentIntelligenceService = require('../services/ai/documentIntelligence.service');

// @desc    Extract data from a quotation document
// @route   POST /api/v1/ai/extract/quotation
// @access  Private (Admin/Manager/Employee)
exports.extractQuotation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Supported mime types for Gemini multimodal
    const supportedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!supportedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Unsupported file format. Please upload PDF, PNG, or JPEG.' });
    }

    const result = await documentIntelligenceService.extractDocument(req.file, 'Quotation', req.user._id);
    
    res.json(result);
  } catch (error) {
    console.error('Error extracting quotation:', error);
    res.status(500).json({ success: false, error: 'Failed to extract document data' });
  }
};
