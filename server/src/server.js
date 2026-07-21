require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");
const { initializeSocket } = require("./socket/socketServer");
const initSystemUser = require("./utils/initSystemUser");

const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not defined in environment variables.`);
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  console.error(`[UNHANDLED REJECTION] Shutting down: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`[UNCAUGHT EXCEPTION] Shutting down: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

connectDB().then(() => {
  initSystemUser();
}).catch(err => console.error(err));
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Initialize Socket.IO
initializeSocket(server);