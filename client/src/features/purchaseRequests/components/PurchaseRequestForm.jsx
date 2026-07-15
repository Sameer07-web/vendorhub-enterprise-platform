import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Textarea from '../../../components/common/Textarea';
import Button from '../../../components/common/Button';
import { getVendors } from '../../../api/vendor.api';
import { DEPARTMENTS, CURRENCIES, PR_PRIORITY } from '../../../utils/constants';

const PurchaseRequestForm = ({ initialData, onSubmit, isSubmitting, mode = 'create' }) => {
  const navigate = useNavigate();
  const isReadOnly = mode === 'readOnly';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: '',
    vendor: '',
    quantity: 1,
    estimatedCost: '',
    currency: 'USD',
    priority: 'MEDIUM',
    requiredDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorError, setVendorError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        vendor: initialData.vendor?._id || initialData.vendor || '',
        requiredDate: initialData.requiredDate ? new Date(initialData.requiredDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData]);

  const fetchVendorList = async () => {
    try {
      setLoadingVendors(true);
      setVendorError(false);
      // Fetch only active vendors without limit for the dropdown (in a real app we might use an autocomplete)
      const res = await getVendors({ status: 'Active', limit: 1000 });
      if (res.success && res.data && res.data.vendors) {
        setVendors(res.data.vendors.sort((a, b) => a.companyName.localeCompare(b.companyName)));
      }
    } catch {
      setVendorError(true);
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    if (!isReadOnly) {
      fetchVendorList();
    }
  }, [isReadOnly]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.estimatedCost || formData.estimatedCost <= 0) {
      newErrors.estimatedCost = 'Estimated cost must be greater than 0';
    }

    if (!formData.requiredDate) {
      newErrors.requiredDate = 'Required Date is required';
    } else {
      const selected = new Date(formData.requiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        newErrors.requiredDate = 'Required Date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (validate()) {
      onSubmit(formData);
    }
  };

  const departmentOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));
  const currencyOptions = CURRENCIES.map(c => ({ value: c, label: c }));
  const priorityOptions = Object.keys(PR_PRIORITY).map(p => ({ value: p, label: p }));
  const vendorOptions = vendors.map(v => ({ value: v._id, label: `${v.vendorCode} — ${v.companyName}` }));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <h3 className="md:col-span-2 text-lg font-medium text-surface-800 border-b pb-2 mb-2">General Information</h3>
        
        <Input label="Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} placeholder="Enter request title" disabled={isReadOnly} />
        <Select label="Department" name="department" value={formData.department} onChange={handleChange} options={departmentOptions} error={errors.department} disabled={isReadOnly} />
        
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isReadOnly}
            rows={3}
            error={errors.description}
            placeholder="Detailed description of the request"
          />
        </div>

        <Input label="Category" name="category" value={formData.category} onChange={handleChange} error={errors.category} placeholder="e.g. IT Equipment" disabled={isReadOnly} />
        <Input label="Required Date" name="requiredDate" type="date" value={formData.requiredDate} onChange={handleChange} error={errors.requiredDate} disabled={isReadOnly} />

        <h3 className="md:col-span-2 text-lg font-medium text-surface-800 border-b pb-2 mt-4 mb-2">Vendor & Financials</h3>
        
        <div className="md:col-span-2 relative">
          <Select 
            label="Vendor" 
            name="vendor" 
            value={formData.vendor} 
            onChange={handleChange} 
            options={vendorOptions} 
            error={errors.vendor} 
            disabled={isReadOnly || loadingVendors} 
          />
          {loadingVendors && <span className="absolute top-8 right-10 text-xs text-surface-400">Loading...</span>}
          {vendorError && !isReadOnly && (
            <div className="mt-1 flex items-center justify-between text-xs text-error-500">
              <span>Failed to load vendors.</span>
              <button type="button" onClick={fetchVendorList} className="text-primary-600 hover:underline">Retry</button>
            </div>
          )}
        </div>

        <Input label="Quantity" name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} error={errors.quantity} disabled={isReadOnly} />
        
        <div className="grid grid-cols-2 gap-2">
          <Input label="Estimated Cost" name="estimatedCost" type="number" min="0.01" step="0.01" value={formData.estimatedCost} onChange={handleChange} error={errors.estimatedCost} disabled={isReadOnly} />
          <Select label="Currency" name="currency" value={formData.currency} onChange={handleChange} options={currencyOptions} disabled={isReadOnly} />
        </div>

        <Select label="Priority" name="priority" value={formData.priority} onChange={handleChange} options={priorityOptions} disabled={isReadOnly} />

        <div className="md:col-span-2 mt-4">
          <Textarea
            label="Internal Notes (Optional)"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            rows={2}
            placeholder="Any additional internal notes..."
          />
        </div>
      </div>

      {!isReadOnly && (
        <div className="mt-8 flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Request'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default PurchaseRequestForm;
