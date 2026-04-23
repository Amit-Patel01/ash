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
  avatar: profile?.avatar || profile?.photoURL || '',
  bio: profile?.bio || '',
  jobTitle: profile?.jobTitle || '',
  experience: profile?.experience || '',
  github: profile?.github || '',
  linkedin: profile?.linkedin || '',
  portfolio: profile?.portfolio || '',
  cvFilePath: profile?.cvFilePath || '',
  showOnTeam: Boolean(profile?.showOnTeam),
})

export default function EmployeeProfileRefined() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile))
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
  const publicProfileId = encodeURIComponent(
    userProfile?.uid ||
    userProfile?.employeeId ||
    currentUser?.uid ||
    currentUser?.email ||
    displayName
  )
  const publicProfilePath = `/team/${publicProfileId}`

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


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <EmployeePageHeader
        eyebrow="Account Center"
        title="Profile Settings"
        description="Manage your employee profile, mentor details, CV, and account security from one place."
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
        <EmployeeSurface title="Public Profile" description="These details support your employee identity and mentor presentation across the platform.">
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
                <EmployeeBadge tone={profileForm.showOnTeam ? 'success' : 'neutral'}>
                  {profileForm.showOnTeam ? 'Visible on Team Page' : 'Hidden from Team Page'}
                </EmployeeBadge>
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
                    These details may appear on course pages and student-facing mentor sections.
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-white">Show On Public Team Profile</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Turn this on if your employee profile should appear on the public team page and team profile route.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileForm(current => ({ ...current, showOnTeam: !current.showOnTeam }))}
                  className={`relative h-6 w-11 rounded-full transition-all ${profileForm.showOnTeam ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  aria-pressed={profileForm.showOnTeam}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${profileForm.showOnTeam ? 'left-6' : 'left-1'}`} />
                </button>
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
          <EmployeeSurface title="Profile Snapshot" description="A quick preview of your current employee profile.">
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
                {profileForm.bio || 'Your bio preview will appear here and helps students and administrators understand your expertise and background.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${profileForm.showOnTeam ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20' : 'bg-slate-400/10 text-slate-400 border border-slate-400/20'}`}>
                  {profileForm.showOnTeam ? 'Publicly visible on team section' : 'Currently hidden from public team section'}
                </span>
                {profileForm.showOnTeam && (
                  <a
                    href={publicProfilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    View Public Profile
                  </a>
                )}
              </div>
            </div>
          </EmployeeSurface>

          <EmployeeSurface title="CV / Resume Link" description="Add your Google Drive link or external URL for your CV.">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                Instead of uploading a file, you can now provide a direct <strong>Google Drive link</strong> or any public URL to your latest resume.
                Save the profile after editing this link so it persists across refreshes.
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-cyan-500">Google Drive Link</label>
                <div className="relative">
                  <input
                    type="url"
                    value={profileForm.cvFilePath}
                    onChange={(event) => setProfileForm(current => ({ ...current, cvFilePath: event.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                    </svg>
                  </div>
                </div>
              </div>
              {profileForm.cvFilePath && (
                <a
                  href={profileForm.cvFilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Test Link
                </a>
              )}
            </div>
          </EmployeeSurface>

          <EmployeeSurface title="Password & Security" description="For security, password updates are handled through a secure email reset link.">
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
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                We will send a secure password reset link to <span className="font-semibold text-white">{currentUser?.email || userProfile?.email || 'your account email'}</span>.
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </button>
            </form>
          </EmployeeSurface>
        </div>
      </div>
    </div>
  )
}
