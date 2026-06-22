import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Server,
  Network,
  Cpu,
  ShieldCheck,
  Tv,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  CloudLightning,
  Workflow,
  Palette,
  Code,
  Smartphone,
  Globe,
  BarChart3,
  Shield,
  TrendingUp,
  MessageSquare,
  FileText,
  Mail,
  Settings,
  GitBranch,
  Container,
  Cloud,
  Lock,
  Search,
  CloudCog,
  FlaskConical,
  Coins,
  ShoppingCart,
  LineChart,
  Building2,
  Megaphone,
  Lightbulb,
  Fingerprint,
  LineChart as LineChartIcon
} from 'lucide-react'

const coreInfrastructure = [
  {
    icon: Server,
    title: 'End-to-End IT Infrastructure',
    desc: 'We are a 360-degree software solution development company with the in-house resources for the entire software development life-cycle.',
    details: ['Full-cycle development capability', 'In-house team of experts', 'Scalable architecture', 'Enterprise-grade security']
  },
  {
    icon: Network,
    title: 'Redundant High-Speed Networks',
    desc: 'Equipped with multiple gigabit fiber-optic connections to ensure seamless collaboration, quick build deployments, and uninterrupted communication.',
    details: ['Gigabit Redundant Links', 'Low Latency Routing', 'Global CDN Integration', 'Enterprise-grade VPN']
  },
  {
    icon: Cpu,
    title: 'Modern Workstation Labs',
    desc: 'Our developer labs feature the latest computing technology, configured to handle demanding compilation, machine learning, and designer workflows.',
    details: ['Latest Multi-core Processors', 'High-speed DDR5 RAM', 'NVIDIA RTX Studio GPUs', 'Ultrawide High-Color Monitors']
  },
  {
    icon: ShieldCheck,
    title: 'Robust Security & Monitoring',
    desc: 'Protecting intellectual property and project data through continuous firewall analysis, encryption at rest and transit, and secure physical access control.',
    details: ['Biometric Access Control', '24/7 Security Operations', 'E2E Data Encryption', 'Intrusion Detection Systems']
  },
  {
    icon: Tv,
    title: 'Smart Meeting & Presentation Rooms',
    desc: 'Equipped with smart screens, immersive audio, and unified conferencing systems to enable high-definition client demos and team sprints.',
    details: ['Interactive Smart Boards', 'High-fidelity Conference Audio', '4K Video Conferencing', 'Wireless Screen Sharing']
  },
  {
    icon: Layers,
    title: 'Scalable Software Architecture Stack',
    desc: 'Using modern microservices and containerized workflows to guarantee deployment flexibility, fast loading speeds, and robust application scaling.',
    details: ['Docker Containerization', 'CI/CD Automated Pipelines', 'Microservices Architecture', 'Real-time Analytics Logging']
  }
]

const services = [
  {
    category: 'Design',
    items: ['Layout', 'Graphics design', 'Logo & Branding', 'Product design', 'Prototype', 'Video'],
    icon: Palette,
    color: 'from-pink-500 to-rose-600'
  },
  {
    category: 'Development',
    items: ['Website', 'Mobile app', 'Browser extension', 'Custom scripts', 'Automation'],
    icon: Code,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    category: 'DevOps & Cloud',
    items: ['DevOps', 'Cloud management', 'Security monitoring', 'Deployment', 'AWS', 'Kubernetes', 'Docker'],
    icon: Cloud,
    color: 'from-indigo-500 to-purple-600'
  },
  {
    category: 'Marketing',
    items: ['SEO', 'SMM', 'PPC', 'Content writing', 'Email marketing'],
    icon: Megaphone,
    color: 'from-orange-500 to-amber-600'
  },
  {
    category: 'Managed Services',
    items: ['Website management', 'Affiliate management', 'Web research', 'Data entry', 'Data analysis'],
    icon: Settings,
    color: 'from-teal-500 to-emerald-600'
  },
  {
    category: 'Consultation',
    items: ['Business consultation', 'Technical architecture', 'Growth hacking', 'Security audits', 'Market research'],
    icon: Lightbulb,
    color: 'from-violet-500 to-purple-600'
  }
]

