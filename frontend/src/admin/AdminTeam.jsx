import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Globe, Link } from 'lucide-react'

const avatarColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-red-500 to-rose-500', 'from-indigo-500 to-violet-500']

export default function AdminTeam() {
  const { users = [], updateUser, tasks: storeTasks = [] } = useStore()
  
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [showingFilter, setShowingFilter] = useState('all') // 'all' | 'about'
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  
  const initialForm = { 
    name: '', 
    role: '', 
    email: '', 
    employeeId: '', 
    department: 'Engineering', 
    status: 'Active', 
    skills: '', 
    joinDate: '', 
    github: '', 
    linkedin: '', 
    portfolio: '',
    cvFilePath: '',
    customImageUrl: '',
    avatarSource: 'github', 
    customDepartment: '',
    isMentor: false,
    bio: '',
    showOnTeam: true,
  }
  
  const [formData, setFormData] = useState(initialForm)

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const safeMembers = (Array.isArray(users) ? users : [])
    .filter((user) => (user?.role || '').toLowerCase() === 'employee' && user?.showOnTeam)
    .map((user) => ({
      ...user,
      id: user.uid || user.id,
      name: user.displayName || user.name || '',
      role: user.jobTitle || user.role || '',
      status: user.status === 'active' ? 'Active' : 'Inactive',
    }))
  const departments = ['All', ...new Set(safeMembers.map(m => m.department))]

  const filteredMembers = safeMembers.filter(member => {
    if (!member) return false
    const matchesDept = departmentFilter === 'All' || member.department === departmentFilter
    const nameStr = member.name || member.displayName || ''
    const roleStr = member.role || ''
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         roleStr.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAbout = showingFilter === 'all' || (showingFilter === 'about' && member.isMentor)
    return matchesDept && matchesSearch && matchesAbout
  }).sort((a, b) => {
    const idA = a.employeeId || ''
    const idB = b.employeeId || ''
    if (!idA && !idB) return 0
    if (!idA) return 1
    if (!idB) return -1
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' })
  })

  const openEdit = (member) => {
    setEditingMember(member)
    const isOther = !['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Editor', 'Technician'].includes(member.department)
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      employeeId: member.employeeId || '',
      department: isOther ? 'Other' : member.department,
      status: member.status,
      skills: (member.skills || []).join(', '),
      joinDate: member.joinDate,
      github: member.github || '',
      linkedin: member.linkedin || '',
      portfolio: member.portfolio || '',
      cvFilePath: member.cvFilePath || '',
      customImageUrl: member.customImageUrl || '',
      avatarSource: member.avatarSource || 'github',
      customDepartment: isOther ? member.department : '',
      isMentor: member.isMentor || false,
      bio: member.bio || '',
      showOnTeam: member.showOnTeam !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const skillsArr = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    try {
      const finalDept = formData.department === 'Other' ? formData.customDepartment : formData.department
      const payload = {
        displayName: formData.name.trim(),
        jobTitle: formData.role.trim(),
        email: formData.email.trim(),
        employeeId: formData.employeeId.trim(),
        department: finalDept,
        status: formData.status === 'Active' ? 'active' : 'inactive',
        skills: skillsArr,
        github: formData.github || '',
        linkedin: formData.linkedin || '',
        portfolio: formData.portfolio || '',
        cvFilePath: formData.cvFilePath || '',
        customImageUrl: formData.customImageUrl || '',
        avatarSource: formData.avatarSource || 'github',
        joinDate: formData.joinDate || '',
        isMentor: Boolean(formData.isMentor),
        bio: formData.bio || '',
        showOnTeam: Boolean(formData.showOnTeam),
        role: 'employee',
      }

      // Clean up temp fields
      if (editingMember) {
        await updateUser(editingMember.id, payload)
      }

      setShowModal(false)
      setEditingMember(null)
    } catch (err) {
      console.error(err)
      alert(`Failed to save team member: ${err.message}`)
    }
  }

  const handleDeleteClick = (member) => {
    setMemberToDelete(member)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!memberToDelete) return
    setDeletingId(memberToDelete.id)
    try {
      await updateUser(memberToDelete.id, { showOnTeam: false })
      setShowDeleteModal(false)
    } catch (err) {
      alert("Failed to remove team member.")
    } finally {
      setDeletingId(null)
      setMemberToDelete(null)
    }
  }

  const toggleStatus = async (member) => {
    try {
      await updateUser(member.id, { status: member.status === 'Active' ? 'inactive' : 'active' })
    } catch (err) {
      console.error("Failed to toggle status:", err)
    }
  }

  const getImageUrl = (member) => {
    if (!member) return null
    const { github, customImageUrl, avatarSource, linkedin } = member
    if (avatarSource === 'custom' && customImageUrl) return customImageUrl
    if (avatarSource === 'linkedin' && linkedin && !linkedin.includes('linkedin.com')) return linkedin
    if (github) {
      if (github.startsWith('http')) return github
      return `https://github.com/${github}.png`
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team (About Us)</h1>
          <p className="text-sm text-gray-400 mt-1">{safeMembers.length} profiles for the website</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-200">
          Team members come from `Staff Accounts` with `Add to Team` enabled.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
          {/* Showing on About filter */}
          <button
            onClick={() => setShowingFilter(showingFilter === 'about' ? 'all' : 'about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              showingFilter === 'about'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Globe className="w-4 h-4" />
            Showing on About
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              showingFilter === 'about' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-gray-500'
            }`}>
              {safeMembers.filter(m => m.isMentor).length}
            </span>
          </button>

          <span className="w-px h-4 bg-white/10 mx-1" />

          {/* Department filters */}
          {departments.map(dept => (
            <button key={dept} onClick={() => setDepartmentFilter(dept)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${departmentFilter === dept ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>{dept}</button>
          ))}
        </div>
  
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg 
              className="w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-all duration-300 ease-in-out transform group-focus-within:scale-110" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search team..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-14 pr-4 py-2.5 w-56 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMembers.map((member, index) => (
          <div key={member.id} className="group bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getImageUrl(member) ? (
                  <img src={getImageUrl(member)} alt={member.name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                ) : (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-bold shadow-lg`}>{member.avatar}</div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-white">{member.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-gray-400">{member.role}</p>
                    {member.employeeId && (
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 rounded ml-1 border border-blue-500/20">{member.employeeId}</span>
                    )}
                    {member.isMentor && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        <Globe className="w-3 h-3" /> About
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100">
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                </button>
                <button onClick={() => handleDeleteClick(member)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
                <button onClick={() => toggleStatus(member)} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}`}>
                  {member.status}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                {member.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                {member.department}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span><span className="text-white font-medium">{(storeTasks || []).filter(t => t && t.assignee === member.name).length || 0}</span> tasks</span>
                <span><span className="text-white font-medium">{[...new Set((storeTasks || []).filter(t => t && t.assignee === member.name).map(t => t.project))].filter(Boolean).length || 0}</span> projs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${member.performance || 0}%` }} />
                </div>
                <span className="text-xs text-gray-400">{member.performance || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unified Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">{editingMember ? 'Edit Team Member' : 'Team Member'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Photo Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">GitHub Username</label>
                  <input type="text" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} placeholder="e.g. user123" className="w-full bg-transparent text-sm text-white focus:outline-none" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Custom Image URL (for avatar)</label>
                  <input type="url" value={formData.customImageUrl} onChange={e => setFormData({ ...formData, customImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-transparent text-sm text-white focus:outline-none" />
                </div>
              </div>

              {/* Social URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-blue-500/20 rounded-xl p-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-blue-400/70 uppercase tracking-widest mb-2">
                    <Link className="w-3 h-3" /> LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                  />
                </div>
                <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-3">
                  <label className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-widest mb-2">CV / Resume Drive Link</label>
                  <input
                    type="url"
                    value={formData.cvFilePath}
                    onChange={e => setFormData({ ...formData, cvFilePath: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div className="bg-white/5 border border-purple-500/20 rounded-xl p-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-purple-400/70 uppercase tracking-widest mb-2">
                    <Globe className="w-3 h-3" /> Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                    {getImageUrl(formData) ? <img src={getImageUrl(formData)} alt="P" className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-600">NULL</span>}
                  </div>
                  <span className="text-[11px] font-bold text-gray-300">Photo Source</span>
                </div>
                <div className="flex bg-gray-800 p-1 rounded-lg">
                  <button type="button" onClick={() => setFormData({ ...formData, avatarSource: 'github' })} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${formData.avatarSource === 'github' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>GitHub</button>
                  <button type="button" onClick={() => setFormData({ ...formData, avatarSource: 'custom' })} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${formData.avatarSource === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Custom</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Name" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Employee ID (Special)</label>
                  <input type="text" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} placeholder="ASH-001" className="w-full px-3 py-2 bg-white/5 border border-blue-500/20 rounded-xl text-sm text-blue-400 font-mono focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                  <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required placeholder="Role" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Department</label>
                  <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                    {['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Editor', 'Technician', 'Other'].map(d => (
                      <option key={d} value={d} className="bg-gray-900">{d}</option>
                    ))}
                  </select>
                </div>
                {/* Mentor Toggle */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 h-[62px] self-end">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isMentor} onChange={e => setFormData({ ...formData, isMentor: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <div>
                    <div className="text-xs font-bold text-white">Set as Mentor</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Displays in 'Our Mentors' section</div>
                  </div>
                </div>
              </div>

              {formData.department === 'Other' && (
                <input
                  type="text"
                  value={formData.customDepartment}
                  onChange={e => setFormData({ ...formData, customDepartment: e.target.value })}
                  placeholder="Enter custom department"
                  required
                  className="mt-2 w-full px-3 py-2 bg-blue-500/5 border border-blue-500/30 rounded-xl text-xs text-blue-400 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Expected Join Date</label>
                  <input type="text" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} placeholder="Jan 2024" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                    <option value="Active" className="bg-gray-900">Active</option>
                    <option value="Inactive" className="bg-gray-900">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Skills</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio / Tagline</label>
                  <input 
                    type="text"
                    value={formData.bio} 
                    onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                    placeholder="Short bio for the card..." 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Remove From Team?</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to hide <span className="text-white">"{memberToDelete?.name}"</span> from the team section?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">{deletingId ? 'Removing...' : 'Yes, Remove'}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-white/5 text-gray-400 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
