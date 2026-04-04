import { Link } from 'react-router-dom'

export default function RoleSelect() {
  return (
    <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4">
      <div className="relative z-20 max-w-4xl mx-auto px-4">

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SolutionHub</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Choose your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Customer Card */}
          <Link
            to="/signup"
            className="group relative bg-white/40 backdrop-blur-2xl rounded-3xl p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative flex flex-col items-center text-center space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">I am a Customer/Student</h2>
                <p className="text-sm text-slate-500 leading-relaxed">Browse projects, place orders, and chat with support</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-emerald-50 px-4 py-2 rounded-full">
                Sign Up Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Employee Card */}
          <Link
            to="/request-account"
            className="group relative bg-white/40 backdrop-blur-2xl rounded-3xl p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative flex flex-col items-center text-center space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">I am an Employee</h2>
                <p className="text-sm text-slate-500 leading-relaxed">Request an account. Admin will provide your credentials</p>
              </div>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-blue-50 px-4 py-2 rounded-full">
                Request Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500">Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign In</Link>
          </p>
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mt-4">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to website
          </Link>
        </div>

      </div>
    </section>
  )
}
