const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const Employee = require("../models/Employee");

/**
 * Runs a MongoDB aggregation pipeline to compute per-employee performance metrics.
 * Tasks use boolean flags (completed, failed, rejected, active) embedded in Employee documents.
 *
 * @param {string} employeeId
 * @returns {Promise<Object|null>} metrics object, or null if employee not found
 */
async function computeEmployeeMetrics(employeeId) {
  const objectId = new mongoose.Types.ObjectId(employeeId);

  const result = await Employee.aggregate([
    { $match: { _id: objectId } },
    {
      $project: {
        firstName: 1,
        email: 1,
        tasks: 1,
      },
    },
    // Unwind so each task becomes its own document; preserve empty arrays
    { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        email: { $first: "$email" },

        // Count only real task documents (not the null from empty arrays)
        totalTasks: {
          $sum: { $cond: [{ $ifNull: ["$tasks._id", false] }, 1, 0] },
        },

        completedCount: {
          $sum: { $cond: [{ $eq: ["$tasks.completed", true] }, 1, 0] },
        },

        failedCount: {
          $sum: { $cond: [{ $eq: ["$tasks.failed", true] }, 1, 0] },
        },

        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$tasks.rejected", true] }, 1, 0] },
        },

        // On-time: completed AND completedAt <= taskDate (string converted to Date)
        onTimeCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$tasks.completed", true] },
                  { $ne: ["$tasks.completedAt", null] },
                  { $ne: ["$tasks.taskDate", ""] },
                  { $ifNull: ["$tasks.taskDate", false] },
                  {
                    $lte: [
                      "$tasks.completedAt",
                      { $toDate: "$tasks.taskDate" },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },

        // Collect all categories (nulls filtered in JS)
        categories: { $push: "$tasks.category" },

        // For each completed task with a valid completedAt and taskDate,
        // push (completedAt - taskDate) in days; else null (filtered in JS)
        completedDays: {
          $push: {
            $cond: [
              {
                $and: [
                  { $eq: ["$tasks.completed", true] },
                  { $ne: ["$tasks.completedAt", null] },
                  { $ne: ["$tasks.taskDate", ""] },
                  { $ifNull: ["$tasks.taskDate", false] },
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      "$tasks.completedAt",
                      { $toDate: "$tasks.taskDate" },
                    ],
                  },
                  86400000, // ms per day
                ],
              },
              null,
            ],
          },
        },
      },
    },
  ]);

  if (!result.length) return null;

  const r = result[0];

  const completionRate =
    r.totalTasks > 0
      ? Math.round((r.completedCount / r.totalTasks) * 1000) / 10
      : 0;

  const onTimeRate =
    r.completedCount > 0
      ? Math.round((r.onTimeCount / r.completedCount) * 1000) / 10
      : 0;

  // Most frequent category
  const catCounts = {};
  (r.categories || []).forEach((c) => {
    if (c) catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const mostFreqCategory =
    Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] ||
    "N/A";

  // Average days to complete (relative to deadline; negative = early, positive = late)
  const validDays = (r.completedDays || []).filter((d) => d !== null);
  const avgDaysToComplete =
    validDays.length > 0
      ? Math.round(
          (validDays.reduce((a, b) => a + b, 0) / validDays.length) * 10
        ) / 10
      : null;

  return {
    firstName: r.firstName,
    email: r.email,
    totalTasks: r.totalTasks,
    completedCount: r.completedCount,
    failedCount: r.failedCount,
    rejectedCount: r.rejectedCount,
    completionRate,
    onTimeRate,
    mostFreqCategory,
    avgDaysToComplete,
  };
}

/**
 * Generates a structured PDF performance report and pipes it to outputStream.
 *
 * @param {Object} employeeData - { firstName, email }
 * @param {Object} metrics      - computed metrics from computeEmployeeMetrics()
 * @param {stream.Writable} outputStream - writable stream (HTTP response or fs.WriteStream)
 */
