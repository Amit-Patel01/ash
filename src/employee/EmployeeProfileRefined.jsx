'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { api } from '../config/api'
import {
  EmployeeBadge,
  EmployeeSurface } from './EmployeePanelUI'
import { getEmployeeInitials } from './employeeUtils'

const createProfileForm = (profile) => ({
  displayName: profile?.displayName || '',
  phone: profile?.phone || '',
  department: profile?.department || '',
  avatar: profile?.avatar || profile?.photoURL || '',
  coverImage: profile?.coverImage || '',
  bio: profile?.bio || '',
  jobTitle: profile?.jobTitle || '',
  experience: profile?.experience || '',
  location: profile?.location || '',
  github: profile?.github || '',
  linkedin: profile?.linkedin || '',
  portfolio: profile?.portfolio || '',
  cvFilePath: profile?.cvFilePath || '',
  showOnTeam: Boolean(profile?.showOnTeam) })

export default function EmployeeProfileRefined() {
  const { currentUser, userProfile, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth()
  const { tasks, projects } = useStore()
  
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile))
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'work' | 'edit' | 'security'
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [emailForm, setEmailForm] = useState(() => currentUser?.email || userProfile?.email || '')
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [publicProfileStatus, setPublicProfileStatus] = useState({ type: '', message: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile))
  }, [userProfile])

  useEffect(() => {
    setEmailForm(currentUser?.email || userProfile?.email || '')
  }, [currentUser?.email, userProfile?.email])

  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Employee'
  const accountEmail = currentUser?.email || userProfile?.email || ''
  const initials = getEmployeeInitials(displayName)
  const userId = currentUser?.uid || userProfile?.uid || ''

  const publicProfileId = encodeURIComponent(
    userProfile?.uid ||
    userProfile?.employeeId ||
    currentUser?.uid ||
    currentUser?.email ||
    displayName
  )
  const publicProfilePath = `/team/${publicProfileId}`
  const publicProfileUrl =
    typeof window !== 'undefined'
      ? new URL(publicProfilePath, window.location.origin).toString()
      : `https://www.amitsolutionhub.com${publicProfilePath}`

  // Metrics from assigned tasks & projects
  const myTasksCount = useMemo(() => {
    return tasks ? tasks.length : 24
  }, [tasks])

  const myProjectsCount = useMemo(() => {
    return projects ? projects.length : 12
  }, [projects])

  const activityScore = useMemo(() => {
    return (myTasksCount * 18) + (myProjectsCount * 35) + 420
  }, [myTasksCount, myProjectsCount])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      if (!userId) throw new Error('User session not found.')
      await updateUserProfile(userId, profileForm)
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  // Realtime Automatic Avatar Upload & DB Save
  const handleImageUpload = async (event) => {
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
          setProfileForm(current => ({ ...current, avatar: base64Url }))

          // Realtime DB Save instantly!
          updateUserProfile(userId, { avatar: base64Url })
            .then(() => {
              setImageLoading(false)
              setProfileStatus({ type: 'success', message: 'Profile photo updated & saved instantly!' })
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

  // Realtime Automatic Cover Image Upload & DB Save
  const handleCoverImageUpload = async (event) => {
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
          setProfileForm(current => ({ ...current, coverImage: base64Url }))

          // Realtime DB Save instantly!
          updateUserProfile(userId, { coverImage: base64Url })
            .then(() => {
              setCoverLoading(false)
              setProfileStatus({ type: 'success', message: 'Cover background updated & saved instantly!' })
            })
            .catch((err) => {
              setCoverLoading(false)
              setProfileStatus({ type: 'error', message: err.message || 'Failed to save cover image.' })
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
      setEmailStatus({ type: 'success', message: 'Email updated successfully. Use the new email for your next login.' })
    } catch (error) {
      setEmailStatus({ type: 'error', message: error.message || 'Unable to update email.' })
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordStatus({ type: '', message: '' })

    try {
      await updateUserPassword()
      setPasswordStatus({ type: 'success', message: 'A password reset link has been sent to your email address.' })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Unable to send the password reset email.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCopyPublicProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      setPublicProfileStatus({ type: 'success', message: 'Public profile link copied to clipboard.' })
    } catch (error) {
      setPublicProfileStatus({ type: 'error', message: 'Unable to copy the link.' })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 font-['Outfit',sans-serif]">

      {profileStatus.message && (
        <div className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm font-bold shadow-2xs flex items-center justify-between ${
          profileStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          <span>{profileStatus.message}</span>
          <button onClick={() => setProfileStatus({ type: '', message: '' })} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* ── 1. Top Profile Header Banner (Designer Reference Style + Realtime Custom Cover Background) ── */}
      <div className="relative rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Soft subtle gradient OR custom uploaded background cover image */}
        <div className="relative h-36 sm:h-44 rounded-t-[28px] bg-gradient-to-r from-blue-100/70 via-indigo-100/50 to-purple-100/60 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4 overflow-hidden group/cover">
          {profileForm.coverImage ? (
            <img src={profileForm.coverImage} alt="Cover Background" className="h-full w-full object-cover transition-transform duration-700 group-hover/cover:scale-105" />
          ) : (
            <>
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-300/20 blur-2xl" />
              <div className="absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-purple-300/20 blur-xl" />
            </>
          )}

          {/* Change Cover Photo Realtime Upload Button */}
          <label className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 hover:bg-slate-900/90 transition-all cursor-pointer shadow-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
            <span>{coverLoading ? 'Uploading Cover...' : profileForm.coverImage ? 'Change Cover' : 'Add Cover Photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} disabled={coverLoading} />
          </label>

          {/* Top Right Colored Numeric Pills (26, 6, 12 style from image) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10">
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white shadow-xs px-2">
              {myTasksCount}
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white shadow-xs px-2">
              {myProjectsCount}
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white shadow-xs px-2">
              {userProfile?.employeeId || 'ASH-01'}
            </span>
          </div>
        </div>

        {/* Content Layout: Avatar + Details + Right Stats */}
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">

          {/* Left Column: Avatar + Profile Name & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar container overflowing header */}
            <div className="relative group shrink-0 -mt-16 sm:-mt-20 z-10">
              <div className="h-32 w-32 sm:h-36 sm:w-36 overflow-hidden rounded-[32px] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-slate-800">
                {profileForm.avatar?.startsWith('http') || profileForm.avatar?.startsWith('data:') ? (
                  <img src={profileForm.avatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {initials}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 rounded-[32px] bg-slate-900/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg className="w-7 h-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span className="text-[10px] font-bold">{imageLoading ? 'Saving...' : 'Change Photo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageLoading} />
              </label>
            </div>

            {/* Name, Designation & Action Buttons */}
            <div className="pt-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{displayName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-2xs">
                  {profileForm.jobTitle ? 'PRO' : 'MEMBER'} ⚡
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                {profileForm.jobTitle || userProfile?.role || 'Team Specialist'}
                {profileForm.department ? ` based in ${profileForm.department}` : ' at Amit Solution Hub'}
              </p>

              {/* Action Buttons: Solid Pill & Outlined Pill */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
                {profileForm.showOnTeam ? (
                  <a
                    href={publicProfilePath}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-300 hover:bg-slate-100 text-slate-800 px-6 py-2.5 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    View Public Profile
                  </a>
                ) : (
                  <button
                    onClick={() => setActiveTab('security')}
                    className="rounded-full border border-slate-300 hover:bg-slate-100 text-slate-800 px-6 py-2.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    Account Security
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Big Counters (Followers, Following, Likes Style) */}
          <div className="flex items-center gap-8 sm:gap-12 pt-2 border-t lg:border-t-0 border-slate-100">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tasks</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{myTasksCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{myProjectsCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Likes / Score</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activityScore}</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Horizontal Navigation Tabs (Work, Moodboards, Likes, About Style) ── */}
      <div className="border-b border-slate-200/80 px-2 flex items-center gap-8 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Work & Overview', count: myProjectsCount },
          { id: 'edit', label: 'Edit Profile' },
          { id: 'security', label: 'Security & Email' },
          { id: 'about', label: 'About & CV' },
        ].map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] font-bold text-slate-400"><sup>{tab.count}</sup></span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── 3. Tab Content Panels ── */}

      {/* TAB 1: WORK & OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Showcase Card 1 */}
            <div className="group rounded-[32px] border border-slate-200/90 bg-sky-50/40 p-6 transition-all hover:bg-sky-50/70 hover:shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
                  UI / DEV
                </span>
                <span className="text-xs font-bold text-slate-400">Active</span>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-sky-100 mb-4 h-36 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-900">Dashboard & LMS Console</p>
                <p className="text-[11px] text-slate-400 mt-0.5">SolutionHub Core Platform</p>
              </div>
              <h3 className="text-base font-bold text-slate-900">Platform Development</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {profileForm.bio || 'Building reactive user interfaces and managing student workflows.'}
              </p>
            </div>

            {/* Showcase Card 2 */}
            <div className="group rounded-[32px] border border-slate-200/90 bg-indigo-50/40 p-6 transition-all hover:bg-indigo-50/70 hover:shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
                  TASKS
                </span>
                <span className="text-xs font-bold text-slate-400">{myTasksCount} Open</span>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-indigo-100 mb-4 h-36 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-900">Execution & Milestones</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Department Operations</p>
              </div>
              <h3 className="text-base font-bold text-slate-900">Assigned Tasks Queue</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Active tasks mapped to {displayName} with automated progress updates.
              </p>
            </div>

            {/* Showcase Card 3 */}
            <div className="group rounded-[32px] border border-slate-200/90 bg-purple-50/40 p-6 transition-all hover:bg-purple-50/70 hover:shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
                  MENTOR
                </span>
                <span className="text-xs font-bold text-slate-400">{profileForm.experience || 'Active'}</span>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-purple-100 mb-4 h-36 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-900">Student & Intern Guidance</p>
                <p className="text-[11px] text-slate-400 mt-0.5">SolutionHub Mentorship</p>
              </div>
              <h3 className="text-base font-bold text-slate-900">Mentorship Node</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Guiding registered students across tech and course tracks.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE FORM */}
      {activeTab === 'edit' && (
        <EmployeeSurface title="Edit Public Profile" description="Update your public name, designation, phone, experience, and social links.">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Full Name *</label>
                <input
                  value={profileForm.displayName}
                  onChange={(event) => setProfileForm(current => ({ ...current, displayName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Phone Number</label>
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm(current => ({ ...current, phone: event.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Department</label>
                <input
                  value={profileForm.department}
                  onChange={(event) => setProfileForm(current => ({ ...current, department: event.target.value }))}
                  placeholder="e.g. Web Development / HR / Sales"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Job Title / Designation</label>
                <input
                  value={profileForm.jobTitle}
                  onChange={(event) => setProfileForm(current => ({ ...current, jobTitle: event.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Experience</label>
                <input
                  value={profileForm.experience}
                  onChange={(event) => setProfileForm(current => ({ ...current, experience: event.target.value }))}
                  placeholder="e.g. 4+ Years"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Avatar Image URL</label>
                <input
                  value={profileForm.avatar}
                  onChange={(event) => setProfileForm(current => ({ ...current, avatar: event.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Public Team Visibility</p>
                  <p className="text-xs text-slate-500 mt-0.5">Show your profile in the public SolutionHub team roster.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileForm(current => ({ ...current, showOnTeam: !current.showOnTeam }))}
                  className={`relative h-6 w-11 rounded-full transition-all cursor-pointer ${profileForm.showOnTeam ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${profileForm.showOnTeam ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Bio / About Me</label>
              <textarea
                value={profileForm.bio}
                onChange={(event) => setProfileForm(current => ({ ...current, bio: event.target.value }))}
                rows={4}
                placeholder="Write a brief intro about your skills, background, and responsibilities..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">GitHub URL</label>
                <input
                  value={profileForm.github}
                  onChange={(event) => setProfileForm(current => ({ ...current, github: event.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">LinkedIn URL</label>
                <input
                  value={profileForm.linkedin}
                  onChange={(event) => setProfileForm(current => ({ ...current, linkedin: event.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Portfolio URL</label>
                <input
                  value={profileForm.portfolio}
                  onChange={(event) => setProfileForm(current => ({ ...current, portfolio: event.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </EmployeeSurface>
      )}

      {/* TAB 3: SECURITY & EMAIL */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <EmployeeSurface title="Account Email" description="Update your primary login email address.">
            {emailStatus.message && (
              <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                emailStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}>
                {emailStatus.message}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                Current login email: <span className="font-bold text-slate-900">{accountEmail || 'Not linked'}</span>
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">New Email Address</label>
                <input
                  type="email"
                  value={emailForm}
                  onChange={(event) => setEmailForm(event.target.value)}
                  placeholder="employee@amitsolutionhub.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {emailLoading ? 'Updating Email...' : 'Update Account Email'}
              </button>
            </form>
          </EmployeeSurface>

          <EmployeeSurface title="Password & Security" description="For safety, password resets are verified via email authentication link.">
            {passwordStatus.message && (
              <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                passwordStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Clicking below will send a secure password reset link to <strong className="text-slate-800">{accountEmail}</strong>.
              </p>
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-6 py-2.5 text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
              </button>
            </form>
          </EmployeeSurface>
        </div>
      )}

      {/* TAB 4: ABOUT & CV */}
      {activeTab === 'about' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <EmployeeSurface title="CV & Resume External Link" description="Link your Google Drive or cloud resume document.">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Google Drive CV Link</label>
                <div className="relative">
                  <input
                    type="url"
                    value={profileForm.cvFilePath}
                    onChange={(event) => setProfileForm(current => ({ ...current, cvFilePath: event.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                  </div>
                </div>
              </div>
              {profileForm.cvFilePath && (
                <a
                  href={profileForm.cvFilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  Open CV Link in new tab →
                </a>
              )}
            </div>
          </EmployeeSurface>

          {profileForm.showOnTeam && (
            <EmployeeSurface title="Public Profile URL" description="Share this direct URL with colleagues or recruiters.">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={publicProfileUrl}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPublicProfileUrl}
                    className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
                {publicProfileStatus.message && (
                  <p className={`text-xs font-bold ${publicProfileStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {publicProfileStatus.message}
                  </p>
                )}
              </div>
            </EmployeeSurface>
          )}
        </div>
      )}

    </div>
  )
}
