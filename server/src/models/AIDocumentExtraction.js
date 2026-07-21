const mongoose = require('mongoose');

const aiDocumentExtractionSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: ['Quotation', 'Invoice', 'PurchaseOrder', 'ComplianceCertificate'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    extractionLatencyMs: {
      type: Number,
      required: true
    },
    overallConfidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    extractedFields: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    warnings: {
      type: [String],
      default: []
    },
    extractedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

aiDocumentExtractionSchema.index({ documentType: 1 });
aiDocumentExtractionSchema.index({ extractedBy: 1 });
aiDocumentExtractionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIDocumentExtraction', aiDocumentExtractionSchema);
