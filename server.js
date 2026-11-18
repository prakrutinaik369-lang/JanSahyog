
require("dotenv").config();

const app = require("./app");
const db = require("./db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`JanSahyog running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
