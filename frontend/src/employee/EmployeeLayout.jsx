import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import NotificationBell from '../components/NotificationBell'

const navItems = [
  { path: '/employee', label: 'Dashboard', icon: 'dashboard', color: 'from-emerald-500 to-teal-500' },
  { path: '/employee/tasks', label: 'My Tasks', icon: 'task', color: 'from-sky-500 to-blue-600' },
  { path: '/employee/projects', label: 'Projects', icon: 'folder', color: 'from-violet-500 to-purple-600' },
  { path: '/employee/course-manage', label: 'Manage Courses', icon: 'book', color: 'from-amber-500 to-orange-500' },
  { path: '/employee/enrollments', label: 'Enrollments', icon: 'enrollment', color: 'from-orange-500 to-amber-600' },
  { path: '/employee/certificates', label: 'Certificates', icon: 'certificate', color: 'from-teal-500 to-cyan-500' },
  { path: '/employee/students', label: 'Students', icon: 'students', color: 'from-indigo-500 to-violet-600' },
  { path: '/employee/team', label: 'Team', icon: 'team', color: 'from-fuchsia-500 to-pink-600' },
  { path: '/employee/employees', label: 'Employees', icon: 'employees', color: 'from-blue-500 to-indigo-600' },
  { path: '/employee/account-requests', label: 'Account Requests', icon: 'account-requests', color: 'from-yellow-500 to-orange-500' },
  { path: '/employee/services', label: 'Services', icon: 'services', color: 'from-emerald-600 to-green-600' },
  { path: '/employee/sales', label: 'Sales', icon: 'sales', color: 'from-green-500 to-emerald-600' },
  { path: '/employee/testimonials', label: 'Testimonials', icon: 'testimonials', color: 'from-pink-500 to-rose-600' },
  { path: '/employee/broadcast', label: 'Bulk Email', icon: 'speaker', color: 'from-rose-500 to-pink-600' },
  { path: '/employee/chat', label: 'Messages', icon: 'chat', color: 'from-cyan-500 to-sky-500' },
  { path: '/employee/sell-project', label: 'Sell Project', icon: 'tag', color: 'from-lime-500 to-green-600' },
  { path: '/employee/settings', label: 'Settings', icon: 'settings', color: 'from-slate-500 to-slate-600' },
  { path: '/employee/profile', label: 'Profile', icon: 'user', color: 'from-slate-400 to-slate-500' },
]

const iconMap = {
  book: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  dashboard: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  task: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  folder: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  chat: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  tag: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  user: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  speaker: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
    </svg>
  ),
  certificate: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  enrollment: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  students: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  team: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  employees: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  'account-requests': (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  services: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m5.654-4.654l3.029-2.498a1.5 1.5 0 012.122 2.122l-2.498 3.029m-5.654 4.654l5.654-4.654" />
    </svg>
  ),
  sales: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  testimonials: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  settings: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

const PERMISSION_MAP = {
  '/employee/projects':         ['manage_projects', 'view_projects'],
  '/employee/course-manage':    ['manage_courses'],
  '/employee/enrollments':      ['manage_enrollments'],
  '/employee/certificates':     ['manage_certificates'],
  '/employee/students':        ['manage_customers', 'view_customers'],
  '/employee/team':             ['manage_team'],
  '/employee/employees':        ['manage_employees', 'view_employees'],
  '/employee/account-requests': ['manage_account_requests'],
  '/employee/services':         ['manage_services'],
  '/employee/sales':            ['manage_coupons', 'view_sales'],
  '/employee/testimonials':     ['manage_testimonials'],
  '/employee/broadcast':        ['send_broadcasts'],
  '/employee/chat':             ['manage_messages'],
  '/employee/settings':         ['system_settings'],
}

const hasPermissionForPath = (path, permissions) => {
  const required = PERMISSION_MAP[path]
  if (!required) return null
  return required.some(p => permissions?.[p] === true)
}

