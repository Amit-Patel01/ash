'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Server,
  Network,
  Cpu,
  ShieldCheck,
  Tv,
  Layers,
  Sparkles,
  ArrowRight,
  Globe,
  BrainCircuit,
  Rocket,
  Code,
  FileText,
  Megaphone,
  GraduationCap,
  Award,
  Users,
  CandlestickChart
} from 'lucide-react'

const coreInfrastructure = [
  {
    icon: Server,
    title: 'End-to-End Training Infrastructure',
    desc: 'We are a full-cycle skill-training organisation with in-house resources to design, mentor, and deliver every stage of our internship programs.',
    details: ['Structured curriculum design', 'In-house mentor team', 'Project-based learning tracks', 'Certificate & assessment pipeline']
  },
  {
    icon: Network,
    title: 'Reliable Online Learning Setup',
    desc: 'High-speed connectivity and stable platforms ensure smooth live sessions, quick doubt resolution, and uninterrupted access to learning material.',
    details: ['Low-latency live classes', 'Cloud-hosted resources', 'Recorded session backups', 'Secure student portal access']
  },
  {
    icon: Cpu,
    title: 'Modern Practice Environments',
    desc: 'Our labs and virtual environments are configured to handle real coding practice, AI model training, and live market simulation for stock trading modules.',
    details: ['Dedicated coding sandboxes', 'AI/ML practice environments', 'Simulated trading dashboards', 'Cross-device accessibility']
  },
  {
    icon: ShieldCheck,
    title: 'Data & Student Privacy Protection',
    desc: 'Student records, project submissions, and certificate data are protected through encryption, access control, and secure record-keeping practices.',
    details: ['Encrypted student records', 'Controlled admin access', 'Secure certificate issuance', 'Privacy-first data handling']
  },
  {
    icon: Tv,
    title: 'Interactive Live Sessions',
    desc: 'Screen-sharing, live coding walkthroughs, and interactive Q&A tools make every session hands-on rather than one-way lectures.',
    details: ['Live code-along sessions', 'Interactive doubt sessions', 'Screen-share demonstrations', 'Recorded session library']
  },
  {
    icon: Layers,
    title: 'Scalable Program Architecture',
    desc: 'Our internship tracks are modular by design, allowing learners to progress from fundamentals to advanced, project-based, industry-relevant work.',
    details: ['Beginner to advanced tracks', 'Real-world mini projects', 'Structured weekly milestones', 'Progress tracking for mentors']
  }
]

const services = [
  {
    category: 'Web Development Internship',
    items: ['HTML, CSS & JavaScript', 'React & Modern Frontend', 'Node.js Backend Basics', 'Full-stack Mini Projects', 'Git & Deployment'],
    icon: Code,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    category: 'AI Internship',
    items: ['Python for AI', 'Machine Learning Basics', 'Neural Networks Intro', 'AI Project Building', 'Real-world Use Cases'],
    icon: BrainCircuit,
    color: 'from-indigo-500 to-purple-600'
  },
  {
    category: 'Stock Market Internship',
    items: ['Market Fundamentals', 'Technical Analysis', 'Trading Strategies', 'Risk Management', 'Live Market Practice'],
    icon: CandlestickChart,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    category: 'Emerging Technologies',
    items: ['Cloud Computing Basics', 'Automation Tools', 'App Development', 'Data Analysis', 'Industry Trends'],
    icon: Rocket,
    color: 'from-orange-500 to-amber-600'
  },
  {
    category: 'Mentorship & Support',
    items: ['1:1 Doubt Sessions', 'Resume & Portfolio Help', 'Project Reviews', 'Mock Interviews', 'Career Guidance'],
    icon: Users,
    color: 'from-rose-500 to-red-600'
  },
  {
    category: 'Certification',
    items: ['Completion Certificate', 'Skill Assessment', 'Project Showcase', 'Verified Credentials', 'LOR on Request'],
    icon: Award,
    color: 'from-violet-500 to-purple-600'
  }
]

const capabilities = [
  {
    icon: Globe,
    title: 'Web Development Training',
    desc: 'Hands-on training in building responsive, modern websites using current frontend and backend technologies',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: BrainCircuit,
    title: 'Artificial Intelligence Internship',
    desc: 'Practical exposure to AI and machine learning concepts through guided projects and real datasets',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    icon: CandlestickChart,
    title: 'Stock Market Training',
    desc: 'Understanding market fundamentals, chart reading, and strategy building through simulated practice',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Rocket,
    title: 'Emerging Technologies Program',
    desc: 'Introduction to fast-growing tech areas so learners stay ahead of industry shifts',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: FileText,
    title: 'Project-Based Learning',
    desc: 'Every track ends with real project work so learners have something concrete to showcase',
    color: 'from-sky-500 to-blue-600'
  },
  {
    icon: GraduationCap,
    title: 'Structured Internship Batches',
    desc: 'Fixed-duration batches with clear milestones, mentor check-ins, and defined outcomes',
    color: 'from-slate-500 to-zinc-600'
  },
  {
    icon: Award,
    title: 'Certification on Completion',
    desc: 'Verified certificates issued on successful completion of the program and final assessment',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: Users,
    title: 'Personal Mentorship',
    desc: 'Dedicated mentor support for doubts, code reviews, and guidance throughout the internship',
    color: 'from-rose-500 to-red-600'
  },
  {
    icon: Megaphone,
    title: 'Career Guidance',
    desc: 'Resume building, interview preparation, and guidance on next steps after the internship',
    color: 'from-teal-500 to-emerald-600'
  }
]

