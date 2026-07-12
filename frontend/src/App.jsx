import { useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'

import { StoreProvider, useStore } from './store/StoreContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'
import AIChatbot from './components/AIChatbot'
import Layout from './components/Layout'
import { getHomePathForRole, isEmployeeRole, normalizeUserRole } from './utils/roles'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'

const MODULE_ERROR_AUTO_REFRESH_KEY = 'module-error-auto-refresh-count'
const MODULE_ERROR_CACHE_BUST_KEY = 'module-error-cache-bust-count'
const MAX_MODULE_ERROR_AUTO_REFRESHES = 5
const MAX_MODULE_ERROR_CACHE_BUSTS = 1
const MODULE_ERROR_REFRESH_DELAY_MS = 350
const MODULE_LOAD_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'failed to load module script',
  'error loading dynamically imported module',
  'importing a module script failed',
  'chunkloaderror',
  'loading chunk',
  'module script',
  'dynamically imported module',
]

const getModuleErrorAutoRefreshCount = () =>
  Number.parseInt(window.sessionStorage.getItem(MODULE_ERROR_AUTO_REFRESH_KEY) || '0', 10) || 0

const getModuleErrorCacheBustCount = () =>
  Number.parseInt(window.sessionStorage.getItem(MODULE_ERROR_CACHE_BUST_KEY) || '0', 10) || 0

const resetModuleErrorAutoRefreshCount = () => {
  window.sessionStorage.setItem(MODULE_ERROR_AUTO_REFRESH_KEY, '0')
  window.sessionStorage.setItem(MODULE_ERROR_CACHE_BUST_KEY, '0')
}

const isRecoverableModuleLoadError = (error) => {
  const message = `${error?.name || ''} ${error?.message || ''}`.toLowerCase()
  return MODULE_LOAD_ERROR_PATTERNS.some(pattern => message.includes(pattern))
}

/**
 * Enhanced lazy loader that detects module load failures (e.g. after a new deployment)
 * and automatically triggers a page refresh to fetch the latest bundles.
 */
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )

    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      resetModuleErrorAutoRefreshCount()
      return component
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        // Module load failed, likely due to a new deployment (old chunk hash missing)
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        window.location.reload()
        return { default: () => null }
      }

      // If we already refreshed once and it still fails, bubble up to ErrorBoundary
      throw error
    }
  })

function ModuleLoadErrorFallback({ error }) {
  const hasScheduledRefresh = useRef(false)

  useEffect(() => {
    if (hasScheduledRefresh.current) {
      return undefined
    }

    hasScheduledRefresh.current = true
    const refreshCount = getModuleErrorAutoRefreshCount()
    const isModuleLoadIssue = isRecoverableModuleLoadError(error)

    const timeoutId = window.setTimeout(() => {
      if (isModuleLoadIssue && refreshCount < MAX_MODULE_ERROR_AUTO_REFRESHES) {
        window.sessionStorage.setItem(
          MODULE_ERROR_AUTO_REFRESH_KEY,
          String(refreshCount + 1)
        )
        window.location.reload()
        return
      }

      const cacheBustCount = getModuleErrorCacheBustCount()
      if (isModuleLoadIssue && cacheBustCount < MAX_MODULE_ERROR_CACHE_BUSTS) {
        const url = new URL(window.location.href)
        url.searchParams.set('app_reload', String(Date.now()))
        window.sessionStorage.setItem(MODULE_ERROR_CACHE_BUST_KEY, String(cacheBustCount + 1))
        window.location.replace(url.toString())
      }
    }, MODULE_ERROR_REFRESH_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [error])

  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(160deg,#f0f7ff 0%,#faf8ff 50%,#eff6ff 100%)',
      }}
    />
  )
}

const Hero = lazyWithRetry(() => import('./components/Hero'))
const About = lazyWithRetry(() => import('./pages/About'))
const PublicEmployeeProfile = lazyWithRetry(() => import('./pages/PublicEmployeeProfile'))
const Services = lazyWithRetry(() => import('./pages/Services'))
const Contact = lazyWithRetry(() => import('./pages/Contact'))
const Infrastructure = lazyWithRetry(() => import('./pages/Infrastructure'))
const Help = lazyWithRetry(() => import('./pages/help'))
const Projects = lazyWithRetry(() => import('./pages/Projects'))
const ProjectDetails = lazyWithRetry(() => import('./pages/ProjectDetails'))
const Checkout = lazyWithRetry(() => import('./pages/Checkout'))
const CustomProject = lazyWithRetry(() => import('./pages/CustomProject'))
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'))
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'))
const StudentSignup = lazyWithRetry(() => import('./pages/StudentSignup'))
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'))
const RoleSelect = lazyWithRetry(() => import('./pages/RoleSelect'))
const ComingSoon = lazyWithRetry(() => import('./pages/ComingSoon'))
const VerifyCertificate = lazyWithRetry(() => import('./pages/VerifyCertificateRefined'))

