import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import api from '../config/api'
import {
  courseBelongsToEmployee,
  enrollmentMatchesCourse,
  formatTimeAgo,
  getEmployeeKeyList,
  getEmployeeMemberData,
  getTimeValue,
  normalize,
} from '../employee/employeeUtils'

const getNotificationMergeKey = (item) => {
  if (item?.notificationKey) return item.notificationKey
  if (item?.enrollmentId) return `enrollment:${item.enrollmentId}`

  if (item?.type === 'new_enrollment') {
    return `enrollment:${normalize(item.studentEmail)}:${normalize(item.courseId || item.courseTitle)}:${normalize(item.planLabel)}:${Number(item.amount || 0)}`
  }

  return item?.id || `notification:${Math.random()}`
}

const mergeNotificationGroups = (groups) => {
  const merged = new Map()

  groups.forEach(group => {
    group.forEach(item => {
      const mergeKey = getNotificationMergeKey(item)
      const existing = merged.get(mergeKey)
      const itemTime = getTimeValue(item.createdAt)
      const existingTime = existing ? getTimeValue(existing.createdAt) : 0

      if (
        !existing ||
        itemTime > existingTime ||
        (itemTime === existingTime && existing?.isDerived && !item?.isDerived)
      ) {
        merged.set(mergeKey, item)
      }
    })
  })

  return [...merged.values()]
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt))
    .slice(0, 30)
}