const techStack = [
  {
    category: 'Web Development',
    techs: [
      { name: 'HTML5', icon: '🌐' },
      { name: 'CSS3', icon: '🎨' },
      { name: 'JavaScript', icon: '📜' },
      { name: 'React JS', icon: '⚛️' },
      { name: 'Node.js', icon: '🟢' },
      { name: 'Tailwind CSS', icon: '🌊' },
      { name: 'Git & GitHub', icon: '🔧' },
      { name: 'REST APIs', icon: '🔗' }
    ]
  },
  {
    category: 'AI & Data',
    techs: [
      { name: 'Python', icon: '🐍' },
      { name: 'NumPy', icon: '🔢' },
      { name: 'Pandas', icon: '📊' },
      { name: 'Scikit-learn', icon: '🤖' },
      { name: 'TensorFlow Basics', icon: '🧠' },
      { name: 'Data Visualization', icon: '📈' }
    ]
  },
  {
    category: 'Stock Market Tools',
    techs: [
      { name: 'TradingView', icon: '📉' },
      { name: 'Technical Indicators', icon: '📐' },
      { name: 'Chart Patterns', icon: '📊' },
      { name: 'Market Simulators', icon: '🕹️' }
    ]
  },
  {
    category: 'Mobile & Emerging Tech',
    techs: [
      { name: 'Flutter', icon: '🦋' },
      { name: 'Android Basics', icon: '📲' },
      { name: 'Cloud Fundamentals', icon: '☁️' },
      { name: 'Automation Tools', icon: '⚙️' }
    ]
  },
  {
    category: 'Learning Platform',
    techs: [
      { name: 'Live Classes', icon: '🎥' },
      { name: 'Recorded Sessions', icon: '📼' },
      { name: 'Assignments Portal', icon: '📝' },
      { name: 'Progress Tracking', icon: '✅' }
    ]
  }
]

export default function Infrastructure() {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [activeService, setActiveService] = useState(null)

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_46%,#f4fbf7_100%)] px-4 py-28 text-slate-900 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#071b18_100%)] dark:text-white sm:px-6 lg:px-8">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            End-to-End Internship & Training Infrastructure
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5.5xl leading-tight mb-6">
            Structured Programs. Real Mentorship. Real Skills.
          </h1>
          <p className="text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            AmitSolutionHub is a skill-based internship and training company built to give learners hands-on, project-driven experience — not just theory.
          </p>
          <p className="text-base leading-7 text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mt-4">
            From Web Development to AI, Stock Market, and Emerging Technologies — every program is designed around real projects, mentor support, and industry-relevant outcomes.
          </p>
        </div>

        <div className="mb-20 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Learn More
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Core Infrastructure Grid */}
        <div className="mb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
              Our Infrastructure
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A dependable learning foundation designed to deliver quality instruction, mentorship, and secure student data handling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreInfrastructure.map((spec, idx) => {
              const Icon = spec.icon
              const isHovered = hoveredIdx === idx
              return (
                <div
                  key={idx}
                  className="group relative rounded-3xl border border-white/80 bg-white/70 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-950/40 dark:shadow-black/20"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className={`absolute top-8 left-8 w-12 h-12 rounded-2xl bg-blue-500/20 blur-xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 dark:bg-white dark:text-slate-950">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                    {spec.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {spec.desc}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    <ul className="space-y-2">
                      {spec.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* What We Do Section */}
        <div className="mb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
              What We Offer
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Skill-based internship programs designed to take learners from fundamentals to real, project-ready capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon
              const isActive = activeService === idx
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-blue-300 dark:border-cyan-500/30 bg-white dark:bg-slate-950/60 shadow-lg'
                      : 'border-white/60 dark:border-white/10 bg-white/50 dark:bg-slate-950/30 hover:border-blue-200 dark:hover:border-white/20'
                  }`}
                  onMouseEnter={() => setActiveService(idx)}
                  onMouseLeave={() => setActiveService(null)}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} text-white shadow-md mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-3">
                    {service.category}
                  </h3>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${service.color} shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Development Capabilities Section */}
        <div className="mb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
              Program Highlights
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              What learners get in every AmitSolutionHub internship track
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-950/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/30"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cap.color} text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2 leading-tight">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* About Us / Technology Stack Section */}
        <div className="mb-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
              About Us
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Tools & Technologies Covered Across Our Programs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {techStack.map((stack, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-950/40 p-6 backdrop-blur-sm"
              >
                <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${services[idx]?.color || 'from-blue-500 to-indigo-600'}`} />
                  {stack.category}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stack.techs.map((tech, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl border border-white/40 dark:border-white/5 bg-white/80 dark:bg-white/5 px-3 py-2.5 transition-all duration-200 hover:border-blue-200 dark:hover:border-white/20"
                    >
                      <span className="text-base">{tech.icon}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="relative overflow-hidden rounded-[32px] border border-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-12 text-center text-white shadow-2xl shadow-blue-500/10 sm:px-12 sm:py-16 md:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black sm:text-4xl mb-4">Ready to Start Your Internship?</h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base leading-6 text-blue-100 font-medium">
              Explore our Web Development, AI, Stock Market, and Emerging Technologies programs and take the first step toward real, hands-on skills.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-blue-700 shadow-lg transition hover:scale-105 hover:bg-slate-50"
              >
                Get in Touch
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 text-sm font-black text-white hover:bg-white/10"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}