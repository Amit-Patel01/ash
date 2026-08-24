'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle2,
  Award,
  Clock,
  BookOpen,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'

export default function MentorStudents() {
  const { currentUser, userProfile } = useAuth()
  const { users, courses } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('All')

  // Real or mock roster
  const sampleStudents = useMemo(() => {
    const raw = (users || []).filter(u => {
      const role = String(u.role || '').toLowerCase()
      return ['student', 'user', 'client', ''].includes(role)
    })

    if (raw.length > 0) {
      return raw.map((u, idx) => ({
        id: u.id || u._id || `st-${idx}`,
        name: u.displayName || u.fullName || u.name || u.email?.split('@')[0] || 'Student',
        email: u.email || 'student@example.com',
        phone: u.phone || u.mobile || '+91 98765 43210',
        course: (u.enrolledCourses?.[0]?.title) || (courses?.[0]?.title) || 'Full-Stack Web Development',
        progress: Math.floor(Math.random() * 60) + 35, // Demo completion %
        status: 'Active',
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Aug 2026'
      }))
    }

    // Default demonstration students
    return [
      {
        id: 'st-1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98123 45678',
        course: 'Full-Stack Web Development',
        progress: 85,
        status: 'Active',
        joinedDate: '01 Aug 2026'
      },
      {
        id: 'st-2',
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        phone: '+91 98234 56789',
        course: 'AI & Machine Learning Certification Course',
        progress: 92,
        status: 'Active',
        joinedDate: '05 Aug 2026'
      },
      {
        id: 'st-3',
        name: 'Aman Deep',
        email: 'aman.deep@example.com',
        phone: '+91 98345 67890',
        course: 'Python & Data Science Bootcamp',
        progress: 60,
        status: 'Active',
        joinedDate: '10 Aug 2026'
      },
      {
        id: 'st-4',
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        phone: '+91 98456 78901',
        course: 'Full-Stack Web Development',
        progress: 45,
        status: 'Active',
        joinedDate: '12 Aug 2026'
      },
      {
        id: 'st-5',
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98567 89012',
        course: 'Cloud & DevOps Architecture',
        progress: 78,
        status: 'Active',
        joinedDate: '15 Aug 2026'
      }
    ]
  }, [users, courses])

  const filteredStudents = useMemo(() => {
    return sampleStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.course.toLowerCase().includes(searchQuery.toLowerCase())
      const matchBatch = selectedBatch === 'All' || s.course === selectedBatch
      return matchSearch && matchBatch
    })
  }, [sampleStudents, searchQuery, selectedBatch])

  const batchOptions = useMemo(() => {
    const set = new Set(['All'])
    sampleStudents.forEach(s => { if (s.course) set.add(s.course) })
    return Array.from(set)
  }, [sampleStudents])

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Assigned Students Roster 👥
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track student learning progress, assignment completion rates, and manage batch cohorts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/mentor/broadcast"
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Entire Batch</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, email, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Course:</span>
          </span>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className={`text-xs px-3 py-2 rounded-xl outline-none border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {batchOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${
              isDark ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-4 sm:p-5">Student</th>
                <th className="p-4 sm:p-5">Enrolled Course</th>
                <th className="p-4 sm:p-5">Curriculum Progress</th>
                <th className="p-4 sm:p-5">Enrolled Date</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-600'}`}>
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-indigo-50/20 dark:hover:bg-white/5 transition-colors">
                  
                  {/* Student Name & Email */}
                  <td className="p-4 sm:p-5 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {st.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{st.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="p-4 sm:p-5 font-semibold text-indigo-600 dark:text-indigo-400">
                    {st.course}
                  </td>

                  {/* Progress */}
                  <td className="p-4 sm:p-5 min-w-[160px]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span>{st.progress}%</span>
                      <span className={st.progress > 80 ? 'text-emerald-500' : 'text-amber-500'}>
                        {st.progress > 80 ? 'On Track' : 'In Progress'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          st.progress > 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                        style={{ width: `${st.progress}%` }}
                      />
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="p-4 sm:p-5 text-slate-500">
                    {st.joinedDate}
                  </td>

                  {/* Actions */}
                  <td className="p-4 sm:p-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`mailto:${st.email}`}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                      <Link
                        href="/mentor/assignments"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                      >
                        Submissions
                      </Link>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
