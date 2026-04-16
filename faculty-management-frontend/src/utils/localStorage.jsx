// localStorage.jsx

// Default data (only used once if localStorage is empty)
const defaultEmployees = [
  {
    id: 1,
    firstName: "Arjun",
    email: "e@e.com",
    password: "123",
    taskCounts: { active: 2, newTask: 1, completed: 1, failed: 0 },
    tasks: [
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Update website",
        taskDescription: "Revamp the homepage design",
        taskDate: "2024-10-12",
        category: "Design",
      },
    ],
  },
  {
    id: 2,
    firstName: "Sneha",
    email: "employee2@example.com",
    password: "123",
    taskCounts: { active: 1, newTask: 0, completed: 1, failed: 0 },
    tasks: [],
  },
];

// Default admin
const defaultAdmin = [
  { id: 1, email: "admin@example.com", password: "123" },
];

// Initialize localStorage if not present
export const initializeStorage = () => {
  if (!localStorage.getItem("employees")) {
    localStorage.setItem("employees", JSON.stringify(defaultEmployees));
  }
  if (!localStorage.getItem("admin")) {
    localStorage.setItem("admin", JSON.stringify(defaultAdmin));
  }
};

// Get data from localStorage
export const getLocalStorage = () => {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const admin = JSON.parse(localStorage.getItem("admin")) || [];
  return { employees, admin };
};

// Save employees to localStorage
export const setEmployees = (employees) => {
  localStorage.setItem("employees", JSON.stringify(employees));
};

// Save admin to localStorage (rarely needed)
export const setAdmin = (admin) => {
  localStorage.setItem("admin", JSON.stringify(admin));
};
