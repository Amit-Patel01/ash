'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '../context/ThemeContext'
import SEO from '../components/SEO'

export default function NotFound() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)

  const quickLinks = [
    { to: '/', label: '🏠 Home' },
    { to: '/projects', label: '📦 Projects' },
    { to: '/courses', label: '🎓 Courses' },
    { to: '/about', label: '🏢 About Us' },
    { to: '/contact', label: '📞 Contact' },
  ]

  return (
    <>
      <SEO
        title="Page Not Found | AmitSolutionHub"
        description="The page you're looking for doesn't exist. Head back to AmitSolutionHub."
      />
      <div className={`min-h-[80vh] flex items-center justify-center px-6 py-20 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40'}`}>
        <div className="max-w-lg w-full text-center space-y-8">

          {/* 404 Graphic */}
          <div className="relative mx-auto w-fit">
            {/* Glow orb */}
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl scale-150 pointer-events-none" />

            <div className={`relative rounded-3xl border p-10 shadow-xl ${
              isDark
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200/80 shadow-slate-200/60'
            }`}>
              {/* Big 404 number */}
              <div
                className="text-[96px] font-black leading-none tracking-tighter select-none"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text' }}
              >
                404
              </div>

              {/* Broken link icon */}
              <div className="mx-auto mt-2 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Page not found
            </h1>
            <p className={`text-base leading-7 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              The page you're looking for doesn't exist or may have been moved. Don't worry — here are some helpful links.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {quickLinks.map(link => (
              <Link
                key={link.to}
                href={link.to}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500 hover:text-violet-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-sm'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border text-sm font-bold transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Go Back
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-indigo-500/40 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Contact note */}
          <p className={`text-xs font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            Need help?{' '}
            <Link href="/contact" className="text-indigo-500 hover:text-indigo-400 underline underline-offset-2">
              Contact our team
            </Link>
            {' '}or{' '}
            <a href="mailto:support@amitsolutionhub.com" className="text-indigo-500 hover:text-indigo-400 underline underline-offset-2">
              email us
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
