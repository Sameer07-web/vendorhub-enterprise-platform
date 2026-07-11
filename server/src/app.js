const express = require("express");

const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/purchase-requests", require("./routes/purchaseRequest.routes"));
app.use("/api/v1/rfqs", require("./routes/rfq.routes"));

app.get("/", (req, res) => {
  res.send("Welcome to VendorHub API 🚀");
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;