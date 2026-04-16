const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");
const { computeEmployeeMetrics, generateEmployeeReport } = require("./reportHelper");

/**
 * Generates a PDF report for a single employee and saves it to the /reports folder.
 *
 * @param {Object} emp  - Mongoose Employee document (needs _id, firstName, email)
 * @param {string} month - e.g. "april"
 * @param {number} year  - e.g. 2026
 * @param {string} reportsDir - absolute path to the /reports directory
 */
async function saveEmployeeReportToDisk(emp, month, year, reportsDir) {
  const metrics = await computeEmployeeMetrics(emp._id.toString());
  if (!metrics) {
    console.warn(`[Cron] No metrics for employee ${emp._id} – skipping.`);
    return;
  }

  const filename = `report_${emp._id}_${month}_${year}.pdf`;
  const filePath = path.join(reportsDir, filename);
  const fileStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
    generateEmployeeReport(
      { firstName: emp.firstName, email: emp.email },
      metrics,
      fileStream
    );
  });

  console.log(`[Cron] Saved: ${filename}`);
}

/**
 * Registers scheduled cron jobs. Call once after the DB is connected.
 * Schedule: 1st of every month at 00:00 server time.
 */
function startCronJobs() {
  cron.schedule("0 0 1 * *", async () => {
    console.log("[Cron] Starting monthly performance report generation...");

    const reportsDir = path.join(__dirname, "..", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const now = new Date();
    const month = now
      .toLocaleString("en-US", { month: "long" })
      .toLowerCase();
    const year = now.getFullYear();

    try {
      const employees = await Employee.find({}, "_id firstName email");
      console.log(`[Cron] Generating reports for ${employees.length} employee(s)...`);

      for (const emp of employees) {
        try {
          await saveEmployeeReportToDisk(emp, month, year, reportsDir);
        } catch (err) {
          console.error(
            `[Cron] Failed to generate report for ${emp._id}:`,
            err.message
          );
        }
      }

      console.log("[Cron] Monthly report generation complete.");
    } catch (err) {
      console.error("[Cron] Error fetching employees:", err.message);
    }
  });

  console.log("[Cron] Monthly report scheduler registered (runs on 1st of each month at 00:00).");
}

module.exports = { startCronJobs };
