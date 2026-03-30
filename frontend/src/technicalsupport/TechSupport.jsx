import { useEffect, useState } from 'react'

const TechSupport = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const supportTypes = [
    { title: '24/7 Priority Support', description: 'Round-the-clock assistance for critical technical emergencies.', icon: '🕒' },
    { title: 'Remote Consultation', description: 'Expert guidance on software selection, system architecture, and security.', icon: '🛡️' },
    { title: 'Network Setup', description: 'Assistance with office or home network configuration and security.', icon: '🌐' },
    { title: 'Custom Tech Guidance', description: 'Personalized training Sessions on how to master your tools and workflow.', icon: '💡' },
  ]

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Technical <span className="text-amber-500">Support & Guidance</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Your partner in solving technical challenges and navigating the digital world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {supportTypes.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-500 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -translate-y-1/2"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need expert advice?</h2>
          <p className="text-amber-50 text-lg mb-10 max-w-2xl mx-auto">
            Skip the frustration and talk to a professional today.
          </p>
          <a href="/contact" className="inline-block bg-white text-amber-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg">
            Get Support Now
          </a>
        </div>
      </div>
    </div>
  )
}

export default TechSupport
