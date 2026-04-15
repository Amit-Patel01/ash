import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function InputField({ label, type = 'text', value, onChange, placeholder, required, mono }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-slate-700 focus:outline-none transition-all ${mono ? 'font-mono' : ''}`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
        onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.45)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
      />
    </div>
  )
}

function SectionCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl p-6 ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
    >
      {children}
    </div>
  )
}

function StatusAlert({ status }) {
  if (!status.message) return null
  const isSuccess = status.type === 'success'
  return (
    <div
      className="mb-5 rounded-2xl p-4 flex items-center gap-3 text-[13px]"
      style={{
        background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        color: isSuccess ? '#34d399' : '#f87171',
        animation: 'fadeInUp 0.3s ease',
      }}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={isSuccess ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
        />
      </svg>
      {status.message}
    </div>
  )
}

export default function EmployeeProfile() {
  const { userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState({
    displayName: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    department: userProfile?.department || '',
    avatar: userProfile?.avatar || '',
    bio: userProfile?.bio || '',
    jobTitle: userProfile?.jobTitle || '',
    experience: userProfile?.experience || '',
    github: userProfile?.github || '',
    linkedin: userProfile?.linkedin || '',
    portfolio: userProfile?.portfolio || '',
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const updateProfile = (field) => (e) => setProfileForm(f => ({ ...f, [field]: e.target.value }))
  const updatePassword = (field) => (e) => setPasswordForm(f => ({ ...f, [field]: e.target.value }))

  const avatarInitial = profileForm.displayName?.charAt(0)?.toUpperCase() || '?'
  const hasAvatar = profileForm.avatar?.startsWith('http')

  if (!userProfile) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mr-3" />
      <span className="text-slate-400">Loading profile...</span>
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6 pb-20" style={{ animation: 'fadeInUp 0.45s ease forwards' }}>

      {/* Top profile summary */}
      <SectionCard>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div
              className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: hasAvatar ? 'transparent' : 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              {hasAvatar ? (
                <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : avatarInitial}
            </div>
            <div
              className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 2px 10px rgba(16,185,129,0.4)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-black text-white">{profileForm.displayName || 'Your Name'}</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">{userProfile?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {profileForm.jobTitle && (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {profileForm.jobTitle}
                </span>
              )}
              {profileForm.department && (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {profileForm.department}
                </span>
              )}
              {profileForm.experience && (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-violet-300" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  {profileForm.experience} exp
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Personal Information */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <svg className="w-4.5 h-4.5 text-emerald-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-black text-white">Personal Information</h2>
            <p className="text-[11px] text-slate-600">Update your account details and profile picture</p>
          </div>
        </div>

        <StatusAlert status={profileStatus} />

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setProfileStatus({ type: '', message: '' })
            try {
              await updateUserProfile(userProfile.uid, profileForm)
              setProfileStatus({ type: 'success', message: 'Profile updated successfully!' })
            } catch (err) {
              setProfileStatus({ type: 'error', message: err.message || 'Failed to update profile' })
            } finally { setLoading(false) }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Full Name" value={profileForm.displayName} onChange={updateProfile('displayName')} required />
            <InputField label="Phone Number" value={profileForm.phone} onChange={updateProfile('phone')} />
          </div>

          <InputField
            label="Profile Photo URL"
            type="url"
            value={profileForm.avatar}
            onChange={updateProfile('avatar')}
            placeholder="https://example.com/photo.jpg"
          />

          {/* Instructor block */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-4 9 4-9 4-9-4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5V14c0 1.7 2.5 3.3 5 3.3s5-1.6 5-3.3v-3.5" />
              </svg>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">Instructor / Mentor Profile</p>
            </div>
            <p className="text-[10px] text-slate-600 mb-4">These details appear on your course page as the instructor profile</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Job Title / Designation" value={profileForm.jobTitle} onChange={updateProfile('jobTitle')} placeholder="e.g. Full Stack Developer" />
              <InputField label="Experience" value={profileForm.experience} onChange={updateProfile('experience')} placeholder="e.g. 5+ Years" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1.5">Bio / About You</label>
              <textarea
                value={profileForm.bio}
                onChange={updateProfile('bio')}
                rows={3}
                placeholder="Tell students about your background, expertise and teaching approach..."
                className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-slate-700 focus:outline-none transition-all resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
              />
            </div>
          </div>

          {/* Social links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="GitHub Username" value={profileForm.github} onChange={updateProfile('github')} placeholder="username" />
            <InputField label="LinkedIn URL" type="url" value={profileForm.linkedin} onChange={updateProfile('linkedin')} placeholder="https://linkedin.com/in/..." />
            <InputField label="Portfolio URL" type="url" value={profileForm.portfolio} onChange={updateProfile('portfolio')} placeholder="https://portfolio.com" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-[14px] font-black text-white flex items-center justify-center gap-2.5 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.45)')}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)'}
          >
            {loading && <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {loading ? 'Updating...' : 'Save Information'}
          </button>
        </form>
      </SectionCard>

      {/* Change Password */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-black text-white">Change Password</h2>
            <p className="text-[11px] text-slate-600">Regularly update your password to maintain security</p>
          </div>
        </div>

        <StatusAlert status={passwordStatus} />

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (passwordForm.new !== passwordForm.confirm) {
              setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
              return
            }
            setLoading(true)
            setPasswordStatus({ type: '', message: '' })
            try {
              await updateUserPassword(passwordForm.current, passwordForm.new)
              setPasswordStatus({ type: 'success', message: 'Password updated successfully!' })
              setPasswordForm({ current: '', new: '', confirm: '' })
            } catch (err) {
              setPasswordStatus({ type: 'error', message: err.message || 'Verification failed. Re-login required for security.' })
            } finally { setLoading(false) }
          }}
        >
          <InputField label="Current Password" type="password" value={passwordForm.current} onChange={updatePassword('current')} required mono />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="New Password" type="password" value={passwordForm.new} onChange={updatePassword('new')} required mono />
            <InputField label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={updatePassword('confirm')} required mono />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-[14px] font-black flex items-center justify-center gap-2.5 transition-all duration-200"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)', color: '#fb923c', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(249,115,22,0.25)')}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}
          >
            {loading && <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </SectionCard>
    </div>
  )
}
