const Services = () => {
  const services = [
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Web & Project Development',
      description: 'Custom websites and web applications built with modern technologies to grow your business online.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'PC & Laptop Repair',
      description: 'Professional hardware and software repair services for all types of computers and laptops.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Video & Photo Editing',
      description: 'Professional editing services for videos and photos to make your content stand out.',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Technical Support & Guidance',
      description: 'Expert technical support and guidance to help you solve any tech-related issues.',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Our Services
          </h1>
          <p className="text-base md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            We provide comprehensive tech solutions to help your business grow and succeed in the digital world.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 justify-items-center">
          {services.map((service, index) => (
            <div 
              key={index}
              className="w-full max-w-sm bg-white rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-gray-200 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0`}></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`text-white mb-5 inline-block p-4 rounded-xl bg-gradient-to-br ${service.color} shadow-lg transform group-hover:scale-125 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-600">
              🚀 More Services Coming Soon!
            </h2>
            <p className="text-gray-700 text-base md:text-lg">
              We're constantly expanding our services to provide you with the best tech solutions.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Services
