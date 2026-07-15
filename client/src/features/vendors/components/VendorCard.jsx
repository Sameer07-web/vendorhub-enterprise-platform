import React from 'react';
import VendorStatusBadge from './VendorStatusBadge';
import { Building2, Mail, Phone, Globe, MapPin, FileText, Star } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';

const VendorCard = ({ vendor }) => {
  return (
    <Card className="w-full">
      <div className="px-6 py-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100/50 shadow-sm shrink-0">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900 tracking-tight">{vendor.companyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md">{vendor.vendorCode}</span>
              <span className="text-sm text-surface-400">•</span>
              <span className="text-sm text-surface-500">{vendor.vendorCategory}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <VendorStatusBadge status={vendor.status} />
          {vendor.rating && (
            <div className="flex items-center gap-1 text-warning-500">
              <Star size={14} className="fill-current" />
              <span className="text-sm font-semibold text-surface-700">{vendor.rating}<span className="text-surface-400 font-normal">/5</span></span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-6 space-y-6 bg-surface-50">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Contact Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                <Building2 className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">{vendor.contactPerson}</p>
                <p className="text-xs font-medium text-surface-500 mt-0.5">Primary Contact</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                <Mail className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <a href={`mailto:${vendor.email}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">{vendor.email}</a>
                <p className="text-xs font-medium text-surface-500 mt-0.5">Email Address</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                <Phone className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">{vendor.phone}</p>
                <p className="text-xs font-medium text-surface-500 mt-0.5">Phone Number</p>
              </div>
            </div>

            {vendor.website && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                  <Globe className="w-4 h-4 text-surface-500" />
                </div>
                <div>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                    {vendor.website.replace(/^https?:\/\//, '')}
                  </a>
                  <p className="text-xs font-medium text-surface-500 mt-0.5">Website</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6 bg-surface-50">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Business Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                <FileText className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 uppercase tracking-wide">{vendor.gstNumber}</p>
                <p className="text-xs font-medium text-surface-500 mt-0.5">Tax / GST Number</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white rounded-md border border-border shadow-subtle">
                <MapPin className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900 leading-relaxed">
                  {vendor.address && <span className="block">{vendor.address}</span>}
                  {(vendor.city || vendor.state || vendor.postalCode) && (
                    <span className="block mt-0.5">
                      {[vendor.city, vendor.state, vendor.postalCode].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {vendor.country && <span className="block mt-0.5 text-surface-600">{vendor.country}</span>}
                  {!vendor.address && !vendor.city && !vendor.state && !vendor.country && <span className="text-surface-400 italic">No address provided</span>}
                </p>
                <p className="text-xs font-medium text-surface-500 mt-1">Headquarters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VendorCard;
