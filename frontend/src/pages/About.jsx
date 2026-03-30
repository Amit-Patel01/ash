import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { API_BASE } from '../config/api'

const About = () => {
  const { teamMembers } = useStore()
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

  return (
    <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4">

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

          <h1 className="text-5xl md:text-7xl font-extrabold mb-2 tracking-tight flex flex-wrap justify-center items-center gap-4">
            Hi
            <svg className="w-12 h-12 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 7.364l4.5 1.636m-18 5.455l4.5-1.636m13.5 1.636l4.5-1.636" />
            </svg>,
            I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Amit Patel</span>
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
            <button
              onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 bg-white text-blue-600 border border-blue-100 rounded-2xl font-bold shadow-lg hover:bg-blue-50 hover:-translate-y-1 transition-all"
            >
              Meet Our Team
            </button>
          </div>
        </div>

        {/* Team Section */}
        {(() => {
          const getImageUrl = (github) => {
            if (!github) return null;
            if (github.startsWith('http')) return github;
            return `https://github.com/${github}.png`;
          }

          return teamMembers.length > 0 && (
            <div id="team-section" className="mb-24 scroll-mt-28">
              <div className="text-center mb-12">
                <h3 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Meet Our <span className="text-blue-600">Team</span></h3>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">The talented individuals working behind the scenes to deliver excellence at AmitSolutionHub.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.filter(m => m.status === 'Active').map((member, index) => (
                  <div
                    key={member.id}
                    className="group relative bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                    <div className="relative flex flex-col items-center text-center w-full">
                      <div className="relative mb-5 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        {member.github ? (
                          <img
                            src={getImageUrl(member.github)}
                            alt={member.name}
                            className="relative w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-xl"
                          />
                        ) : (
                          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <h4 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h4>
                      <p className="text-blue-600 font-semibold text-sm mb-4">{member.role}</p>

                      <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                        {(member.skills || []).slice(0, 3).map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-white/60 rounded-lg text-[15px] font-bold text-slate-500 border border-white/50">{skill}</span>
                        ))}
                      </div>

                      {member.github && !member.github.startsWith('http') && (
                        <a
                          href={`https://github.com/${member.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md group/link"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                          View Profile
                          <span className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all">→</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* About Me Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-xl group hover:shadow-2xl transition-all h-full">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
              </svg> About Me
            </h3>
            <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="font-semibold">B.Tech IT Student</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold">Founder of AmitSolutionHub</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Full-Stack Developer (MERN, PHP, .NET)</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="font-semibold">UI/UX Designer & Creative Editor</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">PC & Laptop Technician</span>
              </p>
              <p className="mt-6 pt-4 border-t border-slate-200">
                I love building practical systems that combine <span className="text-blue-600 font-bold">clean design, security, and performance.</span>
              </p>
            </div>
          </div>

          {/* Journey Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-xl group hover:shadow-2xl transition-all h-full">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg> My Journey
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
              <p className="mt-2 italic flex items-center gap-2">
                The journey is still in progress — and I’m committed to improving every day.
                <svg className="w-5 h-5 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
                </svg>
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
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto max-w-fit"
            >
              Let's Build Something Great
              <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default About