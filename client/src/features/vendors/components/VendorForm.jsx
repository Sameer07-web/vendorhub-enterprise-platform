import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';

const VendorForm = ({ initialData, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    category: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = 'Company Name is required';
    if (!formData.contactPerson) newErrors.contactPerson = 'Contact Person is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (!formData.gstNumber) {
      newErrors.gstNumber = 'GST Number is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format (e.g. 22AAAAA0000A1Z5)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const categoryOptions = [
    { value: 'IT Equipment', label: 'IT Equipment' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <h3 className="md:col-span-2 text-lg font-medium text-slate-800 border-b pb-2 mb-2">Basic Information</h3>
        <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} placeholder="Enter company name" />
        <Input label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} error={errors.contactPerson} placeholder="Enter contact person" />
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="vendor@example.com" />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="+1 234 567 890" />
        <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.example.com" />
        <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} error={errors.gstNumber} placeholder="Enter GST Number" />
        
        <h3 className="md:col-span-2 text-lg font-medium text-slate-800 border-b pb-2 mt-4 mb-2">Address & Status</h3>
        <div className="md:col-span-2">
          <Input label="Address" name="address" value={formData.address || ''} onChange={handleChange} placeholder="123 Street Name" />
        </div>
        <Input label="City" name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" />
        <Input label="State" name="state" value={formData.state || ''} onChange={handleChange} placeholder="State" />
        <Input label="Country" name="country" value={formData.country || ''} onChange={handleChange} placeholder="Country" />
        <Input label="Postal Code" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} placeholder="Postal Code" />
        
        <Select label="Category" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} />
        <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
      </div>

      <div className="mt-8 flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="secondary" onClick={() => navigate('/vendors')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Vendor'}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
