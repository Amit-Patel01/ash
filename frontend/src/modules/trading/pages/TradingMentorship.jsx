import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'
import Pricing from '../components/Pricing'
import LiveSessions from '../components/LiveSessions'
import EnrollmentList from '../components/EnrollmentList'
import PaymentPanel from '../components/PaymentPanel'
import EmployeeAccess from '../components/EmployeeAccess'
import GraphBackground from '../components/GraphBackground'
import TickerTape from '../components/TickerTape'
import Sparkline from '../components/Sparkline'

const ICON_MAP = {
  book: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>),
  chart: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>),
  bolt: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>),
  trending: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>),
  shield: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>),
  sparkle: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>),
}



const FAQ_DATA = [
  { q: 'Who is this mentorship program designed for?', a: 'This program is designed for anyone interested in learning stock market trading — from complete beginners to intermediate traders looking to refine their strategies.' },
  { q: 'Do I need any prior experience in trading?', a: 'No prior experience is required. Our Basic module starts from the very fundamentals.' },
  { q: 'Are the live sessions recorded?', a: 'Yes, all live sessions are recorded and made available within 24 hours.' },
  { q: 'Is there a refund policy?', a: 'We offer a 7-day money-back guarantee. If you feel the program is not right for you, contact us for a full refund.' },
]

function useInView() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target) }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, isVisible]
}

const DEFAULT_MENTOR = null;