const PrivacyPolicy = lazyWithRetry(() => import('./pages/legal/PrivacyPolicy'))
const TermsOfService = lazyWithRetry(() => import('./pages/legal/TermsOfService'))
const RefundPolicy = lazyWithRetry(() => import('./pages/legal/RefundPolicy'))
const GrievanceCell = lazyWithRetry(() => import('./pages/legal/GrievanceCell'))

const WebService = lazyWithRetry(() => import('./web-service/WebService'))
const RepairService = lazyWithRetry(() => import('./technicalsupport/RepairService'))
const EditingService = lazyWithRetry(() => import('./editing/EditingService'))
const TechSupport = lazyWithRetry(() => import('./technicalsupport/TechSupport'))

const AdminLayout = lazyWithRetry(() => import('./admin/AdminLayout'))
const AdminDashboard = lazyWithRetry(() => import('./admin/AdminDashboard'))
const AdminProjects = lazyWithRetry(() => import('./admin/AdminProjects'))
const AdminTasks = lazyWithRetry(() => import('./admin/AdminTasks'))
const AdminTeam = lazyWithRetry(() => import('./admin/AdminTeam'))
const AdminEmployees = lazyWithRetry(() => import('./admin/AdminEmployees'))
const AdminPermissions = lazyWithRetry(() => import('./admin/AdminPermissions'))
const AdminServices = lazyWithRetry(() => import('./admin/AdminServices'))
const AdminMessages = lazyWithRetry(() => import('./admin/AdminMessages'))
const AdminSales = lazyWithRetry(() => import('./admin/AdminSales'))
const AdminReceipts = lazyWithRetry(() => import('./admin/AdminReceipts'))
const AdminAccountRequests = lazyWithRetry(() => import('./admin/AdminAccountRequests'))
const AdminSellRequests = lazyWithRetry(() => import('./admin/AdminSellRequests'))
const AdminServiceRequests = lazyWithRetry(() => import('./admin/AdminServiceRequests'))
const AdminSettings = lazyWithRetry(() => import('./admin/AdminSettings'))
const AdminStudents = lazyWithRetry(() => import('./admin/AdminStudents'))
const AdminQrCertificates = lazyWithRetry(() => import('./admin/AdminQrCertificates'))
const AdminTestimonials = lazyWithRetry(() => import('./admin/AdminTestimonials'))
const AdminInternshipCategories = lazyWithRetry(() => import('./admin/AdminInternshipCategories'))

const RequestAccount = lazyWithRetry(() => import('./pages/RequestAccount'))

const EmployeeLayout = lazyWithRetry(() => import('./employee/EmployeeLayout'))
const EmployeeOverview = lazyWithRetry(() => import('./employee/EmployeeOverview'))
const EmployeeTasks = lazyWithRetry(() => import('./employee/EmployeeTasksRefined'))
const EmployeeProjects = lazyWithRetry(() => import('./employee/EmployeeProjectsRefined'))
const EmployeeProfile = lazyWithRetry(() => import('./employee/EmployeeProfileRefined'))
const SellProjectRequest = lazyWithRetry(() => import('./employee/SellProjectRequestRefined'))
const EmployeeChat = lazyWithRetry(() => import('./employee/EmployeeChatRefined'))
const EmployeeBroadcast = lazyWithRetry(() => import('./employee/EmployeeBroadcastRefined'))

const UserLayout = lazyWithRetry(() => import('./user/UserLayout'))
const UserOverview = lazyWithRetry(() => import('./user/UserOverview'))
const UserOrders = lazyWithRetry(() => import('./user/UserOrders'))
const UserSupport = lazyWithRetry(() => import('./user/UserSupport'))
const UserProfile = lazyWithRetry(() => import('./user/UserProfile'))
const UserCertificates = lazyWithRetry(() => import('./user/UserCertificates'))
const UserCustomProject = lazyWithRetry(() => import('./user/UserCustomProject'))

const ChatPage = lazyWithRetry(() => import('./pages/ChatPage'))
const AdminCourses = lazyWithRetry(() => import('./admin/AdminCourses'))
const AdminCoupons = lazyWithRetry(() => import('./admin/AdminCoupons'))
const AdminCourseCategories = lazyWithRetry(() => import('./admin/AdminCourseCategories'))
const AdminCourseEnrollments = lazyWithRetry(() => import('./admin/AdminCourseEnrollments'))
const EmployeeCourseManage = lazyWithRetry(() => import('./employee/EmployeeCourseManageRefined'))
const CoursesPage = lazyWithRetry(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazyWithRetry(() => import('./pages/CourseDetailPage'))
const ProgramsPage = lazyWithRetry(() => import('./pages/ProgramsPage'))
const UserMyCourses = lazyWithRetry(() => import('./user/UserMyCourses'))
const AboutTradingMentorship = lazyWithRetry(() => import('./pages/AboutTradingMentorship'))

function AppShellFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(160deg,#f0f7ff 0%,#faf8ff 50%,#eff6ff 100%)',
      }}
    />
  )
}

