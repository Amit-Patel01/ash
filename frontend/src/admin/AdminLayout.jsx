import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Globe, ChevronDown, LogOut, Menu, X, Bell } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

const navGroups = [
  {
    label: 'Core',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
      { path: '/admin/projects', label: 'Source Codes', icon: 'folder', permission: 'can_manage_projects' },
      { path: '/admin/tasks', label: 'Tasks', icon: 'task', permission: 'can_manage_tasks' },
      { path: '/admin/sales', label: 'Sales', icon: 'cart', permission: 'can_manage_sales' },
      { path: '/admin/receipts', label: 'Receipts', icon: 'receipt', permission: 'can_manage_sales' },
      { path: '/admin/services', label: 'Services', icon: 'design_services', permission: 'can_manage_services' },
      { path: '/admin/testimonials', label: 'Testimonials', icon: 'comment' },
      { path: '/admin/internship-categories', label: 'Internship Categories', icon: 'layers' },
    ]
  },
  {
    label: 'Courses',
    items: [
      { path: '/admin/courses', label: 'All Courses', icon: 'book' },
      { path: '/admin/coupons', label: 'Coupons', icon: 'coupon' },
      { path: '/admin/course-categories', label: 'Categories', icon: 'tag' },
      { path: '/admin/course-enrollments', label: 'Enrollments', icon: 'book' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { path: '/admin/students', label: 'Students', icon: 'group' },
      { path: '/admin/employees', label: 'Staff Accounts', icon: 'badge', permission: 'can_manage_employees' },
      { path: '/admin/team', label: 'Team', icon: 'group', permission: 'can_manage_employees' },
      { path: '/admin/permissions', label: 'Permissions', icon: 'shield', permission: 'can_manage_employees' },
      { path: '/admin/qr-certificates', label: 'QR Certificates', icon: 'award' },
    ]
  },
  {
    label: 'Inbox & Requests',
    items: [
      { path: '/admin/messages', label: 'Messages', icon: 'mail', permission: 'can_manage_messages' },
      { path: '/admin/account-requests', label: 'Account Requests', icon: 'userPlus', permission: 'can_approve_accounts' },
      { path: '/admin/service-requests', label: 'Service Requests', icon: 'clipboardList', permission: 'can_manage_service_requests' },
      { path: '/admin/sell-requests', label: 'Sell Requests', icon: 'tag', permission: 'can_manage_sell_requests' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/admin/profile', label: 'Admin Profile', icon: 'user' },
      { path: '/admin/settings', label: 'System Settings', icon: 'settings', permission: 'can_manage_settings' },
    ]
  },
]

const iconMap = {
  user: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  folder: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  task: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  group: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  design_services: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.25-2.98a1 1 0 00-1.42.87v5.94a1 1 0 001.42.87l5.25-2.98a1 1 0 000-1.72zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  mail: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  badge: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  ),
  cart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99a6.932 6.932 0 010 .255c.007.378-.138.75-.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  userPlus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  tag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  clipboardList: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  award: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16.5 8 22l-3-1-3 1 1-5.5" />
    </svg>
  ),
  coupon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 15 6-6" />
    </svg>
  ),
  comment: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  layers: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  receipt: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zM9 13.5h6m-6 3h3" />
    </svg>
  ),
}

