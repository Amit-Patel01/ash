import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { emailNotify } from '../utils/emailNotify'

const ADMIN_PERMISSIONS = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'Dashboard', description: 'Access to admin dashboard overview' },
  { id: 'manage_projects', name: 'Manage Projects', category: 'Projects', description: 'Create, edit, delete projects' },
  { id: 'view_projects', name: 'View Projects', category: 'Projects', description: 'View projects list only' },
  { id: 'manage_tasks', name: 'Manage Tasks', category: 'Tasks', description: 'Create, assign, update tasks' },
  { id: 'view_tasks', name: 'View Tasks', category: 'Tasks', description: 'View tasks list only' },
  { id: 'manage_team', name: 'Manage Team', category: 'Team', description: 'Add, edit team members' },
  { id: 'manage_employees', name: 'Manage Employees', category: 'Employees', description: 'Full employee management' },
  { id: 'view_employees', name: 'View Employees', category: 'Employees', description: 'View employee list only' },
  { id: 'manage_attendance', name: 'Manage Attendance', category: 'HR', description: 'Track employee attendance' },
  { id: 'manage_leaves', name: 'Manage Leaves', category: 'HR', description: 'Approve/reject leave requests' },
  { id: 'view_payroll', name: 'View Payroll', category: 'HR', description: 'View salary information' },
  { id: 'manage_recruitment', name: 'Manage Recruitment', category: 'HR', description: 'Handle job postings and candidates' },
  { id: 'manage_account_requests', name: 'Manage Account Requests', category: 'HR', description: 'Approve employee account requests' },
  { id: 'manage_customers', name: 'Manage Customers', category: 'Customers', description: 'Customer account management' },
  { id: 'view_customers', name: 'View Customers', category: 'Customers', description: 'View customer list only' },
  { id: 'manage_services', name: 'Manage Services', category: 'Services', description: 'Service requests management' },
  { id: 'manage_courses', name: 'Manage Courses', category: 'Courses', description: 'Course creation and editing' },
  { id: 'manage_enrollments', name: 'Manage Enrollments', category: 'Courses', description: 'Student enrollment management' },
  { id: 'manage_coupons', name: 'Manage Coupons', category: 'Sales', description: 'Create and manage discount coupons' },
  { id: 'view_sales', name: 'View Sales', category: 'Sales', description: 'View sales reports' },
  { id: 'manage_messages', name: 'Manage Messages', category: 'Communication', description: 'Handle customer messages' },
  { id: 'send_broadcasts', name: 'Send Broadcasts', category: 'Communication', description: 'Send bulk emails/notifications' },
  { id: 'manage_testimonials', name: 'Manage Testimonials', category: 'Content', description: 'Add/edit testimonials' },
  { id: 'manage_certificates', name: 'Manage Certificates', category: 'Certificates', description: 'Certificate generation' },
  { id: 'system_settings', name: 'System Settings', category: 'Settings', description: 'Modify system configuration' },
]

const ROLE_PRESETS = {
  hr: {
    name: 'HR Executive',
    description: 'Human Resources management permissions',
    permissions: [
      'view_dashboard',
      'manage_employees',
      'view_employees',
      'manage_team',
      'manage_attendance',
      'manage_leaves',
      'view_payroll',
      'manage_recruitment',
      'manage_account_requests',
      'view_customers',
      'manage_messages',
      'send_broadcasts',
      'manage_certificates',
    ]
  },
  operations: {
    name: 'Operations Manager',
    description: 'Day-to-day operations management',
    permissions: [
      'view_dashboard',
      'manage_projects',
      'manage_tasks',
      'view_employees',
      'manage_customers',
      'manage_services',
      'manage_enrollments',
      'manage_messages',
      'view_sales',
    ]
  },
  sales: {
    name: 'Sales Executive',
    description: 'Sales and customer management',
    permissions: [
      'view_dashboard',
      'manage_customers',
      'view_customers',
      'manage_services',
      'manage_coupons',
      'view_sales',
      'manage_messages',
      'manage_testimonials',
    ]
  },
  support: {
    name: 'Support Executive',
    description: 'Customer support and assistance',
    permissions: [
      'view_dashboard',
      'view_customers',
      'view_projects',
      'view_tasks',
      'manage_messages',
      'manage_certificates',
      'view_employees',
    ]
  },
  content: {
    name: 'Content Manager',
    description: 'Content and course management',
    permissions: [
      'view_dashboard',
      'manage_courses',
      'manage_enrollments',
      'manage_testimonials',
      'manage_messages',
      'send_broadcasts',
    ]
  },
}

