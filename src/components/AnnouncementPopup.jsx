'use client'
import React, { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { usePathname } from 'next/navigation'

const AnnouncementPopup = () => {
  const { announcement } = useStore()
  const pathname = usePathname() || ''

  const [isDelayedVisible, setIsDelayedVisible] = useState(false)

  const isSensitivePage = ['/admin', '/employee', '/login', '/signup'].some(path => pathname.startsWith(path))

  const isEligible = announcement && announcement.isActive && announcement.message && !isSensitivePage

  useEffect(() => {
    if (!isEligible) {
      setIsDelayedVisible(false)
      return
    }

    const dismissedAnnouncements = JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]')
    if (dismissedAnnouncements.includes(announcement.updatedAt?.seconds || 'default')) {
      setIsDelayedVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setIsDelayedVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isEligible, announcement, pathname])

  const handleDismiss = () => {
    setIsDelayedVisible(false)
    const dismissedAnnouncements = JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]')
    dismissedAnnouncements.push(announcement.updatedAt?.seconds || 'default')
    sessionStorage.setItem('dismissed_announcements', JSON.stringify(dismissedAnnouncements))
  }

  if (!isEligible || !isDelayedVisible) return null

  const getStyles = () => {
    switch (announcement.type) {
      case 'warning':
        return {
          bg: 'bg-amber-500',
          light: 'bg-amber-50',
          text: 'text-amber-900',
          border: 'border-amber-200',
          icon: (
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'success':
        return {
          bg: 'bg-emerald-500',
          light: 'bg-emerald-50',
          text: 'text-emerald-900',
          border: 'border-emerald-200',
          icon: (
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      default: // info
        return {
          bg: 'bg-blue-500',
          light: 'bg-blue-50',
          text: 'text-blue-900',
          border: 'border-blue-200',
          icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const styles = getStyles()

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-lg animate-in fade-in slide-in-from-top-10 duration-500">
      <div className={`relative overflow-hidden bg-white rounded-3xl shadow-2xl border-2 ${styles.border}`}>
        {/* Progress Bar Background */}
        <div className={`absolute top-0 left-0 w-full h-1 ${styles.bg} opacity-20`}></div>
        
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${styles.light} rounded-2xl flex items-center justify-center`}>
              {styles.icon}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-black uppercase tracking-widest ${styles.text.replace('900', '600')}`}>
                  Announcement
                </h3>
                <button 
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className={`text-sm font-bold leading-relaxed ${styles.text}`}>
                {announcement.message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleDismiss}
              className={`px-6 py-2 rounded-xl text-xs font-black text-white ${styles.bg} hover:shadow-lg transition-all active:scale-95`}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementPopup
