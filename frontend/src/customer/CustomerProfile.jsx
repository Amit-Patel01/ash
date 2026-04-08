import { useEffect, useMemo, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

const createProfileForm = (profile, currentUser) => ({
  displayName: profile?.displayName || currentUser?.displayName || '',
  phone: profile?.phone || '',
  avatar: profile?.avatar || profile?.photoURL || currentUser?.photoURL || '',
  bio: profile?.bio || '',
  location: profile?.location || '',
})

const getInitials = (name) =>
  (name || 'Customer')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'CU'

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

export default function CustomerProfile() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState(() => createProfileForm(userProfile, currentUser))
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    setProfileForm(createProfileForm(userProfile, currentUser))
  }, [userProfile, currentUser])

  const userId = currentUser?.uid || userProfile?.uid || ''
  const displayName = profileForm.displayName || userProfile?.displayName || currentUser?.displayName || 'Customer'
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
    if (file.size > 4 * 1024 * 1024) {
      setProfileStatus({ type: 'error', message: 'Image size should be under 4MB.' })
      return
    }

    setImageLoading(true)
    setProfileStatus({ type: '', message: '' })

    try {
      const storageRef = ref(
        storage,
        `profile-images/customers/${userId}/${Date.now()}-${sanitizeFileName(file.name)}`
      )
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      setProfileForm(current => ({
        ...current,
        avatar: downloadURL,
      }))
      setProfileStatus({ type: 'success', message: 'Profile image uploaded. Save profile to apply it everywhere.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || 'Unable to upload image right now.' })
    } finally {
      setImageLoading(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    if (passwordForm.next.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }

    setPasswordLoading(true)
    setPasswordStatus({ type: '', message: '' })

    try {
      await updateUserPassword(passwordForm.current, passwordForm.next)
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Unable to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.94),rgba(124,58,237,0.18))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] border border-white/15 bg-white/10 text-xl font-black text-white shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-200/80">Account Center</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Customer Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Aapka name, phone, profile image, aur password ab yahin se update ho sakta hai. Saved profile image sidebar aur panel header me bhi dikh jayegi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Member Since</p>
              <p className="mt-2 text-sm font-semibold text-white">{memberSince}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Role</p>
              <p className="mt-2 text-sm font-semibold text-white capitalize">{userProfile?.role || 'customer'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Email</p>
              <p className="mt-2 truncate text-sm font-semibold text-white">{currentUser?.email || 'customer@solutionhub.com'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/10 bg-gray-900/55 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-300">Profile Details</p>
              <h2 className="mt-2 text-2xl font-black text-white">Update your customer profile</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Yeh details future enrollments, certificates, aur support conversations me useful rahengi.
              </p>
            </div>

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
                  <FieldLabel>Full Name</FieldLabel>
                  <input
                    value={profileForm.displayName}
                    onChange={(event) => setProfileForm(current => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-400/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm(current => ({ ...current, phone: event.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-400/30 focus:outline-none"
                  />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-500"
                  />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input
                    value={profileForm.location}
                    onChange={(event) => setProfileForm(current => ({ ...current, location: event.target.value }))}
                    placeholder="City, State"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-400/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/10 text-lg font-black text-white">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Profile Photo</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Upload image ya photo URL paste karke customer panel me apni profile photo dikha sakte ho.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/15">
                      {imageLoading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageLoading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setProfileForm(current => ({ ...current, avatar: '' }))}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
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
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-400/30 focus:outline-none"
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
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-400/30 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileLoading ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-gray-900/55 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">Security</p>
              <h2 className="mt-2 text-2xl font-black text-white">Change Password</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Current password confirm karke apna account password update kar sakte ho.
              </p>
            </div>

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
                <FieldLabel>Current Password</FieldLabel>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(event) => setPasswordForm(current => ({ ...current, current: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-amber-400/30 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>New Password</FieldLabel>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(event) => setPasswordForm(current => ({ ...current, next: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-amber-400/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) => setPasswordForm(current => ({ ...current, confirm: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-amber-400/30 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/10 bg-gray-900/55 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-300">Live Preview</p>
            <h2 className="mt-2 text-2xl font-black text-white">Profile Snapshot</h2>
            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-lg font-black text-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-white">{displayName}</p>
                  <p className="mt-1 text-sm text-slate-400">{currentUser?.email || 'customer@solutionhub.com'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm font-semibold text-white">{profileForm.phone || 'Not added yet'}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Location</p>
                  <p className="mt-2 text-sm font-semibold text-white">{profileForm.location || 'Not added yet'}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Bio</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {profileForm.bio || 'Aapka short bio yahan preview hoga.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-gray-900/55 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Why It Matters</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>Updated profile se enrollments aur support conversations me aapki identity clear rehti hai.</p>
              <p>Profile image save karne ke baad customer sidebar aur top bar dono jagah nayi photo visible hogi.</p>
              <p>Phone aur location maintain rakhne se course/session coordination aur certificate accuracy better hoti hai.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
