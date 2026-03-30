import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { api, API_BASE } from '../config/api'

const avatarColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-red-500 to-rose-500', 'from-indigo-500 to-violet-500']

export default function AdminTeam() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useStore()
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({ name: '', role: '', email: '', department: 'Engineering', status: 'Active', skills: '', joinDate: '', github: '', customDepartment: '' })

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const departments = ['All', ...new Set(teamMembers.map(m => m.department))]

  const filteredMembers = teamMembers.filter(member => {
    const matchesDept = departmentFilter === 'All' || member.department === departmentFilter
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  })

  const openCreate = () => {
    setFormData({ name: '', role: '', email: '', department: 'Engineering', status: 'Active', skills: '', joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), github: '', customDepartment: '' })
    setShowModal(true)
  }

  const openEdit = (member) => {
    setEditingMember(member)
    const isOther = !['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Editor', 'Technician'].includes(member.department)
    setFormData({ 
      name: member.name, 
      role: member.role, 
      email: member.email, 
      department: isOther ? 'Other' : member.department, 
      status: member.status, 
      skills: (member.skills || []).join(', '), 
      joinDate: member.joinDate, 
      github: member.github || '',
      customDepartment: isOther ? member.department : ''
    })
    setShowModal(true)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    const skillsArr = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    try {
      const finalDept = formData.department === 'Other' ? formData.customDepartment : formData.department
      const payload = { ...formData, department: finalDept, skills: skillsArr, avatar: formData.name.charAt(0).toUpperCase() }
      // Remove temporary customDepartment field from payload
      delete payload.customDepartment
      
      if (editingMember) {
        await updateTeamMember(editingMember.id, payload)
      } else {
        await addTeamMember({ ...payload, tasksCompleted: 0, projectsActive: 0, performance: 0 })
      }
      setShowModal(false)
    } catch (err) {
      alert("Failed to save team member.")
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
      await deleteTeamMember(memberToDelete.id)
      setShowDeleteModal(false)
    } catch (err) {
      alert("Failed to delete team member.")
    } finally {
      setDeletingId(null)
      setMemberToDelete(null)
    }
  }

  const toggleStatus = async (member) => {
    try {
      await updateTeamMember(member.id, { status: member.status === 'Active' ? 'On Leave' : 'Active' })
    } catch (err) {
      console.error("Failed to toggle status:", err)
    }
  }

  const getImageUrl = (github) => {
    if (!github) return null;
    // If it's already a full URL, return it
    if (github.startsWith('http')) return github;
    // Otherwise assume it's a GitHub username
    return `https://github.com/${github}.png`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm text-gray-400 mt-1">{teamMembers.length} team members across {departments.length - 1} departments</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {departments.map(dept => (
            <button key={dept} onClick={() => setDepartmentFilter(dept)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${departmentFilter === dept ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>{dept}</button>
          ))}
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input type="text" placeholder="Search team..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-2 w-48 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMembers.map((member, index) => (
          <div key={member.id} className="group bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {member.github ? (
                  <img src={getImageUrl(member.github)} alt={member.name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                ) : (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-bold shadow-lg`}>{member.avatar}</div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-white">{member.name}</h3>
                  <p className="text-xs text-gray-400">{member.role}</p>
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

            <div className="flex flex-wrap gap-1.5 mb-4">
              {(member.skills || []).map(skill => (<span key={skill} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-medium text-gray-400">{skill}</span>))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {/* Dynamically calculate task and project counts from the tasks store */}
                <span>
                  <span className="text-white font-medium">
                    {useStore().tasks?.filter(t => t.assignee === member.name || t.avatar === member.avatar).length || 0}
                  </span> tasks
                </span>
                <span>
                  <span className="text-white font-medium">
                    {[...new Set(useStore().tasks?.filter(t => t.assignee === member.name || t.avatar === member.avatar).map(t => t.project))].length || 0}
                  </span> projects
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${member.performance >= 90 ? 'bg-emerald-500' : member.performance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${member.performance}%` }} />
                </div>
                <span className="text-xs text-gray-400">{member.performance}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub Username or Image URL</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden text-blue-400">
                      {formData.github ? (
                        <img src={getImageUrl(formData.github)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={formData.github}
                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                        placeholder="e.g. 'Amit-Patel01' or 'https://example.com/photo.jpg'"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                      <p className="text-[10px] text-gray-500 mt-2 italic font-medium">Enter a GitHub username OR a direct link to an image.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter full name" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required placeholder="email@solutionhub.com" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Role *</label>
                  <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required placeholder="e.g. Senior Developer" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
                  <div className="space-y-3">
                    <select 
                      value={formData.department} 
                      onChange={e => setFormData({ ...formData, department: e.target.value, customDepartment: '' })} 
                      required
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    >
                      {['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Editor', 'Technician', 'Other'].map(d => (
                        <option key={d} value={d} className="bg-gray-900">{d}</option>
                      ))}
                    </select>
                    {formData.department === 'Other' && (
                      <input 
                        type="text" 
                        value={formData.customDepartment || ''} 
                        onChange={e => setFormData({ ...formData, customDepartment: e.target.value })} 
                        required 
                        placeholder="Enter custom department" 
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all animate-in fade-in slide-in-from-top-1" 
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                    <option value="Active" className="bg-gray-900">Active</option>
                    <option value="On Leave" className="bg-gray-900">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Join Date</label>
                  <input type="text" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} placeholder="Jan 2024" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Skills (comma separated)</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">{editingMember ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deletingId && setShowDeleteModal(false)} />
          <div className="relative bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-50"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">Remove Member?</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Are you sure you want to remove <span className="text-white font-medium">"{memberToDelete?.name}"</span> from the team?
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  disabled={deletingId}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {deletingId ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Removing...</>
                  ) : 'Yes, Remove Member'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
