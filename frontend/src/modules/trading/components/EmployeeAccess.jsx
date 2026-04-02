import { useState } from 'react'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'

const PERMISSION_KEYS = [
  { key: 'access_live_sessions', label: 'Live Sessions', desc: 'Access upcoming and live trading sessions' },
  { key: 'access_enrollments', label: 'Enrollments', desc: 'View and manage student enrollments' },
  { key: 'access_payments', label: 'Payments', desc: 'View payment records and receipts' },
  { key: 'access_mentorship_data', label: 'Mentorship Data', desc: 'Access mentorship course materials and analytics' },
  { key: 'can_edit_curriculum', label: 'Edit Curriculum', desc: 'Add, edit, and delete curriculum modules and topics' },
]

const EmployeeAccess = () => {
  const { users, employeePermissions, updateEmployeePermissions } = useStore()
  const { isAdmin } = useAuth()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [localPerms, setLocalPerms] = useState({})
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const employees = users.filter(u => {
    const role = (u.role || '').toLowerCase()
    return role === 'employee' || role === 'mentor'
  })

  const handleSelectEmployee = (id) => {
    setSelectedEmployee(id)
    if (employeePermissions[id]) {
      setLocalPerms({ ...employeePermissions[id] })
    } else {
      setLocalPerms({})
    }
    setSuccessMsg('')
  }

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

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-slate-500 text-sm">Admin access required to manage employee permissions.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Employee Access Control</h3>
        <p className="text-sm text-slate-500 mt-1">Manage employee access to trading mentorship features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Employee List */}
        <div className="lg:border-r border-slate-100 p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Employees</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No employees found</p>
            ) : (
              employees.map(emp => {
                const id = emp.uid || emp.id
                const isActive = selectedEmployee === id
                const permCount = employeePermissions[id]
                  ? Object.values(employeePermissions[id]).filter(Boolean).length
                  : 0
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectEmployee(id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200 text-slate-900'
                        : 'bg-slate-50 border border-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {(emp.displayName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{emp.displayName || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                    </div>
                    {permCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                        {permCount}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Permission Manager */}
        <div className="lg:col-span-2 p-6">
          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <p className="text-sm">Select an employee to manage permissions</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-bold text-white">
                  {(selectedUserData?.displayName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedUserData?.displayName}</h4>
                  <p className="text-sm text-slate-400">{selectedUserData?.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trading Permissions</h5>
                {PERMISSION_KEYS.map(perm => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{perm.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{perm.desc}</p>
                    </div>
                    <button
                      onClick={() => togglePermission(perm.key)}
                      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ml-4 ${
                        localPerms[perm.key] ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        localPerms[perm.key] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : 'Save Permissions'}
                </button>
                {successMsg && (
                  <span className="text-sm text-emerald-600 font-medium">{successMsg}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeAccess
