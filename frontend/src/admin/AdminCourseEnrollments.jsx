import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Search } from 'lucide-react'

export default function AdminCourseEnrollments() {
  const { enrollments, courses, updateEnrollment, deleteEnrollment } = useStore()
  const [filterCourse, setFilterCourse] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = enrollments.filter(e => {
    const matchCourse = filterCourse === 'All' || e.courseId === filterCourse
    const matchStatus = filterStatus === 'All' || e.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || e.userName?.toLowerCase().includes(q) || e.userEmail?.toLowerCase().includes(q) || e.courseTitle?.toLowerCase().includes(q)
    return matchCourse && matchStatus && matchSearch
  })

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    revenue: enrollments.filter(e => e.status === 'active').reduce((s, e) => s + Number(e.amount || 0), 0)
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Course Enrollments</h1>
        <p className="text-sm text-gray-400 mt-1">Track all student course enrollments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Enrollments', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'emerald' },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/20 rounded-2xl p-4`}>
            <p className={`text-2xl font-black text-${s.color}-400`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 group">
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
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student, email, course..."
            className="w-full pl-14 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out"
          />
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50">
          <option value="All">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {['Student','Course','Category','Amount','Mobile','Status','Enrolled On','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">No enrollments found</td></tr>
              ) : filtered.map(enr => (
                <tr key={enr.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{enr.userName || '—'}</p>
                      <p className="text-[11px] text-gray-500">{enr.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300 max-w-40 truncate">{enr.courseTitle || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{enr.category || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-blue-400">
                      {Number(enr.amount) === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : `₹${Number(enr.amount).toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{enr.userMobile || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enr.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                      enr.status === 'expired' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{enr.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(enr.enrolledAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {enr.status === 'active' && (
                        <button
                          onClick={() => updateEnrollment(enr.id, { status: 'cancelled' })}
                          title="Cancel enrollment"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => window.confirm('Delete this enrollment?') && deleteEnrollment(enr.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="px-4 py-3 border-t border-white/5 text-xs text-gray-500">
          Showing {filtered.length} of {enrollments.length} enrollments
        </div>
      </div>
    </div>
  )
}
