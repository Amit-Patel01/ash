import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CustomerMyCourses() {
  const { getUserEnrollments, courses } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)

  const myEnrollments = currentUser ? getUserEnrollments(currentUser.uid) : []

  const getMyCourse = (courseId) => courses.find(c => c.id === courseId)

  if (myEnrollments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
          <p className="text-gray-400 text-sm mb-6">Browse our courses and enroll to start learning</p>
          <button onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            Browse Courses
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-sm text-gray-400 mt-1">{myEnrollments.length} enrolled course{myEnrollments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-all">
          Browse More
        </button>
      </div>

      <div className="space-y-4">
        {myEnrollments.map(enr => {
          const course = getMyCourse(enr.courseId)
          const isExpanded = expandedId === enr.id
          if (!course) return null

          const hasMaterials = Array.isArray(course.materials) && course.materials.length > 0
          const hasMeetingLink = !!course.meetingLink

          return (
            <div key={enr.id} className="bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              {/* Course Header */}
              <div className="p-5 flex items-start gap-4">
                {/* Thumbnail / Icon */}
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center text-2xl">
                      📚
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{enr.category || course.category}</p>
                      <h3 className="font-bold text-white mb-1">{course.title}</h3>
                      {course.instructor && (
                        <p className="text-xs text-gray-500">👨‍🏫 {course.instructor}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      ✓ Active
                    </span>
                  </div>

                  {/* Quick action row */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {hasMeetingLink && (
                      <a href={course.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Join Session
                      </a>
                    )}
                    {hasMaterials && (
                      <button onClick={() => setExpandedId(isExpanded ? null : enr.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {course.materials.length} material{course.materials.length !== 1 ? 's' : ''}
                        <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    )}
                    {!hasMaterials && !hasMeetingLink && (
                      <p className="text-xs text-gray-600 italic">Course content coming soon...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded materials list */}
              {isExpanded && hasMaterials && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Study Materials</p>
                  <div className="space-y-2">
                    {course.materials.map((mat, i) => (
                      <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{mat.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{mat.url}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
