import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const About = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const techStack = {
    languages: "c,cs,html,java,js,php,ts,python,cpp",
    frameworks: "angular,bootstrap,django,express,fastapi,flask,nextjs,nodejs,react,spring,tailwind,threejs,dotnet",
    tools: "git,github,vercel,netlify,npm,arduino,postman",
    os: "windows,linux"
  }

  const expertise = {
    development: [
      "MERN Stack Applications",
      "PHP & MySQL Projects",
      "Authentication & Login Systems",
      "Admin & Client Dashboards",
      "Payment Integration (UPI/QR)",
      "REST API Basics"
    ],
    technical: [
      "PC & Laptop Troubleshooting",
      "SSD / HDD / RAM Upgrades",
      "Windows Installation & BIOS Fix",
      "System Optimization",
      "Network & WiFi Setup"
    ]
  }

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-screen pt-28 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-10 -left-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[100px] animation-delay-2000 animate-pulse"></div>
        <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] animation-delay-4000 animate-pulse"></div>
      </div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className={`relative z-20 max-w-6xl mx-auto px-4 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>

        {/* Header Section */}
        <div className="text-center mb-16">
          {/* GitHub Profile Fetch */}
          <div className="relative inline-block mb-8 group mt-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
            <img
              src="https://github.com/Amit-Patel01.png"
              alt="Amit Patel"
              className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white animate-pulse shadow-lg"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-2 tracking-tight">
            Hi 👋, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Amit Patel</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-6">
            Founder of AmitSolutionHub
          </p>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 px-4">
            I specialize in crafting beautiful web experiences, providing expert hardware solutions, and helping businesses establish a commanding digital presence.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://portfolio.amitsolutionhub.com/" target="_blank" rel="noreferrer" className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
              Visit Portfolio
            </a>
            <a href="https://github.com/Amit-Patel01" target="_blank" rel="noreferrer" className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all">
              GitHub Profile
            </a>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          {/* About Me Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-xl group hover:shadow-2xl transition-all h-full">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-blue-600 text-3xl">🚀</span> About Me
            </h3>
            <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
              <p className="flex items-center gap-3">🎓 <span className="font-semibold">B.Tech IT Student</span></p>
              <p className="flex items-center gap-3">🏢 <span className="font-semibold">Founder of AmitSolutionHub</span></p>
              <p className="flex items-center gap-3">💻 <span className="font-semibold">Full-Stack Developer (MERN, PHP, .NET)</span></p>
              <p className="flex items-center gap-3">🎨 <span className="font-semibold">UI/UX Designer & Creative Editor</span></p>
              <p className="flex items-center gap-3">🖥 <span className="font-semibold">PC & Laptop Technician</span></p>
              <p className="mt-6 pt-4 border-t border-slate-200">
                I love building practical systems that combine <span className="text-blue-600 font-bold">clean design, security, and performance.</span>
              </p>
            </div>
          </div>

          {/* Journey Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-xl group hover:shadow-2xl transition-all h-full">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-indigo-600 text-3xl">🌟</span> My Journey
            </h3>
            <div className="space-y-4 text-slate-700 text-base leading-relaxed">
              <p>
                My journey into technology didn’t start with big resources — it started with <span className="font-bold">curiosity and consistency.</span>
              </p>
              <div className="flex gap-4 items-start bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <span className="font-bold text-blue-600">2018:</span>
                <p>Started learning web dev, evolving from static pages to dynamic full-stack apps.</p>
              </div>
              <div className="flex gap-4 items-start bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="font-bold text-indigo-600">2020:</span>
                <p>Entered PC Repair field, strengthening troubleshooting and problem-solving skills.</p>
              </div>
              <p className="mt-2 italic">
                The journey is still in progress — and I’m committed to improving every day. 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">🎯 Mission</h4>
            <p className="text-blue-100">To build reliable and practical digital solutions that solve real-world problems efficiently.</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-8 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">🔭 Vision</h4>
            <p className="text-indigo-100">To grow AmitSolutionHub into a trusted tech platform combining development and technical support.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-xl font-bold mb-4 text-slate-800">💡 Core Values</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {["Security First", "Creativity", "Growth", "Learning", "Performance"].map(v => (
                <span key={v} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Categories */}
        <div className="space-y-8 mb-16">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-10">🛠 Tech Stack</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Development Tools */}
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Development Tools</h4>
              <div className="flex flex-wrap gap-2">
                <img src="https://cdn.simpleicons.org/mongodb" alt="MongoDB" className="h-6 md:h-8 w-auto object-contain" />
                <img src="https://cdn.simpleicons.org/git" alt="Git" className="h-6 md:h-8 w-auto object-contain" />
                <img src="https://cdn.simpleicons.org/github" alt="GitHub" className="h-6 md:h-8 w-auto object-contain" />
              </div>
            </div>

            {/* Languages & Frameworks */}
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg lg:col-span-3">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Languages & Frameworks</h4>
              <div className="flex flex-col gap-3">
                <img src={`https://skillicons.dev/icons?i=${techStack.languages}`} alt="Languages" className="h-6 md:h-8 w-auto object-contain self-start" />
                <img src={`https://skillicons.dev/icons?i=${techStack.frameworks}`} alt="Frameworks" className="h-6 md:h-8 w-auto object-contain self-start" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Tools & DevOps</h4>
              <img src={`https://skillicons.dev/icons?i=${techStack.tools}`} alt="Tools" className="h-6 md:h-8 w-auto object-contain" />
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Operating Systems</h4>
              <img src={`https://skillicons.dev/icons?i=${techStack.os}`} alt="OS" className="h-6 md:h-8 w-auto object-contain" />
            </div>
          </div>
        </div>



        {/* CTA */}
        <div className="text-center">
          <p className="text-xl font-medium text-slate-600 mb-8 italic">⭐ "Building Solutions. Solving Problems. Creating Impact."</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href="https://www.linkedin.com/in/amit-patel-89736b287/" target="_blank" rel="noreferrer">
              <img src="https://skillicons.dev/icons?i=linkedin" height="40" alt="LinkedIn" className="hover:scale-110 transition-transform" />
            </a>
            <a href="https://www.instagram.com/amiitt_4084" target="_blank" rel="noreferrer">
              <img src="https://skillicons.dev/icons?i=instagram" height="40" alt="Instagram" className="hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:amitpatel07029@gmail.com">
              <img src="https://skillicons.dev/icons?i=gmail" height="40" alt="Email" className="hover:scale-110 transition-transform" />
            </a>
          </div>
          <div className="mt-12">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all inline-block"
            >
              Let's Build Something Great 🚀
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default About