import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

const colorMap = {
  'from-blue-500 to-cyan-500': 'hover:text-blue-600',
  'from-indigo-500 to-purple-500': 'hover:text-indigo-600',
  'from-pink-500 to-rose-500': 'hover:text-pink-600',
  'from-amber-500 to-orange-500': 'hover:text-amber-600',
  'from-amber-500 to-yellow-500': 'hover:text-yellow-600',
}

const Services = () => {
  const [loaded, setLoaded] = useState(false)
  const { services, loading } = useStore()

  useEffect(() => {
    setLoaded(true)
  }, [])

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'code':
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'tool':
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'support':
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'trading':
      case 'chart':
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        )
      default:
        return (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  const getColor = (category) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('dev')) return { color: 'from-blue-500 to-cyan-500', iconBg: 'from-blue-600 to-indigo-600' }
    if (cat.includes('support') || cat.includes('repair')) return { color: 'from-indigo-500 to-purple-500', iconBg: 'from-purple-600 to-pink-600' }
    if (cat.includes('creative') || cat.includes('edit')) return { color: 'from-pink-500 to-rose-500', iconBg: 'from-rose-500 to-orange-500' }
    if (cat.includes('trading') || cat.includes('finance') || cat.includes('mentorship')) return { color: 'from-amber-500 to-yellow-500', iconBg: 'from-yellow-600 to-amber-600' }
    return { color: 'from-amber-500 to-orange-500', iconBg: 'from-amber-500 to-yellow-500' }
  }

  const getPath = (title) => {
    const t = title.toLowerCase()
    if (t.includes('web')) return '/services/web-development'
    if (t.includes('repair')) return '/services/repair'
    if (t.includes('edit')) return '/services/editing'
    if (t.includes('support')) return '/services/tech-support'
    if (t.includes('trading') || t.includes('mentorship')) return '/services/trading-mentorship'
    return '/contact'
  }

  const getFeatures = (category) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('dev')) return ['Responsive Design', 'SEO Optimized', 'Fast Performance']
    if (cat.includes('support') || cat.includes('repair')) return ['Hardware Repair', 'Software Fixes', 'System Optimization']
    if (cat.includes('creative') || cat.includes('edit')) return ['Video Editing', 'Photo Retouching', 'Color Grading']
    if (cat.includes('trading') || cat.includes('finance') || cat.includes('mentorship')) return ['Live Sessions', 'Technical Analysis', 'Risk Management']
    return ['24/7 Support', 'Expert Help', 'Custom Solutions']
  }

  const activeServices = services.filter(s => s.active !== false).map(s => {
    const { color, iconBg } = getColor(s.category)
    return {
      id: s.id,
      title: s.name,
      description: s.description,
      icon: getIcon(s.icon),
      color,
      iconBg,
      features: getFeatures(s.category),
      path: s.path || getPath(s.name) // Use custom path from admin if available
    }
  })

  return (
    <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4">

      <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>


        {/* Header Container */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-blue-700 font-bold text-sm tracking-wide">Premium Tech Solutions</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-800">
            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Offer</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mix-blend-multiply">
            Elevate your digital presence and optimize your systems with our comprehensive suite of professional tech services.
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-64 bg-white/40 backdrop-blur-2xl rounded-3xl animate-pulse border border-white/60"></div>
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {activeServices.map((service, index) => (
              <div
                key={service.id || index}
                className="group relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 hover:bg-white/60 shadow-xl border border-white/60 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Glow behind card content */}
                <div className={`absolute -inset-4 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-xl z-0`}></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                  <div className={`flex-shrink-0 text-white inline-block p-5 rounded-2xl bg-gradient-to-br ${service.iconBg} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-500 relative`}>
                    {service.icon}
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="flex-1 mt-2 md:mt-0">
                    <h3 className={`text-2xl font-bold text-slate-800 mb-3 ${colorMap[service.color] || 'hover:text-blue-600'} transition-all duration-300`}>
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed mb-4 font-medium">
                      {service.description}
                    </p>

                    {/* Features Glass Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-1.5 text-sm font-semibold text-slate-700 bg-white/50 backdrop-blur-md rounded-xl border border-slate-200 group-hover:bg-white group-hover:border-transparent group-hover:shadow-md transition-all duration-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* View Details Link */}
                    <Link
                      to={service.path}
                      className={`inline-flex items-center gap-2 font-bold text-sm bg-gradient-to-r ${service.color} text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Glass Card */}
        <div className="relative max-w-4xl mx-auto transform hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white/50 backdrop-blur-2xl p-10 md:p-14 rounded-3xl text-center border border-white/60 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-purple-400/30 rounded-full blur-3xl mix-blend-multiply"></div>

            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:-rotate-6 hover:scale-110 transition-all duration-500 mb-8 border border-white/20 animate-[bounce_3s_infinite]">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-slate-800 tracking-tight">
                More Innovations on the Horizon!
              </h2>
              <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
                We're aggressively expanding our service portfolio to bring you the next generation of tech solutions.
              </p>
              <Link
                to="/contact"
                className="group relative inline-flex items-center justify-center"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl flex items-center gap-3">
                  Contact us to know more
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Services