export default function TradingMentorship() {
  const { tradingCourses, tradingSessions, mentorProfile, tradingCurriculum } = useStore()
  const { currentUser, isAdmin, isEmployee } = useAuth()

  const CURRICULUM_TABS = (tradingCurriculum || []).map(m => ({ ...m, icon: ICON_MAP[m.iconName] || ICON_MAP.book }));

  const [activeTab, setActiveTab] = useState(CURRICULUM_TABS[0]?.id || 'basics')
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')



  const upcomingSessions = tradingSessions || []

  const [heroRef, heroVisible] = useInView()
  const [aboutRef, aboutVisible] = useInView()
  const [curriculumRef, curriculumVisible] = useInView()

  const fade = (v) => `transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation Tabs for Admin/Employee */}
      {(isAdmin || isEmployee) && (
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 pt-28">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-3">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'enrollments', label: 'Enrollments' },
                { id: 'payments', label: 'Payments' },
                { id: 'sessions', label: 'Live Sessions' },
                ...(isAdmin ? [{ id: 'access', label: 'Employee Access' }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeSection === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Section */}
      {activeSection === 'enrollments' && (isAdmin || isEmployee) && (
        <section className="pt-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <EnrollmentList isAdmin={isAdmin} />
          </div>
        </section>
      )}

      {/* Payments Section */}
      {activeSection === 'payments' && (isAdmin || isEmployee) && (
        <section className="pt-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <PaymentPanel selectedPlan={selectedPlan} />
          </div>
        </section>
      )}

      {/* Live Sessions Section */}
      {activeSection === 'sessions' && (isAdmin || isEmployee) && (
        <section className="pt-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <LiveSessions />
          </div>
        </section>
      )}

      {/* Employee Access Section (Admin only) */}
      {activeSection === 'access' && isAdmin && (
        <section className="pt-8 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <EmployeeAccess />
          </div>
        </section>
      )}

      {/* Public Overview Section */}
      {activeSection === 'overview' && (
        <>
          <TickerTape />

          {/* HERO */}
          <section ref={heroRef} className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/20 pt-40 md:pt-48">
            <GraphBackground />
            
            <div className={`relative z-10 max-w-5xl mx-auto text-center px-4 ${fade(heroVisible)}`}>
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-blue-200 bg-blue-50">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-blue-700 text-sm font-bold tracking-wide uppercase">Live Mentorship Program</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 text-slate-900">
                Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Stock Market</span>
                <br />with Expert Guidance
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-xl md:max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
                Learn intraday trading, technical analysis, and risk management from a professional trader with 10+ years of market experience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                <a
                  href="#pricing"
                  className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg shadow-xl transition-all duration-300 hover:scale-105 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Enroll Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#curriculum"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-300"
                >
                  View Curriculum
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-500">
                {['1000+ Students Trained', '4.9/5 Rating', 'Live & Recorded Sessions', '7-Day Refund Policy'].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT MENTOR */}
          {mentorProfile && (
            <section ref={aboutRef} className="relative py-20 px-4 bg-white">
              <div className={`max-w-6xl mx-auto ${fade(aboutVisible)}`}>
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">
                    Meet Your <span className="text-blue-600">Mentor</span>
                  </h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Learn from a seasoned professional with a proven track record</p>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-shrink-0">
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-3xl border-4 border-blue-100 overflow-hidden shadow-lg bg-slate-100">
                      {mentorProfile?.photoUrl ? (
                        <img src={mentorProfile.photoUrl} alt={mentorProfile.name || 'Mentor'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <svg className="w-20 h-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <span className="text-xs text-slate-400">Mentor Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">{mentorProfile?.name}</h3>
                    <p className="text-blue-600 font-semibold mb-4">{mentorProfile?.title}</p>
                    <p className="text-slate-500 leading-relaxed mb-6">
                      {mentorProfile?.bio}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      {(mentorProfile?.stats || []).map((stat, i) => (
                        <div key={i} className="text-center p-4 rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group">
                          <p className="text-2xl font-black text-blue-600 mb-1">{stat.value}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">{stat.label}</p>
                          <div className="flex justify-center opacity-40 group-hover:opacity-80 transition-opacity">
                            <Sparkline color={i % 2 === 0 ? '#2563eb' : '#22c55e'} width={60} height={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CURRICULUM */}
          {CURRICULUM_TABS.length > 0 && (
            <section id="curriculum" ref={curriculumRef} className="relative py-20 px-4 bg-slate-50/50">
              <div className={`max-w-6xl mx-auto ${fade(curriculumVisible)}`}>
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">
                    What You'll <span className="text-blue-600">Learn</span>
                  </h2>
                  <p className="text-slate-500 max-w-xl mx-auto">A comprehensive curriculum designed for all levels</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {CURRICULUM_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {CURRICULUM_TABS.map(tab => (
                  activeTab === tab.id && (
                    <div key={tab.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {tab.topics.map((topic, i) => (
                        <div
                          key={i}
                          className="relative flex flex-col p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 group overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-bl-xl tracking-tighter opacity-70">
                            MODULE {i + 1}
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                              <span className="text-blue-600 font-black text-sm">#{(i + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div className="flex-1 border-b border-slate-50 pb-1">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Quote Result</span>
                                <span className="text-[10px] font-bold text-green-500">BUY ★</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-800 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{topic}</p>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          {/* PRICING */}
          <Pricing
            courses={tradingCourses}
            onPlanSelect={setSelectedPlan}
          />

          {/* PAYMENT MODAL */}
          {selectedPlan && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pt-24 md:pt-32">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlan(null)} />
              <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <PaymentPanel
                  selectedPlan={selectedPlan}
                  onPaymentSuccess={() => setSelectedPlan(null)}
                />
              </div>
            </div>
          )}

          {/* LIVE SESSIONS */}
          <LiveSessions />


          {/* FAQ */}
          <section className="py-20 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">
                  Frequently Asked <span className="text-blue-600">Questions</span>
                </h2>
              </div>

              <div className="space-y-3">
                {FAQ_DATA.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 bg-white">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="font-semibold text-slate-900 pr-4">{item.q}</span>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 text-blue-600 ${openFaq === i ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="relative py-24 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
                Ready to Start Your Trading Journey?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10">
                Join thousands of traders who have transformed their approach to the stock market.
              </p>
              <a
                href="#pricing"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-all duration-300 hover:scale-105 bg-white text-blue-700 hover:bg-blue-50"
              >
                Enroll Now & Start Learning
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </section>

          {/* WHATSAPP FLOAT */}
          <a
            href="https://wa.me/919999999999?text=Hi%2C%20I%27m%20interested%20in%20the%20Trading%20Mentorship%20program"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
            style={{ background: '#25D366' }}
            title="Chat on WhatsApp"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </>
      )}
    </div>
  )
}
