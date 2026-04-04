import React, { useState, useRef } from 'react';

const TeamMemberCard = ({ member, getImageUrl, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const skills = Array.isArray(member.skills) ? member.skills : [];
  const topSkills = skills.slice(0, 3);
  
  // Dummy data for progress bars
  const skillProgress = [
    { name: skills[0] || 'Technical', value: 92 },
    { name: skills[1] || 'Design', value: 85 },
    { name: skills[2] || 'Leadership', value: 88 },
  ];

  // Advanced Mouse Parallax (Apple/Stripe Style)
  const handleMouseMove = (e) => {
    if (!cardRef.current || isFlipped) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      className="relative team-card shrink-0 w-[300px] sm:w-[380px] lg:w-[420px] h-[550px] perspective-1000 group snap-center animate-fade-in-up fill-mode-both"
      style={{ 
        animationDelay: `${index * 150}ms`,
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-all duration-1000 transform-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative glass-card animate-glow-border rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-between h-full border border-white/40 shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-all duration-500 overflow-hidden group/front">
            
            {/* High-End Noise Texture */}
            <div className="absolute inset-0 noise-bg opacity-[0.03]"></div>
            

            {/* Top Badge */}
            {(member.showOnTeam || index === 0) && (
              <div className="absolute top-8 left-8 px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] z-10">
                {index === 0 ? "Founder" : "Top Member"}
              </div>
            )}

            {/* Avatar Section */}
            <div className="relative mt-4 z-10">
               {/* Online Indicator Pulse */}
              <div className="absolute -top-1 -right-1 z-20">
                <span className="absolute flex h-4 w-4">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                </span>
              </div>

              <div className="relative group/avatar">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-10 group-hover/avatar:opacity-30 transition duration-700 group-hover:scale-110"></div>
                {getImageUrl(member) ? (
                  <img
                    src={getImageUrl(member)}
                    alt={member.displayName}
                    className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:-rotate-2"
                  />
                ) : (
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-xl">
                    {(member.displayName || 'U').charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center w-full mt-6 z-10">
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-2">{member.displayName}</h4>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-sm uppercase tracking-widest mb-6">
                {member.jobTitle || member.role}
              </p>
              
              <p className="text-slate-500 text-base font-medium line-clamp-2 px-6 mb-8 leading-relaxed opacity-80">
                {member.bio || "Pioneering the next generation of digital solutions with a focus on premium UX and scalable architecture."}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {topSkills.map((skill) => (
                  <span key={skill} className="px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-xl text-[11px] font-black text-slate-600 border border-white/50 shadow-sm uppercase tracking-tight">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Row (Revealed on Hover) */}
            <div className="flex items-center justify-center gap-4 z-50 opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-700">
              
              {/* View Profile Button */}
              <div className="relative group/icon">
                <button
                  className="flex p-4 bg-blue-600 text-white rounded-2xl hover:scale-125 hover:-rotate-6 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
                  View Profile
                </div>
              </div>

              {['github', 'portfolio'].map((platform) => (
                member[platform] && (
                  <div key={platform} className="relative group/icon">
                    <a
                      href={member[platform].startsWith('http') ? member[platform] : `https://${platform}.com/${member[platform]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex p-4 bg-white rounded-2xl text-slate-800 hover:text-blue-600 hover:scale-125 hover:-rotate-6 transition-all shadow-xl active:scale-95 border border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {platform === 'github' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>}
                      {platform === 'linkedin' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                      {platform === 'portfolio' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
                    </a>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
                      {platform}
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
              Tap to discover
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="relative glass-card animate-glow-border rounded-[3rem] p-10 md:p-14 flex flex-col justify-between h-full border border-white/40 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white">
            <div className="absolute inset-0 noise-bg opacity-[0.04]"></div>

            <div className="relative w-full z-10">
              <h4 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3">
                <span className="w-12 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                Key Stats
              </h4>

              {/* Progress Bars */}
              <div className="space-y-8">
                {skillProgress.map((skill) => (
                  <div key={skill.name} className="w-full">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{skill.name}</span>
                      <span className="text-xs font-black text-blue-600">{skill.value}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100/50 rounded-full overflow-hidden border border-white p-[2px] shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-[1.5s] cubic-bezier(0.16, 1, 0.3, 1)" 
                        style={{ width: `${isFlipped ? skill.value : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic text-center">
                  "Excellence is not an act, but a habit. I focus on building products that stand the test of time."
                </p>
              </div>
            </div>

            <button className="relative w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 z-10">
              EXPLORE PROFILE
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamMemberCard;
