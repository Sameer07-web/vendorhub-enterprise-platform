import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { Building2, MapPin, Settings2, CheckCircle2, ChevronDown, ChevronUp, Mail, Phone, Globe, Hash } from 'lucide-react';

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
    vendorCategory: 'IT Equipment',
    status: 'Pending',
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialData) {
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
    
    // Smooth scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.getElementsByName(Object.keys(newErrors)[0])[0];
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
    }
    
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

  const isSuccess = (fieldName) => {
    // If the field has value and no errors, mark as success visually
    return formData[fieldName]?.length > 0 && !errors[fieldName];
  };

  const categoryOptions = [
    { value: 'Raw Material', label: 'Raw Material' },
    { value: 'IT Equipment', label: 'IT Equipment' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border animate-fade-in overflow-hidden">
      
      <div className="p-6 md:p-8 space-y-10">
        
        {/* Section: Basic Information */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600 ring-1 ring-inset ring-primary-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900 tracking-tight">Basic Information</h3>
              <p className="text-sm text-surface-500">Core details about the vendor.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-surface-50/50 p-6 rounded-xl border border-border/50">
            <Input required label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} success={isSuccess('companyName')} placeholder="e.g. Acme Corporation" />
            <Input required label="GST Number" name="gstNumber" icon={Hash} value={formData.gstNumber} onChange={handleChange} error={errors.gstNumber} success={isSuccess('gstNumber')} placeholder="e.g. 22AAAAA0000A1Z5" helperText="Must be a valid 15-character GSTIN" />
            <Select required label="Vendor Category" name="vendorCategory" value={formData.vendorCategory} onChange={handleChange} options={categoryOptions} success={isSuccess('vendorCategory')} />
          </div>
        </section>

        <hr className="border-border" />

        {/* Section: Contact Information */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900 tracking-tight">Contact Information</h3>
              <p className="text-sm text-surface-500">Primary point of contact for this vendor.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-surface-50/50 p-6 rounded-xl border border-border/50">
            <Input required label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} error={errors.contactPerson} success={isSuccess('contactPerson')} placeholder="Full Name" />
            <Input required label="Email Address" name="email" type="email" icon={Mail} value={formData.email} onChange={handleChange} error={errors.email} success={isSuccess('email')} placeholder="contact@company.com" />
            <Input required label="Phone Number" name="phone" type="tel" icon={Phone} value={formData.phone} onChange={handleChange} error={errors.phone} success={isSuccess('phone')} placeholder="+1 (555) 000-0000" />
            <Input label="Website" name="website" icon={Globe} value={formData.website} onChange={handleChange} placeholder="https://www.company.com" />
          </div>
        </section>

        <hr className="border-border" />

        {/* Section: Progressive Disclosure - Address & Settings */}
        <section>
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left focus-ring rounded-xl p-2 -mx-2 hover:bg-surface-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-surface-100 rounded-xl text-surface-600 group-hover:bg-surface-200 transition-colors ring-1 ring-inset ring-surface-500/20">
                <Settings2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900 tracking-tight">Address & Configuration</h3>
                <p className="text-sm text-surface-500">Physical location and internal system status.</p>
              </div>
            </div>
            <div className="text-surface-400 group-hover:text-surface-600 transition-colors">
              {showAdvanced ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
          </button>

          {showAdvanced && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-surface-50/50 p-6 rounded-xl border border-border/50 animate-slide-up">
              <div className="md:col-span-2">
                <Input label="Street Address" name="address" icon={MapPin} value={formData.address || ''} onChange={handleChange} placeholder="123 Corporate Blvd, Suite 400" />
              </div>
              <Input label="City" name="city" value={formData.city || ''} onChange={handleChange} placeholder="San Francisco" />
              <Input label="State/Province" name="state" value={formData.state || ''} onChange={handleChange} placeholder="CA" />
              <Input label="Country" name="country" value={formData.country || ''} onChange={handleChange} placeholder="United States" />
              <Input label="Postal Code" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} placeholder="94105" />
              
              <div className="md:col-span-2 mt-2 pt-6 border-t border-border/50">
                <Select label="System Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} helperText="Controls if this vendor can be selected for new Purchase Requests." />
              </div>
            </div>
          )}
        </section>

      </div>

      <div className="px-6 py-4 bg-surface-50 border-t border-border flex items-center justify-between">
        <p className="text-xs text-surface-500"><span className="text-error-500">*</span> Indicates required fields</p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/vendors')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} startIcon={CheckCircle2}>
            {initialData ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </div>

    </form>
  );
};

export default VendorForm;

