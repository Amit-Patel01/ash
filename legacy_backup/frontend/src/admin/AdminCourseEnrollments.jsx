import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { UserCheck, Edit3, Trash2, Ban, ShieldCheck, User } from 'lucide-react'

export default function AdminCourseEnrollments() {
  const { enrollments, courses, employees, updateEnrollment, deleteEnrollment } = useStore()
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : []
  const safeCourses = Array.isArray(courses) ? courses : []
  const safeEmployees = Array.isArray(employees) ? employees : []

  const [filterCourse, setFilterCourse] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = safeEnrollments.filter(e => {
    const matchCourse = filterCourse === 'All' || e.courseId === filterCourse
    const matchStatus = filterStatus === 'All' || e.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || 
      e.userName?.toLowerCase().includes(q) || 
      e.userEmail?.toLowerCase().includes(q) || 
      e.courseTitle?.toLowerCase().includes(q) ||
      e.assignedEmployeeName?.toLowerCase().includes(q)
    return matchCourse && matchStatus && matchSearch
  })

  const stats = {
    total: safeEnrollments.length,
    active: safeEnrollments.filter(e => e.status === 'active').length,
    revenue: safeEnrollments.filter(e => e.status === 'active').reduce((s, e) => s + Number(e.amount || 0), 0)
  }
  const hasFiltersApplied = filterCourse !== 'All' || filterStatus !== 'All' || Boolean(search.trim())
  const footerLabel = hasFiltersApplied
    ? `Showing ${filtered.length} of ${safeEnrollments.length} enrollments`
    : `Showing all ${safeEnrollments.length} enrollments`


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

  const handleAssignEmployee = async (enrollmentId, employeeUid) => {
    if (!employeeUid) {
      await updateEnrollment(enrollmentId, {
        assignedEmployeeUid: null,
        assignedEmployeeEmail: null,
        assignedEmployeeName: null
      })
      return
    }

    const emp = safeEmployees.find(e => e.uid === employeeUid || e.id === employeeUid)
    const empName = emp?.name || emp?.displayName || emp?.email || 'Assigned Mentor'
    const empEmail = emp?.email || ''

    try {
      await updateEnrollment(enrollmentId, {
        assignedEmployeeUid: employeeUid,
        assignedEmployeeEmail: empEmail,
        assignedEmployeeName: empName
      })
      alert(`Assigned mentor ${empName} to student enrollment successfully!`)
    } catch (error) {
      alert(error?.message || 'Unable to assign mentor.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course & Student Enrollments</h1>
        <p className="text-sm text-slate-500 mt-1">Track student course enrollments and assign lead mentors/employees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Enrollments',
            value: stats.total,
            cardClass: 'bg-blue-500/10 border-blue-500/20',
            textClass: 'text-blue-600',
          },
          {
            label: 'Active Plans',
            value: stats.active,
            cardClass: 'bg-emerald-500/10 border-emerald-500/20',
            textClass: 'text-emerald-600',
          },
          {
            label: 'Total Revenue',
            value: `₹${stats.revenue.toLocaleString('en-IN')}`,
            cardClass: 'bg-purple-500/10 border-purple-500/20',
            textClass: 'text-purple-600',
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.cardClass}`}>
            <p className={`text-2xl font-black ${s.textClass}`}>{s.value}</p>
            <p className="mt-1 text-xs text-slate-500 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 group">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-14 pointer-events-none">
            <svg 
              className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" 
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
            placeholder="Search student, mentor, email, course..."
            className="w-full bg-white border border-slate-300 rounded-2xl py-3.5 pl-14 pr-12 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear Search"
            >
              ✕
            </button>
          )}
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs">
          <option value="All">All Courses</option>
          {safeCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                {['Student', 'Course', 'Assigned Mentor/Employee', 'Category', 'Amount', 'Status', 'Enrolled On', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">No enrollments found</td></tr>
              ) : filtered.map(enr => (
                <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{enr.userName || '—'}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{enr.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-bold text-slate-800 max-w-44 truncate">{enr.courseTitle || '—'}</p>
                  </td>
                  {/* Assigned Employee / Mentor Column */}
                  <td className="px-4 py-3.5">
                    <select
                      value={enr.assignedEmployeeUid || ''}
                      onChange={(e) => handleAssignEmployee(enr.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Assign Mentor --</option>
                      {safeEmployees.map(emp => (
                        <option key={emp.uid || emp.id} value={emp.uid || emp.id}>
                          👨‍🏫 {emp.name || emp.displayName || emp.email} ({emp.role || 'Staff'})
                        </option>
                      ))}
                    </select>
                    {enr.assignedEmployeeName && (
                      <p className="text-[10px] text-indigo-600 font-extrabold mt-1">

                        Active: {enr.assignedEmployeeName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{enr.category || 'Course'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-black text-blue-600">
                      {Number(enr.amount) === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : `₹${Number(enr.amount).toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      enr.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      enr.status === 'expired' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>{enr.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-semibold">{formatDate(enr.enrolledAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditEnrollmentName(enr)}
                        title="Edit student name"
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors text-xs font-black"
                      >
                        Edit Name
                      </button>
                      {enr.status === 'active' && (
                        <button
                          onClick={() => updateEnrollment(enr.id, { status: 'cancelled' })}
                          title="Cancel enrollment"
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors text-xs font-black"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => window.confirm('Delete this enrollment?') && deleteEnrollment(enr.id)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500 font-semibold">
          {footerLabel}
        </div>
      </div>
    </div>
  )
}
