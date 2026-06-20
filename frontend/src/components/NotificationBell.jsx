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
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open && unread > 0) markAllRead()
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
        title="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-lg shadow-rose-500/40">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[22rem] overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.98))] shadow-2xl shadow-black/30 animate-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="border-b border-white/5 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Alert Center</p>
                <h3 className="mt-1 text-sm font-black text-white">Notifications</h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  {feedError && fallbackNotifications.length > 0
                    ? 'Showing fallback alerts from recent enrollments.'
                    : 'Student activity and delivery updates appear here.'}
                </p>
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10">
                  Mark Read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-12 text-center">
                <div className="text-4xl">🔔</div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {feedError ? 'Live alerts are reconnecting' : 'No notifications yet'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {feedError ? 'Refresh in a moment and new alerts will sync again.' : 'Fresh enrollments and course updates will show here automatically.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => markOneRead(notification)}
                    className={`block w-full rounded-[22px] border px-4 py-4 text-left transition-all ${
                      notification.read
                        ? 'border-white/5 bg-white/[0.03]'
                        : 'border-cyan-400/15 bg-cyan-400/[0.07] shadow-lg shadow-cyan-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-base ${
                        notification.type === 'new_enrollment'
                          ? 'bg-emerald-400/15'
                          : 'bg-cyan-400/15'
                      }`}>
                        {notification.type === 'new_enrollment' ? '🎓' : '🔔'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-bold leading-tight ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </p>
                            {notification.isDerived && (
                              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                                Fallback Alert
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && <span className="h-2 w-2 rounded-full bg-cyan-300" />}
                            <span className="text-[10px] font-medium text-slate-500">{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-400">{notification.message}</p>

                        {notification.type === 'new_enrollment' && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {notification.courseTitle && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-200">
                                {notification.courseTitle}
                              </span>
                            )}
                            {notification.planLabel && (
                              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-bold text-violet-300">
                                {notification.planLabel}
                              </span>
                            )}
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                              {Number(notification.amount || 0) > 0 ? `₹${Number(notification.amount).toLocaleString('en-IN')}` : 'FREE'}
                            </span>
                            {notification.studentMobile && (
                              <a
                                href={`tel:+91${notification.studentMobile}`}
                                onClick={event => event.stopPropagation()}
                                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300 transition hover:bg-cyan-400/20"
                              >
                                {notification.studentMobile}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-white/5 px-5 py-3">
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                {notifications.length} total alert{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
