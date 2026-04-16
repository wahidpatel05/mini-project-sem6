const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const {
  getTaskRecommendations,
  analyzeTaskSuitability,
  calculatePerformanceScore,
} = require("./analyticsHelper");

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

const resolvePythonCommand = () => {
  if (process.env.PYTHON_EXECUTABLE) {
    return process.env.PYTHON_EXECUTABLE;
  }

  const localVenvPython = path.resolve(
    __dirname,
    "../../task-recommendation-model/.env/Scripts/python.exe"
  );

  if (fs.existsSync(localVenvPython)) {
    return localVenvPython;
  }

  return "python";
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

const predictScoreWithPython = (features) => {
  return new Promise((resolve, reject) => {
    const pythonCmd = resolvePythonCommand();
    const scriptPath = path.resolve(__dirname, "../../task-recommendation-model/predict_single.py");
    const modelPath = path.resolve(__dirname, "../../task-recommendation-model/task_recommendation_model.pkl");

    const child = spawn(pythonCmd, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("ML prediction timed out"));
    }, 15000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      try {
        const output = JSON.parse((stdout || "").trim());
        if (code !== 0 || output.error) {
          return reject(new Error(output.error || stderr || "ML process failed"));
        }
        return resolve(Number(output.score));
      } catch (err) {
        return reject(new Error(stderr || "Invalid ML output"));
      }
    });

    child.stdin.write(JSON.stringify({ modelPath, features }));
    child.stdin.end();
  });
};

const getTaskRecommendationsWithFallback = async (employees, taskCategory, taskPriority) => {
  const ruleBased = getTaskRecommendations(employees, taskCategory, taskPriority);

  try {
    const employeeById = new Map(employees.map((emp) => [String(emp._id), emp]));

    const scored = await Promise.all(
      ruleBased.map(async (rec) => {
        const employee = employeeById.get(String(rec.employeeId));
        if (!employee) return rec;

        const features = buildFeatures(employee, taskCategory, taskPriority);
        const mlScore = await predictScoreWithPython(features);
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

        const blendedScore = Math.round(Math.max(0, Math.min(100, finalScoreRaw)) * 10) / 10;

        return {
          ...rec,
          overallScore: blendedScore,
          performanceScore,
          suitability,
          insights: [
            `ML confidence score: ${Math.round(mlScore)} / 100`,
            `Category fit: ${Math.round(suitability.categoryMatch)}%`,
            ...rec.insights,
          ].slice(0, 5),
          recommendationSource: "ml+rule",
        };
      })
    );

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
