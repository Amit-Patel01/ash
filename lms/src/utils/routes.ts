import {
  Activity,
  Award,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  NotebookTabs,
  Settings,
  Sparkles,
  Star,
  Target,
  UserRound,
  UsersRound,
  Video
} from "lucide-react";
import type { Activity as ActivityItem, Metric, NavItem, PageContent, Role } from "@/types";

export const publicNav = [
  { label: "Courses", href: "#courses" },
  { label: "Internships", href: "#internships" },
  { label: "Results", href: "#statistics" },
  { label: "Contact", href: "#contact" }
];

export const roleNavItems: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/student/courses", icon: BookOpen },
    { label: "Internship Dashboard", href: "/student/internship-dashboard", icon: BriefcaseBusiness },
    { label: "Internship + Training", href: "/student/internship-training-dashboard", icon: GraduationCap },
    { label: "Tasks", href: "/student/tasks", icon: Target },
    { label: "Projects", href: "/student/projects", icon: NotebookTabs },
    { label: "Assignments", href: "/student/assignments", icon: ClipboardCheck },
    { label: "Quizzes", href: "/student/quizzes", icon: FileCheck2 },
    { label: "Results", href: "/student/results", icon: BarChart3 }
  ],
  mentor: [
    { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/mentor/profile", icon: UserRound },
    { label: "Students", href: "/mentor/students", icon: UsersRound },
    { label: "Courses", href: "/mentor/courses", icon: BookOpen },
    { label: "Assignments", href: "/mentor/assignments", icon: ClipboardCheck },
    { label: "Reviews", href: "/mentor/reviews", icon: Star },
    { label: "Tasks", href: "/mentor/tasks", icon: Target },
    { label: "Reports", href: "/mentor/reports", icon: BarChart3 },
    { label: "Messages", href: "/mentor/messages", icon: MessageSquareText }
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Mentors", href: "/admin/mentors", icon: UsersRound },
    { label: "HR", href: "/admin/hr", icon: BriefcaseBusiness },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Payments", href: "/admin/payments", icon: BadgeIndianRupee },
    { label: "Settings", href: "/admin/settings", icon: Settings }
  ],
  hr: [
    { label: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
    { label: "Interviews", href: "/hr/interviews", icon: CalendarCheck },
    { label: "Applications", href: "/hr/applications", icon: FileText },
    { label: "Job Postings", href: "/hr/job-postings", icon: BriefcaseBusiness },
    { label: "Placements", href: "/hr/placements", icon: Award },
    { label: "Reports", href: "/hr/reports", icon: BarChart3 }
  ]
};

const activities: ActivityItem[] = [
  {
    title: "AI quiz generator queued",
    description: "Questions are ready for mentor review.",
    status: "Ready"
  },
  {
    title: "Attendance synced",
    description: "Monthly export is available for the admin team.",
    status: "Updated"
  },
  {
    title: "Certificate verification",
    description: "QR validation endpoint is online.",
    status: "Live"
  }
];

export const roleDashboards: Record<Role, { metrics: Metric[]; activities: ActivityItem[] }> = {
  student: {
    metrics: [
      { label: "Total Courses", value: "12", delta: "+2 this month", icon: BookOpen },
      { label: "Active Courses", value: "4", delta: "78% average progress", icon: Activity },
      { label: "Internship Progress", value: "64%", delta: "+12% this week", icon: BriefcaseBusiness },
      { label: "Quiz Score", value: "91%", delta: "Top 8%", icon: Sparkles }
    ],
    activities
  },
  mentor: {
    metrics: [
      { label: "Students", value: "184", delta: "+16 assigned", icon: UsersRound },
      { label: "Courses", value: "9", delta: "4 live cohorts", icon: BookOpen },
      { label: "Reviews", value: "42", delta: "Due this week", icon: Star },
      { label: "Reports", value: "18", delta: "Submitted", icon: BarChart3 }
    ],
    activities
  },
  admin: {
    metrics: [
      { label: "Total Students", value: "342", delta: "+28 this week", icon: GraduationCap },
      { label: "Active Mentors", value: "18", delta: "100% capacity", icon: UsersRound },
      { label: "Hiring Partners", value: "48", delta: "+4 this month", icon: BriefcaseBusiness },
      { label: "Total Payments", value: "₹4.2M", delta: "Reconciled", icon: BadgeIndianRupee }
    ],
    activities
  },
  hr: {
    metrics: [
      { label: "Interviews", value: "38", delta: "This week", icon: CalendarCheck },
      { label: "Applications", value: "624", delta: "+82 new", icon: FileText },
      { label: "Job Postings", value: "21", delta: "7 urgent", icon: BriefcaseBusiness },
      { label: "Placements", value: "116", delta: "+24 this month", icon: Award }
    ],
    activities
  }
};

export const pageContent: Record<string, PageContent> = {
  "student/profile": { title: "Student Profile", description: "Manage learning identity, documents, resume data, and account preferences.", primaryAction: "Update Profile" },
  "student/courses": { title: "My Courses", description: "Continue active courses, revisit lessons, and track completion milestones.", primaryAction: "Explore Courses" },
  "student/course/[id]": { title: "Course Workspace", description: "View modules, video lessons, notes, assignments, comments, and progress.", primaryAction: "Resume Lesson" },
  "student/internship-dashboard": { title: "Internship Dashboard", description: "Track mentor allocation, weekly reports, project tasks, reviews, and final internship evaluation.", primaryAction: "Submit Report" },
  "student/internship-training-dashboard": { title: "Internship + Training Dashboard", description: "Manage training lessons, live sessions, module assignments, internship tasks, and certificate readiness.", primaryAction: "Continue Training" },
  "student/internships": { title: "Internship Dashboard", description: "Track mentor allocation, weekly reports, project tasks, reviews, and final internship evaluation.", primaryAction: "Submit Report" },
  "student/tasks": { title: "Tasks", description: "Prioritize allocated internship tasks with due dates and review states.", primaryAction: "Add Task" },
  "student/projects": { title: "Projects", description: "Submit project milestones, repositories, demos, and mentor feedback.", primaryAction: "Submit Project" },
  "student/assignments": { title: "Assignments", description: "Upload assignment files, read rubrics, and review mentor remarks.", primaryAction: "Upload Assignment" },
  "student/quizzes": { title: "Quizzes", description: "Attempt timed MCQs, review analytics, and climb the leaderboard.", primaryAction: "Start Quiz" },
  "student/results": { title: "Results", description: "Analyze scores, attempts, course progress, and performance trends.", primaryAction: "Download Report" },
  "student/certificates": { title: "Certificates", description: "Access generated PDF certificates with certificate numbers and QR verification.", primaryAction: "Verify Certificate" },
  "student/attendance": { title: "Attendance", description: "View daily and monthly attendance with export-ready summaries.", primaryAction: "Export Excel" },
  "student/messages": { title: "Messages", description: "Realtime conversations with mentors and admins.", primaryAction: "New Message" },
  "student/settings": { title: "Student Settings", description: "Control notifications, security, theme, and connected account settings.", primaryAction: "Save Settings" },
  "mentor/profile": { title: "Mentor Profile", description: "Maintain mentor expertise, availability, cohorts, and payout details.", primaryAction: "Update Profile" },
  "mentor/students": { title: "Students", description: "Monitor assigned learners, progress, attendance, and intervention signals.", primaryAction: "Assign Task" },
  "mentor/courses": { title: "Mentor Courses", description: "Manage course cohorts, modules, lesson reviews, and learning outcomes.", primaryAction: "Review Course" },
  "mentor/assignments": { title: "Assignment Reviews", description: "Evaluate submissions with rubrics, comments, and revision requests.", primaryAction: "Review Queue" },
  "mentor/reviews": { title: "Mentor Reviews", description: "Score projects, internship tasks, and final evaluations.", primaryAction: "Open Reviews" },
  "mentor/tasks": { title: "Mentor Tasks", description: "Create weekly tasks, set due dates, and monitor completion health.", primaryAction: "Create Task" },
  "mentor/reports": { title: "Mentor Reports", description: "Inspect student analytics, course completion, and internship summaries.", primaryAction: "Generate Report" },
  "mentor/messages": { title: "Mentor Messages", description: "Realtime mentor, student, and admin communication hub.", primaryAction: "New Message" },
  "admin/students": { title: "Students", description: "Search, create, edit, verify, and segment student records.", primaryAction: "Create Student" },
  "admin/student/create": { title: "Create Student", description: "Register a new student with role, cohort, course, and internship details.", primaryAction: "Save Student" },
  "admin/student/edit": { title: "Edit Student", description: "Update student profile, enrollment, status, documents, and access.", primaryAction: "Update Student" },
  "admin/mentors": { title: "Mentors", description: "Manage mentor onboarding, assignments, expertise, and availability.", primaryAction: "Add Mentor" },
  "admin/hr": { title: "HR Team", description: "Control HR accounts, permissions, placements, and interview ownership.", primaryAction: "Invite HR" },
  "admin/courses": { title: "Courses", description: "Create courses with modules, lessons, PDFs, assignments, quizzes, and pricing.", primaryAction: "Create Course" },
  "admin/course/create": { title: "Create Course", description: "Build a complete course structure with videos, notes, quizzes, and certificates.", primaryAction: "Publish Course" },
  "admin/course/edit": { title: "Edit Course", description: "Modify lessons, pricing, SEO metadata, ratings, and publish states.", primaryAction: "Save Course" },
  "admin/internship-dashboard": { title: "Internship Dashboard", description: "Allocate internships, mentors, tasks, reports, project reviews, and final evaluations.", primaryAction: "Allocate Internship" },
  "admin/internship-training-dashboard": { title: "Internship + Training Dashboard", description: "Control training cohorts, live classes, module tasks, internship sprints, and certificate readiness.", primaryAction: "Open Cohorts" },
  "admin/internships": { title: "Internship Dashboard", description: "Allocate internships, mentors, tasks, reports, project reviews, and final evaluations.", primaryAction: "Allocate Internship" },
  "admin/tasks": { title: "Admin Tasks", description: "Track operational tasks across mentors, students, and internship programs.", primaryAction: "Create Task" },
  "admin/certificates": { title: "Certificates", description: "Generate PDF certificates with QR codes and verification pages.", primaryAction: "Generate Certificate" },
  "admin/payments": { title: "Payments", description: "Razorpay, UPI, invoices, payment history, refunds, and reconciliation.", primaryAction: "Create Invoice" },
  "admin/reports": { title: "Reports", description: "Course, revenue, placement, attendance, and student analytics.", primaryAction: "Export Reports" },
  "admin/attendance": { title: "Attendance", description: "Daily attendance, monthly attendance, and Excel exports.", primaryAction: "Export Excel" },
  "admin/notifications": { title: "Notifications", description: "Send targeted role-based notifications through email and in-app channels.", primaryAction: "Send Notification" },
  "admin/settings": { title: "Admin Settings", description: "Configure platform security, integrations, themes, and organization details.", primaryAction: "Save Settings" },
  "hr/interviews": { title: "Interviews", description: "Schedule interviews, assign panels, and record outcomes.", primaryAction: "Schedule Interview" },
  "hr/applications": { title: "Applications", description: "Screen applications, map candidates, and track placement readiness.", primaryAction: "Shortlist" },
  "hr/job-postings": { title: "Job Postings", description: "Publish job openings and map them to eligible learners.", primaryAction: "Post Job" },
  "hr/placements": { title: "Placements", description: "Verify offers, joining status, packages, and employer feedback.", primaryAction: "Verify Placement" },
  "hr/reports": { title: "HR Reports", description: "Placement analytics, interview funnels, and employer engagement dashboards.", primaryAction: "Export Report" }
};
