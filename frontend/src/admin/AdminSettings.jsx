import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { hexToRgba, mergeCertificateTemplate } from '../utils/certificateTemplate'
import CertificateDocument from '../components/certificates/CertificateDocument'

export default function AdminSettings() {
  const { currentUser, updateUserProfile, updateUserPassword } = useAuth()
  const { announcement, updateAnnouncement, certificateTemplate, updateCertificateTemplate } = useStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [announcementForm, setAnnouncementForm] = useState({
    message: announcement?.message || '',
    isActive: announcement?.isActive || false,
    type: announcement?.type || 'info', // info, warning, success
  })

  const [certificateForm, setCertificateForm] = useState(() => mergeCertificateTemplate(certificateTemplate))
  const certificatePreview = {
    userName: 'Amit Patel',
    courseName: 'All Blueprint Of Course',
    certificate_id: `${(certificateForm.certificatePrefix || 'AP').toUpperCase()}-EBGF3DZT`,
    approval_date: new Date().toISOString(),
    issuedByName: certificateForm.issuerName,
    issuedByRole: certificateForm.issuerRole,
    templateSnapshot: certificateForm,
  }

  // Sync announcement form when global state loads
  useEffect(() => {
    if (announcement) {
      setAnnouncementForm({
        message: announcement.message || '',
        isActive: announcement.isActive || false,
        type: announcement.type || 'info',
      })
    }
  }, [announcement])

  useEffect(() => {
    setCertificateForm(mergeCertificateTemplate(certificateTemplate))
  }, [certificateTemplate])

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('notification_prefs')
      return saved ? JSON.parse(saved) : { email: true, push: true, taskReminders: true, projectUpdates: true, darkMode: true }
    } catch {
      return { email: true, push: true, taskReminders: true, projectUpdates: true, darkMode: true }
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ]

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        bio: profileForm.bio
      })
      setSaveSuccess('Profile updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('Failed: ' + (err.message || 'Error updating profile'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await updateUserPassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordSuccess('Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAnnouncement = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateAnnouncement(announcementForm)
      setSaveSuccess('Announcement updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save announcement:', err)
      alert('Failed: ' + (err.message || 'Error updating announcement'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCertificateTemplate = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateCertificateTemplate(certificateForm)
      setSaveSuccess('Certificate template updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save certificate template:', err)
      alert('Failed: ' + (err.message || 'Error updating certificate template'))
    } finally {
      setSaving(false)
    }
  }

  const toggleNotification = (key) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotificationPrefs(updated)
    localStorage.setItem('notification_prefs', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/10'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                {(currentUser?.displayName || currentUser?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{currentUser?.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentUser?.email}</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={e => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Global Announcement Popup</h2>
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Enable Popup</p>
                  <p className="text-xs text-gray-500">Show this message to all visitors</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={announcementForm.isActive} 
                    onChange={() => setAnnouncementForm({ ...announcementForm, isActive: !announcementForm.isActive })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Announcement Message</label>
                <textarea
                  rows={4}
                  value={announcementForm.message}
                  onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Enter the message you want to show to all users..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Popup Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'info', label: 'Information', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
                    { id: 'warning', label: 'Warning', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
                    { id: 'success', label: 'Success', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setAnnouncementForm({ ...announcementForm, type: style.id })}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        announcementForm.type === style.id ? style.color : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveAnnouncement} 
                  disabled={saving} 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Certificate Customization</h2>
                <p className="text-sm text-gray-400 mt-1">Employee-issued certificates will use this branding and issuer information.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-400">Accent Color</label>
                <input
                  type="color"
                  value={certificateForm.accentColor}
                  onChange={e => setCertificateForm({ ...certificateForm, accentColor: e.target.value })}
                  className="h-10 w-12 rounded-lg border border-white/10 bg-transparent"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Certificate Prefix / Code Base</label>
                    <input
                      type="text"
                      value={certificateForm.certificatePrefix}
                      onChange={e => setCertificateForm({ ...certificateForm, certificatePrefix: e.target.value.toUpperCase() })}
                      placeholder="AP"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">Example: `AP` se certificate ID `AP-XXXXXXX` format me generate hogi.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Seal Label</label>
                    <input
                      type="text"
                      value={certificateForm.sealLabel}
                      onChange={e => setCertificateForm({ ...certificateForm, sealLabel: e.target.value })}
                      placeholder="Verified Certificate"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Certificate Title</label>
                  <input
                    type="text"
                    value={certificateForm.title}
                    onChange={e => setCertificateForm({ ...certificateForm, title: e.target.value })}
                    placeholder="Certificate of Achievement"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtitle</label>
                  <textarea
                    rows={3}
                    value={certificateForm.subtitle}
                    onChange={e => setCertificateForm({ ...certificateForm, subtitle: e.target.value })}
                    placeholder="Awarded for successful completion and verified performance."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Organization Name</label>
                    <input
                      type="text"
                      value={certificateForm.organizationName}
                      onChange={e => setCertificateForm({ ...certificateForm, organizationName: e.target.value })}
                      placeholder="Amit Solution Hub"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Support Email</label>
                    <input
                      type="email"
                      value={certificateForm.supportEmail}
                      onChange={e => setCertificateForm({ ...certificateForm, supportEmail: e.target.value })}
                      placeholder="support@amitsolutionhub.com"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Issuer Name</label>
                    <input
                      type="text"
                      value={certificateForm.issuerName}
                      onChange={e => setCertificateForm({ ...certificateForm, issuerName: e.target.value })}
                      placeholder="Amit Patel"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Issuer Role</label>
                    <input
                      type="text"
                      value={certificateForm.issuerRole}
                      onChange={e => setCertificateForm({ ...certificateForm, issuerRole: e.target.value })}
                      placeholder="Founder & Program Director"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Signature Name</label>
                    <input
                      type="text"
                      value={certificateForm.signatureName}
                      onChange={e => setCertificateForm({ ...certificateForm, signatureName: e.target.value })}
                      placeholder="Amit Patel"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Signature Role</label>
                    <input
                      type="text"
                      value={certificateForm.signatureRole}
                      onChange={e => setCertificateForm({ ...certificateForm, signatureRole: e.target.value })}
                      placeholder="Authorized Signatory"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Footer Note</label>
                  <textarea
                    rows={3}
                    value={certificateForm.footerNote}
                    onChange={e => setCertificateForm({ ...certificateForm, footerNote: e.target.value })}
                    placeholder="This credential can be verified online using the certificate ID."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveCertificateTemplate}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 p-5 shadow-2xl" style={{ background: `linear-gradient(135deg, ${hexToRgba(certificateForm.accentColor, 0.2)}, rgba(15, 23, 42, 0.96))` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: certificateForm.accentColor }}>{certificateForm.sealLabel}</p>
                      <h3 className="text-2xl font-black text-white mt-2">Live Certificate Preview</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em]" style={{ borderColor: hexToRgba(certificateForm.accentColor, 0.35), color: certificateForm.accentColor, backgroundColor: hexToRgba(certificateForm.accentColor, 0.12) }}>
                      {certificatePreview.certificate_id}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                    Yahi exact layout customer aur verify page par use hoga. Alignment, sign placement, code base, aur footer changes yahin live dekh sakte ho.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/40 p-3">
                  <CertificateDocument certificate={certificatePreview} template={certificateForm} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">Issuer Block</p>
                    <p className="mt-2 text-sm font-semibold text-white">{certificateForm.issuerName}</p>
                    <p className="mt-1 text-xs text-gray-400">{certificateForm.issuerRole}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">Signature Block</p>
                    <p className="mt-2 text-sm font-semibold text-white">{certificateForm.signatureName}</p>
                    <p className="mt-1 text-xs text-gray-400">{certificateForm.signatureRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive email updates about projects and tasks' },
                { key: 'push', label: 'Push Notifications', desc: 'Get push notifications for important updates' },
                { key: 'taskReminders', label: 'Task Reminders', desc: 'Daily digest of upcoming tasks and deadlines' },
                { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications when team members update projects' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between border-t border-white/5 pt-5 first:border-0 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" checked={notificationPrefs[item.key]} onChange={() => toggleNotification(item.key)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-blue-500/50 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Use dark theme for the dashboard</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" checked={notificationPrefs.darkMode} onChange={() => toggleNotification('darkMode')} className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-blue-500/50 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
            {passwordError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{passwordSuccess}</p>
              </div>
            )}
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <button onClick={handleChangePassword} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Role</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Account Created</p>
                  <p className="text-xs text-gray-500">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
