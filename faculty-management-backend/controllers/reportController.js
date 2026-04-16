const Employee = require("../models/Employee");
const { computeEmployeeMetrics, generateEmployeeReport } = require("../utils/reportHelper");

/**
 * GET /api/reports/employee/:id
 * Runs the aggregation for the given employee, generates a PDF, and streams it
 * as a downloadable response.
 */
exports.downloadEmployeeReport = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).select("firstName email");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const metrics = await computeEmployeeMetrics(id);
    if (!metrics) {
      return res
        .status(404)
        .json({ message: "No metrics found for this employee" });
    }

    const now = new Date();
    const month = now
      .toLocaleString("en-US", { month: "long" })
      .toLowerCase();
    const year = now.getFullYear();
    const filename = `report_${id}_${month}_${year}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    generateEmployeeReport(
      { firstName: employee.firstName, email: employee.email },
      metrics,
      res
    );
  } catch (err) {
    console.error("Report generation error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to generate report", error: err.message });
  }
};
