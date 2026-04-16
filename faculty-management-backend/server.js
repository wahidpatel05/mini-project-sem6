require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const Message = require("./models/Message");

// Import routes
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const taskRoutes = require("./routes/task");
const messageRoutes = require("./routes/message");
const reportRoutes = require("./routes/report");

// Import cron jobs
const { startCronJobs } = require("./utils/cronJobs");

const app = express();
const server = http.createServer(app);

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
   SOCKET.IO SETUP
====================================== */

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Join a chat room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  // Receive and broadcast a message, then persist to DB
  socket.on("send-message", async (data) => {
    const { roomId, senderId, senderName, senderRole, text } = data;

    if (!roomId || !senderId || !senderName || !senderRole || !text) return;

    try {
      const message = new Message({ roomId, senderId, senderName, senderRole, text });
      await message.save();

      io.to(roomId).emit("receive-message", {
        _id: message._id,
        roomId,
        senderId,
        senderName,
        senderRole,
        text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Socket message save error:", err.message);
    }
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
  });
});

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

// Start scheduled cron jobs (monthly report generation)
startCronJobs();

/* ======================================
   ROUTES
====================================== */

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);

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
  server.listen(PORT, () => {
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
module.exports.server = server;
