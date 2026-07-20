import React, { useState, useEffect } from 'react';
import { reportApi } from '../../../api/report.api';
import { savedReportApi } from '../../../api/savedReport.api';
import ReportPreviewTable from '../components/ReportPreviewTable';
import toast from 'react-hot-toast';
import { FileText, FileSpreadsheet, FileIcon, Search, RefreshCw, BarChart2, Clock, Bookmark, BookmarkPlus, Folder, Settings2, Play } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'vendors', label: 'Vendor Report', icon: 'Users' },
  { id: 'purchaseRequests', label: 'Purchase Request Report', icon: 'FileText' },
  { id: 'rfqs', label: 'RFQ Report', icon: 'FileSearch' },
  { id: 'quotations', label: 'Quotation Report', icon: 'ClipboardCheck' },
  { id: 'auditLogs', label: 'Audit Log Report', icon: 'Settings2' }
];

const Reports = () => {
  // State for active report definition
  const [selectedType, setSelectedType] = useState('vendors');
  const [filters, setFilters] = useState({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  
  // State for loaded saved report
  const [activeSavedReportId, setActiveSavedReportId] = useState(null);

  // State for preview data
  const [preview, setPreview] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Saved reports data
  const [savedReports, setSavedReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Modals / Toggles
  const [showColumnSelect, setShowColumnSelect] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', folder: 'Personal', description: '' });

  const fetchPreview = async (type, currentFilters, cols) => {
    setLoading(true);
    try {
      const data = await reportApi.getPreview(type, currentFilters, cols);
      setPreview(data);
      // Initialize selected columns if empty and we just loaded
      if (cols.length === 0 && data.columns) {
        setSelectedColumns(data.columns.map(c => c.key));
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('Failed to load report preview');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedData = async () => {
    try {
      const [reports, recent] = await Promise.all([
        savedReportApi.getAll(),
        savedReportApi.getRecentActivity()
      ]);
      setSavedReports(reports);
      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to load saved reports', error);
    }
  };

  useEffect(() => {
    fetchSavedData();
    fetchPreview(selectedType, filters, selectedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (value) {
      setFilters(prev => ({ ...prev, [name]: value }));
    } else {
      const newFilters = { ...filters };
      delete newFilters[name];
      setFilters(newFilters);
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setActiveSavedReportId(null); // Unlink if they modify filters manually
    fetchPreview(selectedType, filters, selectedColumns);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setFilters({});
    setSelectedColumns([]);
    setActiveSavedReportId(null);
    fetchPreview(type, {}, []);
  };

  const loadSavedReport = async (report) => {
    setSelectedType(report.type || report.reportType);
    setFilters(report.filters || {});
    setSelectedColumns(report.columns || []);
    setActiveSavedReportId(report._id);
    await fetchPreview(report.type || report.reportType, report.filters || {}, report.columns || []);
    if (report._id) {
      await savedReportApi.markAsRun(report._id);
      fetchSavedData(); // Refresh recent activity
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
    try {
      await reportApi.exportReport(selectedType, format, filters, selectedColumns);
      toast.success('Report downloaded successfully', { id: loadingToast });
      if (activeSavedReportId) {
        await savedReportApi.markAsRun(activeSavedReportId);
      }
      fetchSavedData(); // Refresh recent activity to show export job
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to download report', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  const saveReport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...saveForm,
        type: selectedType,
        filters,
        columns: selectedColumns
      };
      await savedReportApi.create(payload);
      toast.success('Report saved successfully');
      setShowSaveModal(false);
      setSaveForm({ name: '', folder: 'Personal', description: '' });
      fetchSavedData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save report');
    }
  };

  const toggleColumn = (key) => {
    setSelectedColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Group saved reports by folder
  const groupedReports = savedReports.reduce((acc, report) => {
    const folder = report.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(report);
    return acc;
  }, {});

  const favorites = savedReports.filter(r => r.isFavorite);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
      {/* LEFT SIDEBAR - Saved & Recent */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-indigo-600" /> Favorites
          </h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No favorite reports.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map(report => (
                <li key={report._id}>
                  <button onClick={() => loadSavedReport(report)} className="text-sm text-gray-700 hover:text-indigo-600 flex items-center gap-2 w-full text-left truncate">
                    <Play className="h-3 w-3 flex-shrink-0" /> {report.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" /> Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map(item => (
                <li key={item._id}>
                  <button onClick={() => loadSavedReport(item)} className="text-sm text-gray-700 hover:text-indigo-600 flex items-center gap-2 w-full text-left truncate">
                    <RefreshCw className="h-3 w-3 flex-shrink-0" /> {item.name || `${item.reportType} (${item.format})`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Folder className="h-5 w-5 text-indigo-600" /> Saved Folders
          </h2>
          {Object.keys(groupedReports).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No saved reports.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedReports).map(([folder, reports]) => (
                <div key={folder}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{folder}</h3>
                  <ul className="space-y-2 pl-2 border-l-2 border-gray-100">
                    {reports.map(report => (
                      <li key={report._id}>
                        <button onClick={() => loadSavedReport(report)} className="text-sm text-gray-700 hover:text-indigo-600 flex items-center w-full text-left truncate">
                          {report.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Report Generator</h1>
            <p className="text-sm text-gray-500">Configure and export enterprise data.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full md:w-56 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-gray-50"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowSaveModal(true)}
              className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1 text-sm font-medium"
              title="Save as Template"
            >
              <BookmarkPlus className="h-4 w-4" /> Save
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select name="status" value={filters.status || ''} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            {(selectedType === 'vendors' || selectedType === 'purchaseRequests') && (
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Category / Dept</label>
                <input type="text" name={selectedType === 'vendors' ? 'category' : 'department'} placeholder="..." value={filters.category || filters.department || ''} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
            )}

            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
            </div>

            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Apply
            </button>
            
            <div className="ml-auto relative">
              <button 
                type="button" 
                onClick={() => setShowColumnSelect(!showColumnSelect)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings2 className="h-4 w-4" /> Columns
              </button>
              
              {showColumnSelect && preview?.columns && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase">Select Columns</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {preview.columns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
                        <input 
                          type="checkbox" 
                          checked={selectedColumns.includes(col.key)} 
                          onChange={() => toggleColumn(col.key)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {col.header}
                      </label>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setShowColumnSelect(false); fetchPreview(selectedType, filters, selectedColumns); }}
                    className="mt-4 w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-md"
                  >
                    Apply Columns
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Metadata & Summary */}
        {preview && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Execution Metadata
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div><span className="text-gray-500">Generated By:</span> <span className="font-medium text-gray-900">{preview.metadata.generatedBy}</span></div>
                <div><span className="text-gray-500">Execution Time:</span> <span className="font-medium text-gray-900">{preview.metadata.executionTimeMs} ms</span></div>
                <div><span className="text-gray-500">Total Records:</span> <span className="font-medium text-gray-900">{preview.metadata.totalRecords}</span></div>
                <div><span className="text-gray-500">Timezone:</span> <span className="font-medium text-gray-900 truncate" title={preview.metadata.timezone}>{preview.metadata.timezone}</span></div>
                <div className="col-span-2 text-xs text-gray-400 mt-1">Generated At: {new Date(preview.metadata.generatedAt).toLocaleString()}</div>
              </div>
            </div>

            {preview.summary && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Summary Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-sm">
                  {Object.entries(preview.summary).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-gray-500 text-xs">{key}</span> 
                      <span className="font-medium text-gray-900 text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table Area */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => handleExport('csv')} disabled={exporting || loading || !preview?.data?.length} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <FileText className="h-3.5 w-3.5 text-blue-500" /> CSV
              </button>
              <button onClick={() => handleExport('excel')} disabled={exporting || loading || !preview?.data?.length} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} disabled={exporting || loading || !preview?.data?.length} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <FileIcon className="h-3.5 w-3.5 text-red-500" /> PDF
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="h-full flex justify-center items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <ReportPreviewTable columns={preview?.columns} data={preview?.data} />
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save Report Template</h2>
            <form onSubmit={saveReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name *</label>
                <input required type="text" value={saveForm.name} onChange={e => setSaveForm({...saveForm, name: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" placeholder="e.g. Monthly IT Spend" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
                <input type="text" value={saveForm.folder} onChange={e => setSaveForm({...saveForm, folder: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" placeholder="e.g. Finance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea value={saveForm.description} onChange={e => setSaveForm({...saveForm, description: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" rows="2" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowSaveModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