const capabilities = [
  {
    icon: Globe,
    title: 'Website Development',
    desc: 'Highly scalable and responsive website development using the latest technologies',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: Smartphone,
    title: 'Android & iOS Mobile App Development',
    desc: 'Fluid speed mobile app development for Android and iOS to tap into your mobile audience',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    icon: Globe,
    title: 'Browser Extension Development',
    desc: 'To enhance the functionality of a web browser, we develop extensions that are performance-friendly',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: FlaskConical,
    title: 'Data Science',
    desc: 'Identifying the data that stands out in some way, through measuring, tracking, and recording metrics',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Coins,
    title: 'Crypto Token Launching',
    desc: 'Provide all consultation and market-fit guidelines to launch crypto tokens',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: ShoppingCart,
    title: 'NFT Marketplace',
    desc: 'Our expertise in NFT and eCommerce makes the NFT marketplace user-friendly, intuitive, and reliable',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: LineChart,
    title: 'Business Analytics Platform',
    desc: 'Business analytics solutions are used by companies to retrieve, analyze, & transform data into useful insights',
    color: 'from-sky-500 to-blue-600'
  },
  {
    icon: Building2,
    title: 'Enterprise Development',
    desc: 'Enhanced business solutions, products, and services to fit the client\'s requirements and market-size',
    color: 'from-slate-500 to-zinc-600'
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    desc: 'Marketing guidance to reach and capture the widest audience possible at the right scale',
    color: 'from-rose-500 to-red-600'
  }
]

const techStack = [
  {
    category: 'Front end',
    techs: [
      { name: 'Angular JS', icon: '⚡' },
      { name: 'TypeScript', icon: '📘' },
      { name: 'React JS', icon: '⚛️' },
      { name: 'Next JS', icon: '▲' },
      { name: 'Vue JS', icon: '💚' },
      { name: 'Tailwind CSS', icon: '🌊' },
      { name: 'Bootstrap', icon: '🅱️' },
      { name: 'HTML5', icon: '🌐' }
    ]
  },
  {
    category: 'Backend',
    techs: [
      { name: 'Node.js', icon: '🟢' },
      { name: 'Python', icon: '🐍' },
      { name: 'Java', icon: '☕' },
      { name: 'PHP', icon: '🐘' },
      { name: 'MySQL', icon: '🗄️' },
      { name: 'MongoDB', icon: '🍃' },
      { name: 'PostgreSQL', icon: '🐘' },
      { name: 'Firebase', icon: '🔥' }
    ]
  },
  {
    category: 'Mobile',
    techs: [
      { name: 'React Native', icon: '📱' },
      { name: 'Flutter', icon: '🦋' },
      { name: 'Swift', icon: '🍎' },
      { name: 'Kotlin', icon: '🤖' },
      { name: 'Android', icon: '📲' },
      { name: 'iOS', icon: '📱' }
    ]
  },
  {
    category: 'DevOps & Cloud',
    techs: [
      { name: 'AWS', icon: '☁️' },
      { name: 'Docker', icon: '🐳' },
      { name: 'Kubernetes', icon: '☸️' },
      { name: 'Jenkins', icon: '🔧' },
      { name: 'GitHub Actions', icon: '🔄' },
      { name: 'Terraform', icon: '🏗️' }
    ]
  },
  {
    category: 'Third Party Integration',
    techs: [
      { name: 'REST APIs', icon: '🔗' },
      { name: 'GraphQL', icon: '◈' },
      { name: 'WebSocket', icon: '🔌' },
      { name: 'OAuth', icon: '🔐' },
      { name: 'Stripe', icon: '💳' },
      { name: 'Twilio', icon: '📞' }
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
            End-to-End IT Infrastructure
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5.5xl leading-tight mb-6">
            End-to-End In-House IT Infrastructure
          </h1>
          <p className="text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We are a 360-degree software solution development company with the in-house resources for the entire software development life-cycle.
          </p>
          <p className="text-base leading-7 text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mt-4">
            To create impactful software and solutions used by global customers. We are also embracing Web 3.0 technologies to maintain best-in-class standards for our products.
          </p>
        </div>

        <div className="mb-20 text-center">
          <Link
            to="/about"
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
              A state-of-the-art technical foundation designed to deliver high speed, maximum reliability, and secure environments.
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
              What We Do
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              To create impactful software and solutions used by global customers. We are also embracing Web 3.0 technologies to maintain best-in-class standards for our products.
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
              Development Capabilities
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              End-to-end business solution development and related services
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
              Our Technology Stack Exposure — We have expertise in multiple cutting-edge technologies
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
            <h2 className="text-3xl font-black sm:text-4xl mb-4">Ready to Build Something Great?</h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base leading-6 text-blue-100 font-medium">
              Let's discuss your project requirements and how our end-to-end infrastructure can help bring your vision to life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-blue-700 shadow-lg transition hover:scale-105 hover:bg-slate-50"
              >
                Discuss Your Project
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 text-sm font-black text-white hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
