import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import { createQuotation } from '../../../api/quote.api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';

const ConfidenceBadge = ({ confidence }) => {
  if (confidence === undefined || confidence === null) return null;
  if (confidence >= 90) return <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-2">{confidence}% Match</span>;
  if (confidence >= 70) return <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-2 flex items-center gap-1"><AlertCircle size={10} /> Needs Review</span>;
  return <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-2 flex items-center gap-1"><AlertCircle size={10} /> Low Confidence</span>;
};

const SubmitQuoteModal = ({ isOpen, onClose, rfq, onQuoteSubmitted }) => {
  const [file, setFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    subtotal: '',
    taxAmount: '',
    shippingCost: '',
    discount: '',
    totalAmount: '',
    deliveryDays: '',
    paymentTerms: '',
    validUntil: '',
    currency: 'USD'
  });
  
  // Confidences
  const [confidences, setConfidences] = useState({});
  const [overallConfidence, setOverallConfidence] = useState(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setIsExtracting(true);
    
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      
      const res = await api.post('/ai/extract/quotation', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = res.data.data;
      
      // Map extracted values to form data
      setFormData({
        subtotal: data.subtotal?.value || '',
        taxAmount: data.taxAmount?.value || '0',
        shippingCost: data.shippingCost?.value || '0',
        discount: data.discount?.value || '0',
        totalAmount: data.totalAmount?.value || '',
        deliveryDays: data.deliveryDays?.value || '',
        paymentTerms: data.paymentTerms?.value || '',
        validUntil: data.validUntil?.value || '',
        currency: data.currency?.value || 'USD'
      });

      // Map confidences
      setConfidences({
        subtotal: data.subtotal?.confidence,
        taxAmount: data.taxAmount?.confidence,
        shippingCost: data.shippingCost?.confidence,
        discount: data.discount?.confidence,
        totalAmount: data.totalAmount?.confidence,
        deliveryDays: data.deliveryDays?.confidence,
        paymentTerms: data.paymentTerms?.confidence,
        validUntil: data.validUntil?.confidence
      });
      
      setOverallConfidence(data.overallConfidence);
      toast.success('Document extracted successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to extract document');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error('Please select a vendor');
      return;
    }

    setIsSubmitting(true);
    try {
      await createQuotation({
        rfq: rfq._id,
        vendor: vendorId,
        subtotal: Number(formData.subtotal),
        taxAmount: Number(formData.taxAmount),
        shippingCost: Number(formData.shippingCost),
        discount: Number(formData.discount),
        totalAmount: Number(formData.totalAmount) || (Number(formData.subtotal) + Number(formData.taxAmount) + Number(formData.shippingCost) - Number(formData.discount)),
        deliveryDays: Number(formData.deliveryDays) || 0,
        paymentTerms: formData.paymentTerms,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        currency: formData.currency
      });
      
      toast.success('Quotation submitted successfully');
      onQuoteSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Submit Quotation</h2>
            <p className="text-sm text-surface-500 mt-1">Upload a PDF or Image to let AI extract the details automatically.</p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-8">
          
          {/* Left Panel: Document Upload */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                isExtracting ? 'border-primary-300 bg-primary-50' : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileDrop} accept="application/pdf,image/png,image/jpeg" />
              
              {isExtracting ? (
                <>
                  <Loader2 className="animate-spin text-primary-500 mb-4" size={32} />
                  <p className="text-sm font-medium text-primary-700">Extracting details with AI...</p>
                </>
              ) : file ? (
                <>
                  <FileText className="text-success-500 mb-4" size={32} />
                  <p className="text-sm font-medium text-surface-900">{file.name}</p>
                  <p className="text-xs text-surface-500 mt-1">Click or drag to replace</p>
                </>
              ) : (
                <>
                  <Upload className="text-surface-400 mb-4" size={32} />
                  <p className="text-sm font-medium text-surface-900">Upload Quotation</p>
                  <p className="text-xs text-surface-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                </>
              )}
            </div>

            {overallConfidence !== null && (
              <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-surface-700 uppercase mb-2">AI Extraction Report</h4>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-surface-600 flex-1">Overall Confidence:</span>
                  <div className="w-24 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${overallConfidence >= 90 ? 'bg-green-500' : overallConfidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${overallConfidence}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium">{overallConfidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Form */}
          <div className="w-full md:w-2/3">
            <form id="quote-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Select Vendor *</label>
                <select 
                  className="w-full border-surface-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                  value={vendorId} 
                  onChange={e => setVendorId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vendor --</option>
                  {(rfq.vendors || []).map(v => (
                    <option key={v._id || v} value={v._id || v}>
                      {v.companyName || v.vendorName || v._id || v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Subtotal * <ConfidenceBadge confidence={confidences.subtotal} />
                  </label>
                  <input type="number" step="0.01" name="subtotal" value={formData.subtotal} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Currency <ConfidenceBadge confidence={confidences.currency} />
                  </label>
                  <input type="text" name="currency" value={formData.currency} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Tax <ConfidenceBadge confidence={confidences.taxAmount} />
                  </label>
                  <input type="number" step="0.01" name="taxAmount" value={formData.taxAmount} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Shipping <ConfidenceBadge confidence={confidences.shippingCost} />
                  </label>
                  <input type="number" step="0.01" name="shippingCost" value={formData.shippingCost} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Discount <ConfidenceBadge confidence={confidences.discount} />
                  </label>
                  <input type="number" step="0.01" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-bold text-surface-900 mb-1">
                  Total Amount * <ConfidenceBadge confidence={confidences.totalAmount} />
                </label>
                <input type="number" step="0.01" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} className="w-full border-surface-400 bg-surface-50 text-lg font-bold rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Delivery Days <ConfidenceBadge confidence={confidences.deliveryDays} />
                  </label>
                  <input type="number" name="deliveryDays" value={formData.deliveryDays} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-surface-700 mb-1">
                    Valid Until <ConfidenceBadge confidence={confidences.validUntil} />
                  </label>
                  <input type="date" name="validUntil" value={formData.validUntil} onChange={handleInputChange} className="w-full border-surface-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-200 bg-surface-50 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-surface-700 hover:text-surface-900">
            Cancel
          </button>
          <button 
            type="submit" 
            form="quote-form" 
            disabled={isSubmitting || isExtracting}
            className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuoteModal;
