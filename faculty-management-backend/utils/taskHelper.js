// Helper function to mark overdue tasks as failed
const markOverdueTasks = (employee) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let updated = false;

  employee.tasks.forEach((task) => {
    const taskDate = new Date(task.taskDate);
    taskDate.setHours(0, 0, 0, 0);

    // If task is past deadline and still new or active (and not rejected), mark as failed
    const hasPendingPostpone =
      task.postponeRequests?.some((request) => request.status === "pending");

    if (taskDate < today && (task.newTask || task.active) && !task.rejected && !hasPendingPostpone) {
      // Update task counts
      if (task.newTask) employee.taskCounts.newTask -= 1;
      if (task.active) employee.taskCounts.active -= 1;
      employee.taskCounts.failed += 1;

      // Mark as failed
      task.newTask = false;
      task.active = false;
      task.completed = false;
      task.failed = true;
      task.rejected = false;
      task.completedAt = null;

      updated = true;
    }
  });

  return updated;
};

module.exports = markOverdueTasks;
