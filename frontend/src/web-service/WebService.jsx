import { useEffect, useState } from 'react'

const WebService = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const features = [
    { title: 'Full-Stack Development', description: 'End-to-end web applications built with React, Node.js, and MongoDB/SQL.', icon: '⚡' },
    { title: 'Responsive Design', description: 'Websites that look stunning on desktops, tablets, and mobile devices.', icon: '📱' },
    { title: 'SEO Optimization', description: 'Search-engine friendly code to help your site rank higher and attract more visitors.', icon: '🔍' },
    { title: 'E-Commerce Solutions', description: 'Secure and scalable online stores with integrated payment gateways.', icon: '🛒' },
  ]

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Web & <span className="text-blue-600">Project Development</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From simple landing pages to complex enterprise platforms, we build digital solutions that propel your business forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need a custom project?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Let's discuss your requirements and build something extraordinary together.
          </p>
          <a href="/contact" className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
            Start a Conversation
          </a>
        </div>
      </div>
    </div>
  )
}

export default WebService
