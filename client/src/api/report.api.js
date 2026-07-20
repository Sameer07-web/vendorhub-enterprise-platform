import api from './axios';

export const reportApi = {
  getPreview: async (type, filters = {}, columns = null) => {
    const queryObj = { ...filters };
    if (columns && columns.length > 0) {
      queryObj.columns = columns.join(',');
    }
    const params = new URLSearchParams(queryObj);
    const response = await api.get(`/reports/${type}?${params.toString()}`);
    return response.data.data;
  },
  
  exportReport: async (type, format, filters = {}, columns = null) => {
    const queryObj = { ...filters, format };
    if (columns && columns.length > 0) {
      queryObj.columns = columns.join(',');
    }
    const params = new URLSearchParams(queryObj);
    // Use blob response type to handle binary data download
    const response = await api.get(`/reports/${type}/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Attempt to extract filename from content-disposition header if available
    const disposition = response.headers['content-disposition'];
    let filename = `${type}_report.${format === 'excel' ? 'xlsx' : format}`;
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename="([^"]+)"/.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
