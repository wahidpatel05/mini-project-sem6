require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
// const cors = require("cors");
const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");

const app = express();

/* ======================================
   CORS CONFIG (LOCAL + PRODUCTION SAFE)
====================================== */

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://faculty-management-frontend-phi.vercel.app",
    "https://faculty-management-frontend-v4qd.vercel.app",
    process.env.FRONTEND_URL,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit preflight handling (IMPORTANT for Vercel)
app.options("*", cors(corsOptions));

/* ======================================
   BODY PARSER
====================================== */

app.use(express.json());

/* ======================================
   STATIC FILE SERVING FOR UPLOADS
====================================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================
   DATABASE CONNECTION
====================================== */

connectDB();

/* ======================================
   ROUTES
====================================== */

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

/* ======================================
   ROOT + HEALTH CHECK
====================================== */

app.get("/", (req, res) => {
  res.json({
    status: "Backend running successfully",
    service: "Faculty Management API"
  });
});
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("Backend running locally on port", PORT);
    console.log(process.env.FRONTEND_URL);
  });
}

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

/* ======================================
   EXPORT FOR VERCEL SERVERLESS
====================================== */

module.exports = app;