const getFilteredNavItems = (userRole, permissions) => {
  const normalized = String(userRole || '').trim().toLowerCase()
  if (!normalized || normalized === 'admin') return navItems

  const hasPermissions = permissions && Object.keys(permissions).length > 0

  return navItems.filter((item) => {
    // Dashboard, My Tasks, and Profile are always allowed
    if (['/employee', '/employee/tasks', '/employee/profile'].includes(item.path)) {
      return true
    }

    // If employee has granular permissions, use those first
    if (hasPermissions) {
      const permResult = hasPermissionForPath(item.path, permissions)
      if (permResult !== null) return permResult
    }

    // Fallback to role-based filtering
    if (item.path === '/employee/projects') {
      return [
        'hr & recruitment executive',
        'web development intern/executive',
        'project coordinator',
        'operations executive',
        'senior developer',
        'junior developer',
        'project manager',
        'frontend developer',
        'backend developer',
        'devops engineer',
        'lms coordinator',
        'placement & career support executive',
        'employee',
      ].includes(normalized)
    }

    if (item.path === '/employee/course-manage') {
      return [
        'lms coordinator',
        'training coordinator',
        'content writer',
        'web development intern/executive',
        'senior developer',
        'junior developer',
        'frontend developer',
        'backend developer',
        'developer',
      ].includes(normalized)
    }

    if (item.path === '/employee/broadcast') {
      return [
        'marketing executive',
        'hr & recruitment executive',
        'project manager',
        'operations executive',
      ].includes(normalized)
    }

    if (item.path === '/employee/chat') {
      return [
        'student support executive',
        'hr & recruitment executive',
        'web development intern/executive',
        'placement & career support executive',
        'business development executive (bde)',
        'marketing executive',
        'project coordinator',
        'operations executive',
        'support agent',
        'developer',
        'employee',
      ].includes(normalized)
    }

    if (item.path === '/employee/sell-project') {
      return [
        'business development executive (bde)',
        'sales executive',
      ].includes(normalized)
    }

    return true
  })
}

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout, refreshCurrentUser } = useAuth()
  const { users } = useStore()

  const handleWheel = (e) => {
    const target = e.target
    const scrollable = target.closest('[style*="overflow"]') || target.closest('.overflow-x-auto') || target.closest('.overflow-y-auto')
    if (scrollable) {
      const { scrollTop, scrollHeight, clientHeight } = scrollable
      const atTop = scrollTop === 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  // Fast-poll permissions every 15s so sidebar updates ~instantly after admin grants access
  const permPollRef = useRef(null)
  useEffect(() => {
    if (!currentUser?.uid) return
    permPollRef.current = setInterval(() => {
      refreshCurrentUser().catch(() => {})
    }, 15000)
    return () => clearInterval(permPollRef.current)
  }, [currentUser?.uid, refreshCurrentUser])

  // Merge latest permissions from StoreContext (updated via admin PATCH + 60s poll)
  // storeUser is preferred (more recent) but we also merge currentUser.permissions as fallback
  const mergedPermissions = useMemo(() => {
    if (!currentUser?.uid) return {}
    const storeUser = users.find(u =>
      u.uid === currentUser.uid ||
      u.email === currentUser.email
    )
    const fromStore = (storeUser?.permissions && typeof storeUser.permissions === 'object') ? storeUser.permissions : {}
    const fromAuth = (currentUser?.permissions && typeof currentUser.permissions === 'object') ? currentUser.permissions : {}
    // Merge both — storeUser (live poll) takes precedence over cached JWT permissions
    return { ...fromAuth, ...fromStore }
  }, [currentUser, users])

  const isTeamMember = userProfile?.role === 'team' || userProfile?.role === 'Team Member'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const employeeName = userProfile?.displayName || currentUser?.displayName || 'Employee'
  const employeeEmail = currentUser?.email || 'employee@solutionhub.com'
  const employeeRole = userProfile?.jobTitle || userProfile?.role || 'employee'
  const employeeInitial = employeeName.charAt(0).toUpperCase()
  const employeeAvatar = userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || currentUser?.avatar || ''

  const filteredNavItems = useMemo(() => {
    return getFilteredNavItems(employeeRole, mergedPermissions)
  }, [employeeRole, mergedPermissions])

  // Enforce Role-Based Access Control (RBAC) path protection
  useEffect(() => {
    const isPathAllowed = filteredNavItems.some(item => 
      item.path === '/employee' 
        ? location.pathname === '/employee'
        : location.pathname.startsWith(item.path)
    )
    if (!isPathAllowed && location.pathname.startsWith('/employee')) {
      navigate('/employee', { replace: true })
    }
  }, [location.pathname, filteredNavItems, navigate])

  const currentNavItem = useMemo(() => {
    return filteredNavItems.find(item =>
      item.path === '/employee'
        ? location.pathname === '/employee'
        : location.pathname.startsWith(item.path)
    ) || filteredNavItems[0] || navItems[0]
  }, [location.pathname, filteredNavItems])

  return (
    <div className="relative h-screen overflow-hidden dark" style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 40%, #050a18 100%)' }}>
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -right-48 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="relative flex h-full">
        {/* ── SIDEBAR ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex transform flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarOpen ? 'w-72' : 'w-20'}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(24px)' }}
        >
          {/* Brand */}
          <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-emerald-400">SolutionHub</p>
                  <h1 className="truncate text-[15px] font-black text-white leading-tight">
                    {isTeamMember ? 'Team Workspace' : 'Employee Portal'}
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* User card */}
          {sidebarOpen && (
            <div className="mx-3 mt-4 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black text-white overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  {employeeAvatar ? (
                    <img src={employeeAvatar} alt={employeeName} className="w-full h-full object-cover" />
                  ) : (
                    employeeInitial
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{employeeName}</p>
                  <p className="truncate text-[11px] text-slate-500">{employeeEmail}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {isTeamMember ? 'Team' : 'Employee'}
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {employeeRole}
                </span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = item.path === '/employee'
                ? location.pathname === '/employee'
                : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${sidebarOpen ? '' : 'justify-center'}`}
                  style={isActive ? {
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#fff',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(148,163,184,0.8)',
                  }}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
                  )}

                  {/* Icon with gradient bg on active */}
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${isActive ? '' : 'group-hover:bg-white/5'}`}
                    style={isActive ? { background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' } : {}}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>
                      {iconMap[item.icon]}
                    </span>
                  </span>

                  {sidebarOpen && <span className="truncate">{item.label}</span>}

                  {isActive && sidebarOpen && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.9)' }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              title="Logout"
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 transition-all duration-200 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </span>
              {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3.5 top-20 hidden h-7 w-7 items-center justify-center rounded-full text-slate-300 transition-all duration-200 hover:text-white lg:flex"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header
            className="sticky top-0 z-30 px-5 py-4 lg:px-8"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile menu btn */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl p-2 text-slate-400 transition hover:text-white lg:hidden"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{currentNavItem.label}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-400/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">SolutionHub</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">Welcome back, {employeeName.split(' ')[0]}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Current page pill */}
                <div
                  className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                  <span className="text-[11px] font-bold text-slate-300">{currentNavItem.label}</span>
                </div>

                <NotificationBell />

                <Link
                  to="/employee/profile"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:text-white shadow-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {employeeAvatar ? (
                      <img src={employeeAvatar} alt={employeeName} className="w-full h-full object-cover" />
                    ) : (
                      employeeInitial
                    )}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <Link
                  to="/"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-slate-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  <span className="hidden sm:inline">View Site</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-7 lg:px-8" onWheel={handleWheel}>
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
