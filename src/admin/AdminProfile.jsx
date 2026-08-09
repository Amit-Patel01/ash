'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Phone,
  Shield,
  Sparkles,
  UserCheck,
  Building,
  MapPin,
  Briefcase,
  KeyRound,
  FileText,
  ExternalLink,
  Layers,
  FolderGit2,
  Users,
  Award,
  Lock,
  Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

function GithubIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedinIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

const createProfileForm = (profile, currentUser) => ({
  displayName: profile?.displayName || currentUser?.displayName || '',
  phone: profile?.phone || currentUser?.phone || '',
  department: profile?.department || 'Executive / Management',
  avatar: profile?.avatar || profile?.photoURL || currentUser?.photoURL || '',
  coverImage: profile?.coverImage || '',
  bio: profile?.bio || 'Administrator & Platform Leader at Amit Solution Hub.',
  jobTitle: profile?.jobTitle || 'Administrator',
  experience: profile?.experience || '5+ Years',
  location: profile?.location || 'Gujarat, India',
  github: profile?.github || '',
  linkedin: profile?.linkedin || '',
  portfolio: profile?.portfolio || '',
  showOnTeam: profile?.showOnTeam !== undefined ? Boolean(profile?.showOnTeam) : true })

export default function AdminProfile() {
  const { currentUser, userProfile, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth()
  const { projects, users, tasks } = useStore()

  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile, currentUser))
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'edit' | 'security' | 'visibility'
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  
  const [emailForm, setEmailForm] = useState(() => currentUser?.email || userProfile?.email || '')
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' })
  const [emailLoading, setEmailLoading] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile, currentUser))
  }, [userProfile, currentUser])

  useEffect(() => {
    setEmailForm(currentUser?.email || userProfile?.email || '')
  }, [currentUser?.email, userProfile?.email])

  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Admin'
  const accountEmail = currentUser?.email || userProfile?.email || ''
  const userId = currentUser?.uid || userProfile?.uid || currentUser?.id || currentUser?._id || userProfile?.id || userProfile?._id || currentUser?.email || 'admin-session'

  const publicProfileId = encodeURIComponent(
    userProfile?.uid ||
    userProfile?.employeeId ||
    currentUser?.uid ||
    currentUser?.email ||
    displayName
  )
  const publicProfilePath = `/team/${publicProfileId}`

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD'
  }, [displayName])

  // Profile Save
  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      if (!userId) throw new Error('Admin session not found.')
      await updateUserProfile(userId, profileForm)
      setProfileStatus({ type: 'success', message: 'Admin profile updated successfully!' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update admin profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  // Realtime Avatar Upload & Save
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!userId) {
      setProfileStatus({ type: 'error', message: 'Please log in again to upload profile photo.' })
      return
    }
    if (!file.type.startsWith('image/')) {
      setProfileStatus({ type: 'error', message: 'Please choose a valid image file.' })
      return
    }

    setImageLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 300
          const MAX_HEIGHT = 300
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              width = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const base64Url = canvas.toDataURL('image/jpeg', 0.85)
          setProfileForm((curr) => ({ ...curr, avatar: base64Url }))

          updateUserProfile(userId, { avatar: base64Url })
            .then(() => {
              setImageLoading(false)
              setProfileStatus({ type: 'success', message: 'Admin profile photo saved instantly!' })
            })
            .catch((err) => {
              setImageLoading(false)
              setProfileStatus({ type: 'error', message: err.message || 'Failed to save profile photo.' })
            })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Unable to process image.' })
      setImageLoading(false)
    }
  }

  // Realtime Cover Photo Upload & Save
  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!userId) {
      setProfileStatus({ type: 'error', message: 'Please log in again to upload cover background.' })
      return
    }
    if (!file.type.startsWith('image/')) {
      setProfileStatus({ type: 'error', message: 'Please choose a valid image file.' })
      return
    }

    setCoverLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 450
          const width = img.width || 1200
          const height = img.height || 450
          const scale = Math.min(1200 / width, 450 / height, 1)
          const targetWidth = Math.round(width * scale)
          const targetHeight = Math.round(height * scale)

          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          const base64Url = canvas.toDataURL('image/jpeg', 0.85)
          setProfileForm((curr) => ({ ...curr, coverImage: base64Url }))

          updateUserProfile(userId, { coverImage: base64Url })
            .then(() => {
              setCoverLoading(false)
              setProfileStatus({ type: 'success', message: 'Cover banner saved instantly!' })
            })
            .catch((err) => {
              setCoverLoading(false)
              setProfileStatus({ type: 'error', message: err.message || 'Failed to save cover banner.' })
            })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Unable to process cover image.' })
      setCoverLoading(false)
    }
  }

  // Email Submit
  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    const nextEmail = emailForm.trim().toLowerCase()
    const currentEmail = accountEmail.trim().toLowerCase()

    setEmailStatus({ type: '', message: '' })
    if (!nextEmail) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }
    if (nextEmail === currentEmail) {
      setEmailStatus({ type: 'error', message: 'This email is already linked to your account.' })
      return
    }

    setEmailLoading(true)
    try {
      await updateUserEmail(nextEmail)
      setEmailStatus({ type: 'success', message: 'Admin login email updated successfully!' })
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.message || 'Failed to update email.' })
    } finally {
      setEmailLoading(false)
    }
  }

  // Password Submit
  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordStatus({ type: '', message: '' })

    if (!passwordForm.newPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter a new password.' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters long.' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setPasswordLoading(true)
    try {
      await updateUserPassword(passwordForm.newPassword)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setPasswordStatus({ type: 'success', message: 'Admin password updated successfully!' })
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Visibility Toggle
  const handleVisibilityToggle = async () => {
    const nextState = !profileForm.showOnTeam
    setProfileForm((curr) => ({ ...curr, showOnTeam: nextState }))
    try {
      await updateUserProfile(userId, { showOnTeam: nextState })
      setProfileStatus({
        type: 'success',
        message: nextState ? 'Your profile is now visible on public team page.' : 'Profile hidden from public team page.' })
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.message || 'Unable to update visibility.' })
    }
  }

  return (
    <div className="space-y-8 font-['Outfit',sans-serif] pb-12">
      
      {/* ── TOP HERO COVER BANNER & AVATAR SHOWCASE ── */}
      <div className="relative rounded-[36px] overflow-hidden border border-slate-200/80 bg-white shadow-xl">
        
        {/* Cover Background */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 overflow-hidden">
          {profileForm.coverImage ? (
            <img src={profileForm.coverImage} alt="Cover" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          {/* Change Cover Button */}
          <label className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white text-xs font-bold transition-all cursor-pointer shadow-lg">
            <Camera size={14} />
            <span>{coverLoading ? 'Uploading...' : 'Change Cover Background'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverLoading} />
          </label>
        </div>

        {/* Profile Info Header Bar */}
        <div className="relative px-6 sm:px-10 pb-6 sm:pb-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            
            {/* Avatar & Main Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              
              {/* Avatar overflowing cover background */}
              <div className="relative group shrink-0 -mt-14 sm:-mt-16 z-10">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-1.5 shadow-2xl border-4 border-white">
                  <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-inner">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                <label className="absolute bottom-2 right-2 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg border-2 border-white transition-all cursor-pointer group-hover:scale-110 z-20">
                  <Camera size={15} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={imageLoading} />
                </label>
              </div>

              {/* Text Info sitting cleanly on white background */}
              <div className="pt-2 sm:pt-4 space-y-1">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{displayName}</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider">
                    <Shield size={12} /> Super Admin
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-500">{profileForm.jobTitle} • {profileForm.department}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap justify-center sm:justify-start pt-0.5">
                  <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-indigo-500" /> {accountEmail}</span>
                  {profileForm.location && <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-indigo-500" /> {profileForm.location}</span>}
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex items-center gap-3 justify-center sm:justify-end pb-1 pt-2 sm:pt-4">
              <Link
                href={publicProfilePath}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition-all"
              >
                <ExternalLink size={15} className="text-indigo-600" />
                <span>View Team Page Profile</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Status Toast Alert */}
        <AnimatePresence>
          {profileStatus.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mx-6 mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
                profileStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileStatus.message}</span>
              </div>
              <button onClick={() => setProfileStatus({ type: '', message: '' })} className="text-slate-400 hover:text-slate-600">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB NAVIGATION BAR */}
        <div className="px-6 sm:px-10 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Info', icon: UserCheck },
            { id: 'edit', label: 'Edit Admin Details', icon: Briefcase },
            { id: 'security', label: 'Security & Login', icon: KeyRound },
            { id: 'visibility', label: 'Public Team Visibility', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

      </div>

      {/* ── TAB CONTENTS ── */}
      <div className="space-y-6">

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Bio & Key Metrics */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <FolderGit2 size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{projects?.length || 0}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Live Projects</p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <Users size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{users?.length || 0}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Platform Users</p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Layers size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{tasks?.length || 0}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Tasks Managed</p>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Award size={20} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">Active</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">System Status</p>
                </div>
              </div>

              {/* Executive Bio */}
              <div className="p-8 rounded-[32px] bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider">
                  <Sparkles size={16} /> Admin Executive Biography
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {profileForm.bio || 'No admin biography added yet. Click "Edit Admin Details" to update your bio.'}
                </p>
              </div>

              {/* Social Links */}
              <div className="p-8 rounded-[32px] bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Social Profiles & Portfolio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {profileForm.github ? (
                    <a href={profileForm.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50 text-slate-800 text-xs font-bold transition-all">
                      <GithubIcon size={18} className="text-slate-900" />
                      <span className="truncate">GitHub</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                      <GithubIcon size={18} /> <span>GitHub not added</span>
                    </div>
                  )}

                  {profileForm.linkedin ? (
                    <a href={profileForm.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-2xl border border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-900 text-xs font-bold transition-all">
                      <LinkedinIcon size={18} className="text-blue-600" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                      <LinkedinIcon size={18} /> <span>LinkedIn not added</span>
                    </div>
                  )}

                  {profileForm.portfolio ? (
                    <a href={profileForm.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 text-indigo-900 text-xs font-bold transition-all">
                      <Globe size={18} className="text-indigo-600" />
                      <span className="truncate">Website</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                      <Globe size={18} /> <span>Website not added</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Account Details Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-[32px] bg-white border border-slate-200/80 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Admin Account Overview</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Full Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Role / Privilege</span>
                    <span className="font-extrabold text-indigo-600 text-sm">Super Administrator</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Primary Department</span>
                    <span className="font-bold text-slate-800">{profileForm.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Phone Contact</span>
                    <span className="font-bold text-slate-800">{profileForm.phone || 'Not configured'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Location</span>
                    <span className="font-bold text-slate-800">{profileForm.location || 'India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Public Visibility</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase mt-1 ${profileForm.showOnTeam ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {profileForm.showOnTeam ? 'Visible on Team Page' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. EDIT PROFILE TAB */}
        {activeTab === 'edit' && (
          <form onSubmit={handleProfileSubmit} className="p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Edit Admin Profile Details</h2>
                <p className="text-xs text-slate-500 font-medium">Update your public name, contact details, bio, and social links.</p>
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Display Name</span>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="Admin Name"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Job Title / Title</span>
                <input
                  type="text"
                  value={profileForm.jobTitle}
                  onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="e.g. Chief Administrator"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Department</span>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="Executive Management"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Phone Number</span>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="+91 98765 43210"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Location</span>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="Gujarat, India"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Years of Experience</span>
                <input
                  type="text"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  placeholder="5+ Years"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Executive Bio</span>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs leading-relaxed"
                placeholder="Write a brief overview about your leadership and background..."
              />
            </label>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Social Media & Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">GitHub Profile URL</span>
                  <input
                    type="url"
                    value={profileForm.github}
                    onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                    placeholder="https://github.com/..."
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">LinkedIn Profile URL</span>
                  <input
                    type="url"
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                    placeholder="https://linkedin.com/in/..."
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">Personal Website URL</span>
                  <input
                    type="url"
                    value={profileForm.portfolio}
                    onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                    placeholder="https://amitsolutionhub.com"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        )}

        {/* 3. SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Update Email Form */}
            <form onSubmit={handleEmailSubmit} className="p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Admin Login Email</h3>
                  <p className="text-xs text-slate-500 font-medium">Update account login email credentials.</p>
                </div>
              </div>

              {emailStatus.message && (
                <div className={`p-4 rounded-2xl border text-xs font-bold ${emailStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {emailStatus.message}
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Email Address</span>
                <input
                  type="email"
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {emailLoading ? 'Updating Email...' : 'Update Login Email'}
              </button>
            </form>

            {/* Update Password Form */}
            <form onSubmit={handlePasswordSubmit} className="p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Change Password</h3>
                  <p className="text-xs text-slate-500 font-medium">Set a strong secure password for your admin account.</p>
                </div>
              </div>

              {passwordStatus.message && (
                <div className={`p-4 rounded-2xl border text-xs font-bold ${passwordStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {passwordStatus.message}
                </div>
              )}

              <label className="block space-y-1.5 relative">
                <span className="text-xs font-bold text-slate-700">New Password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Confirm New Password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {passwordLoading ? 'Updating Password...' : 'Update Admin Password'}
              </button>
            </form>

          </div>
        )}

        {/* 4. VISIBILITY TAB */}
        {activeTab === 'visibility' && (
          <div className="p-8 rounded-[36px] bg-white border border-slate-200/80 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Public Team Directory Showcase</h3>
                <p className="text-xs text-slate-500 font-medium">Control whether your admin profile card appears on the public SolutionHub team page.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-slate-900">Show Profile on Public Team Directory</p>
                <p className="text-xs text-slate-500 mt-0.5">When enabled, students and visitors can see your leadership profile badge on `/team`.</p>
              </div>
              
              <button
                type="button"
                onClick={handleVisibilityToggle}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  profileForm.showOnTeam ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    profileForm.showOnTeam ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href={publicProfilePath}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition-all"
              >
                <ExternalLink size={15} />
                Preview Public Profile Page
              </Link>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
