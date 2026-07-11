require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");

connectDB();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});