import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { api } from '../config/api'

const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-rose-500',
]

export default function AdminStudents() {
  const { users, updateUser, deleteUser, addUser } = useStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [isProcessing, setIsProcessing] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ displayName: '', email: '', phone: '', location: '' })
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTarget, setBroadcastTarget] = useState('enrolled') // 'enrolled' or 'manual'
  const [broadcastManualEmails, setBroadcastManualEmails] = useState('')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter for users (includes legacy "customer" and "student" roles)
  const students = users.filter(u => {
    const role = (u.role || '').toLowerCase();
    return role === 'student' || role === 'customer' || role === 'user';
  })

  const filteredStudents = students.filter(student =>
    (student.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isInactive = (c) => c.status === 'inactive' || c.status === 'banned'

  const handleToggleBan = async (student) => {
    const newStatus = isInactive(student) ? 'active' : 'inactive'
    setIsProcessing(student.uid)
    try {
      await updateUser(student.uid, { status: newStatus })
    } catch (err) {
      console.error("Failed to update student status:", err)
      alert(err.message || "Unable to update account status. Please try again.")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return
    setIsProcessing(studentToDelete.uid)
    try {
      await deleteUser(studentToDelete.uid)
      setShowDeleteModal(false)
    } catch (err) {
      console.error("Failed to delete student:", err)
      alert(err.message || "Unable to delete this student. Please try again.")
    } finally {
      setIsProcessing(null)
      setStudentToDelete(null)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    const phoneDigits = (addForm.phone || '').replace(/\D/g, '')
    if (!addForm.displayName?.trim() || !addForm.email?.trim() || phoneDigits.length < 10) {
      alert('Please enter full name, email, and a valid phone number.')
      return
    }
    setAddSubmitting(true)
    try {
      await addUser({
        displayName: addForm.displayName.trim(),
        email: addForm.email.trim(),
        phone: phoneDigits,
        role: 'student',
        status: 'active',
        location: (addForm.location || '').trim(),
      })
      setShowAddModal(false)
      setAddForm({ displayName: '', email: '', phone: '', location: '' })
      alert('Student account created. A password setup email has been sent to the registered address.')
    } catch (err) {
      alert(err.message || 'Unable to create the student account.')
    } finally {
      setAddSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your community members, handle bans, and profile cleanup.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-slate-900 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-600/30 uppercase tracking-widest"
          >
            Add student
          </button>
          <div className="bg-slate-100 border border-slate-300 rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="flex -space-x-2">
              {students.slice(0, 3).map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[10px] font-bold`}>
                  {(c.displayName || 'C').charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600">{students.length} Total Students</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 h-12 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowBroadcastModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-xs font-black text-slate-900 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest h-12 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            Bulk Email
          </button>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Accounts</p>
            <p className="text-2xl font-black text-slate-900">{students.filter(c => !isInactive(c)).length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                <tr key={student.uid} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-black text-slate-900 shadow-lg`}>
                        {(student.displayName || student.email || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{student.displayName || 'Anonymous User'}</p>
                        <p className="text-xs text-slate-400 mt-1">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">ID: <span className="text-[10px] font-mono text-blue-400/80">{student.uid.slice(0, 8)}...</span></p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Registered: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      isInactive(student)
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isInactive(student) ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {isInactive(student) ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => setSelectedStudentProfile(student)}
                        className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                        title="View Full Profile & Cover Image"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleBan(student)}
                        disabled={isProcessing === student.uid}
                        className={`p-2.5 rounded-xl transition-all ${
                          isInactive(student)
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        }`}
                        title={isInactive(student) ? 'Activate account' : 'Deactivate account'}
                      >
                        {isProcessing === student.uid ? (
                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isInactive(student) ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364L5.636 5.636" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete Permanently"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <p className="text-slate-400 font-medium">No students found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

           {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !addSubmitting && setShowAddModal(false)} />
          <form
            onSubmit={handleAddStudent}
            className="relative bg-white border border-slate-300 rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-4"
          >
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Add student</h3>
            <p className="text-sm text-slate-500">Creates the account in the primary database and Firebase. The student receives an email to set a password.</p>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full name</label>
              <input
                value={addForm.displayName}
                onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</label>
              <input
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="Digits only or formatted"
                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location (optional)</label>
              <input
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} disabled={addSubmitting} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={addSubmitting} className="px-4 py-3 rounded-xl bg-emerald-600 text-slate-900 text-xs font-black">
                {addSubmitting ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Student?</h3>
            <p className="text-sm text-slate-500 mt-3 mb-8 leading-relaxed">
              Are you sure you want to permanently delete <span className="text-slate-900 font-bold text-base underline decoration-red-500/30">"{studentToDelete?.displayName || 'this account'}"</span>? This action cannot be reversed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isProcessing}
                className="px-6 py-3.5 bg-red-600 text-slate-900 rounded-2xl text-xs font-black shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest"
              >
                {isProcessing ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !sendingBroadcast && setShowBroadcastModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-200 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                Bulk Broadcast
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setBroadcastTarget('enrolled')}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${broadcastTarget === 'enrolled' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-100 border-slate-300 text-slate-400 hover:text-slate-600'}`}
                  >
                    Mentorship Students
                  </button>
                  <button 
                    onClick={() => setBroadcastTarget('manual')}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${broadcastTarget === 'manual' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-slate-100 border-slate-300 text-slate-400 hover:text-slate-600'}`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {broadcastTarget === 'manual' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manual Emails (Comma/Space separated)</label>
                  <textarea 
                    value={broadcastManualEmails}
                    onChange={e => setBroadcastManualEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com..."
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 min-h-[80px] resize-none font-mono"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                  <input 
                    type="text"
                    value={broadcastSubject}
                    onChange={e => setBroadcastSubject(e.target.value)}
                    placeholder="Important Update Regarding..."
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50 min-h-[160px] resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-100 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={sendingBroadcast}
                  className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                   if (!broadcastSubject || !broadcastMessage) return alert("Please fill subject and message");
                   if (broadcastTarget === 'manual' && !broadcastManualEmails) return alert("Please enter target emails");
                   
                    setSendingBroadcast(true);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) throw new Error("Please log in again to continue");

                      const response = await fetch(api.adminBroadcastEmail, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          targetType: broadcastTarget,
                          manualEmails: broadcastManualEmails,
                         subject: broadcastSubject,
                         message: broadcastMessage
                       })
                     });
                     const data = await response.json();
                     if (data.success) {
                       alert(`Success: ${data.message}`);
                       setShowBroadcastModal(false);
                       setBroadcastSubject('');
                       setBroadcastMessage('');
                       setBroadcastManualEmails('');
                     } else {
                       alert(data.message);
                     }
                   } catch (err) {
                     alert("Failed to send broadcast: " + err.message);
                   } finally {
                     setSendingBroadcast(false);
                   }
                  }}
                  disabled={sendingBroadcast}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-900 rounded-2xl text-xs font-black shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 transition-all uppercase tracking-widest"
                >
                  {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile View Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStudentProfile(null)} />
          <div className="relative bg-white border border-slate-200 rounded-[28px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Cover Image Banner */}
            <div className="relative h-44 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
              {selectedStudentProfile.coverImage ? (
                <img src={selectedStudentProfile.coverImage} alt="Cover Background" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-indigo-600/80 backdrop-blur-sm" />
              )}
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Avatar & Details */}
            <div className="p-6 sm:p-8 -mt-14 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white overflow-hidden shrink-0">
                    {selectedStudentProfile.avatar || selectedStudentProfile.photoURL ? (
                      <img src={selectedStudentProfile.avatar || selectedStudentProfile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (selectedStudentProfile.displayName || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedStudentProfile.displayName || 'Anonymous Student'}
                    </h2>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">{selectedStudentProfile.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isInactive(selectedStudentProfile) ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isInactive(selectedStudentProfile) ? 'Inactive' : 'Active Account'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedStudentProfile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedStudentProfile.location || 'Gujarat, India'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account ID</p>
                  <p className="text-xs font-mono text-slate-600 mt-1">{selectedStudentProfile.uid}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Date</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedStudentProfile.createdAt ? new Date(selectedStudentProfile.createdAt).toLocaleDateString() : 'Standard'}
                  </p>
                </div>
              </div>

              {selectedStudentProfile.bio && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio / Overview</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedStudentProfile.bio}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedStudentProfile(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
