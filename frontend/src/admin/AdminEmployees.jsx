import { useState } from 'react'
import { useStore } from '../store/StoreContext'
const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
]

const departments = ['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Editor', 'Technician', 'Other']
const employeeRoles = ['Senior Developer', 'Junior Developer', 'UI/UX Designer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Project Manager', 'QA Engineer', 'Content Writer', 'Video Editor', 'Technician', 'Other']

export default function AdminEmployees() {
  const { users, addUser, updateUser, deleteUser, mergeUsers } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  
  // Tab/Section control in modal
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    avatar: '',
    jobTitle: '',
    department: '',
    status: 'active',
    joinDate: '',
    employeeId: '',
    customJobTitle: '',
    customDepartment: '',
    // Unified Team Fields
    github: '',
    linkedin: '',
    portfolio: '',
    customImageUrl: '',
    avatarSource: 'github',
    isMentor: false,
    showOnTeam: false,
    skills: '',
    bio: '',
    cvFilePath: '',
  })

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [mergePrimaryId, setMergePrimaryId] = useState('')
  const [mergeDupId, setMergeDupId] = useState('')
  const [mergeReason, setMergeReason] = useState('')
  const [mergeBusy, setMergeBusy] = useState(false)

  const employees = users.filter(u => (u.role || '').toLowerCase() === 'employee')

  const normalizeAvatarSource = (value) => (value === 'linkedin' ? 'custom' : (value || 'github'))

  const getPreviewImage = (member) => {
    if (!member) return ''
    if (normalizeAvatarSource(member.avatarSource) === 'custom' && member.customImageUrl) return member.customImageUrl
    if (member.avatar && String(member.avatar).startsWith('http')) return member.avatar
    if (member.github) {
      return member.github.startsWith('http') ? member.github : `https://github.com/${member.github}.png`
    }
    return ''
  }

  const filteredDepartments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))]

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter
    const nameStr = emp.displayName || ''
    const emailStr = emp.email || ''
    const roleStr = emp.jobTitle || ''
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleStr.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  }).sort((a, b) => {
    const idA = a.employeeId || ''
    const idB = b.employeeId || ''
    if (!idA && !idB) return 0
    if (!idA) return 1
    if (!idB) return -1
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' })
  })

  const openCreateModal = () => {
    setEditingEmployee(null)
    setFormData({
      displayName: '',
      email: '',
      phone: '',
      avatar: '',
      jobTitle: '',
      department: 'Engineering',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      employeeId: '',
      customJobTitle: '',
      customDepartment: '',
      github: '',
      linkedin: '',
      portfolio: '',
      customImageUrl: '',
      avatarSource: 'github',
      isMentor: false,
      showOnTeam: false,
      skills: '',
      bio: '',
      cvFilePath: '',
    })
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEditModal = (employee) => {
    setEditingEmployee(employee)
    
    // Check if job title and department are in our lists
    const isOtherRole = employee.jobTitle && !employeeRoles.includes(employee.jobTitle)
    const isOtherDept = employee.department && !departments.includes(employee.department)
    const legacyCustomImageUrl =
      employee.customImageUrl ||
      (employee.avatarSource === 'linkedin' && employee.linkedin && !employee.linkedin.includes('linkedin.com') ? employee.linkedin : '')

    setFormData({
      displayName: employee.displayName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      avatar: employee.avatar && String(employee.avatar).startsWith('http') ? employee.avatar : '',
      jobTitle: isOtherRole ? 'Other' : (employee.jobTitle || ''),
      department: isOtherDept ? 'Other' : (employee.department || ''),
      status: employee.status || 'active',
      joinDate: employee.joinDate || '',
      employeeId: employee.employeeId || '',
      customJobTitle: isOtherRole ? employee.jobTitle : '',
      customDepartment: isOtherDept ? employee.department : '',
      // Map Team Fields
      showOnTeam: employee.showOnTeam || false,
      skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : (employee.skills || ''),
      github: employee.github || '',
      linkedin: employee.linkedin || '',
      portfolio: employee.portfolio || '',
      customImageUrl: legacyCustomImageUrl,
      avatarSource: normalizeAvatarSource(employee.avatarSource),
      isMentor: employee.isMentor || false,
      bio: employee.bio || '',
      cvFilePath: employee.cvFilePath || '',
    })
    
    setActiveTab('basic')
    setShowModal(true)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const finalJobTitle = formData.jobTitle === 'Other' ? formData.customJobTitle : formData.jobTitle
      const finalDepartment = formData.department === 'Other' ? formData.customDepartment : formData.department
      
      const skillsArray = typeof formData.skills === 'string' 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : formData.skills

      const payload = { 
        ...formData, 
        jobTitle: finalJobTitle,
        department: finalDepartment,
        skills: skillsArray,
        role: 'employee',
        avatar: (formData.avatar || '').trim(),
        customImageUrl: (formData.customImageUrl || '').trim(),
        avatarSource: normalizeAvatarSource(formData.avatarSource),
      }
      
      // Clean up local temp fields
      delete payload.customJobTitle
      delete payload.customDepartment

      if (editingEmployee) {
        await updateUser(editingEmployee.uid || editingEmployee.id, payload)
      } else {
        await addUser(payload)
      }
      setShowModal(false)
    } catch (err) {
      console.error("Save error:", err)
      alert(err.message || "Unable to save the employee record.")
    }
  }

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return
    const id = employeeToDelete.uid || employeeToDelete.id
    setDeletingId(id)
    try {
      await deleteUser(id)
      setShowDeleteModal(false)
    } catch (err) {
      alert(err.message || "Unable to delete the employee.")
    } finally {
      setDeletingId(null)
      setEmployeeToDelete(null)
    }
  }

  const toggleStatus = async (employee) => {
    const id = employee.uid || employee.id
    try {
      await updateUser(id, { status: employee.status === 'active' ? 'inactive' : 'active' })
    } catch (err) {
      console.error("Failed to toggle status:", err)
      alert(err.message || "Unable to update account status.")
    }
  }

  const handleMergeAccounts = async (e) => {
    e.preventDefault()
    if (!mergePrimaryId.trim() || !mergeDupId.trim()) {
      alert("Enter the primary account identifier and the duplicate account identifier.")
      return
    }
    if (mergePrimaryId.trim() === mergeDupId.trim()) {
      alert("Choose two different accounts to merge.")
      return
    }
    setMergeBusy(true)
    try {
      await mergeUsers(mergePrimaryId.trim(), mergeDupId.trim(), mergeReason.trim())
      setMergePrimaryId("")
      setMergeDupId("")
      setMergeReason("")
      alert("The accounts were merged successfully. Firebase and the primary database have been updated.")
    } catch (err) {
      alert(err.message || "Unable to merge the accounts.")
    } finally {
      setMergeBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">
            {employees.length} employees | {employees.filter(e => e.status === 'active').length} active
            {users.length > 0 && <span className="ml-2 text-blue-400 font-medium">(Total System Users: {users.length})</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-slate-300">
          {filteredDepartments.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                departmentFilter === dept
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {dept}
            </button>
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
            placeholder="Search employees..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-14 pr-4 py-2.5 w-56 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out" 
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Team</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">CV</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.uid || employee.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex-shrink-0 aspect-square rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-sm font-bold shadow-lg overflow-hidden`}>
                        {getPreviewImage(employee) ? (
                          <img src={getPreviewImage(employee)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          employee.avatar || (employee.displayName ? employee.displayName.charAt(0) : '?')
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{employee.displayName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">Joined {employee.joinDate || 'N/A'}</p>
                        {employee.employeeId && (
                          <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">{employee.employeeId}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">{employee.email}</p>
                    <p className="text-xs text-gray-500">{employee.phone || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{employee.jobTitle || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-300">
                      {employee.department || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(employee)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        employee.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        employee.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}></span>
                      {employee.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {employee.showOnTeam ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Showing on About
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-medium uppercase">Private</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {employee.cvFilePath ? (
                      <a
                        href={employee.cvFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        View
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Merge duplicate accounts</h2>
          <p className="text-sm text-gray-400 mt-1">
            Combine two employee records into one. The primary account is kept; the duplicate is removed from MySQL and Firebase.
            Use Firebase UID, numeric database ID, email, or phone as identifiers.
          </p>
        </div>
        <form onSubmit={handleMergeAccounts} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Primary account (kept)</label>
            <input
              value={mergePrimaryId}
              onChange={(e) => setMergePrimaryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              placeholder="UID, ID, email, or phone"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duplicate account (removed)</label>
            <input
              value={mergeDupId}
              onChange={(e) => setMergeDupId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              placeholder="UID, ID, email, or phone"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Reason (optional)</label>
            <input
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
              placeholder="e.g. duplicate signup"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={mergeBusy}
              className="px-4 py-2 rounded-lg bg-amber-600/90 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
            >
              {mergeBusy ? "Merging…" : "Merge accounts"}
            </button>
          </div>
        </form>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gray-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Manage credentials and team visibility</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="employeeForm"
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors"
                >
                  {editingEmployee ? 'Save' : 'Create'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-gray-900 px-6 pt-2 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'basic' ? 'text-blue-400 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                LOGIN & CORE INFO
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'text-blue-400 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                TEAM PROFILE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="employeeForm" onSubmit={handleSubmit} className="space-y-6">
                
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                          required
                          placeholder="Full Name"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="email@example.com"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Employee ID</label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="ASH-001"
                          className="w-full px-3 py-2.5 bg-white/5 border border-blue-500/20 rounded-xl text-sm text-blue-400 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Profile Photo URL</label>
                        <input
                          type="text"
                          value={formData.avatar}
                          onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Job Title *</label>
                        <select
                          value={formData.jobTitle}
                          onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                          required
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="" className="bg-gray-900">Select role</option>
                          {employeeRoles.map(role => (
                            <option key={role} value={role} className="bg-gray-900">{role}</option>
                          ))}
                        </select>
                        {formData.jobTitle === 'Other' && (
                          <input
                            type="text"
                            value={formData.customJobTitle}
                            onChange={e => setFormData({ ...formData, customJobTitle: e.target.value })}
                            placeholder="Enter custom title"
                            className="mt-2 w-full px-3 py-2 bg-blue-500/5 border border-blue-500/30 rounded-xl text-xs text-blue-400 focus:outline-none"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
                        <select
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          required
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="" className="bg-gray-900">Select department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-gray-900">{dept}</option>
                          ))}
                        </select>
                        {formData.department === 'Other' && (
                          <input
                            type="text"
                            value={formData.customDepartment}
                            onChange={e => setFormData({ ...formData, customDepartment: e.target.value })}
                            placeholder="Enter custom department"
                            className="mt-2 w-full px-3 py-2 bg-blue-500/5 border border-blue-500/30 rounded-xl text-xs text-blue-400 focus:outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Account Access</label>
                      <div className="w-full rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-3 text-xs leading-5 text-blue-300">
                        A secure password reset email will be sent after the account is created. No default password is assigned.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="active" className="bg-gray-900">Active</option>
                          <option value="inactive" className="bg-gray-900">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Join Date</label>
                        <input
                          type="date"
                          value={formData.joinDate}
                          onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                       {/* Mentor Toggle */}
                       <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <div>
                          <p className="text-[11px] font-bold text-white">Set as Mentor</p>
                          <p className="text-[9px] text-gray-400">Include in 'Our Mentors'</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isMentor: !formData.isMentor })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.isMentor ? 'bg-emerald-600' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isMentor ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Visibility Switch */}
                      <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                        <div>
                          <p className="text-[11px] font-bold text-white">Add to Team</p>
                          <p className="text-[9px] text-gray-400">Show this staff account in About</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showOnTeam: !formData.showOnTeam })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.showOnTeam ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.showOnTeam ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 mb-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider">Team Card Details</p>
                        <p className="text-[9px] text-gray-500">Information shown on the About page team cards</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Member Bio / Tagline</label>
                      <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="e.g. Passionate developer with 5+ years of experience in building modern web applications..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">A brief description shown under the name on the team card.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Expertise / Skills</label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g. React, UI Design, Node.js"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Separate skills with commas</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Public links and collaboration path
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">GitHub Username</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.github}
                            onChange={e => setFormData({ ...formData, github: e.target.value })}
                            placeholder="amit-patel01"
                            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                          />
                          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Profile Avatar Link</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.customImageUrl}
                            onChange={e => setFormData({ ...formData, customImageUrl: e.target.value })}
                            placeholder="https://example.com/avatar-image.png"
                            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                          />
                          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Portfolio URL</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.portfolio}
                          onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                          placeholder="https://portfolio.amitsolutionhub.com/"
                          className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-cyan-500">CV / Resume (Google Drive Link)</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.cvFilePath}
                          onChange={e => setFormData({ ...formData, cvFilePath: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                        </svg>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Provide a direct link to the Google Drive file or public resume URL.</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                            {getPreviewImage(formData) ? (
                              <img 
                                src={getPreviewImage(formData)}
                                alt="P" 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (formData.displayName || 'User') }}
                              />
                            ) : <span className="text-[10px] text-gray-600 font-bold">NULL</span>}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-300">Avatar Source</span>
                            <p className="text-[10px] text-gray-500">Pick which image to show</p>
                          </div>
                        </div>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, avatarSource: 'github' })} 
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${formData.avatarSource === 'github' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            GitHub
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, avatarSource: 'custom' })} 
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${normalizeAvatarSource(formData.avatarSource) === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            Photo URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 p-6 bg-gray-900 border-t border-white/5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button
                type="submit"
                form="employeeForm"
                className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-xs font-black text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                {editingEmployee ? 'Update Profile' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deletingId && setShowDeleteModal(false)} />
          <div className="relative bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white">Delete Employee?</h3>
            <p className="text-sm text-gray-400 mt-2 mb-6">Are you sure you want to delete <span className="text-white font-medium">"{employeeToDelete?.displayName}"</span>?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">{deletingId ? 'Deleting...' : 'Yes, Delete'}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-white/5 text-gray-300 rounded-xl font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
