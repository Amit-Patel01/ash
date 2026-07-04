import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../config/api'
import { getRoleDisplayLabel } from '../utils/roles'

const createProfileForm = (profile, currentUser) => ({
  displayName: profile?.displayName || currentUser?.displayName || '',
  phone: profile?.phone || '',
  avatar: profile?.avatar || profile?.photoURL || currentUser?.photoURL || '',
  bio: profile?.bio || '',
  location: profile?.location || '',
})

const getInitials = (name) =>
  (name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'U'

const sanitizeFileName = (fileName) =>
  String(fileName || 'profile-image')
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const formatJoinedDate = (value) => {
  if (!value) return 'Recently joined'

  const normalized =
    typeof value?.toDate === 'function'
      ? value.toDate()
      : new Date(value)

  if (Number.isNaN(normalized.getTime())) return 'Recently joined'

  return normalized.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">{children}</label>
}

export default function UserProfile() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile, currentUser))
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile, currentUser))
  }, [userProfile, currentUser])

  const userId = currentUser?.uid || userProfile?.uid || ''
  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Student'
  const avatarUrl = profileForm.avatar || userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || ''
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const memberSince = formatJoinedDate(userProfile?.createdAt)

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
        photoURL: profileForm.avatar.trim(),
        bio: profileForm.bio.trim(),
        location: profileForm.location.trim(),
      }

      await updateUserProfile(userId, payload)
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!userId) {
      setProfileStatus({ type: 'error', message: 'Please log in again to upload your profile image.' })
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
          const MAX_WIDTH = 200
          const MAX_HEIGHT = 200
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

          const base64Url = canvas.toDataURL('image/jpeg', 0.8)
          setProfileForm(current => ({
            ...current,
            avatar: base64Url,
          }))
          setImageLoading(false)
          setProfileStatus({ type: 'success', message: 'Photo loaded successfully. Click Save Profile to apply.' })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Unable to process image.' })
      setImageLoading(false)
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
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(255,255,255,0.98),rgba(217,70,239,0.10))] p-6 shadow-[0_20px_60px_rgba(148,163,184,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] border border-white bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xl font-black text-white shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Account Center</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">User Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Update your name, phone number, profile image, and account settings from one place. Your saved profile image will also appear across the user workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-500">Member Since</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{memberSince}</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-500">Role</p>
              <p className="mt-2 text-sm font-semibold text-slate-800 capitalize">{getRoleDisplayLabel(userProfile?.role)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">Email</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-800">{currentUser?.email || 'student@solutionhub.com'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(148,163,184,0.25)]">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Profile Details</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Update your profile</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                These details help keep your enrollments, certificates, and support conversations accurate.
              </p>
            </div>

            {profileStatus.message && (
              <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                profileStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-600'
              }`}>
                {profileStatus.message}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <input
                    value={profileForm.displayName}
                    onChange={(event) => setProfileForm(current => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm(current => ({ ...current, phone: event.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400"
                  />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input
                    value={profileForm.location}
                    onChange={(event) => setProfileForm(current => ({ ...current, location: event.target.value }))}
                    placeholder="City, State"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-fuchsia-50 p-5">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white bg-gradient-to-br from-blue-500 to-fuchsia-500 text-lg font-black text-white shadow-md">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Profile Photo</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Upload an image or paste a photo URL to update your User Profile picture.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-200">
                      {imageLoading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageLoading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setProfileForm(current => ({ ...current, avatar: '' }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <FieldLabel>Photo URL</FieldLabel>
                  <input
                    value={profileForm.avatar}
                    onChange={(event) => setProfileForm(current => ({ ...current, avatar: event.target.value }))}
                    placeholder="https://example.com/profile-photo.jpg"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Short Bio</FieldLabel>
                <textarea
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm(current => ({ ...current, bio: event.target.value }))}
                  rows={5}
                  placeholder="Tell us a bit about yourself, your goals, or how our team can support you better."
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-2xl border border-transparent bg-gradient-to-r from-blue-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileLoading ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(148,163,184,0.25)]">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-500">Security</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Password Reset</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                For security, password changes are handled through a secure email reset link.
              </p>
            </div>

            {passwordStatus.message && (
              <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                passwordStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-600'
              }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-6 text-slate-600">
                We will email a secure password reset link to <span className="font-semibold text-slate-900">{currentUser?.email || 'your account email'}</span>.
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl border border-transparent bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(148,163,184,0.25)]">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Live Preview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Profile Snapshot</h2>
            <div className="mt-5 rounded-[26px] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-fuchsia-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-blue-500 to-fuchsia-500 text-lg font-black text-white shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{displayName}</p>
                  <p className="mt-1 text-sm text-slate-500">{currentUser?.email || 'student@solutionhub.com'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Phone</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{profileForm.phone || 'Not added yet'}</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-500">Location</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{profileForm.location || 'Not added yet'}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-500">Bio</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {profileForm.bio || 'Your short bio preview will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(148,163,184,0.25)]">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-500">Why It Matters</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>An updated profile keeps your identity clear across enrollments and support conversations.</p>
              <p>Your saved profile image will appear consistently in the user sidebar and top navigation.</p>
              <p>Keeping your phone number and location current improves course coordination and certificate accuracy.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}