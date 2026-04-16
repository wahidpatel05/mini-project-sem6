/**
 * Analytics & Predictive Analysis Helper
 * Calculates employee performance metrics and provides task assignment recommendations
 */

/**
 * Calculate comprehensive performance score for an employee
 * Based on: completion rate, success rate, task handling capacity, priority handling, and consistency
 * Returns a score from 0-100
 */
const calculatePerformanceScore = (employee) => {
  if (!employee.tasks || employee.tasks.length === 0) {
    return 50; // Default score for new employees
  }

  const taskCounts = employee.taskCounts;
  const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  if (totalTasks === 0) {
    return 50;
  }

  // 1. Completion Rate (40% weight)
  const completionRate = totalTasks > 0 ? (taskCounts.completed / totalTasks) * 100 : 0;
  const completionScore = (completionRate / 100) * 40;

  // 2. Failure Rate Impact (30% weight) - lower is better
  const failureRate = totalTasks > 0 ? (taskCounts.failed / totalTasks) * 100 : 0;
  const failureScore = Math.max(0, 30 - (failureRate / 100) * 30);

  // 3. Rejection Rate Impact (20% weight) - lower is better
  const rejectionRate = totalTasks > 0 ? (taskCounts.rejected / totalTasks) * 100 : 0;
  const rejectionScore = Math.max(0, 20 - (rejectionRate / 100) * 20);

  // 4. Active Task Handling (10% weight) - how balanced workload is
  const activeTasks = taskCounts.active || 0;
  const newTasks = taskCounts.newTask || 0;
  const totalActiveLoad = activeTasks + newTasks;
  const maxOptimalLoad = 5; // Optimal: not more than 5 pending tasks
  const capacityScore = totalActiveLoad <= maxOptimalLoad ? 10 : Math.max(0, 10 - (totalActiveLoad - maxOptimalLoad));

  const totalScore = completionScore + failureScore + rejectionScore + capacityScore;

  return Math.round(totalScore * 10) / 10; // Round to 1 decimal place
};

/**
 * Analyze employee suitability for a specific task
 */
const analyzeTaskSuitability = (employee, taskCategory, taskPriority) => {
  if (!employee.tasks || employee.tasks.length === 0) {
    return {
      categoryMatch: 0,
      priorityHandling: 0,
      workloadFitness: 0,
    };
  }

  // 1. Category Match - how many tasks of this category has employee completed
  const completedInCategory = employee.tasks.filter(
    (task) => task.completed && task.category?.toLowerCase() === taskCategory.toLowerCase()
  ).length;

  const totalInCategory = employee.tasks.filter(
    (task) => task.category?.toLowerCase() === taskCategory.toLowerCase()
  ).length;

  const categoryMatch = totalInCategory > 0 ? (completedInCategory / totalInCategory) * 100 : 30;

  // 2. Priority Handling - check if employee handles high priority tasks well
  let priorityHandling = 50;
  if (taskPriority === "High" || taskPriority === "Critical") {
    const highPriorityTasks = employee.tasks.filter(
      (task) => task.priority === "High" || task.priority === "Critical"
    );
    const completedHighPriority = highPriorityTasks.filter((task) => task.completed).length;
    priorityHandling = highPriorityTasks.length > 0 ? (completedHighPriority / highPriorityTasks.length) * 100 : 50;
  }

  // 3. Workload Fitness - check if employee has capacity
  const currentLoad = (employee.taskCounts.active || 0) + (employee.taskCounts.newTask || 0);
  const maxCapacity = 8;
  const workloadFitness = Math.max(0, 100 - (currentLoad / maxCapacity) * 50);

  return {
    categoryMatch: Math.round(categoryMatch * 10) / 10,
    priorityHandling: Math.round(priorityHandling * 10) / 10,
    workloadFitness: Math.round(workloadFitness * 10) / 10,
  };
};

/**
 * Generate AI-like recommendation based on employee metrics
 */
const generateRecommendationInsight = (performanceScore, suitability, employee) => {
  const { categoryMatch, priorityHandling, workloadFitness } = suitability;
  const currentLoad = (employee.taskCounts.active || 0) + (employee.taskCounts.newTask || 0);

  const insights = [];

  // Performance-based insights
  if (performanceScore >= 80) {
    insights.push("⭐ High performer with excellent track record");
  } else if (performanceScore >= 60) {
    insights.push("✓ Reliable employee with consistent performance");
  } else if (performanceScore >= 40) {
    insights.push("⚠ Average performance - monitor progress");
  } else {
    insights.push("❌ Needs improvement - consider support");
  }

  // Category match insight
  if (categoryMatch >= 80) {
    insights.push("📊 Expert in this category");
  } else if (categoryMatch >= 60) {
    insights.push("📈 Has experience with this type of task");
  } else if (categoryMatch === 0) {
    insights.push("🆕 First-time with this category - could be learning opportunity");
  }

  // Workload insight
  if (workloadFitness >= 80) {
    insights.push("✅ Has ample capacity for new task");
  } else if (workloadFitness >= 50) {
    insights.push("⚡ Can take this task, current load: " + currentLoad + " pending");
  } else {
    insights.push("⚠ High workload (" + currentLoad + " pending tasks) - may impact delivery");
  }

  // Priority handling
  if (priorityHandling >= 75) {
    insights.push("🎯 Excellent at handling priority tasks");
  }

  return insights;
};

/**
 * Get ranked recommendations for all employees
 */
const getTaskRecommendations = (employees, taskCategory, taskPriority) => {
  if (!employees || employees.length === 0) {
    return [];
  }

  const recommendations = employees.map((employee) => {
    const performanceScore = calculatePerformanceScore(employee);
    const suitability = analyzeTaskSuitability(employee, taskCategory, taskPriority);

    // Calculate weighted overall score
    const overallScore =
      performanceScore * 0.4 +
      suitability.categoryMatch * 0.25 +
      suitability.priorityHandling * 0.2 +
      suitability.workloadFitness * 0.15;

    const insights = generateRecommendationInsight(performanceScore, suitability, employee);

    return {
      employeeId: employee._id,
      employeeName: employee.firstName,
      email: employee.email,
      overallScore: Math.round(overallScore * 10) / 10,
      performanceScore,
      suitability,
      insights,
      currentLoad: (employee.taskCounts.active || 0) + (employee.taskCounts.newTask || 0),
      completionRate: employee.tasks.length > 0 ? Math.round((employee.taskCounts.completed / employee.tasks.length) * 100) : 0,
    };
  });

  // Sort by overall score descending
  return recommendations.sort((a, b) => b.overallScore - a.overallScore);
};

module.exports = {
  calculatePerformanceScore,
  analyzeTaskSuitability,
  generateRecommendationInsight,
  getTaskRecommendations,
};
