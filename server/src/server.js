require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");

const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not defined in environment variables.`);
    process.exit(1);
  }
});

connectDB();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});