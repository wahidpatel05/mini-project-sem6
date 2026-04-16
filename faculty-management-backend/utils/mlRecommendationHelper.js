const path = require("path");
const fs = require("fs");
const {
  getTaskRecommendations,
  analyzeTaskSuitability,
  calculatePerformanceScore,
} = require("./analyticsHelper");
const { getAvailabilityStatus } = require("./leaveHelper");

const priorityToNumber = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const clamp01 = (value) => {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

const buildFeatures = (employee, taskCategory, taskPriority) => {
  const totalTasks = employee?.tasks?.length || 0;
  const taskCounts = employee?.taskCounts || {};

  const completed = taskCounts.completed || 0;
  const failed = taskCounts.failed || 0;
  const rejected = taskCounts.rejected || 0;
  const active = taskCounts.active || 0;
  const newTask = taskCounts.newTask || 0;

  const completedInCategory = (employee.tasks || []).filter(
    (task) => task.completed && (task.category || "").toLowerCase() === taskCategory.toLowerCase()
  ).length;

  const totalInCategory = (employee.tasks || []).filter(
    (task) => (task.category || "").toLowerCase() === taskCategory.toLowerCase()
  ).length;

  const highPriorityTasks = (employee.tasks || []).filter((task) => {
    const p = (task.priority || "").toLowerCase();
    return p === "high" || p === "critical";
  });

  const completedHighPriority = highPriorityTasks.filter((task) => task.completed).length;

  const completionRate = totalTasks > 0 ? completed / totalTasks : 0.5;
  const failureRate = totalTasks > 0 ? failed / totalTasks : 0.1;
  const rejectionRate = totalTasks > 0 ? rejected / totalTasks : 0.1;
  const categoryMatchRate = totalInCategory > 0 ? completedInCategory / totalInCategory : 0.2;
  const highPrioritySuccessRate = highPriorityTasks.length > 0 ? completedHighPriority / highPriorityTasks.length : 0.5;

  return {
    employee_completion_rate: clamp01(completionRate),
    employee_failure_rate: clamp01(failureRate),
    employee_rejection_rate: clamp01(rejectionRate),
    current_active_tasks: Math.max(0, active + newTask),
    task_priority: priorityToNumber[(taskPriority || "medium").toLowerCase()] || 2,
    category_match_rate: clamp01(categoryMatchRate),
    high_priority_success_rate: clamp01(highPrioritySuccessRate),
  };
};

const predictBatchWithApi = async (featuresList) => {
  const apiUrl = process.env.ML_API_URL || "http://127.0.0.1:5001";
  
  try {
    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featuresList }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `ML API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.scores;
  } catch (error) {
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
       console.warn(`[!] ML API not reachable at ${apiUrl}. Is the Flask server running?`);
    }
    throw new Error(`Failed to fetch ML predictions: ${error.message}`);
  }
};

const getTaskRecommendationsWithFallback = async (employees, taskCategory, taskPriority, taskDeadline) => {
  // Build availability map, DO NOT filter out on-leave employees so they still show up (with status)
  const availabilityMap = new Map();
  const leaveUntilMap = new Map();

  if (taskDeadline) {
    employees.forEach((emp) => {
      const { status, leaveUntil } = getAvailabilityStatus(emp, taskDeadline);
      availabilityMap.set(String(emp._id), status);
      if (leaveUntil) leaveUntilMap.set(String(emp._id), leaveUntil);
    });
  }

  const ruleBased = getTaskRecommendations(employees, taskCategory, taskPriority);

  try {
    const employeeById = new Map(employees.map((emp) => [String(emp._id), emp]));

    // Batch process all features instead of spanning N Python child processes
    const validRecs = ruleBased.filter((rec) => employeeById.has(String(rec.employeeId)));
    const featuresList = validRecs.map((rec) => 
      buildFeatures(employeeById.get(String(rec.employeeId)), taskCategory, taskPriority)
    );

    let batchScores = [];
    if (featuresList.length > 0) {
      batchScores = await predictBatchWithApi(featuresList);
    }

    const scored = validRecs.map((rec, index) => {
      const employee = employeeById.get(String(rec.employeeId));
      const mlScore = batchScores[index] !== undefined ? batchScores[index] : 50;
      
      const suitability = analyzeTaskSuitability(employee, taskCategory, taskPriority);
      const performanceScore = calculatePerformanceScore(employee);

      const categoryBoost =
        suitability.categoryMatch >= 80 ? 14 : suitability.categoryMatch >= 60 ? 8 : 0;
      const loadPenalty = Math.max(0, rec.currentLoad - 4) * 2;

      let finalScoreRaw =
        mlScore * 0.45 +
        rec.overallScore * 0.2 +
        suitability.categoryMatch * 0.35 +
        categoryBoost -
        loadPenalty;

      if (suitability.categoryMatch < 50) {
        finalScoreRaw = Math.min(finalScoreRaw, 59.9);
      }

      // Apply 30% penalty for employees returning soon after deadline
      // Apply huge penalty for "on_leave" so they rank strictly lower
      const availabilityStatus = availabilityMap.get(String(rec.employeeId)) || "available";
      const leaveUntil = leaveUntilMap.get(String(rec.employeeId)) || null;
      if (availabilityStatus === "returning_soon") {
        finalScoreRaw = finalScoreRaw * 0.7;
      } else if (availabilityStatus === "on_leave") {
        finalScoreRaw = finalScoreRaw * 0.1; // heavily penalized
      }

      const blendedScore = Math.round(Math.max(0, Math.min(100, finalScoreRaw)) * 10) / 10;

      return {
        ...rec,
        overallScore: blendedScore,
        availabilityStatus,
        leaveUntil,
        performanceScore,
        suitability,
        insights: [
          `ML confidence score: ${Math.round(mlScore)} / 100`,
          `Category fit: ${Math.round(suitability.categoryMatch)}%`,
          ...rec.insights,
        ].slice(0, 5),
        recommendationSource: "ml+rule",
      };
    });

    return scored.sort((a, b) => {
      if (b.suitability.categoryMatch !== a.suitability.categoryMatch) {
        return b.suitability.categoryMatch - a.suitability.categoryMatch;
      }
      return b.overallScore - a.overallScore;
    });
  } catch (err) {
    console.error("ML Prediction Error:", err);
    return ruleBased.map((rec) => ({
      ...rec,
      availabilityStatus: availabilityMap.get(String(rec.employeeId)) || "available",
      leaveUntil: leaveUntilMap.get(String(rec.employeeId)) || null,
      recommendationSource: "rule-fallback",
      insights: [
        "Using rule-based scoring (ML unavailable)",
        ...rec.insights,
      ].slice(0, 5),
    }));
  }
};

module.exports = {
  getTaskRecommendationsWithFallback,
};
