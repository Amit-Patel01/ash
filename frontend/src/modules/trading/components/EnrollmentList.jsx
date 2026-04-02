import React from 'react'
import { useStore } from '../../../store/StoreContext'

const EnrollmentList = ({ isAdmin = false }) => {
  const { tradingEnrollments, updateTradingEnrollment, loading } = useStore()

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
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
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
                <td className="px-6 py-4">{enr.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    enr.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {enr.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={enr.status}
                      onChange={(e) => updateTradingEnrollment(enr.id, { status: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {tradingEnrollments.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400 italic">
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
