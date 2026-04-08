import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, writeBatch } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function NotificationBell() {
  const { currentUser, userProfile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const recipientIds = [...new Set([currentUser?.uid, userProfile?.uid, userProfile?.employeeId].filter(Boolean))]
    if (recipientIds.length === 0) return
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', 'in', recipientIds),
      orderBy('createdAt', 'desc'),
      limit(30)
    )
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [currentUser?.uid, userProfile?.uid, userProfile?.employeeId])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = async () => {
    const unreadNots = notifications.filter(n => !n.read)
    if (!unreadNots.length) return
    const batch = writeBatch(db)
    unreadNots.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }))
    await batch.commit()
  }

  const markOneRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString('en-IN')
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/40 animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-[10px] text-gray-600 mt-1">You'll be notified when students enroll</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markOneRead(notif.id)}
                  className={`px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors ${!notif.read ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                      notif.type === 'new_enrollment' ? 'bg-emerald-500/15' : 'bg-blue-500/15'
                    }`}>
                      {notif.type === 'new_enrollment' ? '🎓' : '🔔'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-bold leading-tight ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                          <span className="text-[10px] text-gray-600">{formatTime(notif.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{notif.message}</p>

                      {/* Extra info for enrollment */}
                      {notif.type === 'new_enrollment' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {notif.planLabel && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold">
                              {notif.planLabel}
                            </span>
                          )}
                          {notif.amount > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">
                              ₹{Number(notif.amount).toLocaleString('en-IN')}
                            </span>
                          )}
                          {notif.amount === 0 && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">
                              FREE
                            </span>
                          )}
                          {notif.studentMobile && (
                            <a
                              href={`tel:+91${notif.studentMobile}`}
                              onClick={e => e.stopPropagation()}
                              className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                            >
                              📞 {notif.studentMobile}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-600">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
