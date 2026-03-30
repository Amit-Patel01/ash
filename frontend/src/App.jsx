import { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Hero from './components/Hero'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Help from './pages/help'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Checkout from './pages/Checkout'
import CustomProject from './pages/CustomProject'
import RequestAccount from './pages/RequestAccount'
import ForgotPassword from './pages/ForgotPassword'
import ComingSoon from './pages/ComingSoon'

import WebService from './web-service/WebService'
import RepairService from './technicalsupport/RepairService'
import EditingService from './editing/EditingService'
import TechSupport from './technicalsupport/TechSupport'

import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminProjects from './admin/AdminProjects'
import AdminTasks from './admin/AdminTasks'
import AdminTeam from './admin/AdminTeam'
import AdminEmployees from './admin/AdminEmployees'
import AdminServices from './admin/AdminServices'
import AdminMessages from './admin/AdminMessages'
import AdminSales from './admin/AdminSales'
import AdminAccountRequests from './admin/AdminAccountRequests'
import AdminSellRequests from './admin/AdminSellRequests'
import AdminServiceRequests from './admin/AdminServiceRequests'
import AdminSettings from './admin/AdminSettings'

import EmployeeLogin from './employee/EmployeeLogin'
import EmployeeLayout from './employee/EmployeeLayout'
import EmployeeOverview from './employee/EmployeeOverview'
import EmployeeTasks from './employee/EmployeeTasks'
import EmployeeProjects from './employee/EmployeeProjects'
import EmployeeProfile from './employee/EmployeeProfile'
import SellProjectRequest from './employee/SellProjectRequest'

function ProtectedAdmin({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) return null
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin-login" replace />
  }
  return children
}

function ProtectedEmployee({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) return null
  if (!currentUser) return <Navigate to="/employee-login" replace />
  return children
}

function AppContent() {
  const { logout } = useAuth()

  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hero />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetails />} />
          <Route path="checkout/:slug" element={<Checkout />} />
          <Route path="contact" element={<Contact />} />
          <Route path="custom-project" element={<CustomProject />} />
          <Route path="help" element={<Help />} />
          <Route path="services/web-development" element={<WebService />} />
          <Route path="services/repair" element={<RepairService />} />
          <Route path="services/editing" element={<EditingService />} />
          <Route path="services/tech-support" element={<TechSupport />} />
          <Route path="coming-soon" element={<ComingSoon />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdmin><AdminLayout onLogout={handleLogout} /></ProtectedAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="account-requests" element={<AdminAccountRequests />} />
          <Route path="service-requests" element={<AdminServiceRequests />} />
          <Route path="sell-requests" element={<AdminSellRequests />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Employee Auth */}
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/request-account" element={<RequestAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Employee Panel (Firebase Auth Protected) */}
        <Route path="/employee" element={<ProtectedEmployee><EmployeeLayout /></ProtectedEmployee>}>
          <Route index element={<EmployeeOverview />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="projects" element={<EmployeeProjects />} />
          <Route path="sell-project" element={<SellProjectRequest />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  )
}

export default App
