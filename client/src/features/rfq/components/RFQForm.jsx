import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import VendorSelectionTable from './VendorSelectionTable';
import { getPurchaseRequests } from '../../../api/purchaseRequest.api';
import { getVendors } from '../../../api/vendor.api';
import { createRFQ, updateRFQ } from '../../../api/rfq.api';
import Loader from '../../../components/common/Loader';

const RFQForm = ({ initialData, isReadOnly = false, mode = 'create' }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [activeVendors, setActiveVendors] = useState([]);

  const [formData, setFormData] = useState({
    purchaseRequest: '',
    title: '',
    description: '',
    quotationDeadline: '',
    vendors: []
  });

  const [errors, setErrors] = useState({});

  const fetchApprovedPRs = async () => {
    try {
      setIsLoadingPRs(true);
      const response = await getPurchaseRequests({ status: 'APPROVED', limit: 100 });
      if (response.success) {
        setApprovedPRs(response.data.purchaseRequests);
      }
    } catch {
      toast.error('Failed to load purchase requests');
    } finally {
      setIsLoadingPRs(false);
    }
  };

  const fetchActiveVendors = async () => {
    try {
      setIsLoadingVendors(true);
      const response = await getVendors({ status: 'Active', limit: 500 });
      if (response.success) {
        setActiveVendors(response.data.vendors);
      }
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        purchaseRequest: initialData.purchaseRequest?._id || initialData.purchaseRequest || '',
        title: initialData.title || '',
        description: initialData.description || '',
        quotationDeadline: initialData.quotationDeadline ? new Date(initialData.quotationDeadline).toISOString().split('T')[0] : '',
        vendors: initialData.vendors?.map(v => typeof v === 'object' ? v._id : v) || []
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (mode === 'create') {
      fetchApprovedPRs();
    }
    if (!isReadOnly) {
      fetchActiveVendors();
    }
  }, [mode, isReadOnly]);

  const handlePRChange = (e) => {
    const prId = e.target.value;
    const selectedPR = approvedPRs.find(pr => pr._id === prId);
    if (selectedPR) {
      setFormData({
        ...formData,
        purchaseRequest: prId,
        title: `RFQ: ${selectedPR.title}`
      });
    } else {
      setFormData({
        ...formData,
        purchaseRequest: '',
        title: ''
      });
    }
    if (errors.purchaseRequest) setErrors({ ...errors, purchaseRequest: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleVendorChange = (selectedVendorIds) => {
    setFormData(prev => ({ ...prev, vendors: selectedVendorIds }));
    if (errors.vendors) setErrors({ ...errors, vendors: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (mode === 'create' && !formData.purchaseRequest) newErrors.purchaseRequest = 'Purchase Request is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.quotationDeadline) newErrors.quotationDeadline = 'Deadline is required';
    else if (new Date(formData.quotationDeadline) <= new Date()) newErrors.quotationDeadline = 'Deadline must be in the future';
    if (formData.vendors.length === 0) newErrors.vendors = 'At least 1 vendor must be selected';
    if (formData.vendors.length > 10) newErrors.vendors = 'Maximum 10 vendors allowed';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (mode === 'create') {
        const response = await createRFQ(formData);
        toast.success('RFQ created successfully');
        navigate(`/rfqs/${response.data._id}`);
      } else {
        // Update
        const payload = { ...formData };
        delete payload.purchaseRequest; // Cannot update PR reference
        const response = await updateRFQ(initialData._id, payload);
        toast.success('RFQ updated successfully');
        navigate(`/rfqs/${response.data._id}`);
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error('This Purchase Request already has an active RFQ.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to save RFQ');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPRs || isLoadingVendors) {
    return <Loader rows={5} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 pb-2 border-b border-slate-100">General Details</h3>
        
        {mode === 'create' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Approved Purchase Request <span className="text-red-500">*</span>
            </label>
            <select
              name="purchaseRequest"
              value={formData.purchaseRequest}
              onChange={handlePRChange}
              className={`w-full rounded-md shadow-sm sm:text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                errors.purchaseRequest 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            >
              <option value="">-- Select a Purchase Request --</option>
              {approvedPRs.map(pr => (
                <option key={pr._id} value={pr._id}>
                  {pr.requestNumber} | {pr.title} | {pr.department} | {pr.priority}
                </option>
              ))}
            </select>
            {errors.purchaseRequest && <p className="mt-1 text-sm text-red-600">{errors.purchaseRequest}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Request</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
              {initialData?.purchaseRequestSnapshot?.requestNumber} | {initialData?.purchaseRequestSnapshot?.title}
            </div>
          </div>
        )}

        <Input
          label="RFQ Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          disabled={isReadOnly}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            disabled={isReadOnly}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <Input
          label="Quotation Deadline"
          name="quotationDeadline"
          type="date"
          value={formData.quotationDeadline}
          onChange={handleChange}
          error={errors.quotationDeadline}
          required
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 pb-2 border-b border-slate-100">Assign Vendors</h3>
        {errors.vendors && <p className="text-sm text-red-600">{errors.vendors}</p>}
        <VendorSelectionTable 
          vendors={mode === 'create' ? activeVendors : (isReadOnly ? initialData.vendors : activeVendors)} 
          selectedVendorIds={formData.vendors}
          onChange={handleVendorChange}
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Draft RFQ' : 'Update Draft'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default RFQForm;
