
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const db = require("./db");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, "public")));

// Get all resources
app.get("/api/resources", async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, title, category, student_name, type FROM resources ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Add a resource
app.post("/api/resources", async (req, res, next) => {
  try {
    const { title, category, studentName, contact, type } = req.body;

    if (!title || !category || !studentName || !contact || !type) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (title.length > 100 || studentName.length > 80) {
      return res.status(400).json({ error: "Text is too long." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    if (!["Books", "Notes", "Stationery", "Other"].includes(category)) {
      return res.status(400).json({ error: "Invalid category." });
    }

    if (!["Donate", "Exchange"].includes(type)) {
      return res.status(400).json({ error: "Invalid resource action." });
    }

    const [result] = await db.execute(
      `INSERT INTO resources
       (title, category, student_name, contact, type)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), category, studentName.trim(), contact.trim(), type]
    );

    res.status(201).json({
      message: "Resource added successfully.",
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Add student support request
app.post("/api/support", async (req, res, next) => {
  try {
    const { studentName, email, supportType, description } = req.body;

    if (!studentName || !email || !supportType || !description) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    if (studentName.length > 80 || description.length > 1000) {
      return res.status(400).json({ error: "Input is too long." });
    }

    const allowedTypes = [
      "Scholarship Guidance",
      "Study Material",
      "Fee Assistance Guidance",
      "Other Educational Support"
    ];

    if (!allowedTypes.includes(supportType)) {
      return res.status(400).json({ error: "Invalid support type." });
    }

    const [result] = await db.execute(
      `INSERT INTO support_requests
       (student_name, email, support_type, description)
       VALUES (?, ?, ?, ?)`,
      [studentName.trim(), email.trim(), supportType, description.trim()]
    );

    res.status(201).json({
      message: "Support request submitted.",
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Add campus issue
app.post("/api/issues", async (req, res, next) => {
  try {
    const { studentName, issueType, location, description } = req.body;

    if (!studentName || !issueType || !location || !description) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (
      studentName.length > 80 ||
      location.length > 120 ||
      description.length > 1000
    ) {
      return res.status(400).json({ error: "Input is too long." });
    }

    const allowedIssues = [
      "Waste Management",
      "Water Leakage",
      "Electricity Problem",
      "Cleanliness",
      "Other"
    ];

    if (!allowedIssues.includes(issueType)) {
      return res.status(400).json({ error: "Invalid issue type." });
    }

    const [result] = await db.execute(
      `INSERT INTO campus_issues
       (student_name, issue_type, location, description)
       VALUES (?, ?, ?, ?)`,
      [studentName.trim(), issueType, location.trim(), description.trim()]
    );

    res.status(201).json({
      message: "Campus issue reported.",
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// General error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

module.exports = app;
