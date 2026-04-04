import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { API_BASE } from '../config/api'
import TeamMemberCard from '../components/TeamMemberCard'

const About = () => {
  const { users, teamMembers } = useStore() 
  const [loaded, setLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef(null)

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

  // Auto-Scroll Tech Carousel
  useEffect(() => {
    if (isPaused || !carouselRef.current || finalTeamMembers.length <= 1) return

    const interval = setInterval(() => {
      const el = carouselRef.current
      const cardWidth = el.querySelector('.team-card')?.offsetWidth || 350
      const gap = 24 // matching flex gap-6
      
      if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused, finalTeamMembers])

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return
    const el = carouselRef.current
    const cardWidth = el.querySelector('.team-card')?.offsetWidth || 350
    const gap = 24
    const scrollAmount = cardWidth + gap

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4 overflow-hidden">
      {/* Premium Background Glow Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30"></div>
        
        {/* Animated Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-300/10 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-300/10 rounded-full blur-[150px] animate-blob delay-2000"></div>
        <div className="absolute top-[30%] right-[5%] w-[50%] h-[50%] bg-indigo-300/10 rounded-full blur-[150px] animate-blob delay-4000"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[50%] h-[50%] bg-cyan-300/10 rounded-full blur-[150px] animate-blob delay-5000"></div>

        {/* Soft Noise Texture Layer */}
        <div className="absolute inset-0 noise-bg opacity-[0.02]"></div>
        
        {/* Subtle Backdrop Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>


      <div className={`relative z-20 max-w-6xl mx-auto px-4 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>


        {/* Header Section */}
        <div className="relative mb-24 lg:mb-32">
          {/* Decorative backdrop glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 glass-card animate-glow-border rounded-[3rem] p-8 md:p-16 text-center overflow-hidden">
            {/* GitHub Profile Fetch with Hover Overlay */}
            <div className="relative inline-block mb-10 group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:scale-110"></div>
              
              <div className="relative">
                <img
                  src="https://github.com/Amit-Patel01.png"
                  alt="Amit Patel"
                  className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-8 border-white/80 object-cover shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:rotate-3"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white/90 px-4 py-1.5 rounded-full text-blue-600 text-xs font-black shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    ONLINE & ACTIVE
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white animate-pulse shadow-lg ring-4 ring-green-500/20"></div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tighter flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-slate-900">
                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Amit Patel</span>
              </h1>
              
              <p className="text-xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-8 tracking-tight">
                Founder of AmitSolutionHub
              </p>

              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-12 px-2 md:px-12 opacity-80">
                I specialize in crafting <span className="text-slate-900 font-bold">premium web experiences</span>, providing expert hardware solutions, and helping businesses establish a commanding digital presence that scales.
              </p>

              {/* Social Icons Row */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
                <a 
                  href="https://portfolio.amitsolutionhub.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group/social p-4 bg-white/80 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-white/50"
                  title="Portfolio"
                >
                  <svg className="w-6 h-6 text-blue-600 group-hover/social:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a 
                  href="https://github.com/Amit-Patel01" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group/social p-4 bg-slate-900 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  title="GitHub"
                >
                  <svg className="w-6 h-6 text-white group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/amit-patel-341a02195/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group/social p-4 bg-blue-700 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  title="LinkedIn"
                >
                  <svg className="w-6 h-6 text-white group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-2 px-10 py-4 bg-white/80 text-blue-600 border border-blue-100 rounded-2xl font-black shadow-xl hover:bg-blue-600 hover:text-white transition-all duration-500"
                >
                  MEET OUR TEAM
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
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
            <div id="team-section" className="relative mb-24 scroll-mt-28 py-10 overflow-hidden">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px] animate-blob pointer-events-none"></div>
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-[100px] animate-blob pointer-events-none delay-1000"></div>

              <div className="relative z-10 text-center mb-12 animate-reveal px-4">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
                  Meet Our <span className="text-blue-600">Team</span>
                </h3>
                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-6 italic"></div>
                <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed animate-reveal fill-mode-both" style={{ animationDelay: '200ms' }}>
                  The talented individuals working behind the scenes at <span className="text-blue-600 font-bold">AmitSolutionHub</span>.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    {isPaused ? 'Paused' : 'Auto-Scrolling'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">(Hover to pause)</div>
                </div>
              </div>

              {/* Horizontal Slider Wrapper with Navigation Buttons */}
              <div className="relative group/carousel px-4">
                {/* Navigation Buttons - Hidden on Mobile, Hover reveal on Desktop */}
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full glass-morphism animate-glow-border text-blue-600 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 hover:scale-110 hover:bg-blue-600 hover:text-white hidden md:flex items-center justify-center shadow-2xl"
                  aria-label="Previous Team Member"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <button 
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full glass-morphism animate-glow-border text-blue-600 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 hover:scale-110 hover:bg-blue-600 hover:text-white hidden md:flex items-center justify-center shadow-2xl"
                  aria-label="Next Team Member"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <div 
                  ref={carouselRef}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className="relative z-10 flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 px-6 sm:px-12 pb-12 cursor-grab active:cursor-grabbing scroll-smooth"
                >
                  {finalTeamMembers.map((member, index) => (
                    <TeamMemberCard 
                      key={member.uid || member.id}
                      member={member}
                      getImageUrl={getImageUrl}
                      index={index}
                    />
                  ))}
                </div>
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