import React, { useEffect, useState } from 'react'
import Login from './components/Auth/Login'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import { apiService } from './utils/apiService'

const App = () => {

  const [user, setUser] = useState(null)
  const [loggedInUserData, setLoggedInUserData] = useState(null)

  useEffect(()=>{
    const loggedInUser = localStorage.getItem('loggedInUser')
    const authToken = localStorage.getItem('authToken')
    
    if(loggedInUser && authToken){
      const userData = JSON.parse(loggedInUser)
      setUser(userData.role)
      setLoggedInUserData(userData.data)
    }

  },[])

  const handleLogout = () => {
    apiService.logout()
    setUser(null)
    setLoggedInUserData(null)
  }

  const handleLogin = async (email, password) => {
    try {
      // Try admin login first
      const adminResponse = await apiService.adminLogin(email, password)
      
      if (adminResponse.message === 'Admin login successful') {
        setUser('admin')
        localStorage.setItem('loggedInUser', JSON.stringify({ role: 'admin', data: adminResponse.admin }))
      } else {
        // Try employee login
        const employeeResponse = await apiService.employeeLogin(email, password)
        
        if (employeeResponse.message === 'Employee login successful') {
          setUser('employee')
          setLoggedInUserData(employeeResponse.employee)
          localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: employeeResponse.employee }))
        } else {
          alert('Invalid credentials')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Try employee login if admin login fails
      try {
        const employeeResponse = await apiService.employeeLogin(email, password)
        
        if (employeeResponse.message === 'Employee login successful') {
          setUser('employee')
          setLoggedInUserData(employeeResponse.employee)
          localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: employeeResponse.employee }))
        } else {
          alert('Invalid email or password')
        }
      } catch (empError) {
        console.error('Employee login error:', empError)
        alert('Invalid email or password')
      }
    }
  }

  return (
    <>
      {!user ? <Login handleLogin={handleLogin} /> : ''}
      {user == 'admin' ? <AdminDashboard changeUser={handleLogout} /> : (user == 'employee' ? <EmployeeDashboard changeUser={handleLogout} data={loggedInUserData} /> : null) }
    </>
  )
}

export default App