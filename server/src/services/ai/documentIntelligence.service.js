const geminiProvider = require('./geminiProvider');
const { QUOTATION_PROMPT } = require('./document/extractionPrompts');
const AIDocumentExtraction = require('../../models/AIDocumentExtraction');

class DocumentIntelligenceService {
  /**
   * Extract structured data from a document
   * @param {Object} file - The multer file object
   * @param {string} documentType - 'Quotation', 'Invoice', etc.
   * @param {string} userId - ID of the user triggering the extraction
   */
  async extractDocument(file, documentType, userId) {
    console.log(`[DocumentIntelligence] Extracting ${documentType} from file: ${file.originalname}`);
    const startTime = Date.now();
    
    try {
      let prompt = '';
      if (documentType === 'Quotation') {
        prompt = QUOTATION_PROMPT;
      } else {
        throw new Error(`Unsupported document type: ${documentType}`);
      }

      // Convert buffer to base64
      const base64Data = file.buffer.toString('base64');
      const mimeType = file.mimetype;

      // Query LLM
      const response = await geminiProvider.generateContent(
        prompt,
        [], // no history
        [], // no tools
        '', // System instruction already in prompt
        null,
        {
          responseMimeType: "application/json",
          files: [{ mimeType, base64: base64Data }]
        }
      );

      let rawText = response.text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const extractedData = JSON.parse(rawText);

      const extractionLatencyMs = Date.now() - startTime;
      
      // Save Audit Record
      const auditRecord = await AIDocumentExtraction.create({
        documentType,
        filename: file.originalname,
        mimeType: file.mimetype,
        model: 'gemini-2.5-flash',
        extractionLatencyMs,
        overallConfidence: extractedData.overallConfidence || 0,
        extractedFields: extractedData,
        warnings: extractedData.warnings || [],
        extractedBy: userId
      });

      console.log(`[DocumentIntelligence] Extraction complete in ${extractionLatencyMs}ms`);

      return {
        success: true,
        data: extractedData,
        auditId: auditRecord._id
      };

    } catch (error) {
      console.error('[DocumentIntelligence] Extraction failed:', error);
      throw error;
    }
  }
}

module.exports = new DocumentIntelligenceService();
