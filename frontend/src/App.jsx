import { useCallback, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'

import { StoreProvider } from './store/StoreContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'
import AIChatbot from './components/AIChatbot'
import Layout from './components/Layout'

const Hero = lazy(() => import('./components/Hero'))
const About = lazy(() => import('./pages/About'))
const PublicEmployeeProfile = lazy(() => import('./pages/PublicEmployeeProfile'))
const Services = lazy(() => import('./pages/Services'))
const Contact = lazy(() => import('./pages/Contact'))
const Help = lazy(() => import('./pages/help'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CustomProject = lazy(() => import('./pages/CustomProject'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CustomerSignup = lazy(() => import('./pages/CustomerSignup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const RoleSelect = lazy(() => import('./pages/RoleSelect'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificateRefined'))

const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'))
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'))
const GrievanceCell = lazy(() => import('./pages/legal/GrievanceCell'))

const WebService = lazy(() => import('./web-service/WebService'))
const RepairService = lazy(() => import('./technicalsupport/RepairService'))
const EditingService = lazy(() => import('./editing/EditingService'))
const TechSupport = lazy(() => import('./technicalsupport/TechSupport'))

const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminProjects = lazy(() => import('./admin/AdminProjects'))
const AdminTasks = lazy(() => import('./admin/AdminTasks'))
const AdminTeam = lazy(() => import('./admin/AdminTeam'))
const AdminEmployees = lazy(() => import('./admin/AdminEmployees'))
const AdminServices = lazy(() => import('./admin/AdminServices'))
const AdminMessages = lazy(() => import('./admin/AdminMessages'))
const AdminSales = lazy(() => import('./admin/AdminSales'))
const AdminAccountRequests = lazy(() => import('./admin/AdminAccountRequests'))
const AdminSellRequests = lazy(() => import('./admin/AdminSellRequests'))
const AdminServiceRequests = lazy(() => import('./admin/AdminServiceRequests'))
const AdminSettings = lazy(() => import('./admin/AdminSettings'))
const AdminCustomers = lazy(() => import('./admin/AdminCustomers'))

const EmployeeLogin = lazy(() => import('./employee/EmployeeLogin'))
const RequestAccount = lazy(() => import('./pages/RequestAccount'))

const EmployeeLayout = lazy(() => import('./employee/EmployeeLayout'))
const EmployeeOverview = lazy(() => import('./employee/EmployeeOverview'))
const EmployeeTasks = lazy(() => import('./employee/EmployeeTasksRefined'))
const EmployeeProjects = lazy(() => import('./employee/EmployeeProjectsRefined'))
const EmployeeProfile = lazy(() => import('./employee/EmployeeProfileRefined'))
const SellProjectRequest = lazy(() => import('./employee/SellProjectRequestRefined'))
const EmployeeChat = lazy(() => import('./employee/EmployeeChatRefined'))
const EmployeeBroadcast = lazy(() => import('./employee/EmployeeBroadcastRefined'))

const CustomerLayout = lazy(() => import('./customer/CustomerLayout'))
const CustomerOverview = lazy(() => import('./customer/CustomerOverview'))
const CustomerOrders = lazy(() => import('./customer/CustomerOrders'))
const CustomerSupport = lazy(() => import('./customer/CustomerSupport'))
const CustomerProfile = lazy(() => import('./customer/CustomerProfile'))
const CustomerCertificates = lazy(() => import('./customer/CustomerCertificates'))

const ChatPage = lazy(() => import('./pages/ChatPage'))
const AdminCourses = lazy(() => import('./admin/AdminCourses'))
const AdminCourseCategories = lazy(() => import('./admin/AdminCourseCategories'))
const AdminCourseEnrollments = lazy(() => import('./admin/AdminCourseEnrollments'))
const EmployeeCourseManage = lazy(() => import('./employee/EmployeeCourseManageRefined'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const CustomerMyCourses = lazy(() => import('./customer/CustomerMyCourses'))
const AboutTradingMentorship = lazy(() => import('./pages/AboutTradingMentorship'))

const employeeRoles = ['employee', 'mentor']

const getHomePathForRole = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'customer') return '/customer'
  if (employeeRoles.includes(role)) return '/employee'
  return '/login'
}

function ProtectedAdmin({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return null
  if (!currentUser) {
    return <Navigate to="/admin-login" replace />
  }
  if (currentUser.role !== 'admin') {
    return <Navigate to={getHomePathForRole(currentUser.role)} replace />
  }
  return children
}

function ProtectedEmployee({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (!employeeRoles.includes(currentUser.role)) {
    return <Navigate to={getHomePathForRole(currentUser.role)} replace />
  }
  return children
}

function ProtectedCustomer({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'customer') {
    return <Navigate to={getHomePathForRole(currentUser.role)} replace />
  }
  return children
}

function RoleRedirect() {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to={getHomePathForRole(currentUser.role)} replace />
}

function AppContent() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const allowedChatbotPaths = ['/about', '/courses', '/services', '/projects', '/contact']
  const isHome = location.pathname === '/'
  const isAllowedPath = allowedChatbotPaths.some(path => location.pathname.startsWith(path))
  const isVerifyPage = location.pathname.startsWith('/verify')
  const showChatbot = (isHome || isAllowedPath) && !isVerifyPage

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  return (
    <ErrorBoundary fallback={
      <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: 12 }}>Component Error</h2>
        <p>A module failed to load. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Refresh Page</button>
      </div>
    }>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Hero />} />
            <Route path="about" element={<About />} />
            <Route path="team/:profileId" element={<PublicEmployeeProfile />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetails />} />
            <Route path="checkout/:slug" element={<Checkout />} />
            <Route path="contact" element={<Contact />} />
            <Route path="custom-project" element={<CustomProject />} />
            <Route path="help" element={<Help />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="services/web-development" element={<WebService />} />
            <Route path="services/repair" element={<RepairService />} />
            <Route path="services/editing" element={<EditingService />} />
            <Route path="services/tech-support" element={<TechSupport />} />
            <Route path="services/trading-mentorship" element={<AboutTradingMentorship />} />
            <Route path="trading-mentorship" element={<AboutTradingMentorship />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:slug" element={<CourseDetailPage />} />
            <Route path="coming-soon" element={<ComingSoon />} />
            <Route path="join-us" element={<RoleSelect />} />
            <Route path="signup" element={<CustomerSignup />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="verify" element={<VerifyCertificate />} />
            
            {/* Legal Pages */}
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="grievance" element={<GrievanceCell />} />
          </Route>

          {/* Role-based redirect */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdmin><AdminLayout onLogout={handleLogout} /></ProtectedAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="account-requests" element={<AdminAccountRequests />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
            <Route path="sell-requests" element={<AdminSellRequests />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="course-categories" element={<AdminCourseCategories />} />
            <Route path="course-enrollments" element={<AdminCourseEnrollments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Employee Auth */}
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/request-account" element={<RequestAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />

          {/* Employee Panel */}
          <Route path="/employee" element={<ProtectedEmployee><EmployeeLayout /></ProtectedEmployee>}>
            <Route index element={<EmployeeOverview />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="projects" element={<EmployeeProjects />} />
            <Route path="sell-project" element={<SellProjectRequest />} />
            <Route path="course-manage" element={<EmployeeCourseManage />} />
            <Route path="broadcast" element={<EmployeeBroadcast />} />
            <Route path="chat" element={<EmployeeChat />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* Customer Panel */}
          <Route path="/customer" element={<ProtectedCustomer><CustomerLayout /></ProtectedCustomer>}>
            <Route index element={<CustomerOverview />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="trading-mentorship" element={<AboutTradingMentorship />} />
            <Route path="my-courses" element={<CustomerMyCourses />} />
            <Route path="certificates" element={<CustomerCertificates />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
        </Routes>
      </Suspense>
      {/* Global AI Chatbot Widget */}
      {showChatbot && <AIChatbot />}
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  )
}
