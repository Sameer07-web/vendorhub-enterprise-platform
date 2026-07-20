import React, { useState, useRef } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/common/Card';
import { Maximize2, Download, Printer, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const ChartCard = ({ title, children, action }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef(null);

  const handleExportPNG = async () => {
    if (!contentRef.current) return;
    const toastId = toast.loading('Generating PNG...');
    try {
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${title.replace(/\s+/g, '_')}_export.png`;
      link.click();
      toast.success('Downloaded PNG successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export PNG', { id: toastId });
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}_export.pdf`);
      toast.success('Downloaded PDF successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export PDF', { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = (isModal = false) => (
    <div ref={isModal ? contentRef : null} className="w-full h-full flex flex-col p-4 bg-white">
      {isModal && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
      <div className="flex-1 min-h-[300px]">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardHeader 
          title={title} 
          action={
            <div className="flex items-center gap-2">
              {action}
              <button 
                onClick={() => setIsFullscreen(true)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
                title="Full Screen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          } 
        />
        <CardBody className="p-2 sm:p-5 flex-1 flex flex-col min-h-0">
          {children}
        </CardBody>
      </Card>

      {/* Full Screen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md" title="Print"><Printer size={18} /></button>
                <button onClick={handleExportPNG} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center gap-1" title="Export PNG">
                  <Download size={16} /> PNG
                </button>
                <button onClick={handleExportPDF} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center gap-1" title="Export PDF">
                  <Download size={16} /> PDF
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button onClick={() => setIsFullscreen(false)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full max-h-[800px]">
                {renderContent(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartCard;
