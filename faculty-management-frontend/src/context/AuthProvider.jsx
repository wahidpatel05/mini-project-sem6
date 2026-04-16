import React, { createContext, useEffect, useState } from "react";
import { apiService } from "../utils/apiService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all employees from backend on app load
    const fetchEmployees = async () => {
      try {
        const employees = await apiService.getAllEmployees();
        setUserData(employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setUserData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const refreshEmployees = async () => {
    try {
      const employees = await apiService.getAllEmployees();
      setUserData(employees);
    } catch (error) {
      console.error("Error refreshing employees:", error);
    }
  };

  return (
    <AuthContext.Provider value={[userData, setUserData, { loading, refreshEmployees }]}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
