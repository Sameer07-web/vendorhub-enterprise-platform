process.env.JWT_SECRET = "test_secret_key_12345";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");

let mongoServer;
let adminToken = "";
let employeeToken = "";
let managerToken = "";

let testVendorId = "";
let testPrId = "";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);

  // Register Admin
  const adminRes = await request(app).post("/api/v1/auth/register").send({
    fullName: "Admin User",
    email: "admin@test.com",
    password: "Password123!",
    department: "IT"
  });
  
  // Register Employee
  const empRes = await request(app).post("/api/v1/auth/register").send({
    fullName: "Employee User",
    email: "emp@test.com",
    password: "Password123!",
    department: "Sales"
  });

  // Since registration defaults to Employee, we need to directly mock database to set Admin/Manager roles for tests
  await mongoose.connection.collection("users").updateOne(
    { email: "admin@test.com" },
    { $set: { role: "Admin" } }
  );

  // Authenticate Admin
  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: "admin@test.com",
    password: "Password123!"
  });
  adminToken = loginRes.body.data.token;

  // Authenticate Employee
  const empLoginRes = await request(app).post("/api/v1/auth/login").send({
    email: "emp@test.com",
    password: "Password123!"
  });
  employeeToken = empLoginRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Procurement Integration Workflows", () => {
  
  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("UP");
      expect(res.body.data.database).toBe("Connected");
    });
  });

  describe("Vendor CRUD & Roles", () => {
    it("should block Employee from creating vendors", async () => {
      const res = await request(app)
        .post("/api/v1/vendors")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({ 
          companyName: "Test", 
          contactPerson: "TP", 
          email: "v@test.com", 
          phone: "1234567890", 
          gstNumber: "GST123" 
        });
      
      expect(res.status).toBe(403);
    });

    it("should allow Admin to create vendors", async () => {
      const res = await request(app)
        .post("/api/v1/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          companyName: "Integration Test Vendor",
          email: "integration@vendor.com",
          contactPerson: "Test Person",
          phone: "9876543210",
          gstNumber: "GST-INT-100",
          address: "123 Test St",
          vendorCategory: "IT"
        });
      
      if(res.status !== 201) console.error("VENDOR CREATE ERROR:", res.body);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("_id");
      testVendorId = res.body.data._id;
    });

    it("should retrieve vendor list", async () => {
      const res = await request(app)
        .get("/api/v1/vendors")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Purchase Request Flow", () => {
    it("should allow Employee to create PR", async () => {
      const res = await request(app)
        .post("/api/v1/purchase-requests")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          title: "Test PR",
          description: "Testing flow",
          department: "IT",
          category: "IT",
          priority: "HIGH",
          vendor: testVendorId,
          quantity: 2,
          estimatedCost: 1000,
          requiredDate: new Date(Date.now() + 86400000 * 2).toISOString()
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("DRAFT");
      testPrId = res.body.data._id;
    });

    it("should allow Employee to submit PR for approval", async () => {
      const res = await request(app)
        .patch(`/api/v1/purchase-requests/${testPrId}/submit`)
        .set("Authorization", `Bearer ${employeeToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("PENDING_APPROVAL");
    });
  });
});
