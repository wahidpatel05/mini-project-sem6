// apiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://faculty-management-backend-1-6buo6bn29-deptsyncs-projects.vercel.app/api";

// Get the base URL without /api for file uploads
const getBaseURL = () => {
  return API_BASE_URL.replace(/\/api$/, "");
};

// Construct full file URL
export const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  // If it's already a full URL, return as is
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }
  // Otherwise construct the full URL
  return `${getBaseURL()}${fileUrl}`;
};

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiService = {
  // Auth endpoints
  adminLogin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    return data;
  },

  employeeLogin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/employee-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");
  },

  // Employee endpoints
  getAllEmployees: async () => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  getEmployeeById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  createEmployee: async (firstName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ firstName, email, password }),
    });
    return response.json();
  },

  updateEmployee: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  changePassword: async (id, oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return response.json();
  },

  deleteEmployee: async (id) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  addTask: async (employeeId, task, attachments = []) => {
    const formData = new FormData();
    
    // Add task data as JSON
    formData.append("taskTitle", task.taskTitle);
    formData.append("taskDescription", task.taskDescription);
    formData.append("taskDate", task.taskDate);
    formData.append("category", task.category);
    formData.append("priority", task.priority);
    formData.append("active", task.active);
    formData.append("newTask", task.newTask);
    formData.append("failed", task.failed);
    formData.append("completed", task.completed);
    formData.append("rejected", task.rejected);

    // Add attachments
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const token = localStorage.getItem("authToken");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/tasks`, {
      method: "POST",
      headers,
      body: formData,
    });
    return response.json();
  },

  updateTask: async (employeeId, taskIndex, newStatus, attachments = []) => {
    const formData = new FormData();
    formData.append("newStatus", newStatus);

    // Add attachments if any
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const token = localStorage.getItem("authToken");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}/tasks/${taskIndex}`,
      {
        method: "PUT",
        headers,
        body: formData,
      }
    );
    return response.json();
  },

  reassignTask: async (fromEmployeeId, toEmployeeId, taskIndex) => {
    const response = await fetch(
      `${API_BASE_URL}/employees/${fromEmployeeId}/tasks/${taskIndex}/reassign/${toEmployeeId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      }
    );
    return response.json();
  },

  rejectTask: async (employeeId, taskIndex, rejectionReason) => {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}/tasks/${taskIndex}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ rejectionReason }),
      }
    );
    return response.json();
  },

  requestPostpone: async (employeeId, taskIndex, requestedDate, reason) => {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}/tasks/${taskIndex}/postpone`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ requestedDate, reason }),
      }
    );
    return response.json();
  },

  approvePostpone: async (employeeId, taskIndex, requestIndex, responseNote = "") => {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}/tasks/${taskIndex}/postpone/${requestIndex}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ responseNote }),
      }
    );
    return response.json();
  },

  rejectPostpone: async (employeeId, taskIndex, requestIndex, responseNote = "") => {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}/tasks/${taskIndex}/postpone/${requestIndex}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ responseNote }),
      }
    );
    return response.json();
  },

  getTaskRecommendations: async (taskCategory, taskPriority = "Medium") => {
    const params = new URLSearchParams({
      taskCategory,
      taskPriority,
    });

    const response = await fetch(`${API_BASE_URL}/employees/recommendations/task?${params}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  // ── Shared (Multi-Assignee) Tasks ───────────────────────────────────────

  createSharedTask: async (taskData, assigneeIds, attachments = []) => {
    const formData = new FormData();
    formData.append("taskTitle", taskData.taskTitle);
    formData.append("taskDescription", taskData.taskDescription);
    formData.append("taskDate", taskData.taskDate);
    formData.append("category", taskData.category);
    formData.append("priority", taskData.priority);

    // Send as JSON string; controller parses it
    assigneeIds.forEach((id) => formData.append("assigneeIds", id));

    attachments.forEach((file) => formData.append("attachments", file));

    const token = localStorage.getItem("authToken");
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers,
      body: formData,
    });
    return response.json();
  },

  getAllSharedTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  // ── Chat Messages ──────────────────────────────────────────────────────

  getMessages: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/messages/${encodeURIComponent(roomId)}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },

  getAdminProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/admin-profile`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    if (!response.ok) throw new Error("Failed to fetch admin profile");
    return response.json();
  },

  // ── Performance Reports ────────────────────────────────────────────────

  downloadReport: async (employeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/reports/employee/${employeeId}`,
      {
        headers: { ...getAuthHeader() },
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to download report");
    }
    return response;
  },
};
