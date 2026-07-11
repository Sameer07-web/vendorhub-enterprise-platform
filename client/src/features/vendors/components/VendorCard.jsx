import React from 'react';
import VendorStatusBadge from './VendorStatusBadge';
import { Building2, Mail, Phone, Globe, MapPin, FileText } from 'lucide-react';

const VendorCard = ({ vendor }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{vendor.companyName}</h2>
          <p className="text-sm text-slate-500 mt-1">Vendor Code: {vendor.vendorCode}</p>
        </div>
        <VendorStatusBadge status={vendor.status} />
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Contact Information</h3>
          
          <div className="flex items-start">
            <Building2 className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">{vendor.contactPerson}</p>
              <p className="text-xs text-slate-500">Contact Person</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <a href={`mailto:${vendor.email}`} className="text-sm font-medium text-blue-600 hover:underline">{vendor.email}</a>
              <p className="text-xs text-slate-500">Email Address</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">{vendor.phone}</p>
              <p className="text-xs text-slate-500">Phone Number</p>
            </div>
          </div>

          {vendor.website && (
            <div className="flex items-start">
              <Globe className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                  {vendor.website}
                </a>
                <p className="text-xs text-slate-500">Website</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">Business Details</h3>
          
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">{vendor.gstNumber}</p>
              <p className="text-xs text-slate-500">GST Number</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {vendor.address && <span className="block">{vendor.address}</span>}
                {(vendor.city || vendor.state || vendor.postalCode) && (
                  <span className="block">
                    {[vendor.city, vendor.state, vendor.postalCode].filter(Boolean).join(', ')}
                  </span>
                )}
                {vendor.country && <span className="block">{vendor.country}</span>}
                {!vendor.address && !vendor.city && !vendor.state && !vendor.country && 'No address provided'}
              </p>
              <p className="text-xs text-slate-500">Location</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between">
            <div>
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-sm font-medium text-slate-900">{vendor.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Rating</p>
              <p className="text-sm font-medium text-slate-900">{vendor.rating ? `${vendor.rating} / 5` : 'Not Rated'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
