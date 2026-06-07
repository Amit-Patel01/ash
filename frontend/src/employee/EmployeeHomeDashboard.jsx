import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee,
} from './employeeUtils'
const isDone = (status) => ['done', 'completed', 'complete', 'closed'].includes(normalize(status))
const isProgress = (status) => ['in-progress', 'in progress', 'progress', 'working'].includes(normalize(status))

const getTimeValue = (value) => {
  if (!value) return 0
  if (typeof value?.toMillis === 'function') return value.toMillis()
  const date = value?.toDate ? value.toDate() : new Date(value)
  const time = date.getTime()
  return Number.isFinite(time) ? time : 0
}

const formatTimeAgo = (value) => {
  const time = getTimeValue(value)
  if (!time) return 'just now'
  const diff = Math.floor((Date.now() - time) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(time).toLocaleDateString('en-IN')
}

/* ─── Stat card icon definitions ────────────────────────────────── */
const statDefinitions = [
  {
    key: 'tasks',
    label: 'Total Tasks',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    glow: 'rgba(99,102,241,0.35)',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    key: 'projects',
    label: 'Projects',
    gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
    glow: 'rgba(168,85,247,0.35)',
    iconPath: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  },
  {
    key: 'courses',
    label: 'Courses',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(245,158,11,0.35)',
    iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    key: 'students',
    label: 'Students',
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    glow: 'rgba(16,185,129,0.35)',
    iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
]

function StatCard({ label, value, hint, gradient, glow, iconPath }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${glow}, 0 4px 24px rgba(0,0,0,0.3)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: gradient.replace('135deg', '145deg').replace(')', ', transparent)'), opacity: 0.05 }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-black text-white tracking-tight">{value}</p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-500">{hint}</p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: gradient, boxShadow: `0 4px 16px ${glow}` }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
    </div>
  )
}

