import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'

const DEFAULT_MENTOR = {
  name: 'Amit Patel',
  title: 'Professional Trader & Market Analyst',
  bio: 'With over a decade of hands-on experience in the Indian stock market, I have navigated bull runs, bear markets, and everything in between. My mission is to demystify the stock market and empower retail traders with institutional-grade knowledge.',
  photoUrl: '',
  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '1000+', label: 'Sessions Done' },
    { value: 'Intraday', label: 'Specialist' },
  ],
}

export default function AdminMentorProfile() {
  const { mentorProfile, updateMentorProfile } = useStore()
  const [formData, setFormData] = useState(DEFAULT_MENTOR)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (mentorProfile) {
      setFormData({
        name: mentorProfile.name || DEFAULT_MENTOR.name,
        title: mentorProfile.title || DEFAULT_MENTOR.title,
        bio: mentorProfile.bio || DEFAULT_MENTOR.bio,
        photoUrl: mentorProfile.photoUrl || '',
        stats: mentorProfile.stats || DEFAULT_MENTOR.stats,
      })
      if (mentorProfile.photoUrl) setPhotoPreview(mentorProfile.photoUrl)
    }
  }, [mentorProfile])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (url) => {
    setFormData({ ...formData, photoUrl: url })
    if (!photoFile) setPhotoPreview(url)
  }

  const updateStat = (index, field, value) => {
    const newStats = [...formData.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setFormData({ ...formData, stats: newStats })
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccessMsg('')
    try {
      let photoUrl = formData.photoUrl

      if (photoFile) {
        const storageRef = ref(storage, `mentor-photos/${Date.now()}_${photoFile.name}`)
        const snapshot = await uploadBytes(storageRef, photoFile)
        photoUrl = await getDownloadURL(snapshot.ref)
      }

      await updateMentorProfile({
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        photoUrl,
        stats: formData.stats,
      })

      setSuccessMsg('Mentor profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Error saving mentor profile:', err)
      alert('Failed to save mentor profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mentor Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Update the mentor information displayed on the trading mentorship page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Profile Photo</h3>
            <div className="flex flex-col items-center">
              {photoPreview ? (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img src={photoPreview} alt="Mentor" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setPhotoFile(null); setPhotoPreview(''); setFormData({ ...formData, photoUrl: '' }) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >×</button>
                </div>
              ) : (
                <label className="w-40 h-40 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all mb-4">
                  <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs text-gray-500">Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Or Enter Photo URL</label>
            <input
              type="text"
              value={formData.photoUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
            <p className="text-[10px] text-gray-500 mt-2 italic">* Manually entered URL will be used if no new file is uploaded.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Mentor Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Title / Designation</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Professional Trader & Market Analyst"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio / Description</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          {/* Stats */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-3">Stats (3 cards)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => updateStat(i, 'value', e.target.value)}
                    placeholder="e.g. 10+"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-bold focus:outline-none focus:border-blue-500/50"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => updateStat(i, 'label', e.target.value)}
                    placeholder="e.g. Years Experience"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : 'Save Profile'}
            </button>
            {successMsg && (
              <span className="text-sm text-emerald-400 font-medium">{successMsg}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
