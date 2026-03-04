import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const About = () => {
  const [loaded, setLoaded] = useState(false)

  const services = [
    { icon: '💻', title: 'Web Development', desc: 'Custom websites and web applications built with modern technologies' },
    { icon: '🔧', title: 'PC & Laptop Repair', desc: 'Professional hardware and software repair services' },
    { icon: '🎬', title: 'Video & Photo Editing', desc: 'Professional editing services for videos and photos' },
    { icon: '🛠️', title: 'Technical Support', desc: 'Expert technical support and guidance' }
  ]

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-screen pt-28 pb-20 overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-[2] bg-grid opacity-30"></div>

      {/* Main Content Container */}
      <div
        className={`relative z-20 max-w-6xl mx-auto px-4 transition-all duration-1000 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              About Me
            </h1>
            <p className="text-white/90">
              Founder of AmitSolutionHub
            </p>
          </div>

          <div className="p-8 md:p-12">

            {/* Profile Section */}
            <div className="flex flex-col lg:flex-row items-center gap-10 mb-14">

              {/* Avatar */}
              <div className="w-36 md:w-44 h-36 md:h-44 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-bold text-white">AP</span>
              </div>

              {/* Info */}
              <div className="text-center lg:text-left flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  Hi, I'm{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Amit Patel
                  </span>
                </h2>

                <p className="text-lg font-semibold text-blue-600 mb-4">
                  Full-Stack Developer • PC Technician • Digital Creator
                </p>

                <p className="text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  I help businesses and individuals build strong digital presence
                  with modern websites, repair services and smart solutions.
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="mb-14">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
                What I Provide
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition duration-300 border border-gray-100"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl text-white">
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {service.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center border border-white/40 shadow-md mb-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">
                My Mission
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                To provide reliable, affordable, and innovative tech solutions
                in one platform — helping people grow in the digital world.
              </p>
            </div>

            {/* GitHub Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-md mb-12">
              <div className="text-4xl mb-4">🐙</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                My GitHub
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Explore my coding projects including AI Quiz Platform, Car Service Website, and React applications.
              </p>
              <a
                href="https://github.com/Amit-Patel01"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition duration-300"
              >
                Visit GitHub →
              </a>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                to="/contact"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition duration-300"
              >
                Let's Work Together →
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default About