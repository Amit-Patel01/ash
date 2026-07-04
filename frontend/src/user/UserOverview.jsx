import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  BookOpen, 
  Award, 
  ShoppingBag, 
  ChevronRight, 
  Play, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function UserOverview() {
  const { currentUser, userProfile } = useAuth()
  const { orders, getUserEnrollments, courses, certificates } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Load lesson progress count
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0)

  useEffect(() => {
    if (!currentUser?.uid) return
    try {
      const progressKey = `solutionhub:lms-progress:${currentUser.uid}`
      const savedProgress = JSON.parse(localStorage.getItem(progressKey) || '{}')
      if (savedProgress && typeof savedProgress === 'object') {
        setCompletedLessonsCount(Object.keys(savedProgress).length)
      }
    } catch (e) {
      console.error(e)
    }
  }, [currentUser])

  // Get student's enrollments & active courses
  const myEnrollments = useMemo(() => {
    return currentUser ? getUserEnrollments(currentUser.uid) : []
  }, [getUserEnrollments, currentUser])

  // Map enrollments to courses
  const myCourses = useMemo(() => {
    return myEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId || (enrollment.courseTitle && c.title === enrollment.courseTitle))
      return {
        enrollment,
        course: course || {
          title: enrollment.courseTitle || enrollment.courseName || 'Active Track',
          category: enrollment.category || 'Technology',
          deliveryType: enrollment.deliveryType || 'course',
          materials: []
        }
      }
    })
  }, [myEnrollments, courses])

  // Get student's certificates
  const myCertificatesCount = useMemo(() => {
    if (!currentUser) return 0
    return certificates.filter(cert => {
      if (cert.status !== 'approved' && cert.status !== 'active') return false
      const uid = currentUser.uid
      const email = currentUser.email
      if (uid && cert.userId === uid) return true
      if (uid && cert.assignedEmployeeUid === uid) return true
      if (email && cert.assignedEmployeeEmail === email) return true
      return false
    }).length
  }, [certificates, currentUser])

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  const totalSpent = myOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length
  const recentOrders = myOrders.slice(0, 3)

  const userName = userProfile?.displayName || currentUser?.displayName || 'Student'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Premium Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-650 p-8 sm:p-10 border border-white/10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/10 uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Student Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <br className="xs:hidden" />
            <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">{userName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 font-medium max-w-md leading-relaxed">
            Ready to continue your tech journey? Access your enrolled tracks, download documents, or explore help desk tickets directly from here.
          </p>
          <div className="pt-2">
            <Link 
              to="/user/my-courses" 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-600 hover:bg-slate-100 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              Continue Learning <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Tracks', value: myCourses.length, icon: BookOpen, color: 'from-blue-500 to-indigo-650', glow: 'rgba(59,130,246,0.25)' },
          { label: 'Lessons Completed', value: completedLessonsCount, icon: Play, color: 'from-purple-500 to-violet-650', glow: 'rgba(139,92,246,0.25)' },
          { label: 'Verified Certificates', value: myCertificatesCount, icon: Award, color: 'from-emerald-500 to-green-650', glow: 'rgba(16,185,129,0.25)' },
          { label: 'Enrolled Orders', value: myOrders.length, icon: ShoppingBag, color: 'from-pink-500 to-rose-650', glow: 'rgba(236,72,153,0.25)' },
        ].map((stat, i) => {
          const IconComp = stat.icon
          return (
            <div 
              key={i} 
              className={`backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 shadow-glass hover:shadow-glass-hover group relative overflow-hidden ${
                isDark 
                  ? 'bg-slate-900/35 border-white/[0.06] hover:bg-slate-900/50 hover:border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.15)]' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-[0_8px_30px_rgba(148,163,184,0.25)]'
              }`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                style={{ background: `radial-gradient(circle at 50% 50%, ${stat.glow} 0%, transparent 60%)` }}
              />
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300 mb-4 text-white`}>
                <IconComp className="w-5 h-5" />
              </div>
              <p className={`text-3xl font-extrabold tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className={`text-xs font-semibold mt-1 uppercase tracking-wider relative z-10 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enrolled Courses / Progress Section */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden flex flex-col justify-between min-h-[360px] lg:col-span-2 ${
          isDark 
            ? 'bg-slate-900/35 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.15)]' 
            : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 shadow-[0_8px_30px_rgba(148,163,184,0.25)]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <BookOpen className="w-5 h-5 text-blue-500" />
                Active Learning Tracks
              </h3>
              {myCourses.length > 0 && (
                <Link to="/user/my-courses" className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {myCourses.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50/60 border-blue-200'}`}>
                <p className={`font-medium text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>You haven't enrolled in any tracks yet</p>
                <Link to="/courses" className="text-blue-600 text-xs hover:text-blue-700 mt-2 font-bold inline-block">Explore Internship Tracks</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.slice(0, 3).map(({ course, enrollment }) => (
                  <div 
                    key={enrollment.id} 
                    className={`p-4 border rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark 
                        ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.05]' 
                        : 'bg-slate-50 hover:bg-white border-slate-200 shadow-[0_4px_20px_rgba(148,163,184,0.15)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 px-2 py-0.5 rounded bg-blue-100">
                        {course.category}
                      </span>
                      <h4 className={`text-sm font-bold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{course.title}</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Mode: {course.deliveryType === 'course' ? 'Self-Paced Learning' : 'Internship & Training'}</p>
                    </div>
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <Link 
                        to="/user/my-courses"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs font-bold rounded-xl transition-all text-white text-center shadow-md"
                      >
                        Enter LMS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden flex flex-col justify-between ${
          isDark 
            ? 'bg-slate-900/35 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.15)]' 
            : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50 shadow-[0_8px_30px_rgba(148,163,184,0.25)]'
        }`}>
          <div>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-5 h-5 text-purple-500" />
              Quick Shortcuts
            </h3>
            <div className="space-y-3">
              <Link 
                to="/courses" 
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all group ${
                  isDark 
                    ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08]' 
                    : 'bg-blue-50/60 border-blue-100 hover:bg-blue-50 shadow-[0_4px_20px_rgba(148,163,184,0.1)]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-650 flex items-center justify-center text-white shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Courses Directory</p>
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Explore new technologies</p>
                </div>
              </Link>

              <Link 
                to="/user/certificates" 
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all group ${
                  isDark 
                    ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08]' 
                    : 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50 shadow-[0_4px_20px_rgba(148,163,184,0.1)]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-650 flex items-center justify-center text-white shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold group-hover:text-emerald-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Documents & Certificates</p>
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Download offer letters</p>
                </div>
              </Link>

              <Link 
                to="/user/support" 
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all group ${
                  isDark 
                    ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08]' 
                    : 'bg-purple-50/60 border-purple-100 hover:bg-purple-50 shadow-[0_4px_20px_rgba(148,163,184,0.1)]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-650 flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold group-hover:text-purple-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Help Desk Chat</p>
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Instant query support</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Purchases Section */}
      <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 transition-colors ${
        isDark 
          ? 'bg-slate-900/35 border-white/[0.06] hover:bg-slate-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.15)]' 
          : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-slate-50 shadow-[0_8px_30px_rgba(148,163,184,0.25)]'
      }`}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <ShoppingBag className="w-5 h-5 text-pink-500" />
          Recent Orders
        </h3>
        {recentOrders.length === 0 ? (
          <div className={`text-center py-10 rounded-2xl border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-pink-50/60 border-pink-200'}`}>
            <p className={`font-medium text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No transaction records found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map(order => (
              <div 
                key={order.id} 
                className={`p-5 border rounded-2xl transition-all space-y-4 ${
                  isDark 
                    ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.05]' 
                    : 'bg-slate-50 hover:bg-white border-slate-200 shadow-[0_4px_20px_rgba(148,163,184,0.15)]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold truncate max-w-[150px] ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{order.project_title || 'Project Enrollment'}</h4>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{order.date || 'Recent purchase'}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <div className={`flex justify-between items-center border-t pt-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Amount Paid</span>
                  <span className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{Number(order.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}