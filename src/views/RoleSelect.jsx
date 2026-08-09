'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RoleSelect() {
  const searchParams = useSearchParams()
  const fromGoogle = searchParams.get('reason') === 'google-no-account'

  return (
    <section className="relative w-full min-h-screen pt-[120px] md:pt-[160px] pb-24 px-4 overflow-hidden transition-colors duration-500">
      {/* Ambient decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Top Google Alert Banner */}
        {fromGoogle && (
          <div className="max-w-xl mx-auto mb-10 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-4 border rounded-3xl text-sm font-bold shadow-xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4
              border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              No account linked to this Google email. Please select a profile below to register.
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900 dark:text-white leading-tight">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 drop-shadow-sm">Amit Solution Hub</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
            Select your account type to proceed to registration and start your workspace.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          
          {/* Student Card */}
          <Link
            href="/signup"
            className="group relative flex flex-col justify-between rounded-[32px] p-8 md:p-10 border transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-lg
              bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 backdrop-blur-2xl hover:border-emerald-500/50 hover:shadow-emerald-500/5 dark:hover:border-emerald-500/40"
          >
            {/* Glowing background accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative space-y-6">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                  Student / Client Profile
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Ideal for users wishing to buy projects, enroll in academic courses, download certificates, and open service queries.
                </p>

                {/* Bullet details */}
                <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Browse & acquire verified projects
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Access enrolled trading & dev courses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    24/7 dedicated support chat desk
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Student Portal</span>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-black translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300 bg-emerald-500/10 px-4 py-2 rounded-full">
                Sign Up
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Employee Card */}
          <Link
            href="/request-account"
            className="group relative flex flex-col justify-between rounded-[32px] p-8 md:p-10 border transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-lg
              bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/5 backdrop-blur-2xl hover:border-blue-500/50 hover:shadow-blue-500/5 dark:hover:border-blue-500/40"
          >
            {/* Glowing background accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative space-y-6">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                  Employee / Staff Profile
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  For platform staff, developers, sales coordinators, and LMS content writers who require administrative and operational access.
                </p>

                {/* Bullet details */}
                <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    Manage tasks, projects, and LMS syllabus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    Conduct communication and support chats
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    Request access from platform administrators
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">Team Workspace</span>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-black translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300 bg-blue-500/10 px-4 py-2 rounded-full">
                Request Profile
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

        </div>

        {/* Footer actions */}
        <div className="text-center space-y-5 animate-in fade-in duration-700 delay-300">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-extrabold transition-colors">
              Sign In
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to main website
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
