import React, { useState, useEffect, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { getAnalyticsOverview } from '../../../api/analytics.api';
import { dashboardApi } from '../../../api/dashboard.api';
import { getCurrentUser } from '../../../utils/auth';
import { WidgetRegistry } from '../components/WidgetRegistry';
import toast from 'react-hot-toast';
import { Settings, Save, X, Plus, Download, LayoutDashboard, LayoutTemplate, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DashboardHeader from '../components/DashboardHeader';

const ResponsiveGridLayout = WidthProvider(Responsive);

const PREDEFINED_TEMPLATES = {
  Executive: {
    lg: [
      { i: 'totalSpend', x: 0, y: 0, w: 3, h: 4 },
      { i: 'vendors', x: 3, y: 0, w: 3, h: 4 },
      { i: 'purchaseRequests', x: 6, y: 0, w: 3, h: 4 },
      { i: 'totalRfqs', x: 9, y: 0, w: 3, h: 4 },
      { i: 'executiveSummary', x: 0, y: 4, w: 12, h: 4 },
      { i: 'spendTrend', x: 0, y: 8, w: 6, h: 10 },
      { i: 'departmentSpend', x: 6, y: 8, w: 6, h: 10 },
      { i: 'vendorDistribution', x: 0, y: 18, w: 6, h: 10 },
      { i: 'procurementStatus', x: 6, y: 18, w: 6, h: 10 }
    ]
  },
  Finance: {
    lg: [
      { i: 'totalSpend', x: 0, y: 0, w: 4, h: 4 },
      { i: 'vendors', x: 4, y: 0, w: 4, h: 4 },
      { i: 'executiveSummary', x: 8, y: 0, w: 4, h: 14 },
      { i: 'spendTrend', x: 0, y: 4, w: 8, h: 10 },
      { i: 'departmentSpend', x: 0, y: 14, w: 12, h: 10 }
    ]
  },
  Procurement: {
    lg: [
      { i: 'purchaseRequests', x: 0, y: 0, w: 6, h: 4 },
      { i: 'totalRfqs', x: 6, y: 0, w: 6, h: 4 },
      { i: 'procurementStatus', x: 0, y: 4, w: 6, h: 10 },
      { i: 'vendorDistribution', x: 6, y: 4, w: 6, h: 10 },
      { i: 'executiveSummary', x: 0, y: 14, w: 12, h: 4 }
    ]
  }
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const dashboardRef = useRef(null);

  // Preferences State
  const [prefs, setPrefs] = useState(null);
  const [layouts, setLayouts] = useState({ lg: [] });
  const [activeWidgets, setActiveWidgets] = useState([]);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  // Local volatile state during edit (for save/cancel)
  const [editLayouts, setEditLayouts] = useState({});
  const [editWidgets, setEditWidgets] = useState([]);
  const [editDensity, setEditDensity] = useState('spacious');

  const fetchDataAndPrefs = async () => {
    try {
      setLoading(true);
      // Fetch concurrently
      const [analyticsRes, prefsRes] = await Promise.all([
        getAnalyticsOverview('30d'), // Can be driven by prefs.defaultRange
        dashboardApi.getPreferences()
      ]);
      
      if (analyticsRes.success) setData(analyticsRes.data);
      if (prefsRes) {
        setPrefs(prefsRes);
        setLayouts(prefsRes.layouts || { lg: [] });
        setActiveWidgets(prefsRes.widgets || []);
        setEditDensity(prefsRes.density || 'spacious');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndPrefs();
  }, []);

  const startEdit = () => {
    setEditLayouts(JSON.parse(JSON.stringify(layouts)));
    setEditWidgets([...activeWidgets]);
    setEditDensity(prefs?.density || 'spacious');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowAddWidget(false);
  };

  const saveEdit = async () => {
    const toastId = toast.loading('Saving preferences...');
    try {
      const payload = {
        layouts: editLayouts,
        widgets: editWidgets,
        density: editDensity,
        template: 'Custom'
      };
      const updatedPrefs = await dashboardApi.updatePreferences(payload);
      setPrefs(updatedPrefs);
      setLayouts(updatedPrefs.layouts);
      setActiveWidgets(updatedPrefs.widgets);
      setIsEditing(false);
      setShowAddWidget(false);
      toast.success('Dashboard saved', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save', { id: toastId });
    }
  };

  const applyTemplate = (templateName) => {
    if (!PREDEFINED_TEMPLATES[templateName]) return;
    const tpl = PREDEFINED_TEMPLATES[templateName];
    setEditLayouts({ lg: [...tpl.lg] });
    setEditWidgets(tpl.lg.map(i => i.i));
  };

  const removeWidget = (id) => {
    setEditWidgets(prev => prev.filter(w => w !== id));
    // Clean up layouts across all breakpoints
    const newLayouts = { ...editLayouts };
    Object.keys(newLayouts).forEach(bp => {
      newLayouts[bp] = newLayouts[bp].filter(l => l.i !== id);
    });
    setEditLayouts(newLayouts);
  };

  const addWidget = (id) => {
    if (editWidgets.includes(id)) return;
    const widgetDef = WidgetRegistry[id];
    setEditWidgets(prev => [...prev, id]);
    
    // Add to lg layout at the bottom
    const lgLayout = editLayouts.lg || [];
    const maxY = lgLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    
    const newItem = {
      i: id,
      x: 0, 
      y: maxY, 
      w: widgetDef.defaultW, 
      h: widgetDef.defaultH
    };
    
    setEditLayouts(prev => ({
      ...prev,
      lg: [...(prev.lg || []), newItem]
    }));
  };

  const handleLayoutChange = (currentLayout, allLayouts) => {
    setEditLayouts(allLayouts);
  };

  const handleExport = async (format) => {
    if (!dashboardRef.current) return;
    const toastId = toast.loading(`Generating ${format.toUpperCase()}...`);
    try {
      const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#f9fafb', scale: 1.5 });
      const imgData = canvas.toDataURL('image/png');
      
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Executive_Dashboard.png`;
        link.click();
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        
        let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(`Executive_Dashboard.pdf`);
      }
      toast.success('Export successful', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-surface-500">
        Loading Executive Workspace...
      </div>
    );
  }

  // Derive which state to use
  const currentLayouts = isEditing ? editLayouts : layouts;
  const currentWidgets = isEditing ? editWidgets : activeWidgets;
  const currentDensity = isEditing ? editDensity : (prefs?.density || 'spacious');

  const rowHeight = currentDensity === 'compact' ? 20 : 30;
  const margin = currentDensity === 'compact' ? [10, 10] : [20, 20];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardHeader greeting="Executive Workspace" userName={user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'} />
        
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              <button onClick={() => handleExport('png')} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                <Download size={16} /> PNG
              </button>
              <button onClick={() => handleExport('pdf')} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                <Download size={16} /> PDF
              </button>
              <button onClick={startEdit} className="px-3 py-2 text-sm bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 flex items-center gap-1 shadow-sm">
                <Settings size={16} /> Customize Layout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowAddWidget(true)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-indigo-600 font-medium hover:bg-indigo-50 flex items-center gap-1">
                <Plus size={16} /> Add Widget
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button onClick={cancelEdit} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-3 py-2 text-sm bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 flex items-center gap-1 shadow-sm">
                <Save size={16} /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Toolbar */}
      {isEditing && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200 flex flex-wrap gap-6 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Density</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input type="radio" name="density" checked={editDensity === 'compact'} onChange={() => setEditDensity('compact')} className="text-indigo-600 focus:ring-indigo-500" />
                Compact
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input type="radio" name="density" checked={editDensity === 'spacious'} onChange={() => setEditDensity('spacious')} className="text-indigo-600 focus:ring-indigo-500" />
                Spacious
              </label>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Apply Template</label>
            <div className="flex gap-2">
              {Object.keys(PREDEFINED_TEMPLATES).map(tpl => (
                <button key={tpl} onClick={() => applyTemplate(tpl)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1">
                  <LayoutTemplate size={12} /> {tpl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Widget Drawer/Modal */}
      {isEditing && showAddWidget && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[100] border-l border-gray-200 flex flex-col transform transition-transform">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><LayoutDashboard size={18} /> Widget Library</h3>
            <button onClick={() => setShowAddWidget(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {Object.values(WidgetRegistry).map(widget => {
              const isAdded = editWidgets.includes(widget.id);
              return (
                <div key={widget.id} className="border border-gray-200 p-3 rounded-lg flex justify-between items-center bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="text-sm font-medium text-gray-800">{widget.title}</div>
                  <button 
                    disabled={isAdded}
                    onClick={() => addWidget(widget.id)}
                    className={`p-1.5 rounded-md ${isAdded ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    {isAdded ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div ref={dashboardRef} className="min-h-[500px] bg-transparent">
        {currentWidgets.length === 0 && !isEditing && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
            <LayoutDashboard size={48} className="mb-4 text-gray-300" />
            <p className="mb-2">Your dashboard is empty.</p>
            <button onClick={startEdit} className="text-indigo-600 font-medium hover:underline">Customize Layout</button>
          </div>
        )}
        
        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={rowHeight}
          margin={margin}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          compactType="vertical"
        >
          {currentWidgets.map(widgetId => {
            const widgetDef = WidgetRegistry[widgetId];
            if (!widgetDef) return null;
            const Component = widgetDef.component;
            return (
              <div key={widgetId} data-grid={{ w: widgetDef.defaultW, h: widgetDef.defaultH, minW: widgetDef.minW, minH: widgetDef.minH }} className={`relative group ${isEditing ? 'border-2 border-indigo-400 rounded-xl overflow-hidden cursor-move' : ''}`}>
                <div className="h-full w-full pointer-events-auto">
                  {/* Overlay for editing to prevent interacting with charts instead of dragging */}
                  {isEditing && <div className="absolute inset-0 z-10 bg-indigo-50/10" />}
                  
                  {isEditing && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeWidget(widgetId); }} 
                      className="absolute top-2 right-2 z-20 p-1.5 bg-red-100 text-red-600 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Widget"
                    >
                      <X size={14} />
                    </button>
                  )}
                  
                  <Component data={data} />
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
      
    </div>
  );
};

export default Dashboard;
