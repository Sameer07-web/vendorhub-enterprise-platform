import { useState, useMemo } from 'react';
import SearchBar from '../../../components/common/SearchBar';
import { Check, X } from 'lucide-react';

const VendorSelectionTable = ({ vendors = [], selectedVendorIds = [], onChange, disabled = false }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('companyName');
  const [sortDir, setSortDir] = useState('asc');

  const filteredAndSortedVendors = useMemo(() => {
    let result = [...vendors];
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(v => 
        v.companyName?.toLowerCase().includes(lowerSearch) || 
        v.vendorCode?.toLowerCase().includes(lowerSearch) ||
        v.category?.toLowerCase().includes(lowerSearch)
      );
    }
    
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [vendors, search, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleToggleVendor = (vendorId) => {
    if (disabled) return;
    
    const isSelected = selectedVendorIds.includes(vendorId);
    if (isSelected) {
      onChange(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      if (selectedVendorIds.length >= 10) {
        return; // Prevent selecting more than 10
      }
      onChange([...selectedVendorIds, vendorId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-72">
          <SearchBar placeholder="Search vendors..." onSearch={setSearch} />
        </div>
        <div className="flex items-center text-sm">
          <span className="text-slate-500 mr-2">Selected Vendors:</span>
          <span className={`font-semibold px-2 py-1 rounded-md ${selectedVendorIds.length > 10 ? 'bg-red-100 text-red-700' : selectedVendorIds.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
            {selectedVendorIds.length} / 10
          </span>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                  Select
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('vendorCode')}>
                  Code {sortField === 'vendorCode' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('companyName')}>
                  Company {sortField === 'companyName' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('category')}>
                  Category {sortField === 'category' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAndSortedVendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                    No vendors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAndSortedVendors.map((vendor) => {
                  const isSelected = selectedVendorIds.includes(vendor._id);
                  const isAtLimit = !isSelected && selectedVendorIds.length >= 10;
                  
                  return (
                    <tr 
                      key={vendor._id} 
                      className={`${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'} transition-colors ${disabled || isAtLimit ? 'opacity-60' : 'cursor-pointer'}`}
                      onClick={() => !disabled && !isAtLimit && handleToggleVendor(vendor._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className={`w-5 h-5 rounded border flex items-center justify-center
                            ${isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : isAtLimit 
                                ? 'bg-slate-100 border-slate-300 cursor-not-allowed' 
                                : 'bg-white border-slate-300'}`}
                        >
                          {isSelected && <Check size={14} className="text-white" />}
                          {isAtLimit && !isSelected && <X size={14} className="text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {vendor.vendorCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {vendor.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {vendor.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorSelectionTable;