function ProtectedAdmin({ children }) {
  const { currentUser, loading } = useAuth()
  const normalizedRole = normalizeUserRole(currentUser?.role)

  if (loading) return null
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  if (normalizedRole !== 'admin') {
    return <Navigate to={getHomePathForRole(normalizedRole)} replace />
  }
  return children
}

function ProtectedEmployee({ children }) {
  const { currentUser, loading } = useAuth()
  const normalizedRole = normalizeUserRole(currentUser?.role)

  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (!isEmployeeRole(normalizedRole)) {
    return <Navigate to={getHomePathForRole(normalizedRole)} replace />
  }
  return children
}

function ProtectedStudent({ children }) {
  const { currentUser, loading } = useAuth()
  const normalizedRole = normalizeUserRole(currentUser?.role)

  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (normalizedRole !== 'student') {
    return <Navigate to={getHomePathForRole(normalizedRole)} replace />
  }
  return children
}

function RoleRedirect() {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to={getHomePathForRole(currentUser.role)} replace />
}

function MaintenancePage({ message }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        padding: '50px 30px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 8vw, 3rem)',
          background: 'linear-gradient(to right, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          margin: '0 0 16px 0'
        }}>Under Maintenance</h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#94a3b8',
          lineHeight: 1.8,
          margin: '0 0 32px 0'
        }}>
          {message || "We are currently upgrading our systems with exciting new features to bring you a better experience. We'll be back online shortly. Thank you for your patience!"}
        </p>
        <p style={{
          fontSize: '0.9rem',
          color: '#cbd5e1',
          lineHeight: 1.7,
          margin: '0 0 28px 0'
        }}>
          For urgent help, contact <strong style={{ color: '#ffffff' }}>support@amitsolutionhub.com</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '14px', height: '14px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
          <div style={{ width: '14px', height: '14px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
          <div style={{ width: '14px', height: '14px', background: '#818cf8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
        </div>
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-15px) }
          100% { transform: translateY(0px) }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0) }
          40% { transform: scale(1) }
        }
      `}</style>
    </div>
  )
}

function AppContent() {
  const { maintenance } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/login'
  const isMaintenanceActive = false // manually forced on
  const allowedChatbotPaths = ['/about', '/courses', '/services', '/projects', '/contact', '/infrastructure']
  const isHome = location.pathname === '/'
  const isAllowedPath = allowedChatbotPaths.some(path => location.pathname.startsWith(path))
  const isVerifyPage = location.pathname.startsWith('/verify')
  const showChatbot = (isHome || isAllowedPath) && !isVerifyPage

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        const anchor = document.getElementById(location.hash.slice(1))
        if (anchor) {
          anchor.scrollIntoView({ block: 'start' })
        }
      })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search, location.hash])

  if (isMaintenanceActive && !isAdminRoute) {
    return <MaintenancePage message={maintenance?.message} />
  }

  return (
    <ErrorBoundary FallbackComponent={ModuleLoadErrorFallback}>
      <Suspense fallback={<AppShellFallback />}>
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
            <Route path="infrastructure" element={<Infrastructure />} />
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
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="coming-soon" element={<ComingSoon />} />
            <Route path="join-us" element={<RoleSelect />} />
            <Route path="signup" element={<StudentSignup />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="verify" element={<VerifyCertificate />} />
            <Route path="verify/:certificateId/*" element={<VerifyCertificate />} />
            
            {/* Legal Pages */}
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="grievance" element={<GrievanceCell />} />
          </Route>

          {/* Role-based redirect */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<ProtectedAdmin><AdminLayout onLogout={handleLogout} /></ProtectedAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="qr-certificates" element={<AdminQrCertificates />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="receipts" element={<AdminReceipts />} />
            <Route path="account-requests" element={<AdminAccountRequests />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
            <Route path="sell-requests" element={<AdminSellRequests />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="course-categories" element={<AdminCourseCategories />} />
            <Route path="course-enrollments" element={<AdminCourseEnrollments />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="internship-categories" element={<AdminInternshipCategories />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* User & Employee Auth Routes */}
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
            <Route path="enrollments" element={<AdminCourseEnrollments />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="account-requests" element={<AdminAccountRequests />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="certificates" element={<AdminQrCertificates />} />
            <Route path="broadcast" element={<EmployeeBroadcast />} />
            <Route path="chat" element={<EmployeeChat />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* User Panel */}
          <Route path="/user" element={<ProtectedStudent><UserLayout /></ProtectedStudent>}>
            <Route index element={<UserOverview />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="support" element={<UserSupport />} />
            <Route path="trading-mentorship" element={<AboutTradingMentorship />} />
            <Route path="my-courses" element={<UserMyCourses />} />
            <Route path="certificates" element={<UserCertificates />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="custom-project" element={<UserCustomProject />} />
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
                <SpeedInsights />
                <Analytics />
              </ChatProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  )
}
