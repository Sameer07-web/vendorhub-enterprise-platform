export const mockQuotes = [
  // Quotes for RFQ-1001 (Developer Laptops)
  {
    _id: 'q-1001',
    rfqId: 'rfq-1001',
    vendorId: 'v-1001',
    vendorName: 'Acme Corp',
    quoteNumber: 'QT-2024-001',
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'li-1', unitPrice: 3800, total: 38000, notes: 'Available immediately' },
      { id: 'li-2', unitPrice: 2100, total: 10500, notes: 'Lead time 2 weeks' }
    ],
    totalPrice: 48500,
    currency: 'USD',
    deliveryTime: '2-3 weeks',
    paymentTerms: 'Net 30',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Price includes standard 3-year warranty on all devices.',
    status: 'Submitted' // Submitted, Accepted, Rejected
  },
  {
    _id: 'q-1002',
    rfqId: 'rfq-1001',
    vendorId: 'v-1002',
    vendorName: 'Global Hardware Solutions',
    quoteNumber: 'GHS-49281',
    submissionDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'li-1', unitPrice: 3950, total: 39500, notes: 'In stock' },
      { id: 'li-2', unitPrice: 2000, total: 10000, notes: 'In stock' }
    ],
    totalPrice: 49500,
    currency: 'USD',
    deliveryTime: '3-5 days',
    paymentTerms: 'Net 15',
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Can deliver extremely fast, but requires Net 15 terms.',
    status: 'Submitted'
  }
];
