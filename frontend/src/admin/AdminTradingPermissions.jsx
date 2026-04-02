import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'

const PERMISSION_KEYS = [
  { key: 'can_manage_courses', label: 'Manage Courses', desc: 'Add, edit, and delete trading courses' },
  { key: 'can_manage_pricing', label: 'Manage Pricing', desc: 'Update course pricing and plans' },
  { key: 'can_create_sessions', label: 'Create Live Sessions', desc: 'Schedule and manage live sessions' },
  { key: 'can_manage_mentor_profile', label: 'Mentor Profile', desc: 'Update mentor name, bio, photo and stats' },
  { key: 'can_edit_curriculum', label: 'Edit Curriculum', desc: 'Add, edit, and delete curriculum modules and topics' },
  { key: 'can_manage_enrollments', label: 'Manage Enrollments', desc: 'Add and manage student enrollments manually' },
]

export default function AdminTradingPermissions() {
  const { users, employeePermissions, updateEmployeePermissions } = useStore()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [localPerms, setLocalPerms] = useState({})
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const employees = users.filter(u => {
    const role = (u.role || '').toLowerCase()
    return role === 'employee' || role === 'mentor'
  })

  // Load permissions when employee is selected
  useEffect(() => {
    if (selectedEmployee && employeePermissions[selectedEmployee]) {
      setLocalPerms(employeePermissions[selectedEmployee])
    } else {
      setLocalPerms({})
    }
    setSuccessMsg('')
  }, [selectedEmployee, employeePermissions])

  const togglePermission = (key) => {
    setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!selectedEmployee) return
    setSaving(true)
    try {
      await updateEmployeePermissions(selectedEmployee, localPerms)
      setSuccessMsg('Permissions saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const selectedUserData = employees.find(e => (e.uid || e.id) === selectedEmployee)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trading Permissions</h1>
        <p className="text-sm text-gray-400 mt-1">Manage employee access to trading mentorship features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selector */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Employee</h3>
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-sm">No employees found</p>
            ) : (
              employees.map(emp => {
                const id = emp.uid || emp.id
                const isActive = selectedEmployee === id
                const hasPerms = employeePermissions[id]
                const permCount = hasPerms ? Object.values(hasPerms).filter(Boolean).length : 0
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedEmployee(id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${isActive
                        ? 'bg-blue-500/10 border border-blue-500/30 text-white'
                        : 'bg-white/5 border border-transparent text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(emp.displayName || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{emp.displayName || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{emp.email}</p>
                    </div>
                    {permCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {permCount} perms
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Permission Manager */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
              <p className="text-sm">Select an employee to manage permissions</p>
            </div>
          ) : (
            <div>
              {/* Employee Info Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                  {(selectedUserData?.displayName || '?').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUserData?.displayName}</h3>
                  <p className="text-sm text-gray-400">{selectedUserData?.email}</p>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trading Mentorship Permissions</h4>
                {PERMISSION_KEYS.map(perm => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{perm.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{perm.desc}</p>
                    </div>
                    <button
                      onClick={() => togglePermission(perm.key)}
                      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ml-4 ${localPerms[perm.key] ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localPerms[perm.key] ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : 'Save Permissions'}
                </button>
                {successMsg && (
                  <span className="text-sm text-emerald-400 font-medium animate-in fade-in duration-300">{successMsg}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
