import { useEffect, useState } from 'react'

const RepairService = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const services = [
    { title: 'Hardware Repair', description: 'Screen replacement, keyboard fixing, battery upgrades, and internal cleaning.', icon: '🔧' },
    { title: 'Software Troubleshooting', description: 'OS installation, virus removal, driver updates, and performance tuning.', icon: '💻' },
    { title: 'Data Recovery', description: 'Safe extraction of lost data from damaged hard drives and SSDs.', icon: '💾' },
    { title: 'Upgrades & Optimization', description: 'RAM and SSD upgrades to make your old laptop run like new.', icon: '🚀' },
  ]

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            PC & <span className="text-indigo-600">Laptop Repair</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Fast, reliable, and affordable computer repair services by expert technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Device giving you trouble?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Bring it to us or request a remote diagnostic session.
          </p>
          <a href="/contact" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
            Book a Repair
          </a>
        </div>
      </div>
    </div>
  )
}

export default RepairService
