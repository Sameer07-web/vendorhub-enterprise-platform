const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const errorMiddleware = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const purchaseRequestRoutes = require("./routes/purchaseRequest.routes");
const rfqRoutes = require("./routes/rfq.routes");
const quotationRoutes = require("./routes/quotation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const searchRoutes = require("./routes/search.routes");
const userRoutes = require("./routes/user.routes");
const healthRoutes = require("./routes/health.routes");
const notificationRoutes = require("./routes/notification.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const reportRoutes = require("./routes/report.routes");
const savedReportRoutes = require("./routes/savedReport.routes");
const dashboardPreferenceRoutes = require("./routes/dashboardPreference.routes");
const queueRoutes = require("./routes/queue.routes");
const workflowRoutes = require("./routes/workflow.routes");
const automationRoutes = require("./routes/automation.routes");
const workflowRuleRoutes = require("./routes/workflowRule.routes");
const aiRoutes = require("./routes/ai.routes");
const insightRoutes = require("./routes/insight.routes");
const documentRoutes = require("./routes/document.routes");
const app = express();

// ── Observability & Logging ──────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rate Limiting (auth endpoints) ──────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const { protect } = require("./middleware/auth.middleware");
const { tenantMiddleware } = require("./middleware/tenant.middleware");

// ── API Routes ──────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRoutes);

const organizationRoutes = require("./routes/organization.routes");
const roleRoutes = require("./routes/role.routes");
const policyRoutes = require("./routes/policy.routes");

// Public invitation acceptance bypasses auth protection
app.post("/api/v1/organizations/invitations/accept", organizationRoutes);

// Apply auth protection and tenant resolution globally for downstream routes
app.use("/api/v1/organizations/roles", protect, tenantMiddleware, roleRoutes);
app.use("/api/v1/organizations/policies", protect, tenantMiddleware, policyRoutes);
app.use("/api/v1/organizations", protect, tenantMiddleware, organizationRoutes);
app.use("/api/v1/vendors", protect, tenantMiddleware, vendorRoutes);
app.use("/api/v1/purchase-requests", protect, tenantMiddleware, purchaseRequestRoutes);
app.use("/api/v1/rfqs", protect, tenantMiddleware, rfqRoutes);
app.use("/api/v1/quotations", protect, tenantMiddleware, quotationRoutes);
app.use("/api/v1/dashboard", protect, tenantMiddleware, dashboardRoutes);
app.use("/api/v1/search", protect, tenantMiddleware, searchRoutes);
app.use("/api/v1/users", protect, tenantMiddleware, userRoutes);
app.use("/api/v1/notifications", protect, tenantMiddleware, notificationRoutes);
app.use("/api/v1/analytics", protect, tenantMiddleware, analyticsRoutes);
app.use("/api/v1/reports", protect, tenantMiddleware, reportRoutes);
app.use("/api/v1/saved-reports", protect, tenantMiddleware, savedReportRoutes);
app.use("/api/v1/dashboard/preferences", protect, tenantMiddleware, dashboardPreferenceRoutes);
app.use("/api/v1/queues", protect, tenantMiddleware, queueRoutes);
app.use("/api/v1/workflows", protect, tenantMiddleware, workflowRoutes);
app.use("/api/v1/automation", protect, tenantMiddleware, automationRoutes);
app.use("/api/v1/workflow-rules", protect, tenantMiddleware, workflowRuleRoutes);
app.use("/api/v1/ai", protect, tenantMiddleware, aiRoutes);
app.use("/api/v1/ai/insights", protect, tenantMiddleware, insightRoutes);
app.use("/api/v1/ai/extract", protect, tenantMiddleware, documentRoutes);

// ── Health Check ────────────────────────────────────────────────────
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);

// ── Error Handling ──────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;