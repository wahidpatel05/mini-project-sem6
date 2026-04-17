import React, { useEffect, useState } from 'react'
import Login from './components/Auth/Login'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import PasswordChangeModal from './components/other/PasswordChangeModal'
import { apiService } from './utils/apiService'

const App = () => {

  const [user, setUser] = useState(null)
  const [loggedInUserData, setLoggedInUserData] = useState(null)
  const [forcePasswordChange, setForcePasswordChange] = useState(false)

  useEffect(()=>{
    const loggedInUser = localStorage.getItem('loggedInUser')
    const authToken = localStorage.getItem('authToken')
    
    if(loggedInUser && authToken){
      const userData = JSON.parse(loggedInUser)
      setUser(userData.role)
      setLoggedInUserData(userData.data)
      if (userData.role === 'employee' && userData.data?.isFirstLogin === true) {
        setForcePasswordChange(true)
      }
    }

  },[])

  const handleLogout = () => {
    apiService.logout()
    setUser(null)
    setLoggedInUserData(null)
    setForcePasswordChange(false)
  }

  const handleLogin = async (email, password) => {
    try {
      // Try admin login first
      const adminResponse = await apiService.adminLogin(email, password)
      
      if (adminResponse.message === 'Admin login successful') {
        setUser('admin')
        setForcePasswordChange(false)
        localStorage.setItem('loggedInUser', JSON.stringify({ role: 'admin', data: adminResponse.admin }))
      } else {
        // Try employee login
        const employeeResponse = await apiService.employeeLogin(email, password)
        
        if (employeeResponse.message === 'Employee login successful') {
          setUser('employee')
          setLoggedInUserData(employeeResponse.employee)
          localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: employeeResponse.employee }))
          if (employeeResponse.employee?.isFirstLogin === true) {
            setForcePasswordChange(true)
          } else {
            setForcePasswordChange(false)
          }
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
          if (employeeResponse.employee?.isFirstLogin === true) {
            setForcePasswordChange(true)
          } else {
            setForcePasswordChange(false)
          }
        } else {
          alert('Invalid email or password')
        }
      } catch (empError) {
        console.error('Employee login error:', empError)
        alert('Invalid email or password')
      }
    }
  }

  const handlePasswordChanged = () => {
    setForcePasswordChange(false)
    // Update localStorage so a page refresh doesn't re-trigger the modal
    const stored = localStorage.getItem('loggedInUser')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.data) {
        parsed.data.isFirstLogin = false
      }
      localStorage.setItem('loggedInUser', JSON.stringify(parsed))
    }
  }

  return (
    <>
      {!user ? <Login handleLogin={handleLogin} /> : ''}
      {user === 'admin' ? <AdminDashboard changeUser={handleLogout} /> : (user === 'employee' ? <EmployeeDashboard changeUser={handleLogout} data={loggedInUserData} /> : null) }
      {user === 'employee' && forcePasswordChange && loggedInUserData && (
        <PasswordChangeModal
          employee={loggedInUserData}
          isFirstLogin={true}
          onClose={() => { /* intentionally non-dismissible on first login */ }}
          onSuccess={handlePasswordChanged}
        />
      )}
    </>
  )
}

export default App