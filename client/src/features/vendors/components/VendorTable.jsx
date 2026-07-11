import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import VendorStatusBadge from './VendorStatusBadge';

const VendorTable = ({ vendors, onDeleteClick }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor Code</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Person</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created Date</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {vendors.map((vendor) => (
            <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                <Link to={`/vendors/${vendor._id}`}>{vendor.vendorCode}</Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{vendor.companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vendor.contactPerson}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vendor.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <VendorStatusBadge status={vendor.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {vendor.rating ? `${vendor.rating} / 5` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(vendor.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link to={`/vendors/${vendor._id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Eye size={18} />
                  </Link>
                  <Link to={`/vendors/${vendor._id}/edit`} className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => onDeleteClick(vendor)} className="text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorTable;
