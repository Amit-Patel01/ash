import { useState } from 'react'
import { useStore } from '../store/StoreContext'

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
  const hasFiltersApplied = filterCourse !== 'All' || filterStatus !== 'All' || Boolean(search.trim())
  const footerLabel = hasFiltersApplied
    ? `Showing ${filtered.length} of ${enrollments.length} enrollments`
    : `Showing all ${enrollments.length} enrollments`

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleEditEnrollmentName = async (enrollment) => {
    const currentName = enrollment.userName || ''
    const nextName = window.prompt('Enter updated student name', currentName)
    if (nextName === null) return

    const normalized = nextName.trim()
    if (!normalized) {
      alert('Student name is required.')
      return
    }

    try {
      await updateEnrollment(enrollment.id, { userName: normalized })
      alert('Enrollment name updated successfully.')
    } catch (error) {
      alert(error?.message || 'Unable to update enrollment name.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Enrollments</h1>
        <p className="text-sm text-slate-500 mt-1">Track all student course enrollments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Enrollments',
            value: stats.total,
            cardClass: 'bg-blue-500/10 border-blue-500/20',
            textClass: 'text-blue-400',
          },
          {
            label: 'Active',
            value: stats.active,
            cardClass: 'bg-emerald-500/10 border-emerald-500/20',
            textClass: 'text-emerald-400',
          },
          {
            label: 'Total Revenue',
            value: `₹${stats.revenue.toLocaleString('en-IN')}`,
            cardClass: 'bg-purple-500/10 border-purple-500/20',
            textClass: 'text-purple-400',
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.cardClass}`}>
            <p className={`text-2xl font-black ${s.textClass}`}>{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 group">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-14 pointer-events-none">
            <svg 
              className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student, email, course..."
            className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-slate-300 rounded-2xl py-3.5 pl-14 pr-12 text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-inner"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-red-400 transition-colors"
              title="Clear Search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50">
          <option value="All">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Student','Course','Category','Amount','Mobile','Status','Enrolled On','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">No enrollments found</td></tr>
              ) : filtered.map(enr => (
                <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{enr.userName || '—'}</p>
                      <p className="text-[11px] text-slate-400">{enr.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600 max-w-40 truncate">{enr.courseTitle || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{enr.category || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-blue-400">
                      {Number(enr.amount) === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : `₹${Number(enr.amount).toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{enr.userMobile || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enr.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                      enr.status === 'expired' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{enr.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(enr.enrolledAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditEnrollmentName(enr)}
                        title="Edit student name"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors text-xs"
                      >
                        Edit Name
                      </button>
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
        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-400">
          {footerLabel}
        </div>
      </div>
    </div>
  )
}
