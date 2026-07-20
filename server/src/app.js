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

// ── API Routes ──────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/purchase-requests", purchaseRequestRoutes);
app.use("/api/v1/rfqs", rfqRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/saved-reports", savedReportRoutes);
app.use("/api/v1/dashboard/preferences", dashboardPreferenceRoutes);
app.use("/api/v1/queues", queueRoutes);

// ── Health Check ────────────────────────────────────────────────────
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);

// ── Error Handling ──────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;