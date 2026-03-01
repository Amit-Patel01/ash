const About = () => {
  const services = [
    "Web & Project Development Solutions",
    "PC & Laptop Repair Services", 
    "Video & Photo Editing Solutions",
    "Technical Support & Guidance"
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-10 md:py-16 px-6 md:px-10 text-center relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-4 text-6xl opacity-20">✨</div>
              <div className="absolute bottom-4 right-6 text-6xl opacity-20">🚀</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 relative z-10">
              About Me
            </h1>
            <p className="text-white/90 text-base md:text-lg relative z-10">
              Founder of AmitSolutionHub
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center gap-8 mb-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 md:w-40 h-32 md:h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 glow">
                  <span className="text-5xl md:text-6xl font-bold text-white">AP</span>
                </div>
              </div>

              {/* Info - Centered */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Hi, I'm Amit Patel
                </h2>
                <p className="text-base md:text-xl gradient-text font-semibold mb-4">
                  Full-Stack Developer | PC Technician | Digital Creator
                </p>
                <p className="text-gray-700 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                  I help businesses and individuals build strong digital presence
                  with modern websites, repair services and smart solutions.
                </p>
              </div>
            </div>

            {/* Services Grid */}
            <div className="mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                What I Provide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 flex items-center gap-4 p-4 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 group border border-blue-200"
                  >
                    <span className="text-green-500 text-2xl flex-shrink-0 group-hover:scale-150 transition-transform">✓</span>
                    <span className="text-gray-700 font-semibold text-sm md:text-base">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="bg-indigo-50 p-8 rounded-2xl text-center mb-8 hover:shadow-lg transition-shadow border border-indigo-200">
              <h3 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-4">
                My Mission
              </h3>
              <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                To provide reliable, affordable, and innovative tech solutions
                in one platform — helping people grow in the digital world.
              </p>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <a href="/contact" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Let's Work Together →
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default About
