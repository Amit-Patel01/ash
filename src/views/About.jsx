'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Code2,
  TrendingUp,
  Share2,
  GraduationCap,
  Users2,
  ShieldCheck,
  Laptop,
  Globe2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Mail,
  ChevronRight,
  Eye,
  Target,
  Compass,
  Zap,
  Activity,
  Layers,
  HeartHandshake,
  Workflow,
  Search,
  PenTool,
  Cpu,
  CheckSquare,
  Rocket,
  ShieldAlert
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import msmeLogo from '../assets/msme.png'
import tejashImg from '../assets/tejash-patil.png'

// Inline Custom SVGs for Github and Linkedin since the installed lucide-react package does not export them
const Github = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const Linkedin = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export default function About() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }



  // Core Values Data
  const values = [
    {
      title: 'Innovation',
      desc: 'Constantly exploring new technological frontiers and teaching methods to keep our learners ahead.',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-500',
      ring: 'hover:border-blue-400/60 dark:hover:border-blue-400/40' },
    {
      title: 'Transparency',
      desc: 'We build direct relationships with no hidden policies or fake placement/salary claims.',
      icon: Eye,
      color: 'from-emerald-500 to-teal-500',
      ring: 'hover:border-emerald-400/60 dark:hover:border-emerald-400/40' },
    {
      title: 'Quality',
      desc: 'Delivering exceptional educational standards and robust enterprise software services.',
      icon: ShieldCheck,
      color: 'from-violet-500 to-purple-500',
      ring: 'hover:border-violet-400/60 dark:hover:border-violet-400/40' },
    {
      title: 'Integrity',
      desc: 'Honesty is at our core. Ethical practices guide every decision, internship, and codebase.',
      icon: CheckCircle2,
      color: 'from-amber-500 to-orange-500',
      ring: 'hover:border-amber-400/60 dark:hover:border-amber-400/40' },
    {
      title: 'Continuous Learning',
      desc: 'Technology evolves daily. We cultivate an environment of continuous upskilling and adaptiveness.',
      icon: Compass,
      color: 'from-rose-500 to-pink-500',
      ring: 'hover:border-rose-400/60 dark:hover:border-rose-400/40' },
    {
      title: 'Customer Success',
      desc: 'Empowering students to land jobs and enabling clients to scale their software systems.',
      icon: HeartHandshake,
      color: 'from-cyan-500 to-sky-500',
      ring: 'hover:border-cyan-400/60 dark:hover:border-cyan-400/40' }
  ]

  // What We Do Data
  const services = [
    {
      title: 'AI Learning',
      desc: 'Master artificial intelligence, machine learning, and prompt engineering with practical project work.',
      icon: Cpu,
      iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      gradient: 'hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:shadow-purple-500/10'
    },
    {
      title: 'Full Stack Development',
      desc: 'Learn to build scalable websites and web apps using React, Node.js, MongoDB, and modern frameworks.',
      icon: Code2,
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      gradient: 'hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-blue-500/10'
    },
    {
      title: 'Digital Marketing',
      desc: 'Understand SEO, search engine marketing, social campaigns, and data-driven client growth hacks.',
      icon: Share2,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      gradient: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-emerald-500/10'
    },
    {
      title: 'Stock Market Education',
      desc: 'Acquire financial literacy, technical analysis, risk management, and smart investing fundamentals.',
      icon: TrendingUp,
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      gradient: 'hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:shadow-amber-500/10'
    },
    {
      title: 'Internship Programs',
      desc: 'Hands-on industrial training with real client tasks, peer code reviews, and structured timelines.',
      icon: GraduationCap,
      iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      gradient: 'hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-indigo-500/10'
    },
    {
      title: 'Hiring Network',
      desc: 'Connect directly with verified businesses looking for skilled graduates and interns.',
      icon: Users2,
      iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      gradient: 'hover:border-rose-500/50 dark:hover:border-rose-400/50 hover:shadow-rose-500/10'
    },
    {
      title: 'Certificate Verification',
      desc: 'Blockchain-inspired online credentials with instantly scanner-verifiable custom QR validation.',
      icon: ShieldCheck,
      iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      gradient: 'hover:border-cyan-500/50 dark:hover:border-cyan-400/50 hover:shadow-cyan-500/10'
    },
    {
      title: 'Software Development',
      desc: 'Custom enterprise desktop and cloud database applications developed for startups and SMBs.',
      icon: Laptop,
      iconBg: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      gradient: 'hover:border-violet-500/50 dark:hover:border-violet-400/50 hover:shadow-violet-500/10'
    },
    {
      title: 'Website Development',
      desc: 'Stunning premium user interfaces built using Vite, Next.js, and highly responsive Tailwind styling.',
      icon: Globe2,
      iconBg: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      gradient: 'hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-teal-500/10'
    }
  ]

  // Why Choose Us Data
  const points = [
    {
      title: 'MSME Registered',
      desc: 'Conforming strictly to Indian Government standards for corporate training and delivery.',
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
    },
    {
      title: 'AICTE Internship Portal Registered',
      desc: 'Aligned directly with national guidelines to deliver valid, credit-mappable academic programs.',
      icon: GraduationCap,
      color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    },
    {
      title: 'Razorpay Reseller Partner',
      desc: 'Offering premium reseller solutions for integrated and automated business checkout systems.',
      icon: Zap,
      color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
    },
    {
      title: 'AI-Powered Platform',
      desc: 'Self-improving dashboard systems, personalized recommendations, and guided learning bots.',
      icon: Cpu,
      color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
    },
    {
      title: 'Secure Certificate Verification',
      desc: 'Anti-forgery credentials with a public verification ledger searchable via serial or QR scan.',
      icon: CheckCircle2,
      color: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
    },
    {
      title: 'Expert Mentorship',
      desc: 'Learn directly from industry professionals with regular live workshops and review meetups.',
      icon: Users2,
      color: 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
    }
  ]

  // Timeline Data
  const timeline = [
    { phase: 'Understand', desc: 'Identify student profiles, client specs, or business requirements.', icon: Search, color: 'bg-blue-500/10 text-blue-500' },
    { phase: 'Plan', desc: 'Formulate precise milestones, custom syllabus routes, or project roadmaps.', icon: Workflow, color: 'bg-indigo-500/10 text-indigo-500' },
    { phase: 'Design', desc: 'Craft minimalist, high-converting Figma assets and database schemas.', icon: PenTool, color: 'bg-purple-500/10 text-purple-500' },
    { phase: 'Develop', desc: 'Write test-driven, responsive components and cloud API handlers.', icon: Code2, color: 'bg-violet-500/10 text-violet-500' },
    { phase: 'Test', desc: 'Conduct strict linting, mobile layouts check, and API load validation.', icon: CheckSquare, color: 'bg-pink-500/10 text-pink-500' },
    { phase: 'Deploy', desc: 'Deliver production bundles via Vercel, VPS nodes, or secure server pipelines.', icon: Rocket, color: 'bg-rose-500/10 text-rose-500' },
    { phase: 'Support', desc: 'Continuous active support, code maintenance, and weekly learning feedback.', icon: HeartHandshake, color: 'bg-amber-500/10 text-amber-500' }
  ]

  // FAQ Data
  const faqs = [
    {
      q: 'Is Amit Solution Hub an AICTE-approved college?',
      a: 'No. Amit Solution Hub is a private technology development agency registered on the AICTE National Internship Portal. We provide industrial training programs and build real-world software products, which colleges accept for credit mapping under their internship guidelines.'
    },
    {
      q: 'How do employers verify my internship certificate?',
      a: 'Every certificate we issue features a unique certificate serial ID and a secure QR code. Employers can scan the QR code or enter the ID on our /verify portal to instantly check the authentic candidate details, domain, and completion date.'
    },
    {
      q: 'What is the "Razorpay Reseller Partner" badge?',
      a: 'As an official Reseller Partner with Razorpay, we help local businesses, startups, and educational institutions integrate and configure seamless payment checkouts, payment links, and payment gateways into their custom applications.'
    },
    {
      q: 'Do you offer offline classroom coaching?',
      a: 'We focus entirely on digital platform delivery and remote, project-based internships, enabling students from any corner of India to learn hands-on from home at a highly flexible pace.'
    },
    {
      q: 'How can clients request a custom software quote?',
      a: 'Simply head to our /contact page or select "Custom Build" in the Why Us menu dropdown. Our technical team will coordinate within 24 hours to map your exact requirements.'
    }
  ]

  return (
    <>
      
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[700px] pointer-events-none overflow-hidden z-0">
          <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-40 ${isDark ? 'bg-indigo-600' : 'bg-blue-400'}`} />
          <div className={`absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-35 ${isDark ? 'bg-purple-600' : 'bg-violet-400'}`} />
          <div className={`absolute top-[30%] left-[30%] w-[35vw] h-[35vw] rounded-full blur-[140px] opacity-25 ${isDark ? 'bg-pink-600' : 'bg-pink-300'}`} />
        </div>

        {/* ── 1. HERO SECTION ── */}
        <section className="relative pt-12 lg:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Badges Stack */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                  <ShieldCheck size={11} /> MSME Registered Organization
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white shadow-md shadow-orange-500/30">
                  <GraduationCap size={11} /> AICTE National Internship Portal Registered Organization
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500 text-white shadow-md shadow-blue-500/30">
                  <Zap size={11} /> Razorpay Reseller Partner
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                Building the Future of <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Learning & Technology
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Amit Solution Hub is an AI-powered EdTech and IT development platform delivering premium hands-on internships, custom software architectures, expert training, and secure verification systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/programs"
                  className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 dark:shadow-indigo-500/30 text-center active:scale-98 transition-all"
                >
                  Explore Programs
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 rounded-2xl text-sm font-bold border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-300 text-center active:scale-98 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Right Graphic Section */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-sm aspect-square rounded-[2.5rem] border-2 bg-gradient-to-br from-white/60 via-blue-50/40 to-purple-50/40 dark:from-slate-900/40 dark:via-indigo-950/30 dark:to-purple-950/30 border-indigo-200/60 dark:border-indigo-800/60 shadow-[0_20px_50px_rgba(79,70,229,0.15)] dark:shadow-[0_20px_50px_rgba(79,70,229,0.25)] backdrop-blur-2xl flex flex-col justify-between p-8"
              >
                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl filter blur-xl opacity-30" />

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Laptop size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Verifiable Credentials</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    We combine MSME statutory compliance with modern scanning verification, giving graduates reliable proofs of technical training.
                  </p>
                </div>

                <div className="pt-6 border-t border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Govt Registration</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 font-mono">GJ-17-0037282</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. COMPANY STORY, 3. MISSION, 4. VISION ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Story */}
            <div className="lg:col-span-6 space-y-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500 text-white shadow-sm">
                Our Genesis
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Our Story</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Amit Solution Hub started with a bold vision: to bridge the gap between academic education and industry standards through project-based learning and real-world experience. We observed that traditional classrooms often focus on theory, leaving a skill gap for graduates transitioning into technical careers.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                To solve this, we created an ecosystem where students solve actual business codebases and build verifiable web models, while businesses receive optimized, high-fidelity software products.
              </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Mission Card */}
              <div className="p-6 rounded-3xl border-2 border-orange-200/70 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/70 to-white dark:from-orange-950/20 dark:to-slate-900/20 backdrop-blur-xl space-y-4 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                  <Target size={20} />
                </div>
                <h3 className="text-lg font-bold">Our Mission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Empower students and businesses with practical learning, AI technologies, and innovative digital solutions.
                </p>
              </div>

              {/* Vision Card */}
              <div className="p-6 rounded-3xl border-2 border-purple-200/70 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/70 to-white dark:from-purple-950/20 dark:to-slate-900/20 backdrop-blur-xl space-y-4 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                  <Rocket size={20} />
                </div>
                <h3 className="text-lg font-bold">Our Vision</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Become India's most trusted AI-powered EdTech and Technology platform.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 5. CORE VALUES ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-violet-500 text-white shadow-sm">
              Belief System
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Core Values</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              These shared guidelines shape how we write code, support interns, and interact with partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.title}
                  className={`p-6 rounded-3xl border-2 bg-white/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md ${v.ring} hover:shadow-lg transition-all duration-300 flex flex-col space-y-3 group`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-extrabold group-hover:text-blue-500 dark:group-hover:text-indigo-400 transition-colors">{v.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 6. WHAT WE DO ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500 text-white shadow-sm">
              Service Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What We Do</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              We specialize in state-of-the-art technological solutions and real-world skills training.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.title}
                  className={`p-6 rounded-3xl border-2 bg-white/60 dark:bg-slate-900/25 border-slate-200/60 dark:border-slate-800/80 backdrop-blur-xl transition-all duration-300 flex flex-col space-y-3 hover:translate-y-[-4px] shadow-sm hover:shadow-xl ${s.gradient}`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{s.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 7. WHY CHOOSE US ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white shadow-sm">
              Accreditation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why Choose Us</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              We stand apart because of our transparency, certifications, and project-based methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-3xl border-2 bg-white/70 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-900/80 backdrop-blur-xl shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col space-y-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{p.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 8. HOW WE WORK ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50 overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500 text-white shadow-sm">
              Work Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How We Work</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Our systematic approach guarantees clean delivery for custom services and training.
            </p>
          </div>

          {/* Timeline Process Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {timeline.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.phase}
                  className="relative p-5 rounded-2xl border-2 bg-white/60 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/80 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition-all"
                >
                  {/* Phase bubble */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-200 text-[10px] font-black flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${step.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{step.phase}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-bold">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 10. LEADERSHIP ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500 text-white shadow-sm">
              Founding Team & Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">Leadership</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Leading our vision, operations, and technical execution to build digital solutions that drive success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

            {/* Founder: Amit Patel */}
            <div className="p-8 rounded-[2rem] border-2 bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-950/30 border-blue-200/70 dark:border-blue-900/60 shadow-[0_8px_30px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.12)] backdrop-blur-xl flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src="https://cdn.phototourl.com/free/2026-04-17-0ae88615-c6d0-46bb-b3a9-271cc07980a8.jpg"
                      alt="Amit Patel"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center hidden">AP</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                    Founder & CEO
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Amit Patel</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Founder of AmitSolutionHub</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  I lead the design and development of digital projects at AmitSolutionHub. With a focus on full-stack technologies and stock market analytics, I guide our software team to implement clean solutions for clients, while mentoring students through hands-on internship courses.
                </p>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['React & Node.js', 'System Architecture', 'Mentorship', 'API Design', 'Technical Analysis'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-blue-200/50 dark:border-blue-900/50">
                <a
                  href="https://portfolio.amitsolutionhub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  Portfolio
                </a>
                <a
                  href="https://www.linkedin.com/in/amit-patel01/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-700 dark:text-blue-300 transition-all"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Co-Founder: Naivedh Patel */}
            <div className="p-8 rounded-[2rem] border-2 bg-gradient-to-br from-purple-50/60 to-white dark:from-purple-950/20 dark:to-slate-950/30 border-purple-200/70 dark:border-purple-900/60 shadow-[0_8px_30px_rgba(168,85,247,0.08)] dark:shadow-[0_8px_30px_rgba(168,85,247,0.12)] backdrop-blur-xl flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src="https://cdn.phototourl.com/free/2026-04-17-535a233f-3c4a-4bf3-9f98-b1131ef6064a.jpg"
                      alt="Naivedh Patel"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white text-xl font-bold flex items-center justify-center hidden">NP</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                    Co-Founder
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Naivedh Patel</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Editor & Tech Developer Manager</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  I manage the content strategy and lead our core technology development division to deliver high-quality digital solutions. Focused on driving design innovation, structured content workflows, and high-performance engineering standards.
                </p>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Content Strategy', 'Web Development', 'Operations', 'Team Management', 'Product Design'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-purple-200/50 dark:border-purple-900/50">
                <a
                  href="https://portfolio-beta-five-50.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-md shadow-purple-500/20 transition-all"
                >
                  Portfolio
                </a>
                <a
                  href="https://www.linkedin.com/in/naivedh2518/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 transition-all"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Head: Tejash Patil */}
            <div className="p-8 rounded-[2rem] border-2 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-950/30 border-emerald-200/70 dark:border-emerald-900/60 shadow-[0_8px_30px_rgba(16,185,129,0.08)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.12)] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src={tejashImg?.src || tejashImg || "https://media.licdn.com/dms/image/v2/D4D03AQEWuA51rLjzxA/profile-displayphoto-scale_400_400/B4DZ5TknxUKEAg-/0/1779518571006?e=1786579200&v=beta&t=bPQT9l4WP1gftoGcFYtoNTavm14vph4vlsSliDg23bw"}
                      alt="Tejas Patil"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-bold flex items-center justify-center hidden">TP</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                    Head
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Tejas Patil</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Head of Operations & Execution</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  I oversee team management, operational strategy, and project execution at AmitSolutionHub. Dedicated to optimizing internal workflows, maintaining quality standards, and driving cross-departmental success.
                </p>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Operations Lead', 'Team Leadership', 'Workflow Planning', 'Project Execution', 'Quality Assurance'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-emerald-200/50 dark:border-emerald-900/50">
                <a
                  href="mailto:tejasspatil2601@gmail.com"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 transition-all"
                >
                  Contact
                </a>
                <a
                  href="mailto:tejasspatil2601@gmail.com"
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 transition-all"
                >
                  Email
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ── 11. TRUSTED PARTNERS & RECOGNITIONS ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white shadow-sm">
              Certifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trusted Partners & Recognitions</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Verified legal status and payment associations.
            </p>
          </div>

          {/* Core Partners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-3xl border-2 border-emerald-200/70 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-950/30 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 flex items-center">
                <img src={msmeLogo} alt="MSME Logo" className="h-8 object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">MSME Registered Organization</h4>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">GJ-17-0037282</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border-2 border-orange-200/70 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/60 to-white dark:from-orange-950/20 dark:to-slate-950/30 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 flex items-center">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm">
                  <GraduationCap size={18} />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">AICTE National Internship Portal</h4>
                <p className="text-[9px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider">Registered Organization</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border-2 border-blue-200/70 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-950/30 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 flex items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay Logo" className="h-6 object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Razorpay Reseller Partner</h4>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">Official Partner</p>
              </div>
            </div>
          </div>

          {/* Placeholders for Future Programs */}
          <div className="mt-16 text-center max-w-4xl mx-auto space-y-6">
            <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full border border-dashed border-amber-300 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <ShieldAlert size={12} className="text-amber-500" /> Upcoming Cloud & Startup Program Enlistments
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-70">
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/20 text-center flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Microsoft for Startups</span>
                <span className="text-[9px] text-blue-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Pending Approval</span>
              </div>
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/20 text-center flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Google for Startups</span>
                <span className="text-[9px] text-blue-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Assessment Phase</span>
              </div>
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/20 text-center flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cloudflare Portal</span>
                <span className="text-[9px] text-blue-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Integration Queue</span>
              </div>
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/20 text-center flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">MongoDB for Academics</span>
                <span className="text-[9px] text-blue-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Under Enlistment</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 12. FAQ ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500 text-white shadow-sm">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Quick answers about our statutory listings and training models.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className={`rounded-3xl border-2 transition-all duration-300 ${isOpen
                      ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20 shadow-lg shadow-blue-500/5'
                      : 'border-slate-200/80 bg-white/50 dark:border-slate-900/80 dark:bg-slate-900/20'
                    }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left outline-none"
                  >
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{faq.q}</span>
                    <div className={`ml-4 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium border-t border-blue-100 dark:border-blue-900/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 13. CTA SECTION ── */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600 dark:border-indigo-500/20 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl">

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 filter blur-3xl opacity-30 pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-yellow-300/20 filter blur-3xl opacity-30 pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/15 text-white">
                Let's Partner Up
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Let's Build Something <br />Amazing Together
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-md mx-auto">
                Sign up for an industry-grade learning experience or consult with our technical team to custom build your next cloud codebase.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/join-us"
                  className="px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-white text-blue-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md"
                >
                  Start Internship <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3.5 rounded-2xl text-sm font-extrabold border-2 border-white/40 bg-white/10 hover:bg-white/20 transition-all text-center active:scale-98"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}