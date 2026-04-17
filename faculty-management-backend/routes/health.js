/**
 * Health Check Routes
 *
 * GET /health       – Lightweight ping for uptime monitors (UptimeRobot, etc.)
 * GET /health/full  – Deep check: MongoDB connection + ML model availability
 *
 * Rate-limited to prevent abuse.
 */

const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const router = express.Router();

/* -----------------------------------------------------------------------
   Rate limiter – applied to all health routes
   Allow 60 requests per minute per IP (generous for monitors, tight enough
   to block scrapers)
----------------------------------------------------------------------- */
const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please slow down." },
});

router.use(healthRateLimiter);

/* -----------------------------------------------------------------------
   Simple logger – prints method, path and response time to stdout.
   Avoids pulling in a full logging library for just two endpoints.
----------------------------------------------------------------------- */
function logHealthRequest(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[health] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
}

router.use(logHealthRequest);

/* -----------------------------------------------------------------------
   GET /health  –  Lightweight ping, no DB or ML calls
   Ideal for UptimeRobot / Render keep-alive pings
----------------------------------------------------------------------- */
router.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ML model base URL – resolved once at module load
const ML_MODEL_URL = process.env.ML_MODEL_URL || "https://mini-project-sem6.onrender.com";

/* -----------------------------------------------------------------------
   GET /health/full  –  Deep health check
   Checks:
     1. MongoDB readyState (1 = connected)
     2. ML model service reachability (HEAD request, no inference)
----------------------------------------------------------------------- */
router.get("/full", async (req, res) => {

  // --- MongoDB status (synchronous, no query needed) ---
  const readyState = mongoose.connection.readyState;
  // 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
  const readyStateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const dbStatus = readyStateMap[readyState] ?? "unknown";

  // --- ML model reachability (HEAD request to avoid triggering inference) ---
  let mlStatus = "unavailable";
  let mlTimeout;
  try {
    const controller = new AbortController();
    mlTimeout = setTimeout(() => controller.abort(), 5000); // 5 s timeout

    const mlRes = await fetch(ML_MODEL_URL, {
      method: "HEAD",
      signal: controller.signal,
    });

    mlStatus = mlRes.ok ? "reachable" : "unreachable";
  } catch {
    mlStatus = "unreachable";
  } finally {
    clearTimeout(mlTimeout);
  }

  // --- Overall status ---
  const allOk = readyState === 1 && mlStatus === "reachable";

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    database: dbStatus,
    ml_model: mlStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
