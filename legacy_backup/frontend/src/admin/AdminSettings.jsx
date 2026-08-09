import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('announcement')
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
    onlyAllowedDomain: maintenance?.onlyAllowedDomain !== false,
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
        onlyAllowedDomain: maintenance.onlyAllowedDomain !== false,
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
    { id: 'announcement', label: 'Announcement' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'stats', label: 'Homepage Stats' },
    { id: 'notifications', label: 'Notifications' },
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
      setSaveSuccess('Announcement banner updated successfully!')
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
      alert('Failed: ' + (err.message || 'Error updating maintenance'))
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System & Platform Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global announcements, maintenance mode, and homepage stats.</p>
        </div>
        <Link
          to="/admin/profile"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
        >
          <User size={15} />
          <span>Open Admin Profile Settings</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saveSuccess && activeTab !== 'certificate' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-sm text-emerald-400 font-medium">{saveSuccess}</p>
        </div>
      )}

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
                  <p className="text-xs text-slate-400">Show maintenance page to visitors (except admin at /admin)</p>
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

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Restrict Live App to www.amitsolutionhub.com</p>
                  <p className="text-xs text-slate-400">When maintenance mode is active, ONLY visitors on www.amitsolutionhub.com can see the live app. All other preview/alternative domains will show the Maintenance Page.</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={maintenanceForm.onlyAllowedDomain} 
                    onChange={() => setMaintenanceForm({ ...maintenanceForm, onlyAllowedDomain: !maintenanceForm.onlyAllowedDomain })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
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
                <strong className="text-slate-900 font-semibold">Note:</strong> When maintenance mode is active with domain restriction enabled, only visitors accessing via <strong className="text-blue-600">www.amitsolutionhub.com</strong> can view the live site. All other preview or third-party domains will display the Maintenance Page. The admin portal (<code className="text-red-500">/admin</code>) remains accessible.
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
