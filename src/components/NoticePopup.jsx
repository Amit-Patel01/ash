'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Info 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'ash_notice_popup_v1_dismissed'

export default function NoticePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname() || ''

  // Do not show on auth/admin/verification pages
  const isExcludedPage = ['/admin', '/employee', '/login', '/signup', '/verify'].some(
    p => pathname.startsWith(p)
  )

  useEffect(() => {
    if (isExcludedPage) {
      setIsOpen(false)
      return
    }

    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === 'true') {
      return
    }

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1200)

    return () => clearTimeout(timer)
  }, [isExcludedPage, pathname])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  if (isExcludedPage) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-amber-400/40 dark:border-amber-500/30 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden my-auto max-h-[90vh] flex flex-col"
          >
            {/* Top Amber Accent Glow Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close Notice"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-200">
              
              {/* Header Badge & Title */}
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Important Notice</span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Internship Program Temporarily Closed
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Official update regarding registrations and active certifications
                  </p>
                </div>
              </div>

              {/* Notice Section 1: Internship Status */}
              <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="text-sm leading-relaxed space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-amber-100">
                      We would like to inform all students and visitors that Ashnexa Systems’s Internship Program is currently on hold due to the pending approval of our Private Limited company registration.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Therefore, we are currently not accepting new internship applications or registrations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice Section 2: Already Issued Certificates */}
              <div className="rounded-2xl p-4 sm:p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-emerald-200 uppercase tracking-wide">
                      Already Issued Certificates:
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Students who have previously completed our internship programs and received certificates do not need to worry. Your previously issued certificates remain <strong>100% valid</strong> and verifiable through our official portal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice Section 3: ASHX OS Focus & Certification Courses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Technology Solutions Card */}
                <div className="rounded-2xl p-4 bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>Core Development</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    At present, our primary focus is on advancing custom enterprise software, cloud architecture, and cutting-edge web engineering.
                  </p>
                </div>

                {/* Certification Courses Card */}
                <div className="rounded-2xl p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>Open For Enrollment</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <strong>Certification Courses Available:</strong> Our Certification Courses are still active. Students can continue learning and earn verified credentials through our available courses.
                  </p>
                </div>
              </div>

              {/* Notice Section 4: Closing Note */}
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <p>
                  We will announce any future updates regarding the Internship Program through our official channels.
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Thank you for your understanding and continued support.
                </p>
              </div>

              {/* Organization Sign-off */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    Ashnexa Systems
                  </h4>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Learn &bull; Build &bull; Grow.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/courses"
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Browse Courses
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    I Understand
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
