import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
]

const departments = ['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Sales', 'Editor', 'Technician', 'HR', 'Operations', 'Placement', 'Other']
const employeeRoles = [
  'HR & Recruitment Executive',
  'Student Support Executive',
  'Business Development Executive (BDE)',
  'Marketing Executive',
  'Content Writer',
  'LMS Coordinator',
  'Training Coordinator',
  'Project Coordinator',
  'Graphic Designer',
  'Web Development Intern/Executive',
  'Operations Executive',
  'Placement & Career Support Executive',
  'Senior Developer',
  'Junior Developer',
  'UI/UX Designer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Project Manager',
  'QA Engineer',
  'Video Editor',
  'Technician',
  'Other'
]

export default function AdminEmployees() {
  const { users, addUser, updateUser, deleteUser, mergeUsers, fireEmployee, reinstateEmployee } = useStore()
  const navigate = useNavigate()
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

  // Fire Employee Modal state
  const [showFireModal, setShowFireModal] = useState(false)
  const [employeeToFire, setEmployeeToFire] = useState(null)
  const [fireReason, setFireReason] = useState('')
  const [relievingDate, setRelievingDate] = useState(new Date().toISOString().split('T')[0])
  const [sendEmailNotice, setSendEmailNotice] = useState(true)
  const [fireBusy, setFireBusy] = useState(false)

  // Status / Isolation Tab Filter ('active' | 'terminated' | 'all')
  const [statusTab, setStatusTab] = useState('active')

  // Reinstate Modal State
  const [showReinstateModal, setShowReinstateModal] = useState(false)
  const [employeeToReinstate, setEmployeeToReinstate] = useState(null)
  const [reinstateEmailNotice, setReinstateEmailNotice] = useState(true)
  const [reinstateBusy, setReinstateBusy] = useState(false)

  const isTerminatedUser = (u) => {
    if (!u) return false
    const statusLower = String(u.status || '').toLowerCase()
    const isTerm = u.isTerminated
    return (
      statusLower === 'terminated' ||
      isTerm === true ||
      isTerm === 'true' ||
      isTerm === 1 ||
      Boolean(u.fireReason)
    )
  }

  const employees = users.filter(u => {
    const roleLower = String(u.role || '').toLowerCase()
    const prevRoleLower = String(u.previousRole || '').toLowerCase()
    const isTerm = isTerminatedUser(u)
    return (
      roleLower === 'employee' ||
      roleLower === 'staff' ||
      roleLower === 'mentor' ||
      roleLower === 'developer' ||
      prevRoleLower === 'employee' ||
      prevRoleLower === 'staff' ||
      prevRoleLower === 'mentor' ||
      prevRoleLower === 'developer' ||
      isTerm ||
      Boolean(u.employeeId)
    )
  })

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
    const isEmpTerminated = isTerminatedUser(emp)
    const matchesDept = statusTab === 'terminated' || departmentFilter === 'All' || emp.department === departmentFilter
    const matchesStatus = statusTab === 'all'
      ? true
      : statusTab === 'terminated'
      ? isEmpTerminated
      : !isEmpTerminated

    const nameStr = emp.displayName || emp.name || ''
    const emailStr = emp.email || ''
    const roleStr = emp.jobTitle || emp.role || ''
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleStr.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesStatus && matchesSearch
  }).sort((a, b) => {
    const idA = a.employeeId || ''
    const idB = b.employeeId || ''
    if (!idA && !idB) return 0
    if (!idA) return 1
    if (!idB) return -1
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' })
  })

  const getEmployeeId = (emp) => emp?.uid || emp?.id || emp?._id || emp?.firebaseUid || emp?.email || ''

  const openFireModal = (employee) => {
    setEmployeeToFire(employee)
    setFireReason('Terminated by Admin')
    setRelievingDate(new Date().toISOString().split('T')[0])
    setSendEmailNotice(true)
    setShowFireModal(true)
  }

  const handleConfirmFire = async (e) => {
    if (e) e.preventDefault()
    if (!employeeToFire) return
    const reason = fireReason.trim() || 'Terminated by Admin'
    setFireBusy(true)
    try {
      const id = getEmployeeId(employeeToFire)
      const res = await fireEmployee(id, {
        fireReason: reason,
        relievingDate,
        sendEmailNotice
      })
      setStatusTab('terminated')
      setShowFireModal(false)
      setEmployeeToFire(null)
      alert(res.message || "Employee terminated successfully.")
    } catch (err) {
      alert(err.message || "Failed to terminate employee.")
    } finally {
      setFireBusy(false)
    }
  }

  const openReinstateModal = (employee) => {
    setEmployeeToReinstate(employee)
    setReinstateEmailNotice(true)
    setShowReinstateModal(true)
  }

  const handleConfirmReinstate = async (e) => {
    if (e) e.preventDefault()
    if (!employeeToReinstate) return
    setReinstateBusy(true)
    try {
      const id = getEmployeeId(employeeToReinstate)
      const res = await reinstateEmployee(id, { sendEmailNotice: reinstateEmailNotice })
      setStatusTab('active')
      setShowReinstateModal(false)
      setEmployeeToReinstate(null)
      alert(res.message || "Employee reinstated successfully.")
    } catch (err) {
      alert(err.message || "Failed to reinstate employee.")
    } finally {
      setReinstateBusy(false)
    }
  }

  const getNextEmployeeId = (employeesList = []) => {
    let maxNum = 2; // Floor so next starts at ASH-03
    const regex = /ASH-(\d+)/i;
    (employeesList || []).forEach(emp => {
      const id = emp?.employeeId || '';
      const match = String(id).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `ASH-${String(nextNum).padStart(2, '0')}`;
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const width = img.width || 1200
        const height = img.height || 450
        const scale = Math.min(1200 / width, 450 / height, 1)
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        setFormData(prev => ({ ...prev, coverImage: canvas.toDataURL('image/jpeg', 0.85) }))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const openCreateModal = () => {
    setEditingEmployee(null)
    const autoId = getNextEmployeeId(employees)
    setFormData({
      displayName: '',
      email: '',
      phone: '',
      avatar: '',
      coverImage: '',
      jobTitle: '',
      department: 'Engineering',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      employeeId: autoId,
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
      coverImage: employee.coverImage || '',
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

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return
    const id = getEmployeeId(employeeToDelete)
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
    const id = getEmployeeId(employee)
    try {
      await updateUser(id, { status: employee.status === 'active' ? 'inactive' : 'active' })
    } catch (err) {
      console.error("Failed to toggle status:", err)
      alert(err.message || "Unable to update account status.")
    }
  }

  const promoteToAdmin = async (employee) => {
    const id = getEmployeeId(employee)
    if (!window.confirm(`Promote ${employee.displayName || employee.email} to admin access?`)) {
      return
    }
    try {
      await updateUser(id, { role: 'admin' })
      alert(`${employee.displayName || employee.email} has been granted admin access.`)
    } catch (err) {
      console.error("Failed to promote employee:", err)
      alert(err.message || "Unable to promote the employee to admin.")
    }
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
        role: editingEmployee ? (editingEmployee.role || 'employee') : 'employee',
        avatar: (formData.avatar || '').trim(),
        customImageUrl: (formData.customImageUrl || '').trim(),
        avatarSource: normalizeAvatarSource(formData.avatarSource),
      }

      if (!editingEmployee && (!payload.employeeId || !payload.employeeId.trim())) {
        payload.employeeId = getNextEmployeeId(employees)
      }
      
      // Clean up local temp fields
      delete payload.customJobTitle
      delete payload.customDepartment

      if (editingEmployee) {
        await updateUser(getEmployeeId(editingEmployee), payload)
      } else {
        await addUser(payload)
      }
      setShowModal(false)
    } catch (err) {
      console.error("Save error:", err)
      alert(err.message || "Unable to save the employee record.")
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
          <h1 className="text-2xl font-bold text-slate-900">Staff Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            {employees.length} employees | {employees.filter(e => e.status === 'active').length} active
            {users.length > 0 && <span className="ml-2 text-blue-400 font-medium">(Total System Users: {users.length})</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/employees/new')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Status / Isolation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setStatusTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            statusTab === 'active'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          Active Staff ({employees.filter(e => !isTerminatedUser(e)).length})
        </button>

        <button
          onClick={() => setStatusTab('terminated')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            statusTab === 'terminated'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
          Isolated / Fired ({employees.filter(e => isTerminatedUser(e)).length})
        </button>

        <button
          onClick={() => setStatusTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            statusTab === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Records ({employees.length})
        </button>
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
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg 
              className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-all duration-300 ease-in-out transform group-focus-within:scale-110" 
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
            className="pl-14 pr-4 py-2.5 w-56 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out" 
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              {statusTab === 'terminated' ? (
                <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              )}
              <p className="text-base font-semibold text-slate-600">
                {statusTab === 'terminated' ? 'No fired / isolated employees found.' : 'No active employees found.'}
              </p>
              <p className="text-sm text-slate-400">
                {statusTab === 'terminated'
                  ? 'Fired employee records will appear here for reinstatement.'
                  : 'Click "Add Employee" to create new staff accounts.'}
              </p>
            </div>
          </div>
        ) : (
          filteredEmployees.map((employee, index) => (
            <div
              key={getEmployeeId(employee) || index}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                isTerminatedUser(employee) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
              }`}
            >
              {/* ── Top: Employee + Contact (always visible) ── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 border-b border-slate-100">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-sm font-bold overflow-hidden shadow-sm flex-shrink-0`}>
                  {getPreviewImage(employee) ? (
                    <img src={getPreviewImage(employee)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {employee.displayName ? employee.displayName.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                </div>

                {/* Name + ID */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base leading-tight">
                      {employee.displayName || 'Unknown'}
                    </span>
                    {employee.isMentor && (
                      <span className="hidden px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-400/30 uppercase tracking-wide">
                        Mentor
                      </span>
                    )}
                    {isTerminatedUser(employee) && (
                      <span className="hidden px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-400/30 uppercase tracking-wide">
                        Terminated
                      </span>
                    )}
                  </div>
                  {employee.employeeId && (
                    <span className="hidden text-[11px] text-slate-400 font-mono">ID: {employee.employeeId}</span>
                  )}
                </div>

                {/* Contact */}
                <div className="flex flex-col text-xs text-right">
                  <span className="text-slate-700 font-medium">{employee.email || '—'}</span>
                  {employee.phone && <span className="text-slate-500 mt-0.5">{employee.phone}</span>}
                </div>
                <button
                  onClick={() => navigate(`/admin/employees/${encodeURIComponent(getEmployeeId(employee))}`)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
                >
                  Open dashboard
                </button>
              </div>

              {/* ── Bottom: Detail Boxes + Actions ── */}
              <div className="hidden px-5 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">

                  {/* Job Title */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Title</p>
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate" title={employee.jobTitle || 'N/A'}>
                      {employee.jobTitle || 'N/A'}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate" title={employee.department || 'General'}>
                      {employee.department || 'General'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <button
                      onClick={() => toggleStatus(employee)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2 py-0.5 transition-colors ${
                        employee.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                          : employee.status === 'terminated'
                          ? 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        employee.status === 'active' ? 'bg-emerald-500' : employee.status === 'terminated' ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                      }`}></span>
                      {employee.status === 'active' ? 'Active' : employee.status === 'terminated' ? 'Terminated' : 'Inactive'}
                    </button>
                  </div>

                  {/* Session Security */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Session</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${employee.currentSessionId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-mono font-semibold text-slate-700 truncate" title={employee.lastLoginIp || 'No IP'}>
                          {employee.lastLoginIp || 'No IP'}
                        </span>
                        <span className={`text-[9px] font-medium ${employee.currentSessionId ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {employee.currentSessionId ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Visibility */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Team</p>
                    {employee.showOnTeam ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Visible
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Hidden</span>
                    )}
                  </div>

                  {/* CV */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CV</p>
                    {employee.cvFilePath ? (
                      <a
                        href={employee.cvFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View CV
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Not uploaded</span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-sm"
                    title="Edit Employee"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleRevokeSession(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors border border-slate-200 hover:border-rose-200"
                    title="Force Logout / Revoke Session"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Revoke Session
                  </button>

                  <button
                    onClick={() => promoteToAdmin(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-bold transition-colors border border-slate-200 hover:border-amber-200"
                    title="Promote to Admin"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    Promote
                  </button>

                  {isTerminatedUser(employee) ? (
                    <button
                      onClick={() => openReinstateModal(employee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
                      title="Reinstate Employee"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reinstate
                    </button>
                  ) : (
                    <button
                      onClick={() => openFireModal(employee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors border border-slate-200 hover:border-rose-200"
                      title="Fire / Terminate Employee"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      </svg>
                      Terminate
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteClick(employee)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-bold transition-colors border border-slate-200 hover:border-red-200 ml-auto"
                    title="Delete Employee"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-slate-300 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Merge duplicate accounts</h2>
          <p className="text-sm text-slate-500 mt-1">
            Combine two employee records into one. The primary account is kept; the duplicate is removed from MySQL and Firebase.
            Use Firebase UID, numeric database ID, email, or phone as identifiers.
          </p>
        </div>
        <form onSubmit={handleMergeAccounts} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Primary account (kept)</label>
            <input
              value={mergePrimaryId}
              onChange={(e) => setMergePrimaryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-sm text-slate-900"
              placeholder="UID, ID, email, or phone"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Duplicate account (removed)</label>
            <input
              value={mergeDupId}
              onChange={(e) => setMergeDupId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-sm text-slate-900"
              placeholder="UID, ID, email, or phone"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Reason (optional)</label>
            <input
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-sm text-slate-900"
              placeholder="e.g. duplicate signup"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={mergeBusy}
              className="px-4 py-2 rounded-lg bg-amber-600/90 text-slate-900 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
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
          <div className="relative bg-white border border-slate-300 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Manage credentials and team profile</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="employeeForm"
                  className="px-3 py-2 rounded-lg bg-blue-600 text-slate-900 text-[11px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors"
                >
                  {editingEmployee ? 'Save' : 'Create'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Cover Image Banner */}
            <div className="relative h-28 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden shrink-0 group/cover">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-purple-600/80" />
              )}
              <label className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 hover:bg-slate-900 transition-all cursor-pointer shadow-md">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
                <span>{formData.coverImage ? 'Change Cover' : 'Add Cover Photo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-white px-6 pt-2 border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'basic' ? 'text-blue-400 border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                LOGIN & CORE INFO
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'text-blue-400 border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
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
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                          required
                          placeholder="Full Name"
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="email@example.com"
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Employee ID</label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="ASH-001"
                          className="w-full px-3 py-2.5 bg-slate-100 border border-blue-500/20 rounded-xl text-sm text-blue-400 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Profile Photo URL</label>
                        <input
                          type="text"
                          value={formData.avatar}
                          onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Job Title *</label>
                        <select
                          value={formData.jobTitle}
                          onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                          required
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                        >
                          <option value="" className="bg-white">Select role</option>
                          {employeeRoles.map(role => (
                            <option key={role} value={role} className="bg-white">{role}</option>
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
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Department *</label>
                        <select
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          required
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                        >
                          <option value="" className="bg-white">Select department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-white">{dept}</option>
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
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Account Access</label>
                      <div className="w-full rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-3 text-xs leading-5 text-blue-300">
                        A secure password reset email will be sent after the account is created. No default password is assigned.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                        >
                          <option value="active" className="bg-white">Active</option>
                          <option value="inactive" className="bg-white">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Join Date</label>
                        <input
                          type="date"
                          value={formData.joinDate}
                          onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                       {/* Mentor Toggle */}
                       <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <div>
                          <p className="text-[11px] font-bold text-slate-900">Set as Mentor</p>
                          <p className="text-[9px] text-slate-500">Include in 'Our Mentors'</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isMentor: !formData.isMentor })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.isMentor ? 'bg-emerald-600' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isMentor ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Visibility Switch */}
                      <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                        <div>
                          <p className="text-[11px] font-bold text-slate-900">Add to Team</p>
                          <p className="text-[9px] text-slate-500">Show this staff account in About</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showOnTeam: !formData.showOnTeam })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.showOnTeam ? 'bg-blue-600' : 'bg-slate-200'}`}
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
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Team Card Details</p>
                        <p className="text-[9px] text-slate-400">Information shown on the About page team cards</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Member Bio / Tagline</label>
                      <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="e.g. Passionate developer with 5+ years of experience in building modern web applications..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">A brief description shown under the name on the team card.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Expertise / Skills</label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g. React, UI Design, Node.js"
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Separate skills with commas</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Public links and collaboration path
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">GitHub Username</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.github}
                            onChange={e => setFormData({ ...formData, github: e.target.value })}
                            placeholder="amit-patel01"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                          />
                          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Profile Avatar Link</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.customImageUrl}
                            onChange={e => setFormData({ ...formData, customImageUrl: e.target.value })}
                            placeholder="https://example.com/avatar-image.png"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                          />
                          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Portfolio URL</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.portfolio}
                          onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                          placeholder="https://portfolio.amitsolutionhub.com/"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider text-cyan-500">CV / Resume (Google Drive Link)</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.cvFilePath}
                          onChange={e => setFormData({ ...formData, cvFilePath: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-cyan-500/50"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                        </svg>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Provide a direct link to the Google Drive file or public resume URL.</p>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-300 shadow-lg">
                            {getPreviewImage(formData) ? (
                              <img 
                                src={getPreviewImage(formData)}
                                alt="P" 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (formData.displayName || 'User') }}
                              />
                            ) : <span className="text-[10px] text-slate-500 font-bold">NULL</span>}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-600">Avatar Source</span>
                            <p className="text-[10px] text-slate-400">Pick which image to show</p>
                          </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, avatarSource: 'github' })} 
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${formData.avatarSource === 'github' ? 'bg-blue-600 text-slate-900 shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            GitHub
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, avatarSource: 'custom' })} 
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${normalizeAvatarSource(formData.avatarSource) === 'custom' ? 'bg-blue-600 text-slate-900 shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}
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
            <div className="sticky bottom-0 p-6 bg-white border-t border-slate-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                CANCEL
              </button>
              <button
                type="submit"
                form="employeeForm"
                className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-xs font-black text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all uppercase tracking-widest"
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
          <div className="relative bg-white border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Delete Employee?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">Are you sure you want to delete <span className="text-slate-900 font-medium">"{employeeToDelete?.displayName}"</span>?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-3 bg-red-600 hover:bg-red-700 text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">{deletingId ? 'Deleting...' : 'Yes, Delete'}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Fire Employee Modal */}
      {showFireModal && employeeToFire && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !fireBusy && setShowFireModal(false)} />
          <div className="relative bg-white border border-rose-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Fire / Terminate Employee</h3>
                  <p className="text-xs text-rose-100 font-medium">Issue official relieving notice & termination certificate</p>
                </div>
              </div>
              <button
                onClick={() => setShowFireModal(false)}
                disabled={fireBusy}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleConfirmFire} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Employee Card Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden flex-shrink-0">
                  {getPreviewImage(employeeToFire) ? (
                    <img src={getPreviewImage(employeeToFire)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    employeeToFire.displayName ? employeeToFire.displayName.charAt(0) : 'E'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{employeeToFire.displayName || 'Employee'}</h4>
                  <p className="text-xs text-slate-500 truncate">{employeeToFire.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">{employeeToFire.jobTitle || 'Employee'}</span>
                    {employeeToFire.employeeId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">{employeeToFire.employeeId}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual Reason Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Termination Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={fireReason}
                  onChange={(e) => setFireReason(e.target.value)}
                  placeholder="Type the manual reason for firing/termination (e.g., Performance issues, policy violation, breach of contract, or project downsizing)..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">This reason will be included in the official Relieving Letter & Email sent to the employee.</p>
              </div>

              {/* Relieving Date Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Effective Relieving Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={relievingDate}
                  onChange={(e) => setRelievingDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Send Email Notice Toggle */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Send Email with Relieving Certificate</p>
                    <p className="text-[11px] text-slate-600">Dispatches official termination letter via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendEmailNotice}
                  onChange={(e) => setSendEmailNotice(e.target.checked)}
                  className="w-5 h-5 text-rose-600 accent-rose-600 rounded focus:ring-rose-500"
                />
              </div>

              {/* Warning Notice Box */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex gap-2">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p>
                  Firing this employee will update their account status to <strong>Terminated</strong>, remove them from the public Team page, and send the official relieving notice.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <button
                  type="button"
                  disabled={fireBusy}
                  onClick={() => setShowFireModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fireBusy}
                  className="flex-[2] py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {fireBusy ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Terminating...
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      </svg>
                      Terminate & Send Letter
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reinstate Employee Modal */}
      {showReinstateModal && employeeToReinstate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !reinstateBusy && setShowReinstateModal(false)} />
          <div className="relative bg-white border border-emerald-200 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200 shadow-inner">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Reinstate Employee?</h3>
            <p className="text-sm text-slate-600 mt-2 mb-4">
              Are you sure you want to reinstate <strong className="text-slate-900">"{employeeToReinstate.displayName || employeeToReinstate.email}"</strong> back to Active status?
            </p>

            {employeeToReinstate.fireReason && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 mb-3 text-left">
                <span className="font-bold text-slate-700 block mb-0.5">Recorded Termination Reason:</span>
                "{employeeToReinstate.fireReason}"
              </div>
            )}

            {employeeToReinstate.reinstatementMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 text-left">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-0.5">
                  <svg className="w-4 h-4 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Message to Founder/CEO & Admin:
                </span>
                "{employeeToReinstate.reinstatementMessage}"
              </div>
            )}

            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-left mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-xs font-bold text-slate-800">Send Reinstatement Email</span>
              </div>
              <input
                type="checkbox"
                checked={reinstateEmailNotice}
                onChange={(e) => setReinstateEmailNotice(e.target.checked)}
                className="w-5 h-5 text-emerald-600 accent-emerald-600 rounded"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={reinstateBusy}
                onClick={() => setShowReinstateModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reinstateBusy}
                onClick={handleConfirmReinstate}
                className="flex-[2] py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                {reinstateBusy ? (
                  'Reinstating...'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Restore & Activate
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
