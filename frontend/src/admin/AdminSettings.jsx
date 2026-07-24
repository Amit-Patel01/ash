import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { api } from '../config/api'
import {
  DOCUMENT_TYPES,
  getDocumentTypeMeta,
  hexToRgba,
  mergeCertificateTemplate,
  normalizeCertificateTemplate,
  updateTemplateVariant,
} from '../utils/certificateTemplate'
import CertificateDocument from '../components/Certificate'

export default function AdminSettings() {
  const { currentUser, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth()
  const { announcement, updateAnnouncement, maintenance, updateMaintenance, certificateTemplate, updateCertificateTemplate, homepageStats, updateHomepageStats } = useStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || currentUser?.photoURL || '',
  })

  const [imageLoading, setImageLoading] = useState(false)

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [announcementForm, setAnnouncementForm] = useState({
    message: announcement?.message || '',
    isActive: announcement?.isActive || false,
    type: announcement?.type || 'info', // info, warning, success
  })

  const [maintenanceForm, setMaintenanceForm] = useState({
    isActive: maintenance?.isActive || false,
    message: maintenance?.message || '',
  })

  const [statsForm, setStatsForm] = useState({
    studentsTrained: homepageStats?.studentsTrained || '5,000+',
    internshipPrograms: homepageStats?.internshipPrograms || '12+',
    liveProjects: homepageStats?.liveProjects || '800+',
    certificatesIssued: homepageStats?.certificatesIssued || '4,800+',
  })

  const [selectedDocumentType, setSelectedDocumentType] = useState('certificate')
  const [certificateForm, setCertificateForm] = useState(() => normalizeCertificateTemplate(certificateTemplate))
  const activeCertificateForm = mergeCertificateTemplate(certificateForm, selectedDocumentType)
  const selectedDocumentMeta = getDocumentTypeMeta(selectedDocumentType)
  const certificatePreview = {
    userName: 'Amit Patel',
    courseName: selectedDocumentType === 'offer_letter' ? 'Software Development Internship' : 'All Blueprint Of Course',
    internshipRole: selectedDocumentType === 'offer_letter' ? 'Frontend Developer Intern' : 'Full Stack Development Track',
    internshipDuration: '3 Months',
    joiningDate: new Date().toISOString(),
    documentType: selectedDocumentType,
    documentLabel: activeCertificateForm.documentLabel,
    certificate_id: `${(activeCertificateForm.certificatePrefix || 'AP').toUpperCase()}-EBGF3DZT`,
    approval_date: new Date().toISOString(),
    issuedByName: activeCertificateForm.issuerName,
    issuedByRole: activeCertificateForm.issuerRole,
    templateSnapshot: activeCertificateForm,
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

  // Sync maintenance form when global state loads
  useEffect(() => {
    if (maintenance) {
      setMaintenanceForm({
        isActive: maintenance.isActive || false,
        message: maintenance.message || '',
      })
    }
  }, [maintenance])

  // Sync homepage stats when global state loads
  useEffect(() => {
    if (homepageStats) {
      setStatsForm({
        studentsTrained: homepageStats.studentsTrained || '5,000+',
        internshipPrograms: homepageStats.internshipPrograms || '12+',
        liveProjects: homepageStats.liveProjects || '800+',
        certificatesIssued: homepageStats.certificatesIssued || '4,800+',
      })
    }
  }, [homepageStats])

  useEffect(() => {
    setCertificateForm(normalizeCertificateTemplate(certificateTemplate))
  }, [certificateTemplate])

  useEffect(() => {
    setProfileForm({
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || '',
      avatar: currentUser?.avatar || currentUser?.photoURL || '',
    })
  }, [currentUser])

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
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'stats', label: 'Homepage Stats' },
    { id: 'certificate', label: 'Documents' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ]

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file.')
      return
    }

    setImageLoading(true)
    setProfileError('')
    setSaveSuccess('')

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
          setSaveSuccess('Photo loaded successfully! Click "Save Changes" to save.')
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setProfileError(error.message || 'Unable to process image.')
      setImageLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveSuccess('')
    setProfileError('')
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        bio: profileForm.bio,
        avatar: profileForm.avatar,
        photoURL: profileForm.avatar,
      })
      setSaveSuccess('Profile updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setProfileError(err.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async () => {
    setEmailSaving(true)
    setEmailError('')
    setEmailSuccess('')
    try {
      await updateUserEmail(profileForm.email)
      setEmailSuccess('Admin email updated successfully.')
      setTimeout(() => setEmailSuccess(''), 4000)
    } catch (err) {
      console.error('Failed to update email:', err)
      setEmailError(err.message || 'Failed to update email.')
    } finally {
      setEmailSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    setSaving(true)
    try {
      await updateUserPassword()
      setPasswordSuccess('A password reset link has been sent to your email address.')
    } catch (err) {
      setPasswordError(err.message || 'Failed to send the password reset email.')
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

  const handleSaveMaintenance = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateMaintenance(maintenanceForm)
      setSaveSuccess('Maintenance settings updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save maintenance settings:', err)
      alert('Failed: ' + (err.message || 'Error updating maintenance settings'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStats = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateHomepageStats(statsForm)
      setSaveSuccess('Homepage stats updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save homepage stats:', err)
      alert('Failed: ' + (err.message || 'Error updating homepage stats'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCertificateTemplate = async () => {
    setSaving(true)
    setSaveSuccess('')
    try {
      await updateCertificateTemplate(certificateForm)
      setSaveSuccess('Document template updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save document template:', err)
      alert('Failed: ' + (err.message || 'Error updating document template'))
    } finally {
      setSaving(false)
    }
  }

  const updateDocumentField = (field, value) => {
    setCertificateForm(prev => updateTemplateVariant(prev, selectedDocumentType, { [field]: value }))
  }

  const toggleNotification = (key) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotificationPrefs(updated)
    localStorage.setItem('notification_prefs', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden border border-slate-300">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (currentUser?.displayName || currentUser?.email || 'A').charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageLoading} />
                </label>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-900 font-medium">{currentUser?.displayName || 'Admin'}</p>
                  {imageLoading && <span className="text-[10px] text-blue-400 animate-pulse font-medium">Uploading image...</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
                <p className="text-[10px] text-slate-500 mt-2">Click image to upload new profile photo (max 4MB)</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{profileError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={e => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">Use the Security tab if you want to update the admin login email.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Global Announcement Popup</h2>
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Enable Popup</p>
                  <p className="text-xs text-slate-400">Show this message to all visitors</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={announcementForm.isActive} 
                    onChange={() => setAnnouncementForm({ ...announcementForm, isActive: !announcementForm.isActive })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Announcement Message</label>
                <textarea
                  rows={4}
                  value={announcementForm.message}
                  onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Enter the message you want to show to all users..."
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Popup Style</label>
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
                        announcementForm.type === style.id ? style.color : 'bg-slate-100 border-slate-300 text-slate-500'
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
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Portal Maintenance Mode</h2>
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Enable Maintenance Mode</p>
                  <p className="text-xs text-slate-400">Show maintenance page to all visitors (except admin at /admin)</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={maintenanceForm.isActive} 
                    onChange={() => setMaintenanceForm({ ...maintenanceForm, isActive: !maintenanceForm.isActive })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Custom Maintenance Message (Optional)</label>
                <textarea
                  rows={4}
                  value={maintenanceForm.message}
                  onChange={e => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })}
                  placeholder="We are currently upgrading our systems with exciting new features to bring you a better experience. We'll be back online shortly. Thank you for your patience! (Default message will be used if left blank)"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-4 text-sm leading-6 text-slate-700">
                <strong className="text-slate-900 font-semibold">Warning:</strong> When active, this blocks all users from accessing any public routes (home page, services, contact, etc.) and shows them a maintenance page with the support email <strong className="text-slate-900">support@amitsolutionhub.com</strong>. The admin portal (<code className="text-red-500">/admin</code>) and login page will remain fully accessible to you.
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveMaintenance} 
                  disabled={saving} 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Homepage Statistics Settings</h2>
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{saveSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Students Trained</label>
                <input
                  type="text"
                  value={statsForm.studentsTrained}
                  onChange={e => setStatsForm({ ...statsForm, studentsTrained: e.target.value })}
                  placeholder="5,000+"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-505 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Internship Programs</label>
                <input
                  type="text"
                  value={statsForm.internshipPrograms}
                  onChange={e => setStatsForm({ ...statsForm, internshipPrograms: e.target.value })}
                  placeholder="12+"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-505 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Live Projects Completed</label>
                <input
                  type="text"
                  value={statsForm.liveProjects}
                  onChange={e => setStatsForm({ ...statsForm, liveProjects: e.target.value })}
                  placeholder="800+"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-505 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Certificates Issued</label>
                <input
                  type="text"
                  value={statsForm.certificatesIssued}
                  onChange={e => setStatsForm({ ...statsForm, certificatesIssued: e.target.value })}
                  placeholder="4,800+"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-505 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={handleSaveStats} 
                disabled={saving} 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Stats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Document Customization</h2>
                <p className="text-sm text-slate-500 mt-1">Course certificates, internship certificates, and offer letters each have their own branding, wording, and code base—all managed from this panel.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Accent Color</label>
                <input
                  type="color"
                  value={activeCertificateForm.accentColor}
                  onChange={e => updateDocumentField('accentColor', e.target.value)}
                  className="h-10 w-12 rounded-lg border border-slate-300 bg-transparent"
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
                <div className="rounded-2xl border border-slate-300 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Document Type</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {DOCUMENT_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedDocumentType(type.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDocumentType === type.id
                            ? 'border-blue-500/30 bg-blue-500/15 text-blue-300'
                            : 'border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    You are currently customizing the <span className="font-semibold text-slate-900">{selectedDocumentMeta.label}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Document Prefix / Code Base</label>
                    <input
                      type="text"
                      value={activeCertificateForm.certificatePrefix}
                      onChange={e => updateDocumentField('certificatePrefix', e.target.value.toUpperCase())}
                      placeholder="AP"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400">This code base is used across the admin panel, employee issuance actions, student downloads, and the public verification link.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Seal Label</label>
                    <input
                      type="text"
                      value={activeCertificateForm.sealLabel}
                      onChange={e => updateDocumentField('sealLabel', e.target.value)}
                      placeholder="Verified Certificate"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Main Title</label>
                  <input
                    type="text"
                    value={activeCertificateForm.title}
                    onChange={e => updateDocumentField('title', e.target.value)}
                    placeholder="Certificate"
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Subtitle</label>
                  <textarea
                    rows={3}
                    value={activeCertificateForm.subtitle}
                    onChange={e => updateDocumentField('subtitle', e.target.value)}
                    placeholder="of Achievement"
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Overline</label>
                    <input
                      type="text"
                      value={activeCertificateForm.overline}
                      onChange={e => updateDocumentField('overline', e.target.value)}
                      placeholder="Official Certification"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Reference Label</label>
                    <input
                      type="text"
                      value={activeCertificateForm.referenceLabel}
                      onChange={e => updateDocumentField('referenceLabel', e.target.value)}
                      placeholder="Certificate ID"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Organization Name</label>
                    <input
                      type="text"
                      value={activeCertificateForm.organizationName}
                      onChange={e => updateDocumentField('organizationName', e.target.value)}
                      placeholder="Amit Solution Hub"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Support Email</label>
                    <input
                      type="email"
                      value={activeCertificateForm.supportEmail}
                      onChange={e => updateDocumentField('supportEmail', e.target.value)}
                      placeholder="support@amitsolutionhub.com"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Issuer Name</label>
                    <input
                      type="text"
                      value={activeCertificateForm.issuerName}
                      onChange={e => updateDocumentField('issuerName', e.target.value)}
                      placeholder="Amit Patel"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Issuer Role</label>
                    <input
                      type="text"
                      value={activeCertificateForm.issuerRole}
                      onChange={e => updateDocumentField('issuerRole', e.target.value)}
                      placeholder="Founder & Program Director"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Signature Name</label>
                    <input
                      type="text"
                      value={activeCertificateForm.signatureName}
                      onChange={e => updateDocumentField('signatureName', e.target.value)}
                      placeholder="Amit Patel"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Signature Role</label>
                    <input
                      type="text"
                      value={activeCertificateForm.signatureRole}
                      onChange={e => updateDocumentField('signatureRole', e.target.value)}
                      placeholder="Authorized Signatory"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Intro Line</label>
                    <input
                      type="text"
                      value={activeCertificateForm.summaryLine}
                      onChange={e => updateDocumentField('summaryLine', e.target.value)}
                      placeholder="This document is proudly issued to"
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Body Prefix</label>
                      <textarea
                        rows={3}
                        value={activeCertificateForm.bodyPrefix}
                        onChange={e => updateDocumentField('bodyPrefix', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Body Suffix</label>
                      <textarea
                        rows={3}
                        value={activeCertificateForm.bodySuffix}
                        onChange={e => updateDocumentField('bodySuffix', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Footer Note</label>
                  <textarea
                    rows={3}
                    value={activeCertificateForm.footerNote}
                    onChange={e => updateDocumentField('footerNote', e.target.value)}
                    placeholder="This document can be verified online using the document ID."
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveCertificateTemplate}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-300 p-5 shadow-2xl" style={{ background: `linear-gradient(135deg, ${hexToRgba(activeCertificateForm.accentColor, 0.2)}, rgba(15, 23, 42, 0.96))` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: activeCertificateForm.accentColor }}>{activeCertificateForm.sealLabel}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">Live {selectedDocumentMeta.shortLabel} Preview</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em]" style={{ borderColor: hexToRgba(activeCertificateForm.accentColor, 0.35), color: activeCertificateForm.accentColor, backgroundColor: hexToRgba(activeCertificateForm.accentColor, 0.12) }}>
                      {certificatePreview.certificate_id}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    The selected {selectedDocumentMeta.shortLabel.toLowerCase()} design is used on employee issuance controls, the student documents area, and the verification page. The prefix and code base stay in sync with this preview.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 p-3">
                  <div className="mx-auto w-full max-w-[860px]">
                    <CertificateDocument certificate={certificatePreview} template={certificateForm} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-300 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Issuer Block</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{activeCertificateForm.issuerName}</p>
                    <p className="mt-1 text-xs text-slate-500">{activeCertificateForm.issuerRole}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-300 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Signature Block</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{activeCertificateForm.signatureName}</p>
                    <p className="mt-1 text-xs text-slate-500">{activeCertificateForm.signatureRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive email updates about projects and tasks' },
                { key: 'push', label: 'Push Notifications', desc: 'Get push notifications for important updates' },
                { key: 'taskReminders', label: 'Task Reminders', desc: 'Daily digest of upcoming tasks and deadlines' },
                { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications when team members update projects' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between border-t border-slate-200 pt-5 first:border-0 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" checked={notificationPrefs[item.key]} onChange={() => toggleNotification(item.key)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500/50 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                <p className="text-xs text-slate-400 mt-0.5">Use dark theme for the dashboard</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" checked={notificationPrefs.darkMode} onChange={() => toggleNotification('darkMode')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500/50 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Change Admin Email</h2>
            {emailError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{emailError}</p>
              </div>
            )}
            {emailSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">{emailSuccess}</p>
              </div>
            )}
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">New Admin Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="rounded-xl border border-slate-300 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                This updates the admin login email in both the app profile and Firebase authentication. Use the new email for future sign-ins.
              </div>
              <button
                onClick={handleChangeEmail}
                disabled={emailSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {emailSaving ? 'Updating...' : 'Update Admin Email'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Password Reset</h2>
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
              <div className="rounded-xl border border-slate-300 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                For security, administrator password changes are handled through a secure email reset link sent to <span className="font-semibold text-slate-900">{currentUser?.email || 'your account email'}</span>.
              </div>
              <button onClick={handleChangePassword} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Send Password Reset Link
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Info</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Role</p>
                  <p className="text-xs text-slate-400 capitalize">{currentUser?.role || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Account Created</p>
                  <p className="text-xs text-slate-400">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
