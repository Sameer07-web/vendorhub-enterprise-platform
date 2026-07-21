const QuotationExtractionSchema = {
  type: "object",
  properties: {
    vendorCode: { type: "object", properties: { value: { type: "string" }, confidence: { type: "number" } } },
    companyName: { type: "object", properties: { value: { type: "string" }, confidence: { type: "number" } } },
    subtotal: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    taxAmount: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    shippingCost: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    discount: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    totalAmount: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    currency: { type: "object", properties: { value: { type: "string" }, confidence: { type: "number" } } },
    deliveryDays: { type: "object", properties: { value: { type: "number" }, confidence: { type: "number" } } },
    paymentTerms: { type: "object", properties: { value: { type: "string" }, confidence: { type: "number" } } },
    validUntil: { type: "object", properties: { value: { type: "string" }, confidence: { type: "number" } } },
    overallConfidence: { type: "number" },
    warnings: { type: "array", items: { type: "string" } }
  },
  required: ["companyName", "subtotal", "totalAmount", "overallConfidence"]
};

module.exports = {
  QuotationExtractionSchema
};
