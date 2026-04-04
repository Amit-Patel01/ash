import React from 'react'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'

const EnrollmentList = () => {
  const { tradingEnrollments, updateTradingEnrollment, deleteTradingEnrollment, employeePermissions, loading } = useStore()
  const { currentUser, isAdmin } = useAuth()

  const perms = employeePermissions[currentUser?.uid] || {}
  const canManage = isAdmin || perms.can_manage_enrollments === true

  if (loading) return <div>Loading...</div>

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Enrollments</h3>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase">{tradingEnrollments.length} Total</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Join Date</th>
              <th className="px-6 py-4">Status</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600">
            {tradingEnrollments.map((enr) => (
              <tr key={enr.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {enr.userName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{enr.userName || 'Student'}</p>
                      <p className="text-xs text-slate-400">{enr.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{enr.courseName}</td>
                <td className="px-6 py-4">{enr.createdAt?.toDate ? enr.createdAt.toDate().toLocaleDateString() : enr.createdAt ? new Date(enr.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    enr.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {enr.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={enr.status}
                        onChange={(e) => updateTradingEnrollment(enr.id, { status: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this enrollment?')) {
                            await deleteTradingEnrollment(enr.id)
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {tradingEnrollments.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-slate-400 italic">
                  No enrollments found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EnrollmentList
