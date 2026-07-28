import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { api, buildApiUrl, readApiJson } from '../config/api'
import { parseDeviceName, formatISTDateTime } from '../utils/deviceParser'

const departments = [
  'Engineering', 'Design', 'Marketing', 'Management', 'Support',
  'Sales', 'Editor', 'Technician', 'HR', 'Operations', 'Placement', 'Other'
]
const employeeRoles = [
  'HR & Recruitment Executive', 'Student Support Executive',
  'Business Development Executive (BDE)', 'Marketing Executive', 'Content Writer',
  'LMS Coordinator', 'Training Coordinator', 'Project Coordinator', 'Graphic Designer',
  'Web Development Intern/Executive', 'Operations Executive',
  'Placement & Career Support Executive', 'Senior Developer', 'Junior Developer',
  'UI/UX Designer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'Project Manager', 'QA Engineer', 'Video Editor', 'Technician', 'Other'
]

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'job', label: 'Job Info' },
  { id: 'social', label: 'Social & CV' },
  { id: 'session', label: 'Session & Devices' },
  { id: 'visibility', label: 'Visibility' },
]

export function EmployeeDashboard({ employee = {}, onClose, createMode = false }) {
  const { updateUser, addUser } = useStore()
  const empId = employee.uid || employee.id || employee._id || ''

  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    displayName: employee.displayName || '',
    email: employee.email || '',
    phone: employee.phone || '',
    avatar: employee.avatar || employee.photoURL || '',
    coverImage: employee.coverImage || '',
    bio: employee.bio || '',
    location: employee.location || '',
    experience: employee.experience || '',
    jobTitle: employee.jobTitle || '',
    department: employee.department || '',
    status: employee.status || 'active',
    employeeId: employee.employeeId || '',
    joinDate: employee.joinDate || '',
    isMentor: !!employee.isMentor,
    showOnTeam: !!employee.showOnTeam,
    skills: employee.skills || '',
    github: employee.github || '',
    linkedin: employee.linkedin || '',
    portfolio: employee.portfolio || '',
    cvFilePath: employee.cvFilePath || '',
    customImageUrl: employee.customImageUrl || '',
    avatarSource: employee.avatarSource || 'github',
  })

  const [devices, setDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revokingSession, setRevokingSession] = useState(false)
  const [sessionRevoked, setSessionRevoked] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [imageLoading, setImageLoading] = useState(false)

  const [liveSession, setLiveSession] = useState({
    currentSessionId: employee.currentSessionId || null,
    lastLoginIp: employee.lastLoginIp || '',
    lastLoginDevice: employee.lastLoginDevice || '',
    lastLoginAt: employee.lastLoginAt || null,
  })

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
  }

  // Real-time 2-second Session & Device Auto-Poller (No Manual Refresh Needed)
  useEffect(() => {
    let timer = null
    const target = form.email || employee.email || empId || employee.uid || employee.id

    const pollRealtimeSession = async () => {
      if (!target) return
      try {
        const lookupUrl = buildApiUrl(`/api/admin/users/lookup?email=${encodeURIComponent(target)}`)

        const res = await fetch(lookupUrl, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        }).then(readApiJson)

        if (res.success && res.user) {
          const u = res.user
          setLiveSession({
            currentSessionId: u.currentSessionId || null,
            lastLoginIp: u.lastLoginIp || '',
            lastLoginDevice: u.lastLoginDevice || '',
            lastLoginAt: u.lastLoginAt || null,
          })
          if (u.currentSessionId && sessionRevoked) {
            setSessionRevoked(false)
          }
          setDevices([
            {
              ip: u.lastLoginIp || 'Unknown IP',
              rawDevice: u.lastLoginDevice || 'Not available',
              deviceName: parseDeviceName(u.lastLoginDevice),
              lastSeen: formatISTDateTime(u.lastLoginAt),
              active: Boolean(u.currentSessionId)
            }
          ])
        }
      } catch {
        /* silent poll catch */
      } finally {
        setLoadingDevices(false)
      }
    }

    pollRealtimeSession()
    timer = setInterval(pollRealtimeSession, 2000)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [form.email, employee.email, empId, employee.uid, employee.id, sessionRevoked])

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      if (createMode) {
        await addUser({
          ...form,
          role: 'employee',
          skills: typeof form.skills === 'string' ? form.skills.split(',').map((skill) => skill.trim()).filter(Boolean) : form.skills,
        })
        onClose()
        return
      }
      await updateUser(empId, form)
      setMsg({ type: 'success', text: 'Saved successfully!' })
    } catch (err) {
      setMsg({ type: 'error', text: (err.message || 'Failed to save.') })
    } finally { setSaving(false) }
  }

  const handleRevokeSession = async () => {
    if (!empId || sessionRevoked) return
    setRevokingSession(true)
    setMsg({ type: '', text: '' })
    try {
      const response = await fetch(buildApiUrl(`/api/admin/users/${encodeURIComponent(empId)}/revoke-session`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.message || 'Unable to revoke the session.')
      setSessionRevoked(true)
      setDevices((current) => current.map((device) => ({ ...device, active: false })))
      setMsg({ type: 'success', text: 'Session revoked. The employee will be logged out on their next request.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Unable to revoke the session.' })
    } finally {
      setRevokingSession(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    setImageLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 300
        let w = img.width, h = img.height
        if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX } }
        else { if (h > MAX) { w = w * MAX / h; h = MAX } }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        set('avatar', canvas.toDataURL('image/jpeg', 0.85))
        setImageLoading(false)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1200 / img.width, 450 / img.height, 1)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        set('coverImage', canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const initials = (form.displayName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const formatDateTime = (value) => {
    if (!value) return 'Not available'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }
  const statusColor = form.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : form.status === 'terminated' ? 'bg-rose-100 text-rose-700 border-rose-200'
    : 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Sticky Top Bar ──────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Staff
        </button>
        <div className="flex items-center gap-3">
          {msg.text && (
            <span className={`text-sm font-semibold ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>{msg.text}</span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero Banner ──────────────────────────────────── */}
        <div className="relative rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden group/cover">
            {form.coverImage ? (
              form.coverImage.startsWith('linear-gradient') ? (
                <div className="w-full h-full" style={{ background: form.coverImage }} />
              ) : (
                <img src={form.coverImage} alt="cover" className="w-full h-full object-cover" />
              )
            ) : (
              <>
                <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute left-1/3 -bottom-10 h-48 w-48 rounded-full bg-purple-500/20 blur-2xl" />
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              </>
            )}

            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 cursor-pointer hover:bg-slate-900 transition-all shadow-lg border border-white/10">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
                <span>{form.coverImage ? 'Change Cover' : 'Upload Cover'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>

              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => set('coverImage', '')}
                  className="rounded-full bg-rose-950/80 backdrop-blur-md text-rose-300 text-xs font-bold px-3 py-2 hover:bg-rose-900 transition-all border border-rose-500/20"
                >
                  Reset Cover
                </button>
              )}
            </div>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-5 -mt-14">
            <div className="relative group shrink-0 z-10">
              <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                {(form.avatar?.startsWith('http') || form.avatar?.startsWith('data:'))
                  ? <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <label className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  </svg>
                  {imageLoading ? 'Uploading…' : 'Change'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="flex-1 pt-14 sm:pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{form.displayName || 'Unnamed Employee'}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'active' ? 'bg-emerald-500' : form.status === 'terminated' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </span>
                {form.isMentor && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 14.6l7.74-4.453M12 4.5l7.74 4.453L12 13.407 4.26 8.953 12 4.5zM4.26 13.5v3.6L12 21.6l7.74-4.5v-3.6" />
                    </svg>
                    Mentor
                  </span>
                )}
                {form.showOnTeam && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    Public
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {form.jobTitle || 'No title set'}
                {form.department ? ` · ${form.department}` : ''}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{form.email}{form.phone ? ` · ${form.phone}` : ''}</p>
            </div>

            <div className="flex gap-6 text-center text-xs pb-1">
              {form.employeeId && <div><p className="text-slate-400 font-medium">EMP ID</p><p className="text-slate-800 font-extrabold">{form.employeeId}</p></div>}
              {form.joinDate && <div><p className="text-slate-400 font-medium">Joined</p><p className="text-slate-800 font-extrabold">{form.joinDate}</p></div>}
              <div>
                <p className="text-slate-400 font-medium">Session</p>
                <p className={`font-extrabold flex items-center justify-center gap-1.5 ${employee.currentSessionId ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${employee.currentSessionId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  {employee.currentSessionId ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto scrollbar-none">
          {TABS.filter((t) => !createMode || t.id !== 'session').map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all relative ${tab === t.id ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}>
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
            </button>
          ))}
        </div>

        {/* ── TAB: Profile ──────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Basic Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Display Name', name: 'displayName', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Phone', name: 'phone', type: 'tel' },
                { label: 'Location', name: 'location', type: 'text', placeholder: 'e.g. Mumbai, India' },
                { label: 'Experience', name: 'experience', type: 'text', placeholder: 'e.g. 4+ Years' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder || ''}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Avatar URL (optional)</label>
                <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://… or upload above"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Bio / About</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                placeholder="Brief intro about skills, background, and responsibilities…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none" />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Skills <span className="normal-case font-medium">(comma separated)</span></label>
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Figma…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
            </div>
          </div>
        )}

        {/* ── TAB: Job Info ─────────────────────────────────── */}
        {tab === 'job' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Job Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Job Title</label>
                <select name="jobTitle" value={form.jobTitle} onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                  <option value="">Select role…</option>
                  {employeeRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                <select name="department" value={form.department} onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                  <option value="">Select dept…</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                  <option value="active">Active</option>
                  <option value="terminated">Terminated</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Employee ID</label>
                <input name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="ASH-001"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Join Date</label>
                <input name="joinDate" type="date" value={form.joinDate} onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Experience</label>
                <input name="experience" value={form.experience} onChange={handleChange} placeholder="4+ Years"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Social & CV ─────────────────────────────── */}
        {tab === 'social' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Social Links & CV</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'GitHub URL', name: 'github', placeholder: 'https://github.com/…' },
                { label: 'LinkedIn URL', name: 'linkedin', placeholder: 'https://linkedin.com/in/…' },
                { label: 'Portfolio URL', name: 'portfolio', placeholder: 'https://…' },
                { label: 'CV / Resume Link', name: 'cvFilePath', placeholder: 'https://drive.google.com/…' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              ))}
            </div>
            {form.cvFilePath && (
              <a href={form.cvFilePath} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Open CV in new tab →</span>
              </a>
            )}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Avatar Source</label>
              <select name="avatarSource" value={form.avatarSource} onChange={handleChange}
                className="w-64 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all">
                <option value="github">GitHub</option>
                <option value="custom">Custom URL</option>
                <option value="upload">Uploaded</option>
              </select>
            </div>
            {form.avatarSource === 'custom' && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Custom Image URL</label>
                <input name="customImageUrl" value={form.customImageUrl} onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Session & Devices ───────────────────────── */}
        {tab === 'session' && (
          <div className="space-y-5">
            {/* Session Info box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Session Security</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> Realtime 3s Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Session ID</span>
                  <span className="font-mono text-slate-700 break-all text-xs">
                    {(liveSession.currentSessionId || employee.currentSessionId) && !sessionRevoked
                      ? (liveSession.currentSessionId || employee.currentSessionId)
                      : '— (No Active Session)'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Last Login IP</span>
                  <span className="font-mono text-slate-700 font-bold">{liveSession.lastLoginIp || employee.lastLoginIp || '—'}</span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Login Device</span>
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    {parseDeviceName(liveSession.lastLoginDevice || employee.lastLoginDevice)}
                  </span>
                  {(liveSession.lastLoginDevice || employee.lastLoginDevice) && (
                    <span className="font-mono text-[10px] text-slate-400 break-all truncate" title={liveSession.lastLoginDevice || employee.lastLoginDevice}>
                      {liveSession.lastLoginDevice || employee.lastLoginDevice}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Login Time (IST)</span>
                  <span className="text-xs font-bold text-slate-800">{formatISTDateTime(liveSession.lastLoginAt || employee.lastLoginAt)}</span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Realtime Status</span>
                  <span className={`font-bold text-xs flex items-center gap-1.5 ${(liveSession.currentSessionId || employee.currentSessionId) && !sessionRevoked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${(liveSession.currentSessionId || employee.currentSessionId) && !sessionRevoked ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    {(liveSession.currentSessionId || employee.currentSessionId) && !sessionRevoked ? 'Online (Active Now)' : 'Offline (Logged Out)'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Firebase UID</span>
                  <span className="font-mono text-slate-700 break-all text-xs">{employee.uid || employee.id || '—'}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400 font-medium">Revoking force logs out active session immediately</span>
                <button
                  type="button"
                  onClick={async () => {
                    await handleRevokeSession()
                    setLiveSession(prev => ({ ...prev, currentSessionId: null }))
                  }}
                  disabled={!(liveSession.currentSessionId || employee.currentSessionId) || sessionRevoked || revokingSession}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
                >
                  {revokingSession ? 'Logging out…' : sessionRevoked ? 'Session logged out' : 'Force logout employee'}
                </button>
              </div>
            </div>

            {/* Devices box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Current / Last Login Device</h2>
              <p className="mb-4 text-xs text-slate-500 font-medium">A new login replaces the previous active session, so this shows the currently active or most recent device.</p>
              {loadingDevices ? (
                <p className="text-sm text-slate-400 font-mono">// Loading devices…</p>
              ) : devices.length === 0 ? (
                <p className="text-sm text-slate-400">No active device sessions found.</p>
              ) : (
                <ul className="space-y-3">
                  {devices.map((dev, i) => (
                    <li key={i} className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">{dev.deviceName || parseDeviceName(dev.rawDevice)}</span>
                        {dev.active && !sessionRevoked ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active now
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 pt-1">
                        <span>IP: <strong className="text-slate-800">{dev.ip}</strong></span>
                        <span className="text-slate-400 font-sans">Last seen: <strong className="text-slate-700">{dev.lastSeen || '—'}</strong></span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Visibility ──────────────────────────────── */}
        {tab === 'visibility' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Team & Visibility Settings</h2>

            {[
              { name: 'showOnTeam', label: 'Show on Public Team Page', desc: 'Profile will appear in the public SolutionHub team roster.' },
              { name: 'isMentor', label: 'Is Mentor', desc: 'Mark this employee as a mentor visible to students.' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <button type="button" onClick={() => set(item.name, !form[item.name])}
                  className={`relative h-6 w-11 rounded-full transition-all ${form[item.name] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form[item.name] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}

            {form.showOnTeam && (
              <div className="mt-2 p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                <p className="text-xs font-bold text-blue-700 mb-1">Public Profile URL</p>
                <p className="text-xs font-mono text-blue-600 break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/team/${encodeURIComponent(employee.uid || employee.id || form.email)}` : '—'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom Save Bar ───────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-10">
          <button onClick={onClose}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDashboardRoute() {
  const { users } = useStore()
  const { employeeId } = useParams()
  const navigate = useNavigate()
  if (employeeId === 'new') {
    return <EmployeeDashboard createMode employee={{}} onClose={() => navigate('/admin/employees')} />
  }
  const employee = users.find((user) =>
    [user.uid, user.id, user._id, user.firebaseUid, user.email]
      .filter(Boolean)
      .map(String)
      .includes(String(employeeId || ''))
  )

  if (!employee) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Employee not found</h1>
        <p className="mt-2 text-sm text-slate-500">This employee may have been removed or is still loading.</p>
        <button onClick={() => navigate('/admin/employees')} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Back to staff</button>
      </div>
    )
  }

  return <EmployeeDashboard employee={employee} onClose={() => navigate('/admin/employees')} />
}