function ProgressBar({ progress, gradient = 'linear-gradient(90deg,#10b981,#06b6d4)' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${progress}%`, background: gradient }}
      />
    </div>
  )
}

export default function EmployeeHomeDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { tasks, projects, teamMembers, courses, enrollments } = useStore()

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const displayName = userProfile?.displayName || currentUser?.displayName || memberData?.name || 'Employee'
  const roleLabel = userProfile?.jobTitle || memberData?.role || (userProfile?.role === 'mentor' ? 'Mentor' : 'Employee')
  const departmentLabel = userProfile?.department || memberData?.department || 'Operations'
  const employeeId = userProfile?.employeeId || currentUser?.employeeId || memberData?.employeeId || ''
  const employeeEmail = currentUser?.email || userProfile?.email || memberData?.email || ''
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'EM'

  const identities = useMemo(
    () => getEmployeeIdentitySet(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myTasks = useMemo(
    () => tasks.filter((task) => taskBelongsToEmployee(task, identities)),
    [tasks, identities]
  )

  const myProjects = useMemo(() => {
    const projectNames = [...new Set(myTasks.map(task => task.project).filter(Boolean))]
    return projectNames.map(name => {
      const projectTasks = myTasks.filter(task => task.project === name)
      const completed = projectTasks.filter(task => isDone(task.status)).length
      const linkedProject = projects.find(project => normalize(project.title) === normalize(name))
      return {
        id: linkedProject?.id || name,
        name,
        total: projectTasks.length,
        completed,
        progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
      }
    }).sort((a, b) => b.total - a.total)
  }, [myTasks, projects])

  const employeeKeys = useMemo(
    () => [...new Set([currentUser?.uid, userProfile?.uid, employeeId].filter(Boolean))],
    [currentUser?.uid, userProfile?.uid, employeeId]
  )

  const courseCards = useMemo(() => courses
    .filter(course => employeeKeys.includes(course.assignedEmployeeId) || employeeKeys.includes(course.assignedEmployeeRef))
    .map(course => {
      const students = enrollments.filter(enrollment =>
        enrollment.status === 'active' &&
        (enrollment.courseId === course.id || enrollment.courseTitle === course.title)
      )
      return {
        id: course.id,
        title: course.title,
        category: course.category || 'General',
        plans: Array.isArray(course.plans) ? course.plans.length : 0,
        materials: Array.isArray(course.materials) ? course.materials.length : 0,
        meetingReady: !!course.meetingLink,
        students,
        studentCount: students.length,
      }
    })
    .sort((a, b) => b.studentCount - a.studentCount), [courses, enrollments, employeeKeys])

  const recentActivity = useMemo(() => courseCards
    .flatMap(course => course.students.map(item => ({ ...item, courseTitle: item.courseTitle || course.title })))
    .sort((a, b) => getTimeValue(b.enrolledAt) - getTimeValue(a.enrolledAt))
    .slice(0, 5), [courseCards])

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(task => isDone(task.status)).length
  const inProgressTasks = myTasks.filter(task => isProgress(task.status)).length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks
  const readyCourses = courseCards.filter(course => course.meetingReady && course.materials > 0).length
  const activeStudents = courseCards.reduce((sum, course) => sum + course.studentCount, 0)

  const taskOverviewBars = [
    { label: 'Pending', count: pendingTasks, color: '#64748b', gradient: 'linear-gradient(90deg,#64748b,#94a3b8)' },
    { label: 'In Progress', count: inProgressTasks, color: '#f59e0b', gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
    { label: 'Completed', count: completedTasks, color: '#10b981', gradient: 'linear-gradient(90deg,#10b981,#34d399)' },
  ]

  // ──────────────────────────────────────────────────────────────────────────
  // Interactive Custom States for Role Widgets
  // ──────────────────────────────────────────────────────────────────────────
  
  // HR states
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Aarav Sharma', role: 'Web Developer Intern', status: 'Pending Review', phone: '9876543210' },
    { id: 2, name: 'Isha Patel', role: 'UI/UX Intern', status: 'Interview Scheduled', phone: '8765432109' },
    { id: 3, name: 'Karan Malhotra', role: 'Content Writer Intern', status: 'Pending Review', phone: '7654321098' }
  ])
  const [attendanceSynced, setAttendanceSynced] = useState(false)
  const [isSyncingAttendance, setIsSyncingAttendance] = useState(false)

  // Support states
  const [tickets, setTickets] = useState([
    { id: 'TKT-201', student: 'Rohan Gupta', subject: 'Option Trading Module locked', status: 'Open' },
    { id: 'TKT-202', student: 'Sneha Reddy', subject: 'Spelling mistake on internship letter', status: 'Open' },
    { id: 'TKT-203', student: 'Amit Mishra', subject: 'WhatsApp support number query', status: 'Pending' }
  ])
  const [solvedCount, setSolvedCount] = useState(184)
  const [replyText, setReplyText] = useState('')
  const [activeTicketId, setActiveTicketId] = useState(null)

  // BDE states
  const [leads, setLeads] = useState([
    { id: 1, college: 'L.D. College of Engineering', contact: 'Dr. R. K. Patel', status: 'Pitching', type: 'MoU Partner' },
    { id: 2, college: 'Nirma University', contact: 'Prof. Anjali Shah', status: 'Meeting Fixed', type: 'Webinar Partner' },
    { id: 3, college: 'DA-IICT Gandhinagar', contact: 'Placement Cell', status: 'Signed', type: 'MoU Partner' }
  ])
  const [partnershipsCount, setPartnershipsCount] = useState(6)
  const [newLeadName, setNewLeadName] = useState('')
  const [newLeadContact, setNewLeadContact] = useState('')

  // Marketing states
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Summer Internship Drive 2026', platform: 'LinkedIn/Instagram', reach: 32400, status: 'Active' },
    { id: 2, name: 'Trading Webinar Masterclass', platform: 'Facebook/Meta Ads', reach: 10500, status: 'Active' },
    { id: 3, name: 'Tech Support Campus Outreach', platform: 'Direct/Email', reach: 4500, status: 'Scheduled' }
  ])

  // Content Writer states
  const [drafts, setDrafts] = useState([
    { id: 1, title: 'Top 10 Frontend Projects for Resume', type: 'Blog Post', wordCount: 1200, status: 'Writing' },
    { id: 2, title: 'BDE Internship Syllabus Guide', type: 'LMS Material', wordCount: 850, status: 'Reviewing' },
    { id: 3, title: 'Trading Module 3 Quiz descriptions', type: 'Certificate Copy', wordCount: 350, status: 'Approved' }
  ])

  // LMS states
  const [coursesProgress, setCoursesProgress] = useState([
    { id: 1, title: 'Trading Mentorship 101', uploadedVideos: 12, totalVideos: 15, status: 'Editing' },
    { id: 2, title: 'Advanced Technical Analysis', uploadedVideos: 8, totalVideos: 8, status: 'Published' }
  ])

  // Training states
  const [sessions, setSessions] = useState([
    { id: 1, topic: 'React Hook Form & Validation', trainer: 'Developer Amit', time: 'Today, 4:00 PM', meetingLink: 'https://meet.google.com/abc-defg-hij' },
    { id: 2, topic: 'Sales Outreach Pitch Prep', trainer: 'BDE Lead Shah', time: 'Tomorrow, 11:30 AM', meetingLink: 'https://meet.google.com/klm-nopq-rst' }
  ])

  // Project Coordinator states
  const [reports, setReports] = useState([
    { id: 1, intern: 'Deepak Das', project: 'AI Medical Assistant', week: 'Week 3 Report', status: 'Pending Review' },
    { id: 2, intern: 'Karan Kumar', project: 'E-commerce API with Node', week: 'Week 2 Report', status: 'Verified' },
    { id: 3, intern: 'Meera Sen', project: 'Creative Portfolio', week: 'Week 4 Report', status: 'Pending Review' }
  ])

  // Graphic Designer states
  const [designTasks, setDesignTasks] = useState([
    { id: 1, item: 'Poster - Placement Drive TCS', type: 'Creative', status: 'In Progress' },
    { id: 2, item: 'Trading Mentorship Certificate Layout', type: 'Template', status: 'Pending Approval' },
    { id: 3, item: 'Social Banner - MSME Approval', type: 'Creative', status: 'Approved' }
  ])

  // Web Developer states
  const [bugList, setBugList] = useState([
    { id: 'BUG-402', title: 'PDF export alignment shift on mobile Safari', priority: 'High', status: 'Investigating' },
    { id: 'BUG-403', title: 'Dark mode color contrast in LMS sidebar', priority: 'Low', status: 'Open' }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStep, setDeployStep] = useState('')

  // Operations states
  const [checklists, setChecklists] = useState([
    { id: 1, task: 'Verify employee attendance logs', completed: false },
    { id: 2, task: 'Sync course curriculum data with LMS', completed: true },
    { id: 3, task: 'Verify student certificate requests', completed: false }
  ])

  // Placement states
  const [jobOpenings, setJobOpenings] = useState([
    { id: 1, company: 'TCS', role: 'Frontend Developer', package: '4.8 LPA', date: 'June 12', applicants: 18 },
    { id: 2, company: 'SolutionHub Labs', role: 'Business Development Associate', package: '5.2 LPA', date: 'June 18', applicants: 9 }
  ])

  // ──────────────────────────────────────────────────────────────────────────
  // Role Mapping Logic
  // ──────────────────────────────────────────────────────────────────────────
  const normalizedRoleKey = String(roleLabel || '').trim().toLowerCase()

  const welcomeMessage = useMemo(() => {
    switch (normalizedRoleKey) {
      case 'hr & recruitment executive':
        return 'Coordinate interviews, screen incoming candidates, and welcome new members to SolutionHub.'
      case 'student support executive':
        return 'Help students with their queries, resolve doubts, and keep their learning journey smooth.'
      case 'business development executive (bde)':
        return 'Drive partnerships, connect with colleges, generate leads, and grow SolutionHub.'
      case 'marketing executive':
        return 'Manage social media campaigns, create viral creatives, and expand SolutionHub\'s reach.'
      case 'content writer':
        return 'Draft engaging blogs, design course materials, and refine certificate descriptions.'
      case 'lms coordinator':
        return 'Keep the LMS portal updated, upload courses, and track student completion metrics.'
      case 'training coordinator':
        return 'Schedule trainer-student sessions, update meeting schedules, and collect session feedback.'
      case 'project coordinator':
        return 'Assign projects to interns, track weekly progress reports, and guide development.'
      case 'graphic designer':
        return 'Design premium posters, certificate templates, and stunning branding visuals.'
      case 'web development intern/executive':
        return 'Maintain website systems, deploy technical updates, and build new LMS features.'
      case 'operations executive':
        return 'Handle daily documentation, coordinate team task-boards, and ensure smooth operations.'
      case 'placement & career support executive':
        return 'Conduct resume reviews, guide student careers, and bring placement drives.'
      default:
        return 'Your central hub for tasks, courses, student activity, and team communication — all in one focused workspace.'
    }
  }, [normalizedRoleKey])

  const roleStatsMap = {
    'hr & recruitment executive': [
      { label: 'Screened Candidates', value: '47', hint: '+12 this week', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'hr' },
      { label: 'Interviews Scheduled', value: String(candidates.filter(c => c.status === 'Interview Scheduled').length), hint: 'Check interview pipeline', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'interview' },
      { label: 'Joining Processing', value: '5', hint: '2 onboarding docs pending', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'joining' },
      { label: 'Active Employees', value: String(teamMembers.length || 32), hint: 'Attendance logged', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'employees' },
    ],
    'student support executive': [
      { label: 'Open Queries', value: String(tickets.filter(t => t.status !== 'Resolved').length), hint: 'Avg response time: 8m', gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(244,63,94,0.35)', icon: 'ticket' },
      { label: 'Pending Support', value: '3', hint: 'Escalated to coordinator', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'pending' },
      { label: 'Queries Solved', value: String(solvedCount), hint: '98.4% satisfaction', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'check' },
      { label: 'Active Chats', value: '14', hint: 'WhatsApp/Email support active', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'chat' },
    ],
    'business development executive (bde)': [
      { label: 'Leads Generated', value: '118', hint: '24 from direct contact', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'leads' },
      { label: 'Meetings Fixed', value: String(leads.filter(l => l.status === 'Meeting Fixed').length), hint: 'Campus partnerships pending', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'meeting' },
      { label: 'Partnerships Signed', value: String(partnershipsCount), hint: 'Active college MoUs', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'partnership' },
      { label: 'Sales Target Status', value: '78%', hint: '₹1.8L generated this month', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'target' },
    ],
    'marketing executive': [
      { label: 'Active Campaigns', value: String(campaigns.filter(c => c.status === 'Active').length), hint: 'Summer Internship Drive', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'campaign' },
      { label: 'Social Reach', value: '42K', hint: '+14% impressions gain', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'reach' },
      { label: 'Campaign Signups', value: '312', hint: 'CPA: ₹42 / registration', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'leads' },
      { label: 'Creatives Posted', value: '18', hint: '4 scheduled for post', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'creatives' },
    ],
    'content writer': [
      { label: 'Blogs Written', value: String(drafts.filter(d => d.type === 'Blog Post').length), hint: '3 drafts pending review', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'write' },
      { label: 'Internship Materials', value: '45', hint: '2 revised syllabus texts', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'book' },
      { label: 'Cert Descriptions', value: '9', hint: 'All types mapped', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'certificate' },
      { label: 'Copy Task Progress', value: '4/6', hint: '80% checklist done', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'check' },
    ],
    'lms coordinator': [
      { label: 'Active Courses', value: String(courses.length || 14), hint: 'Synchronized with DB', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'book' },
      { label: 'Student Enrollments', value: String(enrollments.length || 1420), hint: 'Real-time sync', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'students' },
      { label: 'Course Progress Avg', value: '62%', hint: '96.4% watch progress avg', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'upload' },
      { label: 'LMS System Health', value: '100%', hint: 'All nodes online', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'health' },
    ],
    'training coordinator': [
      { label: 'Sessions Scheduled', value: String(sessions.length), hint: '5 scheduled today', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'meeting' },
      { label: 'Active Trainers', value: '7', hint: 'All assigned to slots', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'mentor' },
      { label: 'Average Attendance', value: '94%', hint: 'Average student attendance', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'students' },
      { label: 'Sessions Logged', value: '82', hint: 'Reports saved to drive', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'check' },
    ],
    'project coordinator': [
      { label: 'Intern Projects', value: String(projects.length || 9), hint: 'Active project catalog', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'folder' },
      { label: 'Assigned Interns', value: String(enrollments.filter(e => e.status === 'active').length || 124), hint: 'Active student workspace', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'students' },
      { label: 'Weekly Reports', value: String(reports.filter(r => r.status === 'Verified').length) + '/' + String(reports.length), hint: 'Verify incoming reports', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'report' },
      { label: 'Project Grade Avg', value: '92%', hint: 'Avg project score: A-', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'check' },
    ],
    'graphic designer': [
      { label: 'Pending Requests', value: String(designTasks.filter(t => t.status !== 'Approved').length), hint: '2 needed by tomorrow', gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(244,63,94,0.35)', icon: 'pending' },
      { label: 'Designs Approved', value: String(designTasks.filter(t => t.status === 'Approved').length), hint: '+5 brand mockups', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'check' },
      { label: 'Active Workloads', value: '3', hint: 'Certificates / Poster templates', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'creatives' },
      { label: 'Visual Templates', value: '14', hint: 'LMS assets catalog ready', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'partnership' },
    ],
    'web development intern/executive': [
      { label: 'Site Health Status', value: '99.9%', hint: 'Vercel status: Green', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'health' },
      { label: 'Updates Deployed', value: '18', hint: 'Latest: Certificate Export Fix', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'upload' },
      { label: 'Open Debug Bugs', value: String(bugList.length), hint: '0 critical bugs remaining', gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(244,63,94,0.35)', icon: 'ticket' },
      { label: 'LMS Integration Code', value: '6/8', hint: 'Next: Student Live Tracker', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'leads' },
    ],
    'operations executive': [
      { label: 'Daily Ops Tasks', value: String(checklists.length), hint: 'Check operational pipeline', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'task' },
      { label: 'Docs Verification', value: '94%', hint: 'Joining profiles verified', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'partnership' },
      { label: 'Incidents Logged', value: '0', hint: 'Zero issues in past 30 days', gradient: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(244,63,94,0.35)', icon: 'check' },
      { label: 'Attendance Synced', value: '✓ Yes', hint: 'Updated 2h ago', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'meeting' },
    ],
    'placement & career support executive': [
      { label: 'Resumes Reviewed', value: '82', hint: '14 reviewed today', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'partnership' },
      { label: 'Placement Drives', value: '3', hint: '1 scheduled for Friday', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'meeting' },
      { label: 'Active Job Openings', value: String(jobOpenings.length), hint: '+4 MNC partners added', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'leads' },
      { label: 'Placed Students', value: '41', hint: 'LPA range: 4.2 - 9.8 LPA', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'students' },
    ],
  }

  const currentStats = useMemo(() => {
    if (roleStatsMap[normalizedRoleKey]) {
      return roleStatsMap[normalizedRoleKey]
    }
    // Fallback default stats
    return [
      { label: 'Total Tasks', value: totalTasks, hint: `${pendingTasks} pending`, gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.35)', icon: 'task' },
      { label: 'Projects Mapped', value: myProjects.length, hint: `${inProgressTasks} in progress`, gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)', glow: 'rgba(168,85,247,0.35)', icon: 'folder' },
      { label: 'Assigned Courses', value: courseCards.length, hint: `${readyCourses} delivery ready`, gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.35)', icon: 'book' },
      { label: 'Active Students', value: activeStudents, hint: `${recentActivity.length} recent activity`, gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.35)', icon: 'students' },
    ]
  }, [normalizedRoleKey, totalTasks, pendingTasks, myProjects.length, inProgressTasks, courseCards.length, readyCourses, activeStudents, recentActivity.length, candidates, tickets, solvedCount, leads, partnershipsCount, campaigns, drafts, coursesProgress, sessions, reports, designTasks, bugList, checklists, jobOpenings])

  const currentQuickActions = useMemo(() => {
    const actions = {
      'hr & recruitment executive': [
        { to: '/employee/tasks', label: 'Candidate Screenings', caption: 'Review incoming profiles', color: '#3b82f6' },
        { to: '/employee/broadcast', label: 'Broadcast Joining', caption: 'Send onboarding details', color: '#ec4899' },
        { to: '/employee/chat', label: 'Candidate Chats', caption: 'Resolve candidate inquiries', color: '#06b6d4' }
      ],
      'student support executive': [
        { to: '/employee/chat', label: 'Student Chat Queue', caption: 'Answer student doubts', color: '#06b6d4' },
        { to: '/employee/tasks', label: 'Support Tasks', caption: 'Review feedback/queries', color: '#3b82f6' }
      ],
      'business development executive (bde)': [
        { to: '/employee/sell-project', label: 'Sell Project Portal', caption: 'Log and submit project sale', color: '#10b981' },
        { to: '/employee/chat', label: 'Sales Messages', caption: 'Coordinate with college contacts', color: '#06b6d4' }
      ],
      'marketing executive': [
        { to: '/employee/broadcast', label: 'Broadcast Promos', caption: 'Send discount promos to leads', color: '#ec4899' },
        { to: '/employee/chat', label: 'Marketing Messages', caption: 'Coordinate promotions', color: '#06b6d4' }
      ],
      'content writer': [
        { to: '/employee/course-manage', label: 'LMS Syllabus Texts', caption: 'Upload course descriptions', color: '#f59e0b' },
        { to: '/employee/tasks', label: 'Writing Tasks', caption: 'Check content outlines', color: '#3b82f6' }
      ],
      'lms coordinator': [
        { to: '/employee/course-manage', label: 'Course Upload Panel', caption: 'Host new modules & resources', color: '#f59e0b' },
        { to: '/employee/projects', label: 'Track Intern Progress', caption: 'Verify weekly submissions', color: '#a855f7' },
        { to: '/employee/chat', label: 'LMS Queries', caption: 'Assist students with access issues', color: '#06b6d4' }
      ],
      'training coordinator': [
        { to: '/employee/course-manage', label: 'Schedule Sessions', caption: 'Set Zoom/GMeet links', color: '#f59e0b' },
        { to: '/employee/tasks', label: 'Training Tasks', caption: 'Prepare schedules', color: '#3b82f6' }
      ],
      'project coordinator': [
        { to: '/employee/projects', label: 'Intern Project Hub', caption: 'Assign projects and review code', color: '#a855f7' },
        { to: '/employee/chat', label: 'Intern Chat Support', caption: 'Solve project bugs for students', color: '#06b6d4' }
      ],
      'graphic designer': [
        { to: '/employee/tasks', label: 'Creative Request Board', caption: 'Check design request drafts', color: '#3b82f6' }
      ],
      'web development intern/executive': [
        { to: '/employee/projects', label: 'Dev Projects Board', caption: 'Review site code submissions', color: '#a855f7' },
        { to: '/employee/course-manage', label: 'LMS Integrations', caption: 'Manage tech settings', color: '#f59e0b' },
        { to: '/employee/chat', label: 'Technical Chat', caption: 'Solve student platform bugs', color: '#06b6d4' }
      ],
      'operations executive': [
        { to: '/employee/projects', label: 'Ops Project Sync', caption: 'Organize project deliverables', color: '#a855f7' },
        { to: '/employee/broadcast', label: 'Operations Broadcasts', caption: 'Send notifications to team', color: '#ec4899' },
        { to: '/employee/chat', label: 'Operations Messages', caption: 'Coordinate with departments', color: '#06b6d4' }
      ],
      'placement & career support executive': [
        { to: '/employee/chat', label: 'Career Support Chat', caption: 'Guide students on placement', color: '#06b6d4' },
        { to: '/employee/projects', label: 'Placement Projects', caption: 'Verify resume-ready projects', color: '#a855f7' }
      ]
    }
    return actions[normalizedRoleKey] || [
      { to: '/employee/tasks', label: 'Open Tasks', caption: 'Track pending and completed work', color: '#3b82f6' },
      { to: '/employee/projects', label: 'Projects Board', caption: 'Track active project progress', color: '#a855f7' },
      { to: '/employee/course-manage', label: 'Manage Courses', caption: 'Update materials and meeting links', color: '#f59e0b' },
      { to: '/employee/chat', label: 'Open Messages', caption: 'Respond to team communication', color: '#06b6d4' },
    ]
  }, [normalizedRoleKey])

  // Custom icon map for dashboard stats
  const statIcons = {
    hr: 'M18 18.72a6 6 0 00-3.44-5.54m2.09-1.913a3 3 0 10-2.22-5.508m2.03 2.12c-.07-.02-.13-.04-.2-.05C13.5 12 11 12 9.5 13.5 8 15 8 17 8 18.72a6 6 0 00-3.44-5.54M15 11a3 3 0 11-6 0 3 3 0 016 0zm-6 8c0-2.676 5.333-4 8-4s8 1.324 8 4v2H9v-2z',
    interview: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z',
    joining: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    employees: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    ticket: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h9c.621 0 1.125.504 1.125 1.125v1.318a2.5 2.5 0 010 3.124v3.124a2.5 2.5 0 010 3.124v1.318c0 .621-.504 1.125-1.125 1.125h-9a1.125 1.125 0 01-1.125-1.125V18a2.5 2.5 0 010-3.124v-3.124a2.5 2.5 0 010-3.124V7.125A1.125 1.125 0 017.5 6z',
    pending: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    chat: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    leads: 'M18 18.72a6 6 0 00-3.44-5.54m2.09-1.913a3 3 0 10-2.22-5.508m2.03 2.12c-.07-.02-.13-.04-.2-.05C13.5 12 11 12 9.5 13.5 8 15 8 17 8 18.72a6 6 0 00-3.44-5.54M15 11a3 3 0 11-6 0 3 3 0 016 0zm-6 8c0-2.676 5.333-4 8-4s8 1.324 8 4v2H9v-2z',
    meeting: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5zM3.75 18h16.5M12 21v-3m0 0H9m3 0h3',
    partnership: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    target: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
    campaign: 'M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z',
    reach: 'M12.75 3.03v.568a8.967 8.967 0 016.162 6.162h.568A9.53 9.53 0 0012.75 3.03zm0 17.382v-.568a8.967 8.967 0 01-6.162-6.162h-.568A9.53 9.53 0 0012.75 20.412zM3.03 11.25h.568a8.967 8.967 0 016.162-6.162v-.568a9.53 9.53 0 00-6.73 6.73zm17.382 1.5h-.568a8.967 8.967 0 01-6.162 6.162v.568a9.53 9.53 0 006.73-6.73z',
    creatives: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    write: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    certificate: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    health: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
    upload: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
    students: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    mentor: 'M12 18v-5.25m0 0a3 3 0 10-3-3m3 3a3 3 0 103-3M12 18a6 6 0 00-6-6M12 18a6 6 0 016-6',
    folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    report: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Interactive Handlers
  // ──────────────────────────────────────────────────────────────────────────
  
  // HR Handlers
  const handleScheduleInterview = (id) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Interview Scheduled' } : c))
    alert('Interview successfully scheduled!')
  }

  const handleHireCandidate = (id, name) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
    alert(`Candidate ${name} hired! Added to active team.`)
  }

  const handleSyncAttendance = () => {
    setIsSyncingAttendance(true)
    setTimeout(() => {
      setIsSyncingAttendance(false)
      setAttendanceSynced(true)
    }, 1200)
  }

  // Support Handlers
  const handleSolveTicket = (id) => {
    if (!replyText.trim()) return alert('Please enter response text first!')
    setTickets(prev => prev.filter(t => t.id !== id))
    setSolvedCount(prev => prev + 1)
    setReplyText('')
    setActiveTicketId(null)
    alert('Query resolved and student notified!')
  }

  // BDE Handlers
  const handleAddLead = (e) => {
    e.preventDefault()
    if (!newLeadName.trim()) return
    setLeads(prev => [
      ...prev,
      {
        id: Date.now(),
        college: newLeadName,
        contact: newLeadContact || 'Placement Office',
        status: 'Pitching',
        type: 'Webinar Partner'
      }
    ])
    setNewLeadName('')
    setNewLeadContact('')
    alert('Lead registered successfully!')
  }

  const handleMoUSigned = (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'Signed' } : l))
    setPartnershipsCount(prev => prev + 1)
    alert('Partnership successfully sealed with MoU!')
  }

  // Marketing Handlers
  const handleBoostCampaign = (id) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, reach: c.reach + Math.floor(Math.random() * 5000) + 2000 } : c))
  }

  // Content Writer Handlers
  const handleWriterSubmit = (id) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'Reviewing' } : d))
    alert('Draft submitted to LMS manager for review!')
  }

  // LMS Handlers
  const handleUploadVideo = (id) => {
    setCoursesProgress(prev => prev.map(c => {
      if (c.id === id) {
        const nextUploaded = Math.min(c.uploadedVideos + 1, c.totalVideos)
        return {
          ...c,
          uploadedVideos: nextUploaded,
          status: nextUploaded === c.totalVideos ? 'Published' : 'Editing'
        }
      }
      return c
    }))
  }

  // Project Coordinator Handlers
  const handleVerifyReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Verified' } : r))
    alert('Report checked and marked as verified!')
  }

  // Graphic Designer Handlers
  const handleApproveDesign = (id) => {
    setDesignTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Approved' } : t))
    alert('Creative marked as complete and sent to Marketing!')
  }

  // Web Developer Handlers
  const handleDeployHotfix = () => {
    setIsDeploying(true)
    setDeployStep('Initiating build pipeline...')
    setTimeout(() => {
      setDeployStep('Compressing assets & running check lints...')
      setTimeout(() => {
        setDeployStep('Syncing Cloudflare routing config...')
        setTimeout(() => {
          setIsDeploying(false)
          setBugList([])
          alert('Site successfully compiled and deployed to Vercel production edge servers!')
        }, 1000)
      }, 1000)
    }, 1000)
  }

  // Operations Handlers
  const handleToggleChecklist = (id) => {
    setChecklists(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c))
  }

  // Placement Handlers
  const handlePostOpening = () => {
    const comp = prompt("Enter company name:")
    if (!comp) return
    const pos = prompt("Enter role designation:")
    if (!pos) return
    const pkg = prompt("Enter annual package (e.g. 5.5 LPA):")
    if (!pkg) return
    setJobOpenings(prev => [
      ...prev,
      {
        id: Date.now(),
        company: comp,
        role: pos,
        package: pkg,
        date: 'Today',
        applicants: 0
      }
    ])
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Specialized Role Panel Renderers
  // ──────────────────────────────────────────────────────────────────────────
  
  const renderHRWidget = () => (
    <div className="space-y-6">
      <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
        <h3 className="text-base font-black text-white mb-1">Recruitment Funnel</h3>
        <p className="text-[12px] text-slate-500 mb-4">Pending intern screenings & approvals</p>
        
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <div className="rounded-2xl px-4 py-8 text-center text-[12px] text-slate-500" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              No candidates awaiting screening
            </div>
          ) : candidates.map(c => (
            <div key={c.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-semibold text-white">{c.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.role} · Ph: {c.phone}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  c.status === 'Interview Scheduled' 
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {c.status !== 'Interview Scheduled' && (
                  <button
                    onClick={() => handleScheduleInterview(c.id)}
                    className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition border border-white/10"
                  >
                    Schedule Interview
                  </button>
                )}
                <button
                  onClick={() => handleHireCandidate(c.id, c.name)}
                  className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 transition border border-emerald-500/30"
                >
                  Onboard & Hire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-base font-black text-white mb-1">Attendance Sync Terminal</h3>
        <p className="text-[12px] text-slate-500 mb-4">Pull metrics from GForms and Google biometric sheets</p>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleSyncAttendance}
            disabled={isSyncingAttendance}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 px-4 py-2.5 text-xs font-black text-white transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isSyncingAttendance ? 'Syncing Logs...' : 'Synchronize Attendance'}
          </button>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${attendanceSynced ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-400 font-bold">{attendanceSynced ? 'Verified & Synced' : 'Sync needed'}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSupportWidget = () => (
    <div className="rounded-3xl p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <div>
        <h3 className="text-base font-black text-white mb-1">WhatsApp & Mail Queries</h3>
        <p className="text-[12px] text-slate-500">Respond directly to active student queries</p>
      </div>

      <div className="space-y-3">
        {tickets.map(t => (
          <div key={t.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-black text-slate-500 tracking-wider">{t.id}</span>
                <h4 className="text-[13px] font-bold text-white mt-0.5">{t.student}</h4>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                t.status === 'Open' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-lg mb-3">
              "{t.subject}"
            </p>
            {activeTicketId === t.id ? (
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official query response..."
                  className="w-full h-20 rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSolveTicket(t.id)}
                    className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30 transition"
                  >
                    Send Reply & Resolve
                  </button>
                  <button
                    onClick={() => { setActiveTicketId(null); setReplyText(''); }}
                    className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-400 border border-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTicketId(t.id)}
                className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition border border-white/10"
              >
                Compose Response
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderBDEWidget = () => (
    <div className="space-y-6">
      <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
        <h3 className="text-base font-black text-white mb-1">Partnership Lead Board</h3>
        <p className="text-[12px] text-slate-500 mb-4">University & Institution MoU outreach status</p>
        
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{l.college}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{l.type} · Contact: {l.contact}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  l.status === 'Signed' 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : l.status === 'Meeting Fixed' 
                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {l.status}
                </span>
              </div>
              {l.status !== 'Signed' && (
                <div className="mt-3">
                  <button
                    onClick={() => handleMoUSigned(l.id)}
                    className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 transition"
                  >
                    Confirm MoU Signature
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-base font-black text-white mb-3">Log New Partnership Lead</h3>
        <form onSubmit={handleAddLead} className="space-y-3">
          <input
            type="text"
            value={newLeadName}
            onChange={e => setNewLeadName(e.target.value)}
            placeholder="College/University Name..."
            required
            className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
          />
          <input
            type="text"
            value={newLeadContact}
            onChange={e => setNewLeadContact(e.target.value)}
            placeholder="Contact point (e.g. Dean, Placement Officer)..."
            className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white border border-white/10 transition"
          >
            Create Lead File
          </button>
        </form>
      </div>
    </div>
  )

  const renderMarketingWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Campaign Analytics & Boost</h3>
      <p className="text-[12px] text-slate-500 mb-4">Realtime reach tracker for digital posters & webinars</p>
      
      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[13px] font-bold text-white">{c.name}</h4>
                <p className="text-[11px] text-slate-500">{c.platform}</p>
              </div>
              <span className="text-sm font-black text-sky-400">{c.reach.toLocaleString()} Reach</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" style={{ width: `${Math.min((c.reach / 40000) * 100, 100)}%` }} />
            </div>
            <button
              onClick={() => handleBoostCampaign(c.id)}
              className="rounded-lg bg-sky-500/20 hover:bg-sky-500/30 px-3 py-1.5 text-[11px] font-bold text-sky-300 border border-sky-500/30 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Boost Campaign Budget
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWriterWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Editorial Content Queue</h3>
      <p className="text-[12px] text-slate-500 mb-4">Syllabus documentation, blog copy and quiz items</p>
      
      <div className="space-y-3">
        {drafts.map(d => (
          <div key={d.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-[13px] font-bold text-white">{d.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{d.type} · {d.wordCount} words</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                d.status === 'Approved' 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : d.status === 'Reviewing' 
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {d.status}
              </span>
            </div>
            {d.status === 'Writing' && (
              <div className="mt-3">
                <button
                  onClick={() => handleWriterSubmit(d.id)}
                  className="rounded-lg bg-violet-500/20 hover:bg-violet-500/30 px-3 py-1.5 text-[11px] font-bold text-violet-300 border border-violet-500/30 transition"
                >
                  Submit copy for review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderLMSWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">LMS Upload Pipeline</h3>
      <p className="text-[12px] text-slate-500 mb-4">Track module uploading progress across courses</p>
      
      <div className="space-y-4">
        {coursesProgress.map(c => {
          const progressPercent = Math.round((c.uploadedVideos / c.totalVideos) * 100)
          return (
            <div key={c.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{c.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{c.uploadedVideos} of {c.totalVideos} videos uploaded</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  c.status === 'Published' 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mb-3.5">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              {progressPercent < 100 && (
                <button
                  onClick={() => handleUploadVideo(c.id)}
                  className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-300 border border-amber-500/30 transition"
                >
                  Upload next video module
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderTrainingWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Live Meeting Session Scheduler</h3>
      <p className="text-[12px] text-slate-500 mb-4">Launch trainer links and verify student scheduling</p>
      
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h4 className="text-[13px] font-bold text-white">{s.topic}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Trainer: {s.trainer} · Time: {s.time}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={s.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Launch Google Meet
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProjectWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Weekly Project Submissions</h3>
      <p className="text-[12px] text-slate-500 mb-4">Review and verify code/report submissions from interns</p>
      
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-[13px] font-bold text-white">{r.intern}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.project} · {r.week}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                r.status === 'Verified' 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {r.status}
              </span>
            </div>
            {r.status === 'Pending Review' && (
              <div className="mt-3">
                <button
                  onClick={() => handleVerifyReport(r.id)}
                  className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 transition"
                >
                  Grade & Approve Report
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderDesignerWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Creative Production Requests</h3>
      <p className="text-[12px] text-slate-500 mb-4">Posters and certificate layout requests from management</p>
      
      <div className="space-y-3">
        {designTasks.map(t => (
          <div key={t.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-[13px] font-bold text-white">{t.item}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.type}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                t.status === 'Approved' 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : t.status === 'Pending Approval' 
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {t.status}
              </span>
            </div>
            {t.status !== 'Approved' && (
              <div className="mt-3">
                <button
                  onClick={() => handleApproveDesign(t.id)}
                  className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 transition"
                >
                  Mark Design Approved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderDeveloperWidget = () => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <h3 className="text-base font-black text-white mb-1">Tech Hotfix Deploy Console</h3>
      <p className="text-[12px] text-slate-500 mb-4">Compile system updates and clear server error logs</p>
      
      {isDeploying ? (
        <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-cyan-400 font-bold">{deployStep}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 bg-slate-950 border border-white/5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Known Platform Issues</p>
            {bugList.length === 0 ? (
              <p className="text-xs text-emerald-400 font-bold">✓ System clean. No issues logged.</p>
            ) : bugList.map(b => (
              <div key={b.id} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span className="text-slate-300">{b.title}</span>
                <span className={`font-black text-[9px] uppercase px-1.5 py-0.5 rounded ${b.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>{b.priority}</span>
              </div>
            ))}
          </div>
          {bugList.length > 0 && (
            <button
              onClick={handleDeployHotfix}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:opacity-90 px-4 py-2.5 text-xs font-black text-white transition shadow-lg shadow-cyan-950/40 w-full"
            >
              Deploy hotfix pipeline to Vercel
            </button>
          )}
        </div>
      )}
    </div>
  )

  const renderOperationsWidget = () => (
    <div className="rounded-3xl p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <div>
        <h3 className="text-base font-black text-white mb-1">Daily Operations Task-sheet</h3>
        <p className="text-[12px] text-slate-500">Track operations verification checklists</p>
      </div>

      <div className="space-y-2.5">
        {checklists.map(c => (
          <div
            key={c.id}
            onClick={() => handleToggleChecklist(c.id)}
            className="flex items-center gap-3 rounded-2xl p-4 transition-all cursor-pointer hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${c.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
              {c.completed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            <span className={`text-xs ${c.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>{c.task}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPlacementWidget = () => (
    <div className="rounded-3xl p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white mb-1">Placement Job Openings</h3>
          <p className="text-[12px] text-slate-500">Active campus drives and package details</p>
        </div>
        <button
          onClick={handlePostOpening}
          className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition border border-white/10"
        >
          Add Job
        </button>
      </div>

      <div className="space-y-3">
        {jobOpenings.map(j => (
          <div key={j.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-white">{j.company}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{j.role} · Pack: {j.package}</p>
              </div>
              <span className="text-[10px] text-slate-600 font-bold">{j.date}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{j.applicants} students applied</span>
              <button
                onClick={() => alert('Reviewing resumes for this listing...')}
                className="rounded-lg bg-sky-500/20 hover:bg-sky-500/30 px-2.5 py-1 text-[10px] font-bold text-sky-300 border border-sky-500/20 transition"
              >
                Review Applications
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRoleWidget = () => {
    switch (normalizedRoleKey) {
      case 'hr & recruitment executive':
        return renderHRWidget()
      case 'student support executive':
        return renderSupportWidget()
      case 'business development executive (bde)':
        return renderBDEWidget()
      case 'marketing executive':
        return renderMarketingWidget()
      case 'content writer':
        return renderWriterWidget()
      case 'lms coordinator':
        return renderLMSWidget()
      case 'training coordinator':
        return renderTrainingWidget()
      case 'project coordinator':
        return renderProjectWidget()
      case 'graphic designer':
        return renderDesignerWidget()
      case 'web development intern/executive':
        return renderDeveloperWidget()
      case 'operations executive':
        return renderOperationsWidget()
      case 'placement & career support executive':
        return renderPlacementWidget()
      default:
        // Default Widget: Fallback tasks + projects list
        return (
          <div className="space-y-6">
            <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">Task Pipeline</h2>
                  <p className="mt-0.5 text-[12px] text-slate-500">Status breakdown of your workload</p>
                </div>
                <Link
                  to="/employee/tasks"
                  className="flex-shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Open Board →
                </Link>
              </div>

              <div className="space-y-4">
                {taskOverviewBars.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-[12px] font-semibold text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-[12px] font-black text-white">{item.count}</span>
                    </div>
                    <ProgressBar progress={totalTasks ? Math.round((item.count / totalTasks) * 100) : 0} gradient={item.gradient} />
                  </div>
                ))}
              </div>

              {totalTasks > 0 && (
                <div className="mt-6 flex items-center gap-4 rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">{Math.round((completedTasks / totalTasks) * 100)}%</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mt-0.5">Complete</p>
                  </div>
                  <div className="h-10 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <p className="text-[12px] text-slate-400 leading-5">{completedTasks} of {totalTasks} tasks completed across {myProjects.length} projects</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Assigned Projects</h3>
                <span className="text-[10px] text-slate-600">{myProjects.length} mapped</span>
              </div>
              {myProjects.length === 0 ? (
                <div className="rounded-2xl px-4 py-8 text-center text-[12px] text-slate-600" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                  No projects mapped.
                </div>
              ) : myProjects.slice(0, 3).map(project => (
                <div key={project.id} className="rounded-2xl p-4 mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[13px] font-semibold text-white truncate">{project.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-sky-300" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      {project.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={project.progress} gradient="linear-gradient(90deg,#38bdf8,#06b6d4)" />
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-7" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(2,6,23,0.95) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 60px rgba(16,185,129,0.08), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {/* Left: identity */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(6,182,212,0.4))', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400 mb-1">Employee Workspace</p>
                <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">{displayName}</h1>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-400 mb-4">
              {welcomeMessage}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                {roleLabel}
              </span>
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                {departmentLabel}
              </span>
              {employeeId && (
                <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  ID {employeeId}
                </span>
              )}
            </div>
          </div>

          {/* Right: mini stats */}
          <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
            {[
              { label: 'Total Tasks', value: totalTasks, color: '#3b82f6' },
              { label: 'Pending Tasks', value: pendingTasks, color: '#ef4444' },
              { label: 'Mapped Projects', value: myProjects.length, color: '#a855f7' },
              { label: 'Profile Node', value: employeeEmail ? 'Active' : 'Offline', color: '#10b981', small: true }
            ].map(tile => (
              <div key={tile.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">{tile.label}</p>
                <p className={`mt-2 font-black text-white ${tile.small ? 'text-xs mt-3 text-emerald-400' : 'text-2xl'}`}>{tile.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {currentStats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${stat.glow}, 0 4px 24px rgba(0,0,0,0.3)`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: stat.gradient.replace('135deg', '145deg').replace(')', ', transparent)'), opacity: 0.05 }} />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-4xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="mt-1.5 text-[12px] font-medium text-slate-500">{stat.hint}</p>
              </div>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: stat.gradient, boxShadow: `0 4px 16px ${stat.glow}` }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={statIcons[stat.icon] || statIcons['task']} />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: stat.gradient }} />
          </div>
        ))}
      </section>

      {/* ── Main Content Grid ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">

        {/* Left Column: Dynamic Role-Specific Console */}
        <div className="space-y-6">
          {renderRoleWidget()}
        </div>

        {/* Right Column: Quick Actions + Recents */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
            <h2 className="text-[13px] font-black text-white mb-0.5">Quick Actions</h2>
            <p className="text-[11px] text-slate-500 mb-4">Direct paths allowed for your role</p>

            <div className="space-y-2">
              {currentQuickActions.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${link.color}30`; e.currentTarget.style.background = `${link.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: link.color }} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white">{link.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{link.caption}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Student Activity Feed (Where relevant) */}
          {['lms coordinator', 'training coordinator', 'project coordinator', 'student support executive', 'placement & career support executive'].includes(normalizedRoleKey) && (
            <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-[13px] font-black text-white mb-0.5">Student Registration Feed</h2>
              <p className="text-[11px] text-slate-500 mb-4">Latest students entering courses</p>

              <div className="space-y-2.5">
                {recentActivity.length === 0 ? (
                  <div className="rounded-2xl px-4 py-8 text-center text-[12px] text-slate-600" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                    No recent student activity.
                  </div>
                ) : recentActivity.map(activity => (
                  <div key={activity.id} className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-white truncate">{activity.userName || activity.studentName || 'Student'}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{activity.courseTitle}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{formatTimeAgo(activity.enrolledAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