const getPermissionsArray = (user) => {
  if (user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
    return ADMIN_PERMISSIONS.filter(p => user.permissions[p.id]).map(p => p.id)
  }
  return user.adminPermissions || []
}

export default function AdminPermissions() {
  const { users, updateUser } = useStore()
  const { currentUser } = useAuth()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const employees = users.filter(u => (u.role || '').toLowerCase() === 'employee')

  const filteredEmployees = employees.filter(emp => {
    const name = (emp.displayName || '').toLowerCase()
    const email = (emp.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  const handlePermissionToggle = (permissionId) => {
    if (!selectedEmployee) return
    
    const currentPermissions = selectedEmployee.adminPermissions
    const hasPermission = currentPermissions.includes(permissionId)
    
    const updatedPermissions = hasPermission
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId]
    
    setSelectedEmployee({
      ...selectedEmployee,
      adminPermissions: updatedPermissions
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedEmployee) return
    
    setSaving(true)
    try {
      const permArray = selectedEmployee.adminPermissions || []
      const permObject = {}
      ADMIN_PERMISSIONS.forEach(p => { permObject[p.id] = permArray.includes(p.id) })

      await updateUser(selectedEmployee.uid || selectedEmployee.id, {
        permissions: permObject
      })

      emailNotify('permissions_updated', {
        employeeName: selectedEmployee.displayName,
        employeeEmail: selectedEmployee.email,
        updatedByName: currentUser?.displayName || 'Admin'
      })

      alert('✅ Permissions updated successfully!')
      setSelectedEmployee(null)
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Failed to update permissions'))
    } finally {
      setSaving(false)
    }
  }

  const applyRolePreset = (presetKey) => {
    if (!selectedEmployee) return
    const preset = ROLE_PRESETS[presetKey]
    setSelectedEmployee({
      ...selectedEmployee,
      adminPermissions: preset.permissions
    })
    setShowPresets(false)
  }

  const groupedPermissions = ADMIN_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Permissions</h1>
          <p className="text-sm text-gray-400 mt-1">
            Grant admin-level access to specific employees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Select Employee</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {filteredEmployees.map(emp => {
                const permCount = getPermissionsArray(emp).length
                const isSelected = selectedEmployee?.id === emp.id || selectedEmployee?.uid === emp.uid
                
                return (
                  <button
                    key={emp.uid || emp.id}
                    onClick={() => setSelectedEmployee({ ...emp, adminPermissions: getPermissionsArray(emp) })}
                    className={`w-full p-4 border-b border-white/5 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-500/10 border-l-4 border-l-blue-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {emp.displayName?.charAt(0) || 'E'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{emp.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                        {permCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold mt-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {permCount} permission{permCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {selectedEmployee.displayName?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedEmployee.displayName}</h3>
                      <p className="text-sm text-gray-400">{selectedEmployee.email}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium mt-1">
                        {selectedEmployee.jobTitle || 'Employee'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {permissions.map(perm => {
                        const hasPermission = selectedEmployee.adminPermissions.includes(perm.id)
                        return (
                          <div
                            key={perm.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                              hasPermission
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-semibold text-white">{perm.name}</h5>
                                {hasPermission && (
                                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
                            </div>
                            <button
                              onClick={() => handlePermissionToggle(perm.id)}
                              className={`w-12 h-6 rounded-full transition-all relative ${
                                hasPermission ? 'bg-emerald-600' : 'bg-gray-700'
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                  hasPermission ? 'left-7' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 bg-gray-900/80">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <span className="font-semibold text-white">
                        {selectedEmployee.adminPermissions.length}
                      </span>{' '}
                      of {ADMIN_PERMISSIONS.length} permissions granted
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          onClick={() => setShowPresets(!showPresets)}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
                        >
                          Role Preset
                        </button>
                        {showPresets && (
                          <div className="absolute bottom-full mb-2 right-0 w-56 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                            {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                              <button
                                key={key}
                                onClick={() => applyRolePreset(key)}
                                className="w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                              >
                                <p className="text-sm font-semibold text-white">{preset.name}</p>
                                <p className="text-xs text-gray-400">{preset.description}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedEmployee(null)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all"
                      >
                        {saving ? 'Saving...' : 'Save Permissions'}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Select an Employee</h3>
              <p className="text-sm text-gray-400">
                Choose an employee from the list to manage their admin permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
