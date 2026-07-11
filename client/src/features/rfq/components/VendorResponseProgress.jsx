const VendorResponseProgress = ({ vendorResponses }) => {
  if (!vendorResponses) return null;

  const { totalVendors = 0, responded = 0 } = vendorResponses;
  const percentage = totalVendors > 0 ? Math.round((responded / totalVendors) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700">{percentage}%</span>
        <span className="text-sm text-slate-500">
          {responded} of {totalVendors} Vendors Responded
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default VendorResponseProgress;
