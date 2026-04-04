import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function EmployeeProfile() {
  const { userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [profileForm, setProfileForm] = useState({
    displayName: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    department: userProfile?.department || '',
    avatar: userProfile?.avatar || '',
    github: userProfile?.github || '',
    linkedin: userProfile?.linkedin || '',
    portfolio: userProfile?.portfolio || '',
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  if (!userProfile) return <div className="p-8 text-white">Loading profile...</div>

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account information and security.</p>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-emerald-400 font-bold">
              {profileForm.avatar?.startsWith('http') ? (
                <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profileForm.displayName?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Personal Information</h3>
            <p className="text-sm text-gray-500">Update your account details and profile picture.</p>
          </div>
        </div>

        {profileStatus.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${profileStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profileStatus.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
            {profileStatus.message}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setProfileStatus({ type: '', message: '' });
          try {
            await updateUserProfile(userProfile.uid, profileForm);
            setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
          } catch (err) {
            setProfileStatus({ type: 'error', message: err.message || 'Failed to update profile' });
          } finally {
            setLoading(false);
          }
        }}>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input type="text" value={profileForm.displayName} onChange={e => setProfileForm({ ...profileForm, displayName: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Profile Photo URL</label>
            <input type="url" value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })} placeholder="https://example.com/photo.jpg" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">GitHub Username</label>
              <input type="text" value={profileForm.github} onChange={e => setProfileForm({ ...profileForm, github: e.target.value })} placeholder="username" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">LinkedIn URL</label>
              <input type="url" value={profileForm.linkedin} onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Portfolio URL</label>
              <input type="url" value={profileForm.portfolio} onChange={e => setProfileForm({ ...profileForm, portfolio: e.target.value })} placeholder="https://portfolio.com" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="md:col-span-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>}
            {loading ? 'Updating...' : 'Save Information'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Change Password</h3>
            <p className="text-sm text-gray-500">Regularly update your password to maintain security.</p>
          </div>
        </div>

        {passwordStatus.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${passwordStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordStatus.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
            {passwordStatus.message}
          </div>
        )}

        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          if (passwordForm.new !== passwordForm.confirm) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
          }
          setLoading(true);
          setPasswordStatus({ type: '', message: '' });
          try {
            await updateUserPassword(passwordForm.current, passwordForm.new);
            setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswordForm({ current: '', new: '', confirm: '' });
          } catch (err) {
            setPasswordStatus({ type: 'error', message: err.message || 'Verification failed. Re-login required for security.' });
          } finally {
            setLoading(false);
          }
        }}>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Current Password</label>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-mono" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">New Password</label>
              <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>}
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
