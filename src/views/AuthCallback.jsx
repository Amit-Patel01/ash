'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'
import { useTheme } from '../context/ThemeContext'
import brandLogo from '../assets/brand-logo.png'
import SEO from '../components/SEO'

export default function AuthCallback() {
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
  const { refreshCurrentUser } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [status, setStatus] = useState('loading') // 'loading' | 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const error = params.get('error')

      if (error) {
        const messages = {
          google_denied:       'You cancelled Google sign-in.',
          account_inactive:    'Your account is currently inactive. Please contact support.',
          google_token_failed: 'Google authentication failed. Please try again.',
          google_no_email:     'Could not retrieve your email address from Google.',
          google_server_error: 'A server error occurred during Google sign-in.' }
        const errorText = messages[error] || 'Google sign-in failed. Please try again.'
        sessionStorage.setItem('auth_error', errorText)
        if (isMounted) {
          setErrorMessage(errorText)
          setStatus('error')
        }
        return
      }

      if (!token) {
        const errorText = 'No authentication token received.'
        sessionStorage.setItem('auth_error', errorText)
        if (isMounted) {
          setErrorMessage(errorText)
          setStatus('error')
        }
        return
      }

      // Save token and load user profile
      localStorage.setItem('token', token)
      try {
        if (isMounted) setStatus('verifying')
        const user = await refreshCurrentUser()
        if (!user) throw new Error('Could not load user profile')

        const path = getHomePathForRole(user?.role)

        if (isMounted) {
          setStatus('success')
        }

        setTimeout(() => {
          if (isMounted) {
            navigate(path, { replace: true })
          }
        }, 1000)
      } catch (err) {
        console.error('AuthCallback error:', err)
        localStorage.removeItem('token')
        if (isMounted) {
          setErrorMessage('Could not load profile settings. Please log in again.')
          setStatus('error')
        }
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [navigate, refreshCurrentUser])

  return (
    <>
      <SEO title="Authenticating... | SolutionHub" />

      <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/15 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/10 blur-[140px]" />
        </div>

        {/* Floating Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className={`p-8 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-2xl text-center relative overflow-hidden transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/80 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)]' 
              : 'bg-white/90 border-slate-200/80 shadow-[0_25px_60px_rgba(37,99,235,0.12)]'
          }`}>
            
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* Brand Logo Header */}
            <div className="flex justify-center mb-8">
              <div className="relative p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg group">
                <img
                  src={brandLogo}
                  alt="SolutionHub Logo"
                  className="h-10 w-auto object-contain filter drop-shadow-md"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
                    <AlertCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Authentication Failed
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {errorMessage || 'Something went wrong during authentication.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Back to Login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/"
                      className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </motion.div>
              ) : status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-2"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                    <CheckCircle2 className="w-10 h-10 relative z-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Authenticated Successfully!
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Redirecting you to your portal...
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Secure Connection Established</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-2"
                >
                  {/* Glowing Animated Ring */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/15" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-500 animate-spin" />
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                      <ShieldCheck className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {status === 'verifying' ? 'Verifying Account...' : 'Signing You In...'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Please wait a moment while we set up your session.
                    </p>
                  </div>

                  {/* Step Indicators */}
                  <div className="pt-4 space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status === 'loading' ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span>{status === 'loading' ? 'Receiving Auth Token' : 'Auth Token Verified'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status === 'verifying' ? 'bg-purple-500 animate-ping' : status === 'success' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <span>{status === 'verifying' ? 'Loading Profile Credentials' : 'Profile Loaded'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
