const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to VendorHub API 🚀");
});

module.exports = app;