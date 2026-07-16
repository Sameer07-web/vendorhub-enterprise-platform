import { loadData, saveData, delay } from '../utils/storage';
import { mockQuotes } from '../data/mockQuotes';

const QUOTES_KEY = 'vendorhub_quotes';

const getStoredQuotes = () => loadData(QUOTES_KEY, mockQuotes);

export const getQuotesByRFQ = async (rfqId) => {
  await delay();
  const quotes = getStoredQuotes();
  const filtered = quotes.filter(q => q.rfqId === rfqId);
  return { success: true, data: filtered };
};

export const generateMockQuotes = async (rfqId, vendorIds, vendors) => {
  await delay(1500); // simulate some heavy processing
  const quotes = getStoredQuotes();
  
  const newQuotes = vendorIds.map(vId => {
    const vendor = vendors.find(v => v._id === vId) || { companyName: 'Unknown Vendor' };
    const randomPriceMultiplier = 0.85 + (Math.random() * 0.3); // ±15% variation
    
    // We ideally want to use the RFQ line items, but for the mock we'll just generate generic ones if not passed
    // Or we assume a base total price around $45,000 for Demo purposes
    const baseTotal = 45000; 
    const quoteTotal = Math.round(baseTotal * randomPriceMultiplier);
    
    const deliveryDays = [3, 5, 7, 10, 14, 21][Math.floor(Math.random() * 6)];
    const terms = ['Net 15', 'Net 30', 'Net 45', 'Net 60'][Math.floor(Math.random() * 4)];
    
    return {
      _id: `q-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId,
      vendorId: vId,
      vendorName: vendor.companyName,
      quoteNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      submissionDate: new Date().toISOString(),
      items: [
        { id: 'li-1', unitPrice: Math.round(quoteTotal * 0.7), total: Math.round(quoteTotal * 0.7), notes: 'Main item' },
        { id: 'li-2', unitPrice: Math.round(quoteTotal * 0.3), total: Math.round(quoteTotal * 0.3), notes: 'Secondary item' }
      ],
      totalPrice: quoteTotal,
      currency: 'USD',
      deliveryTime: `${deliveryDays} days`,
      paymentTerms: terms,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Automated mock quote generated for ${vendor.companyName}.`,
      status: 'Submitted'
    };
  });
  
  const updatedQuotes = [...newQuotes, ...quotes];
  saveData(QUOTES_KEY, updatedQuotes);
  
  return { success: true, data: newQuotes };
};
