'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import ImageCropModal from '../components/ImageCropModal'

const createProfileForm = (profile, currentUser) => ({
  displayName: profile?.displayName || currentUser?.displayName || '',
  phone: profile?.phone || '',
  avatar: profile?.avatar || profile?.photoURL || currentUser?.photoURL || '',
  coverImage: profile?.coverImage || '',
  bio: profile?.bio || '',
  location: profile?.location || '' })

const getInitials = (name) =>
  (name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'U'

export default function UserProfile() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const { getUserEnrollments, certificates = [], orders = [] } = useStore()
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile, currentUser))
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'edit' | 'security'
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState(null)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile, currentUser))
  }, [userProfile, currentUser])

  const userId = currentUser?.uid || userProfile?.uid || ''
  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Student'
  const avatarUrl = profileForm.avatar || userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || ''
  const initials = useMemo(() => getInitials(displayName), [displayName])

  const myEnrollments = useMemo(() => {
    return userId && getUserEnrollments ? getUserEnrollments(userId) : []
  }, [getUserEnrollments, userId])

  const myCertificatesCount = useMemo(() => {
    if (!userId) return 0
    return certificates.filter(c => (c.userId === userId || c.userEmail === currentUser?.email) && (c.status === 'approved' || c.status === 'active')).length
  }, [certificates, userId, currentUser?.email])

  const myOrdersCount = useMemo(() => {
    if (!userId) return 0
    return orders.filter(o => o.userId === userId || o.userEmail === currentUser?.email).length
  }, [orders, userId, currentUser?.email])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      if (!userId) throw new Error('User session not found.')
      const payload = {
        displayName: profileForm.displayName.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
        coverImage: profileForm.coverImage,
        bio: profileForm.bio.trim(),
        location: profileForm.location.trim() }
      await updateUserProfile(userId, payload)
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  // Open Image Crop Modal on File Selection
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileStatus({ type: 'error', message: 'Please select a valid image file.' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setRawImageSrc(e.target.result)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  // Handle Cropped Image Save
  const handleCropComplete = async (croppedBase64) => {
    setImageLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      setProfileForm(current => ({ ...current, avatar: croppedBase64 }))

      // Save Realtime to DB
      await updateUserProfile(userId, { avatar: croppedBase64 })
      setProfileStatus({ type: 'success', message: 'Profile photo cropped & saved successfully!' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to save avatar.' })
    } finally {
      setImageLoading(false)
    }
  }

  // Realtime Automatic Cover Image Upload & Save
  const handleCoverImageUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileStatus({ type: 'error', message: 'Please select a valid image file.' })
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
          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const base64Url = canvas.toDataURL('image/jpeg', 0.85)
          setProfileForm(current => ({ ...current, coverImage: base64Url }))

          // Save Realtime to DB!
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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordStatus({ type: '', message: '' })

    try {
      await updateUserPassword()
      setPasswordStatus({ type: 'success', message: 'Password reset link sent to your email.' })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Unable to send password reset email.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-['Outfit',sans-serif] pb-20">

      {profileStatus.message && (
        <div className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm font-bold shadow-2xs flex items-center justify-between ${
          profileStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          <span>{profileStatus.message}</span>
          <button onClick={() => setProfileStatus({ type: '', message: '' })} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* ── 1. Top Profile Banner Card (Reference Design + Realtime Custom Cover Background) ── */}
      <div className="relative rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Soft subtle gradient OR custom uploaded cover image */}
        <div className="relative h-36 sm:h-44 rounded-t-[28px] bg-gradient-to-r from-blue-100/70 via-purple-100/50 to-indigo-100/60 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4 overflow-hidden group/cover">
          {profileForm.coverImage ? (
            <img src={profileForm.coverImage} alt="Cover Background" className="h-full w-full object-cover transition-transform duration-700 group-hover/cover:scale-105" />
          ) : (
            <>
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-300/20 blur-2xl" />
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

          {/* Top Right Dynamic Numeric Badges */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10">
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white shadow-xs px-2" title="Enrolled Courses">
              {myEnrollments.length}
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white shadow-xs px-2" title="Certificates">
              {myCertificatesCount}
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white shadow-xs px-2" title="Orders">
              {myOrdersCount}
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
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
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
                  STUDENT ⚡
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                {profileForm.bio ? profileForm.bio.slice(0, 60) + '...' : 'Learning and growing with Amit Solution Hub'}
                {profileForm.location ? ` · based in ${profileForm.location}` : ''}
              </p>

              {/* Action Buttons: Dark Solid Pill & Outlined Pill */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className="rounded-full border border-slate-300 hover:bg-slate-100 text-slate-800 px-6 py-2.5 text-xs font-bold transition-all cursor-pointer"
                >
                  Password & Security
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Counters */}
          <div className="flex items-center gap-8 sm:gap-12 pt-2 border-t lg:border-t-0 border-slate-100">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Courses</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{myEnrollments.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certificates</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{myCertificatesCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Orders</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{myOrdersCount}</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Horizontal Navigation Tabs ── */}
      <div className="border-b border-slate-200/80 px-2 flex items-center gap-8 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Work & Overview' },
          { id: 'edit', label: 'Edit Profile' },
          { id: 'security', label: 'Account Security' },
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
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── 3. Tab Content Panels ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="rounded-[32px] border border-slate-200/90 bg-sky-50/40 p-6 relative overflow-hidden">
            <span className="rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 mb-4 inline-block">
              COURSES
            </span>
            <h3 className="text-base font-bold text-slate-900">My Enrolled Courses</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track your active video lectures, module progress, and upcoming trading mentorships.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200/90 bg-indigo-50/40 p-6 relative overflow-hidden">
            <span className="rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 mb-4 inline-block">
              VERIFIED
            </span>
            <h3 className="text-base font-bold text-slate-900">Certificates & Awards</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Download QR-verified official course completion & internship certificates.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200/90 bg-purple-50/40 p-6 relative overflow-hidden">
            <span className="rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 mb-4 inline-block">
              SUPPORT
            </span>
            <h3 className="text-base font-bold text-slate-900">Student Support</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Get instant help with doubt resolution, query tickets, and technical guidance.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile Info</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Full Name</label>
                <input
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Phone</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Location</label>
              <input
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="City, State"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={4}
                placeholder="A short intro..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 text-sm shadow-md transition-all cursor-pointer"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Password Reset</h2>
          <p className="text-xs text-slate-500">
            Send a secure password reset link to <strong className="text-slate-800">{currentUser?.email}</strong>.
          </p>
          {passwordStatus.message && (
            <div className={`p-4 rounded-2xl border text-xs font-bold ${passwordStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {passwordStatus.message}
            </div>
          )}
          <button
            onClick={handlePasswordSubmit}
            disabled={passwordLoading}
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 text-xs shadow-sm cursor-pointer"
          >
            {passwordLoading ? 'Sending...' : 'Send Password Reset Link'}
          </button>
        </div>
      )}

      {/* Interactive Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

    </div>
  )
}