export default function AdminLayout({ onLogout }) {
  const { currentUser, hasPermission, userProfile } = useAuth()
  const { accountRequests, sellRequests, serviceRequests, messages } = useStore()
  
  const [openGroup, setOpenGroup] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState(null)

  const navRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const avatarUrl = userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || currentUser?.avatar || ''
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'
  const displayEmail = currentUser?.email || 'admin@solutionhub.com'
  const avatar = displayName.charAt(0).toUpperCase()

  // Close dropdowns on outside click or route change
  useEffect(() => {
    setOpenGroup(null)
    setShowNotifications(false)
    setShowProfileMenu(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenGroup(null)
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase()
    if (q.includes('project')) navigate('/admin/projects')
    else if (q.includes('task')) navigate('/admin/tasks')
    else if (q.includes('employee')) navigate('/admin/employees')
    else if (q.includes('certificate') || q.includes('qr')) navigate('/admin/qr-certificates')
    else if (q.includes('sale') || q.includes('order')) navigate('/admin/sales')
    else if (q.includes('message')) navigate('/admin/messages')
    else if (q.includes('setting')) navigate('/admin/settings')
    else if (q.includes('service')) navigate('/admin/services')
    setSearchQuery('')
  }

  const getBadgeCount = (itemPath) => {
    if (itemPath === '/admin/account-requests') return accountRequests.filter(r => r.status === 'pending').length
    if (itemPath === '/admin/service-requests') return serviceRequests.filter(r => r.status === 'pending').length
    if (itemPath === '/admin/sell-requests') return sellRequests.filter(r => r.status === 'pending').length
    if (itemPath === '/admin/messages') return messages.filter(m => m.status === 'unread').length
    return 0
  }

  const isGroupActive = (group) => {
    return group.items.some(item => 
      item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path)
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Outfit',sans-serif]">
      
      {/* ── TOP HORIZONTAL NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" ref={navRef}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Brand Logo & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/admin" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                    SolutionHub
                  </h1>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Admin Portal</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Dropdowns */}
            <nav className="hidden lg:flex items-center gap-1">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter(item => !item.permission || hasPermission(item.permission))
                if (visibleItems.length === 0) return null

                const active = isGroupActive(group)
                const isOpen = openGroup === group.label

                // Total badge count in group
                const groupBadgeTotal = visibleItems.reduce((acc, item) => acc + getBadgeCount(item.path), 0)

                return (
                  <div key={group.label} className="relative">
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : group.label)}
                      onMouseEnter={() => setOpenGroup(group.label)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        active 
                          ? 'bg-blue-50 text-blue-600 font-bold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <span>{group.label}</span>
                      {groupBadgeTotal > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full">
                          {groupBadgeTotal}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                    </button>

                    {/* Dropdown Menu Panel */}
                    {isOpen && (
                      <div 
                        onMouseLeave={() => setOpenGroup(null)}
                        className="absolute left-0 mt-1 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                        </div>
                        <div className="space-y-0.5 px-1.5">
                          {visibleItems.map((item) => {
                            const isItemActive = item.path === '/admin'
                              ? location.pathname === '/admin'
                              : location.pathname.startsWith(item.path)
                            const badge = getBadgeCount(item.path)

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpenGroup(null)}
                                className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                  isItemActive
                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={isItemActive ? 'text-blue-600' : 'text-slate-400'}>
                                    {iconMap[item.icon]}
                                  </span>
                                  <span>{item.label}</span>
                                </div>
                                {badge > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                    {badge}
                                  </span>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search admin..."
                  className="w-44 lg:w-56 pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </form>

              {/* View Main Site */}
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-all shadow-2xs"
                title="View Main Website"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>View Site</span>
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Bell className="w-4 h-4" />
                  {(accountRequests.filter(r => r.status === 'pending').length +
                    sellRequests.filter(r => r.status === 'pending').length +
                    serviceRequests.filter(r => r.status === 'pending').length +
                    messages.filter(m => m.status === 'unread').length) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {accountRequests.filter(r => r.status === 'pending').length > 0 && (
                          <Link to="/admin/account-requests" onClick={() => setShowNotifications(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{iconMap.userPlus}</div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Account Requests</p>
                              <p className="text-[10px] text-slate-500">{accountRequests.filter(r => r.status === 'pending').length} pending approval</p>
                            </div>
                          </Link>
                        )}
                        {messages.filter(m => m.status === 'unread').length > 0 && (
                          <Link to="/admin/messages" onClick={() => setShowNotifications(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">{iconMap.mail}</div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Unread Messages</p>
                              <p className="text-[10px] text-slate-500">{messages.filter(m => m.status === 'unread').length} new messages</p>
                            </div>
                          </Link>
                        )}
                        {accountRequests.filter(r => r.status === 'pending').length === 0 && messages.filter(m => m.status === 'unread').length === 0 && (
                          <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : avatar}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
                    </div>
                    <Link to="/admin/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      {iconMap.user}
                      <span>Admin Profile</span>
                    </Link>
                    <Link to="/admin/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      {iconMap.settings}
                      <span>System Settings</span>
                    </Link>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">SH</div>
              <span className="font-bold text-sm">Admin Navigation</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter(item => !item.permission || hasPermission(item.permission))
              if (visibleItems.length === 0) return null

              return (
                <div key={group.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
                  <div className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-blue-600">{iconMap[item.icon]}</span>
                          <span>{item.label}</span>
                        </div>
                        {getBadgeCount(item.path) > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {getBadgeCount(item.path)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER (FULL WIDTH) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}
