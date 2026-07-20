import axiosInstance from './axios';

export const getQuotations = async (params = {}) => {
  const response = await axiosInstance.get('/quotations', { params });
  return response.data;
};

export const getQuotationById = async (id) => {
  const response = await axiosInstance.get(`/quotations/${id}`);
  return response.data;
};

export const createQuotation = async (data) => {
  const response = await axiosInstance.post('/quotations', data);
  return response.data;
};

export const updateQuotation = async (id, data) => {
  const response = await axiosInstance.patch(`/quotations/${id}`, data);
  return response.data;
};

export const reviewQuotation = async (id, data) => {
  const response = await axiosInstance.patch(`/quotations/${id}/review`, data);
  return response.data;
};

export const selectWinner = async (id) => {
  const response = await axiosInstance.patch(`/quotations/${id}/select-winner`);
  return response.data;
};

export const deleteQuotation = async (id) => {
  const response = await axiosInstance.delete(`/quotations/${id}`);
  return response.data;
};

/**
 * Get quotations for a specific RFQ — used by QuoteComparison page
 */
export const getQuotesByRFQ = async (rfqId) => {
  const response = await axiosInstance.get('/quotations', { params: { rfq: rfqId } });
  const quotesList = response.data?.data?.quotations || [];
  
  const mappedQuotes = quotesList.map(q => ({
    ...q,
    totalPrice: q.totalAmount,
    vendorName: q.vendorSnapshot?.companyName || 'Unknown Vendor',
    vendorId: q.vendor?._id || q.vendor,
    deliveryTime: q.deliveryDays ? `${q.deliveryDays} days` : '—',
  }));

  return { success: true, data: mappedQuotes };
};
