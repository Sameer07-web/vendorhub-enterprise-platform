const request = require("supertest");
const app = require("../../src/app");
const Organization = require("../../src/models/Organization");
const User = require("../../src/models/User");
const RFQ = require("../../src/models/RFQ");
const PurchaseRequest = require("../../src/models/PurchaseRequest");
const Vendor = require("../../src/models/Vendor");
const Quotation = require("../../src/models/Quotation");
const Notification = require("../../src/models/Notification");
const DashboardPreference = require("../../src/models/DashboardPreference");
const WorkflowRule = require("../../src/models/WorkflowRule");
const AuditLog = require("../../src/models/AuditLog");
const AIDraft = require("../../src/models/AIDraft");
const AIConversation = require("../../src/models/AIConversation");
const AIDocumentExtraction = require("../../src/models/AIDocumentExtraction");
const AutomationRule = require("../../src/models/AutomationRule");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

describe("Batch 3, 4, 5 & 6 Cross-Tenant Isolation Tests", () => {
  let mongoServer;
  let orgA, orgB;
  let userA, userB;
  let tokenA, tokenB;
  let prA;
  let vendorA, vendorB;
  let rfqA;
  let notificationA;
  let workflowRuleA;
  let draftA;
  let conversationA;
  let documentExtractionA;
  let automationRuleA;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Disconnect existing mongoose connection to avoid conflict
    await mongoose.disconnect();
    await mongoose.connect(uri);

    // Create Org A & Org B
    orgA = await Organization.create({
      name: "Tenant Isolation Org A",
      slug: "org-a-" + Date.now(),
      status: "ACTIVE",
      tenantVersion: 1
    });

    orgB = await Organization.create({
      name: "Tenant Isolation Org B",
      slug: "org-b-" + Date.now(),
      status: "ACTIVE",
      tenantVersion: 1
    });

    // Create User A & User B
    userA = await User.create({
      organization: orgA._id,
      fullName: "User A",
      email: `usera-${Date.now()}@orga.com`,
      password: "Password123!",
      role: "Admin",
      tenantVersion: 1
    });

    userB = await User.create({
      organization: orgB._id,
      fullName: "User B",
      email: `userb-${Date.now()}@orgb.com`,
      password: "Password123!",
      role: "Admin",
      tenantVersion: 1
    });

    tokenA = jwt.sign(
      { id: userA._id, email: userA.email, role: userA.role, organizationId: orgA._id, tenantVersion: 1 },
      process.env.JWT_SECRET || "supersecretjwtkey_vendorhub_enterprise_2026",
      { expiresIn: "1h" }
    );

    tokenB = jwt.sign(
      { id: userB._id, email: userB.email, role: userB.role, organizationId: orgB._id, tenantVersion: 1 },
      process.env.JWT_SECRET || "supersecretjwtkey_vendorhub_enterprise_2026",
      { expiresIn: "1h" }
    );

    // Create Vendor A & Vendor B with all required properties
    vendorA = await Vendor.create({
      organization: orgA._id,
      vendorCode: "V-ORGA-" + Date.now(),
      companyName: "Vendor A",
      contactPerson: "Alice",
      email: `vendora-${Date.now()}@orga.com`,
      phone: "1234567890",
      gstNumber: "GST-ORGA-100",
      status: "Active",
      createdBy: userA._id
    });

    vendorB = await Vendor.create({
      organization: orgB._id,
      vendorCode: "V-ORGB-" + Date.now(),
      companyName: "Vendor B",
      contactPerson: "Bob",
      email: `vendorb-${Date.now()}@orgb.com`,
      phone: "9876543210",
      gstNumber: "GST-ORGB-100",
      status: "Active",
      createdBy: userB._id
    });

    // Create PR for Org A
    prA = await PurchaseRequest.create({
      organization: orgA._id,
      requestNumber: "PR-ORGA-100",
      title: "Org A Laptops",
      description: "Laptops description",
      department: "IT",
      category: "IT",
      priority: "HIGH",
      status: "APPROVED",
      requester: userA._id,
      vendor: vendorA._id,
      quantity: 1,
      estimatedCost: 1000,
      requiredDate: new Date(Date.now() + 86400000),
      createdBy: userA._id,
      items: [{ itemDescription: "Laptop", quantity: 1, estimatedUnitPrice: 1000 }]
    });

    // Create RFQ for Org A
    rfqA = await RFQ.create({
      organization: orgA._id,
      rfqNumber: "RFQ-ORGA-100",
      purchaseRequest: prA._id,
      purchaseRequestSnapshot: {
        requestNumber: prA.requestNumber,
        title: prA.title,
        department: prA.department,
        priority: prA.priority
      },
      title: "Laptops Procurement",
      vendors: [vendorA._id],
      status: "SENT",
      quotationDeadline: new Date(Date.now() + 86400000),
      createdBy: userA._id
    });

    // Create Notification for Org A
    notificationA = await Notification.create({
      organization: orgA._id,
      recipient: userA._id,
      type: "SYSTEM",
      title: "Org A Alert",
      message: "Secret alert for Org A",
      priority: "HIGH"
    });

    // Create WorkflowRule for Org A
    workflowRuleA = await WorkflowRule.create({
      organization: orgA._id,
      name: "Org A Approval Rule " + Date.now(),
      entityType: "PurchaseRequest",
      levels: [{ sequence: 10, approverRole: "manager" }]
    });

    // Create AuditLog for Org A
    await AuditLog.create({
      organization: orgA._id,
      user: userA._id,
      action: "CREATE_PR",
      entityType: "PurchaseRequest",
      entityId: prA._id
    });

    // Create AI Draft for Org A
    draftA = await AIDraft.create({
      organization: orgA._id,
      user: userA._id,
      entityType: "PurchaseRequest",
      draftJson: { title: "Draft PR Org A" },
      status: "PENDING",
      expiresAt: new Date(Date.now() + 86400000)
    });

    // Create AI Conversation for Org A
    conversationA = await AIConversation.create({
      organization: orgA._id,
      user: userA._id,
      prompt: "Show me Org A vendors",
      response: "Here is vendor A",
      model: "gemini-2.5-flash",
      success: true
    });

    // Create Document Extraction for Org A
    documentExtractionA = await AIDocumentExtraction.create({
      organization: orgA._id,
      documentType: "Quotation",
      filename: "quotation_orga.pdf",
      mimeType: "application/pdf",
      model: "gemini-2.5-flash",
      extractionLatencyMs: 120,
      overallConfidence: 95,
      extractedFields: { vendorName: "Vendor A" },
      extractedBy: userA._id
    });

    // Create Automation Rule for Org A
    automationRuleA = await AutomationRule.create({
      organization: orgA._id,
      name: "Org A Auto Approve Rule",
      trigger: "PR_CREATED",
      actions: [{ type: "AUTO_APPROVE" }],
      isActive: true
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("1. Organization B GET Org A RFQ -> Returns 404", async () => {
    const res = await request(app)
      .get(`/api/v1/rfqs/${rfqA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(404);
  });

  test("2. Organization B attempts to create RFQ referencing Org A Vendor -> Returns 400", async () => {
    const prB = await PurchaseRequest.create({
      organization: orgB._id,
      requestNumber: "PR-ORGB-100",
      title: "Org B PR",
      description: "Paper description",
      department: "Finance",
      category: "IT",
      priority: "MEDIUM",
      status: "APPROVED",
      requester: userB._id,
      vendor: vendorB._id,
      quantity: 10,
      estimatedCost: 50,
      requiredDate: new Date(Date.now() + 86400000),
      createdBy: userB._id,
      items: [{ itemDescription: "Paper", quantity: 10, estimatedUnitPrice: 5 }]
    });

    const res = await request(app)
      .post("/api/v1/rfqs")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        purchaseRequest: prB._id,
        title: "Cross Tenant RFQ Attempt",
        vendors: [vendorA._id],
        quotationDeadline: new Date(Date.now() + 86400000)
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/belong to another organization|do not exist/i);

    await PurchaseRequest.deleteOne({ _id: prB._id });
  });

  test("3. Organization B attempts to submit Quotation for Org A RFQ -> Returns 404", async () => {
    const res = await request(app)
      .post("/api/v1/quotations")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        rfq: rfqA._id,
        vendor: vendorB._id,
        subtotal: 500
      });

    expect(res.statusCode).toBe(404);
  });

  test("4. Organization B GET Notifications -> Cannot read Org A notification", async () => {
    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    const notifications = res.body.data?.notifications || res.body.notifications || [];
    const hasOrgANotification = notifications.some(n => n._id.toString() === notificationA._id.toString());
    expect(hasOrgANotification).toBe(false);
  });

  test("5. Organization B GET Analytics -> Receives 0 spend for Org A transactions", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/kpis?range=30d")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    const kpis = res.body.data || res.body;
    expect(kpis.totalSpend.value).toBe(0);
  });

  test("6. Organization B GET Org A AI Draft -> Returns 404", async () => {
    const res = await request(app)
      .get(`/api/v1/ai/drafts/${draftA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(404);
  });

  test("7. Organization B GET Org A AI Conversation -> Returns 404", async () => {
    const res = await request(app)
      .get(`/api/v1/ai/conversations/${conversationA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(404);
  });

  test("8. Organization B GET Global Search -> Returns 0 Org A search results", async () => {
    const res = await request(app)
      .get(`/api/v1/search?q=Laptops`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    const results = res.body.data || res.body;
    expect(results.rfqs.length).toBe(0);
  });
});
