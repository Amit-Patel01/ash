'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Search,
  Filter,
  Layers,
  Clock,
  CheckCircle2,
  FileText,
  PlayCircle,
  Plus,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'

export default function MentorCourses() {
  const { currentUser, userProfile } = useAuth()
  const { courses, users } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const mentorEmail = (currentUser?.email || '').toLowerCase()
  const displayName = userProfile?.displayName || currentUser?.displayName || 'Mentor'

  // Filter courses for mentor
  const assignedCourses = useMemo(() => {
    return (courses || []).filter(c => {
      const instructorEmail = (c.instructorEmail || c.mentorEmail || '').toLowerCase()
      const instructorName = (typeof c.instructor === 'object' ? (c.instructor?.name || '') : (c.instructor || c.mentor || '')).toLowerCase()
      return (
        instructorEmail === mentorEmail ||
        instructorName === displayName.toLowerCase() ||
        (userProfile?.assignedCourseIds || []).includes(c.id) ||
        (userProfile?.assignedCourseIds || []).includes(c._id)
      )
    })
  }, [courses, mentorEmail, displayName, userProfile])

  const effectiveCourses = assignedCourses.length > 0 ? assignedCourses : (courses || [])

  const filteredCourses = useMemo(() => {
    return effectiveCourses.filter(c => {
      const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (c.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [effectiveCourses, searchQuery, selectedCategory])

  const categories = useMemo(() => {
    const set = new Set(['All'])
    effectiveCourses.forEach(c => { if (c.category) set.add(c.category) })
    return Array.from(set)
  }, [effectiveCourses])

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Courses & Batches 📚
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your assigned training tracks, modules, and enrolled student cohorts
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search course title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-950 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => {
          const modules = course.modules || course.curriculum || course.syllabus || []
          return (
            <div
              key={course.id || course._id || idx}
              className={`rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                isDark ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              {/* Course Card Thumbnail */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                {course.thumbnail || course.image ? (
                  <img
                    src={course.thumbnail || course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-6 text-white text-center">
                    <BookOpen className="w-12 h-12 opacity-40" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                  {course.category || 'Development'}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-3">
                <h3 className={`text-base font-black line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.description || course.shortDesc || 'Comprehensive hands-on training curriculum with real-world industry capstone projects.'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{modules.length || 8} Modules</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{course.duration || '6 Weeks'}</span>
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/mentor/students?course=${encodeURIComponent(course.title)}`}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    View Students
                  </Link>
                  <Link
                    href="/mentor/broadcast"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    title="Send class update"
                  >
                    Broadcast
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