export default function NotificationBell() {
  const { currentUser, userProfile } = useAuth()
  const { courses, enrollments, teamMembers } = useStore()
  const [liveNotifications, setLiveNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [feedError, setFeedError] = useState(false)
  const [readFallbackIds, setReadFallbackIds] = useState(new Set())
  const panelRef = useRef(null)

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const employeeKeys = useMemo(
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const storageKey = useMemo(() => {
    if (!employeeKeys.length) return ''
    return `employee-notification-read:${employeeKeys.join(':')}`
  }, [employeeKeys])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      setReadFallbackIds(new Set())
      return
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      const savedIds = raw ? JSON.parse(raw) : []
      setReadFallbackIds(new Set(Array.isArray(savedIds) ? savedIds : []))
    } catch (error) {
      console.error('Failed to restore notification read state:', error)
      setReadFallbackIds(new Set())
    }
  }, [storageKey])

  const persistFallbackReads = useCallback((ids) => {
    if (!storageKey || !ids.length) return

    setReadFallbackIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))

      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]))
      } catch (error) {
        console.error('Failed to persist notification read state:', error)
      }

      return next
    })
  }, [storageKey])

  const fetchLiveNotifications = useCallback(async () => {
    if (!currentUser?.uid) return
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch(`${api.base}/api/db/notifications?orderBy=createdAt&order=desc`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok && data.success && Array.isArray(data.documents)) {
        setLiveNotifications(data.documents.map(d => ({ id: d.id, ...d, isDerived: false })))
        setFeedError(false)
      } else {
        setFeedError(true)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setFeedError(true)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser?.uid) {
      setLiveNotifications([])
      setFeedError(false)
      return
    }

    fetchLiveNotifications()
    const interval = setInterval(fetchLiveNotifications, 10000)
    return () => clearInterval(interval)
  }, [currentUser, fetchLiveNotifications])

  useEffect(() => {
    const handler = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const assignedCourses = useMemo(
    () => courses.filter(course => courseBelongsToEmployee(course, employeeKeys)),
    [courses, employeeKeys]
  )

  const fallbackNotifications = useMemo(() => {
    if (!assignedCourses.length) return []

    return enrollments
      .filter(enrollment =>
        enrollment.status === 'active' &&
        assignedCourses.some(course => enrollmentMatchesCourse(enrollment, course))
      )
      .sort((a, b) => getTimeValue(b.enrolledAt) - getTimeValue(a.enrolledAt))
      .filter(enrollment => {
        return !liveNotifications.some(notification => {
          if (notification.enrollmentId && notification.enrollmentId === enrollment.id) return true

          return (
            notification.type === 'new_enrollment' &&
            normalize(notification.studentEmail) === normalize(enrollment.userEmail) &&
            normalize(notification.courseId || notification.courseTitle) === normalize(enrollment.courseId || enrollment.courseTitle) &&
            normalize(notification.planLabel) === normalize(enrollment.planLabel) &&
            Number(notification.amount || 0) === Number(enrollment.amount || 0)
          )
        })
      })
      .slice(0, 15)
      .map(enrollment => {
        const fallbackId = `fallback-enrollment:${enrollment.id}`

        return {
          id: fallbackId,
          enrollmentId: enrollment.id,
          notificationKey: `enrollment:${enrollment.id}`,
          type: 'new_enrollment',
          title: 'New Student Enrolled!',
          message: `${enrollment.userName || enrollment.userEmail} enrolled in "${enrollment.courseTitle}"`,
          courseId: enrollment.courseId,
          courseTitle: enrollment.courseTitle,
          studentName: enrollment.userName || enrollment.userEmail,
          studentEmail: enrollment.userEmail,
          studentMobile: enrollment.userMobile || '',
          planLabel: enrollment.planLabel || '',
          amount: enrollment.amount || 0,
          createdAt: enrollment.enrolledAt,
          read: readFallbackIds.has(fallbackId),
          isDerived: true,
        }
      })
  }, [assignedCourses, enrollments, liveNotifications, readFallbackIds])

  const notifications = useMemo(
    () => mergeNotificationGroups([liveNotifications, fallbackNotifications]),
    [liveNotifications, fallbackNotifications]
  )

  const unread = notifications.filter(notification => !notification.read).length

  const markAllRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(notification => !notification.read)
    if (!unreadNotifications.length) return

    const derivedIds = unreadNotifications
      .filter(notification => notification.isDerived)
      .map(notification => notification.id)

    if (derivedIds.length) {
      persistFallbackReads(derivedIds)
    }

    const liveUnread = unreadNotifications.filter(notification => !notification.isDerived)
    if (!liveUnread.length) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return
      await Promise.all(liveUnread.map(notification =>
        fetch(`${api.base}/api/db/notifications/${notification.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ read: true })
        })
      ))
      setLiveNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error("Failed to mark notifications read:", err)
    }
  }, [notifications, persistFallbackReads])

  const markOneRead = useCallback(async (notification) => {
    if (notification.read) return

    if (notification.isDerived) {
      persistFallbackReads([notification.id])
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return
      await fetch(`${api.base}/api/db/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: true })
      })
      setLiveNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))
    } catch (err) {
      console.error("Failed to mark notification read:", err)
    }
  }, [persistFallbackReads])

  return (
    <div className="relative font-['Outfit',sans-serif]" ref={panelRef}>
      {/* ── Bell Trigger Button ── */}
      <button
        onClick={() => {
          setOpen(!open)
          if (!open && unread > 0) markAllRead()
        }}
        className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-2xs cursor-pointer"
        title="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Floating Notification Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 top-13 z-50 w-80 sm:w-96 overflow-hidden rounded-[28px] border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/15 animate-in zoom-in-95 slide-in-from-top-2 duration-150">
          
          {/* Header Bar */}
          <div className="rounded-t-[24px] bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">Activity Center</p>
                <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">Notifications</h3>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  {feedError && fallbackNotifications.length > 0
                    ? 'Showing fallback student enrollment alerts.'
                    : 'Real-time student enrollments and system updates.'}
                </p>
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100/80 px-3 py-1 text-[10px] font-bold text-blue-700 transition-all cursor-pointer shrink-0"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="rounded-[22px] border-2 border-dashed border-blue-200/80 bg-blue-50/30 px-5 py-10 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm font-bold text-slate-900">
                  {feedError ? 'Alerts syncing' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                  {feedError ? 'Reconnecting to notification server...' : 'Student enrollments and course delivery updates will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => markOneRead(notification)}
                  className={`group block w-full rounded-[22px] border p-3.5 text-left transition-all cursor-pointer ${
                    notification.read
                      ? 'border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/70'
                      : 'border-blue-200 bg-blue-50/60 hover:bg-blue-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon container */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-base shadow-2xs ${
                      notification.type === 'new_enrollment'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-blue-200 bg-blue-50 text-blue-600'
                    }`}>
                      {notification.type === 'new_enrollment' ? '🎓' : '🔔'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-xs font-bold leading-snug ${notification.read ? 'text-slate-700' : 'text-slate-900 font-extrabold'}`}>
                            {notification.title}
                          </p>
                          {notification.isDerived && (
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700">
                              System Alert
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                          <span className="text-[10px] font-medium text-slate-400">{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">{notification.message}</p>

                      {notification.type === 'new_enrollment' && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {notification.courseTitle && (
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                              {notification.courseTitle}
                            </span>
                          )}
                          {notification.planLabel && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                              {notification.planLabel}
                            </span>
                          )}
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            {Number(notification.amount || 0) > 0 ? `₹${Number(notification.amount).toLocaleString('en-IN')}` : 'FREE'}
                          </span>
                          {notification.studentMobile && (
                            <a
                              href={`tel:+91${notification.studentMobile}`}
                              onClick={event => event.stopPropagation()}
                              className="rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 transition-colors"
                            >
                              📞 {notification.studentMobile}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 rounded-b-[24px]">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {notifications.length} Total Alert{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
