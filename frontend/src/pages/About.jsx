import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { API_BASE } from '../config/api'

const About = () => {
  const { users, teamMembers } = useStore() // Use both states
  const [loaded, setLoaded] = useState(false)

  // Derive final team list: 
  // 1. Get all members from the 'team' collection (legacy)
  // 2. Enrich them with 'users' data if an Employee ID or Email matches
  const finalTeamMembers = (() => {
    const combined = []
    const seenEmails = new Set()
    
    // Safety check for arrays - Use empty arrays if data is still fetching
    const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : []
    const safeUsers = Array.isArray(users) ? users : []

    // Process legacy team members (Current Team tab)
    safeTeamMembers.forEach(member => {
      if (!member) return
      
      const memberEmail = (member.email || "").toLowerCase()
      const memberId = member.employeeId || ""

      // Check if this person has a formal Employee record
      const linkedUser = safeUsers.find(u => 
        (u.employeeId && memberId && u.employeeId === memberId) || 
        (u.email && memberEmail && u.email.toLowerCase() === memberEmail)
      )
      
      if (linkedUser) {
        // Merge - User Profile from Admin takes priority
        combined.push({
          ...member,
          ...linkedUser,
          displayName: linkedUser.displayName || member.name,
          jobTitle: linkedUser.jobTitle || member.role,
          id: member.id || linkedUser.uid
        })
        if (memberEmail) seenEmails.add(memberEmail)
      } else {
        // Just show the old Team entry
        combined.push({
          ...member,
          displayName: member.name,
          jobTitle: member.role
        })
        if (memberEmail) seenEmails.add(memberEmail)
      }
    })

    // Also add any NEW Employees marked with 'Show on Team Page'
    safeUsers.forEach(user => {
      if (!user) return
      const userEmail = (user.email || "").toLowerCase()
      if (user.showOnTeam && user.status === 'active' && !seenEmails.has(userEmail)) {
        combined.push({
          ...user,
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          id: user.uid || user.id
        })
      }
    })

    return combined
  })()

  useEffect(() => {
    setLoaded(true)
  }, [])

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

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-2 tracking-tight flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-slate-800">
            Hi
            <svg className="w-8 sm:w-10 md:w-12 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
          const getImageUrl = (member) => {
            if (!member) return null;
            const { github, linkedin, avatarSource } = member;
            
            // If LinkedIn/URL source is selected and exists, use it
            if (avatarSource === 'linkedin' && linkedin) {
              return linkedin;
            }
            
            // Fallback to GitHub if source is github OR if linkedin source is empty
            if (github) {
              if (github.startsWith('http')) return github;
              return `https://github.com/${github}.png`;
            }
            
            return null;
          }

          return finalTeamMembers.length > 0 && (
            <div id="team-section" className="mb-24 scroll-mt-28">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-4">Meet Our <span className="text-blue-600">Team</span></h3>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">The talented individuals working behind the scenes to deliver excellence at AmitSolutionHub.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {finalTeamMembers.map((member, index) => (
                  <div
                    key={member.uid || member.id}
                    className="group relative bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-blue-500/5 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                    <div className="relative flex flex-col items-center text-center w-full">
                      <div className="relative mb-3 sm:mb-5 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        {getImageUrl(member) ? (
                          <img
                            src={getImageUrl(member)}
                            alt={member.displayName}
                            className="relative w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl object-cover border-2 border-white shadow-xl"
                          />
                        ) : (
                          <div className="relative w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white shadow-md">
                            {(member.displayName || 'U').charAt(0)}
                          </div>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-1">{member.displayName}</h4>
                      <p className="text-blue-600 font-semibold text-xs sm:text-sm mb-3 sm:mb-4">{member.jobTitle || member.role}</p>

                      <div className="flex flex-wrap justify-center gap-1 mb-4 sm:mb-6">
                        {(Array.isArray(member.skills) ? member.skills : []).slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 sm:py-1 bg-white/60 rounded-lg text-[11px] sm:text-[13px] font-bold text-slate-500 border border-white/50">{skill}</span>
                        ))}
                      </div>

                      <a
                        href={member.github?.startsWith('http') ? member.github : `https://github.com/${member.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-md group/link"
                      >
                        <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        <span className="hidden sm:inline">GitHub Profile</span>
                        <span className="sm:hidden">GitHub</span>
                        <span className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all">→</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Main Content Grid */}

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">🎯 Mission</h4>
            <p className="text-blue-100 text-sm sm:text-base">To build reliable and practical digital solutions that solve real-world problems efficiently.</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">🔭 Vision</h4>
            <p className="text-indigo-100 text-sm sm:text-base">To grow AmitSolutionHub into a trusted tech platform combining development and technical support.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/60 shadow-xl transform hover:-translate-y-2 transition-all">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-800">💡 Core Values</h4>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {["Security First", "Creativity", "Growth", "Learning", "Performance"].map(v => (
                <span key={v} className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold">{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Categories */}
        <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-8 sm:mb-10">🛠 Tech Stack</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'C++'].map(lang => (
                  <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">{lang}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Express', 'Next.js', 'Tailwind', 'Flutter'].map(fw => (
                  <span key={fw} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">{fw}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Tools & Database</h4>
              <div className="flex flex-wrap gap-2">
                {['Git', 'GitHub', 'MongoDB', 'Firebase', 'Vercel', 'Postman'].map(tool => (
                  <span key={tool} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">{tool}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
              <h4 className="font-bold mb-3 text-slate-700 text-sm">Operating Systems</h4>
              <div className="flex flex-wrap gap-2">
                {['Windows', 'Linux', 'Ubuntu'].map(os => (
                  <span key={os} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">{os}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xl font-medium text-slate-600 mb-8 italic">⭐ "Building Solutions. Solving Problems. Creating Impact."</p>
         
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