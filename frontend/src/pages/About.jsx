import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const About = () => {
  const [loaded, setLoaded] = useState(false)

  const services = [
    { icon: '💻', title: 'Web Development', desc: 'Custom websites built with modern technologies' },
    { icon: '🔧', title: 'PC & Laptop Repair', desc: 'Professional hardware & software repair' },
    { icon: '🎬', title: 'Video & Photo Editing', desc: 'Creative editing for videos and photos' },
    { icon: '🛠️', title: 'Technical Support', desc: 'Expert technical guidance and support' }
  ]

  const techStack = [
    { name: "HTML", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: ".NET", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg" },
    { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    { name: "GitHub", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    { name: "Vercel", logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" },
    { name: "Angular", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
    { name: "Arduino", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg" },
    { name: "Photoshop", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg" },
    { name: "VS Code", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" }
  ];

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-screen pt-28 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-10 -left-20 w-[30rem] h-[30rem] bg-blue-500/30 rounded-full blur-[100px] animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[100px] animate-[bounce_8s_infinite]"></div>
      </div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      {/* Main Container */}
      <div className={`relative z-20 max-w-6xl mx-auto px-4 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>

        {/* Hero Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-12 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Avatar with Glow */}
              <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 transform group-hover:rotate-y-12 transition-transform duration-500">
                  <span className="text-6xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">AP</span>
                  <div className="absolute -bottom-4 -right-4 bg-green-500 w-8 h-8 rounded-full border-4 border-white animate-bounce shadow-lg"></div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center lg:text-left flex-1 space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 font-medium text-sm mb-2 backdrop-blur-md shadow-sm">
                  Welcome to my portfolio
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
                  Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Amit Patel</span>
                </h2>
                <p className="text-xl font-semibold text-indigo-600">
                  Founder of AmitSolutionHub
                </p>
                <p className="text-slate-600 leading-relaxed max-w-2xl text-lg mix-blend-multiply">
                  I specialize in crafting beautiful web experiences, providing expert hardware solutions, and helping businesses establish a commanding digital presence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Tech Stack */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/60 p-8 transform hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">⚙️</span>
              <h3 className="text-2xl font-bold text-slate-800">Tech Stack</h3>
            </div>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {techStack.map((tech, index) => (
                <div 
                  key={index}
                  className="group relative flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] md:w-[5rem] md:h-[5rem] bg-white/40 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-110 cursor-default"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <img 
                    src={tech.logo} 
                    alt={tech.name} 
                    className="w-10 h-10 object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Hover Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none z-50">
                    {tech.name}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl border border-slate-700 p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-3xl font-bold">GitHub</h3>
                  </div>
                  <p className="text-slate-300 mb-8 text-lg">
                    Explore my open source projects, including AI platforms and full-stack React applications.
                  </p>
                </div>
                <a
                  href="https://github.com/Amit-Patel01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors duration-300 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Visit Profile
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full duration-1000"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-10">What I Provide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 hover:-translate-y-3 hover:shadow-2xl hover:bg-white/60 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pb-10">
          <Link
            to="/contact"
            className="group relative inline-flex items-center justify-center"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-full font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl flex items-center gap-3">
              Let's Work Together
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default About