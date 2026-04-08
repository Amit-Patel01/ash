import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  EmployeeBadge,
  EmployeePageHeader,
  EmployeeSurface,
} from './EmployeePanelUI'
import { getEmployeeInitials } from './employeeUtils'

const createProfileForm = (profile) => ({
  displayName: profile?.displayName || '',
  phone: profile?.phone || '',
  department: profile?.department || '',
  avatar: profile?.avatar || '',
  bio: profile?.bio || '',
  jobTitle: profile?.jobTitle || '',
  experience: profile?.experience || '',
  github: profile?.github || '',
  linkedin: profile?.linkedin || '',
  portfolio: profile?.portfolio || '',
})

export default function EmployeeProfileRefined() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile))
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile))
  }, [userProfile])

  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Employee'
  const initials = getEmployeeInitials(displayName)
  const profileLinks = [profileForm.github, profileForm.linkedin, profileForm.portfolio].filter(Boolean).length
  const userId = currentUser?.uid || userProfile?.uid || ''

  const profileStats = useMemo(() => ([
    { label: 'Role', value: profileForm.jobTitle || userProfile?.jobTitle || userProfile?.role || 'Employee' },
    { label: 'Department', value: profileForm.department || userProfile?.department || 'Operations' },
    { label: 'Links', value: profileLinks },
  ]), [profileForm.department, profileForm.jobTitle, profileLinks, userProfile?.department, userProfile?.jobTitle, userProfile?.role])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      if (!userId) throw new Error('User session not found.')
      await updateUserProfile(userId, profileForm)
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setPasswordLoading(true)
    setPasswordStatus({ type: '', message: '' })

    try {
      await updateUserPassword(passwordForm.current, passwordForm.new)
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Unable to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <EmployeePageHeader
        eyebrow="Account Center"
        title="Profile Settings"
        description="Employee profile, mentor details aur account security ko ek hi jagah se manage karo."
        stats={profileStats}
        actions={
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-sm font-black text-white">
              {profileForm.avatar?.startsWith('http') ? (
                <img src={profileForm.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-slate-400">{currentUser?.email || userProfile?.email || 'employee@solutionhub.com'}</p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <EmployeeSurface title="Public Profile" description="Yeh details aapke employee identity aur mentor presentation ke liye use hoti hain.">
          {profileStatus.message && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              profileStatus.type === 'success'
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                : 'border-rose-400/20 bg-rose-400/10 text-rose-300'
            }`}>
              {profileStatus.message}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Full Name</label>
                <input
                  value={profileForm.displayName}
                  onChange={(event) => setProfileForm(current => ({ ...current, displayName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Phone</label>
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm(current => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Department</label>
                <input
                  value={profileForm.department}
                  onChange={(event) => setProfileForm(current => ({ ...current, department: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Job Title</label>
                <input
                  value={profileForm.jobTitle}
                  onChange={(event) => setProfileForm(current => ({ ...current, jobTitle: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Avatar URL</label>
                <input
                  value={profileForm.avatar}
                  onChange={(event) => setProfileForm(current => ({ ...current, avatar: event.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap gap-2">
                <EmployeeBadge tone="info">Mentor Profile</EmployeeBadge>
                <EmployeeBadge>{profileForm.experience || 'Experience pending'}</EmployeeBadge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Experience</label>
                  <input
                    value={profileForm.experience}
                    onChange={(event) => setProfileForm(current => ({ ...current, experience: event.target.value }))}
                    placeholder="5+ Years"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07] px-4 py-3 text-sm text-slate-300">
                    In details ka use course pages aur student-facing mentor sections me ho sakta hai.
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm(current => ({ ...current, bio: event.target.value }))}
                  rows={5}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">GitHub</label>
                <input
                  value={profileForm.github}
                  onChange={(event) => setProfileForm(current => ({ ...current, github: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">LinkedIn</label>
                <input
                  value={profileForm.linkedin}
                  onChange={(event) => setProfileForm(current => ({ ...current, linkedin: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Portfolio</label>
                <input
                  value={profileForm.portfolio}
                  onChange={(event) => setProfileForm(current => ({ ...current, portfolio: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileLoading ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </form>
        </EmployeeSurface>

        <div className="space-y-6">
          <EmployeeSurface title="Profile Snapshot" description="Current employee profile ka quick preview.">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-lg font-black text-white">
                  {profileForm.avatar?.startsWith('http') ? (
                    <img src={profileForm.avatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-white">{displayName}</p>
                  <p className="mt-1 text-sm text-slate-400">{profileForm.jobTitle || 'Employee'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <EmployeeBadge tone="info">{profileForm.department || 'Operations'}</EmployeeBadge>
                    {profileForm.experience && <EmployeeBadge>{profileForm.experience}</EmployeeBadge>}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
                {profileForm.bio || 'Aapka bio yahan preview hoga. Students aur admins ko expertise aur background samajhne me help milti hai.'}
              </p>
            </div>
          </EmployeeSurface>

          <EmployeeSurface title="Password & Security" description="Account access secure rakhne ke liye password yahin se change karo.">
            {passwordStatus.message && (
              <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                passwordStatus.type === 'success'
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                  : 'border-rose-400/20 bg-rose-400/10 text-rose-300'
              }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(event) => setPasswordForm(current => ({ ...current, current: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(event) => setPasswordForm(current => ({ ...current, new: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(event) => setPasswordForm(current => ({ ...current, confirm: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </EmployeeSurface>
        </div>
      </div>
    </div>
  )
}
