import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function CustomerProfile() {
  const { currentUser, userProfile, updateUserProfile, updateUserPassword } = useAuth()
  const [name, setName] = useState(userProfile?.displayName || currentUser?.displayName || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateUserProfile(currentUser.uid, { displayName: name, phone })
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwSaving(true)
    setPwError('')
    setPwSuccess('')
    try {
      await updateUserPassword(currentPw, newPw)
      setPwSuccess('Password updated successfully!')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwError(err.message || 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">{success}</div>}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input type="email" value={currentUser?.email || ''} disabled className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <button type="submit" disabled={saving} className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">{pwSuccess}</div>}
            {pwError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{pwError}</div>}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <button type="submit" disabled={pwSaving || !currentPw || !newPw || !confirmPw} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {pwSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