function generateEmployeeReport(employeeData, metrics, outputStream) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(outputStream);

  const now = new Date();
  const reportPeriod = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const ACCENT = "#2563EB";
  const LIGHT = "#F1F5F9";
  const TEXT = "#0F172A";
  const MUTED = "#64748B";
  const BORDER = "#E2E8F0";
  const pageW = doc.page.width;
  const contentW = pageW - 100; // left 50 + right 50

  // ── Header Banner ────────────────────────────────────────────────
  doc.rect(0, 0, pageW, 90).fill(ACCENT);
  doc
    .fillColor("#FFFFFF")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Performance Review Report", 50, 26, { width: contentW });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Generated: ${now.toLocaleString()}`, 50, 56, { width: contentW });

  doc.fillColor(TEXT);

  // ── Employee Info ────────────────────────────────────────────────
  const INFO_TOP = 108;
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(employeeData.firstName || metrics.firstName, 50, INFO_TOP, {
      width: contentW,
    });
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor(MUTED)
    .text(employeeData.email || metrics.email, 50, INFO_TOP + 22, {
      width: contentW,
    })
    .text(`Report Period: ${reportPeriod}`, 50, INFO_TOP + 38, {
      width: contentW,
    });

  doc.fillColor(TEXT);
  doc
    .moveTo(50, INFO_TOP + 62)
    .lineTo(pageW - 50, INFO_TOP + 62)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();

  // ── Summary Metrics ──────────────────────────────────────────────
  const METRICS_TOP = INFO_TOP + 78;
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor(ACCENT)
    .text("Summary Metrics", 50, METRICS_TOP);

  const rows = [
    ["Total Tasks Assigned", String(metrics.totalTasks)],
    ["Completed", String(metrics.completedCount)],
    ["Failed", String(metrics.failedCount)],
    ["Rejected", String(metrics.rejectedCount)],
    ["Completion Rate", `${metrics.completionRate}%`],
    ["On-Time Completion Rate", `${metrics.onTimeRate}%`],
    ["Most Frequent Category", metrics.mostFreqCategory],
    [
      "Avg Days to Complete (vs deadline)",
      metrics.avgDaysToComplete !== null
        ? `${metrics.avgDaysToComplete} days`
        : "N/A",
    ],
  ];

  let rowY = METRICS_TOP + 20;
  rows.forEach(([label, value], i) => {
    doc.rect(50, rowY, contentW, 24).fill(i % 2 === 0 ? LIGHT : "#FFFFFF");
    doc
      .fillColor(TEXT)
      .fontSize(11)
      .font("Helvetica")
      .text(label, 58, rowY + 6, { width: 250 });
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(value, 310, rowY + 6, { width: contentW - 260, align: "right" });
    rowY += 24;
  });

  doc.fillColor(TEXT);

  // ── Completion Rate Visualization ────────────────────────────────
  const VIZ_TOP = rowY + 28;
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor(ACCENT)
    .text("Completion Rate Visualization", 50, VIZ_TOP);

  const BAR_Y = VIZ_TOP + 20;
  const filled = Math.round((metrics.completionRate / 100) * contentW);

  // Background track
  doc.rect(50, BAR_Y, contentW, 18).fill(BORDER);
  // Filled portion
  if (filled > 0) {
    doc.rect(50, BAR_Y, filled, 18).fill(ACCENT);
  }

  // Percentage label
  doc
    .fillColor(TEXT)
    .fontSize(10)
    .font("Helvetica")
    .text(`${metrics.completionRate}% Complete`, 50, BAR_Y + 24);

  // ASCII-style text bar
  const BLOCKS = 40;
  const filledBlocks = Math.round((metrics.completionRate / 100) * BLOCKS);
  const bar =
    "[" +
    "\u2588".repeat(filledBlocks) +
    "\u2591".repeat(BLOCKS - filledBlocks) +
    "]";
  doc.fontSize(9).text(bar, 50, BAR_Y + 40, { lineBreak: false });

  // ── Footer ───────────────────────────────────────────────────────
  const FOOTER_Y = doc.page.height - 50;
  doc
    .moveTo(50, FOOTER_Y - 12)
    .lineTo(pageW - 50, FOOTER_Y - 12)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Faculty Management System  •  Auto-generated on ${now.toUTCString()}`,
      50,
      FOOTER_Y,
      { align: "center", width: contentW }
    );

  doc.end();
}

module.exports = { computeEmployeeMetrics, generateEmployeeReport };
