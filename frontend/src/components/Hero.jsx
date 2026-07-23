import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TechMarquee from './TechMarquee'
import TrustedPartners from './TrustedPartners'
import { 
  Check, 
  Shield, 
  GraduationCap, 
  Award, 
  Users, 
  Code, 
  Cpu, 
  LineChart, 
  Globe, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Play, 
  FileText, 
  ChevronDown, 
  MessageSquare, 
  ArrowRight,
  Database,
  Terminal,
  Cloud,
  FileCode2,
  Calendar,
  Layers,
  ChevronRight,
  Star
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'
import SEO from './SEO'
import msmeQR from '../assets/msme-qr.png'
import msmeLogo from '../assets/msme.png'

/* ── Counter component ── */
const Counter = ({ value, duration = 1.8 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value.replace(/[^0-9]/g, ''), 10)
    if (isNaN(end)) return

    const totalMiliseconds = duration * 1000
    const steps = 50
    const stepValue = Math.ceil(end / steps)
    const incrementTime = totalMiliseconds / steps

    const timer = setInterval(() => {
      start += stepValue
      if (start >= end) {
        clearInterval(timer)
        setCount(end)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  const suffix = value.replace(/[0-9,]/g, '')
  return <span>{count.toLocaleString('en-IN')}{suffix}</span>
}

/* ── Custom Animated Tech Illustration ── */
const TechIllustration = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="relative w-full max-w-lg mx-auto h-64 sm:h-80 lg:aspect-square flex items-center justify-center select-none">
      {/* Glow Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.2, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" 
      />

      <svg className="w-[85%] h-[85%] relative z-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="250" cy="250" r="220" stroke="currentColor" className="text-slate-200/40 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="250" cy="250" r="170" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800/70" strokeWidth="1.5" />
        
        {/* Coding Terminal Mockup */}
        <motion.g
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <rect x="75" y="110" width="350" height="230" rx="16" className="fill-slate-900/95 dark:fill-slate-950/95 stroke-slate-200 dark:stroke-slate-800/80 shadow-2xl" strokeWidth="2" />
          <rect x="75" y="110" width="350" height="38" rx="16" className="fill-slate-850 dark:fill-slate-900" />
          <circle cx="98" cy="129" r="6" fill="#ef4444" />
          <circle cx="114" cy="129" r="6" fill="#eab308" />
          <circle cx="130" cy="129" r="6" fill="#22c55e" />
          <text x="250" y="133" textAnchor="middle" className="fill-slate-400 text-xs font-mono">App.jsx</text>
          
          {/* Coding lines */}
          <motion.rect x="100" y="170" width="120" height="8" rx="4" fill="#3b82f6" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.2, repeat: Infinity }} />
          <motion.rect x="100" y="190" width="220" height="8" rx="4" fill="#a855f7" animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 2.8, repeat: Infinity }} />
          <rect x="100" y="210" width="180" height="8" rx="4" fill="#10b981" />
          <motion.rect x="100" y="230" width="140" height="8" rx="4" fill="#f59e0b" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3.2, repeat: Infinity }} />
          <rect x="100" y="250" width="245" height="8" rx="4" fill="#64748b" />
          
          <rect x="250" y="275" width="155" height="50" rx="10" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1" />
          <text x="328" y="304" textAnchor="middle" className="fill-blue-400 text-[10px] font-bold font-mono">Build Success ✓</text>
        </motion.g>

        {/* Floating Database Badge */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="45" y="275" width="68" height="68" rx="16" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 shadow-xl" strokeWidth="1.5" />
          <Database className="w-7 h-7 text-indigo-500" x="65" y="295" />
        </motion.g>

        {/* Floating AI/CPU Badge */}
        <motion.g
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <rect x="385" y="65" width="68" height="68" rx="16" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 shadow-xl" strokeWidth="1.5" />
          <Cpu className="w-7 h-7 text-pink-500" x="405" y="85" />
        </motion.g>

        {/* Floating Certificate Trophy */}
        <motion.g
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="365" y="290" width="76" height="76" rx="18" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 shadow-xl" strokeWidth="1.5" />
          <Award className="w-9 h-9 text-emerald-500" x="384" y="309" />
        </motion.g>
      </svg>
    </div>
  )
}

/* ── Static Data ── */
const STATS = [
  { value: '5,000+', label: 'Students Trained', icon: Users, color: 'text-blue-500' },
  { value: '12+',    label: 'Internship Programs', icon: BookOpen, color: 'text-indigo-500' },
  { value: '800+',   label: 'Live Projects Completed', icon: Code, color: 'text-purple-500' },
  { value: '4,800+', label: 'Certificates Issued', icon: Award, color: 'text-emerald-500' },
]

const CATEGORIES = [
  {
    title: 'Full Stack Development',
    desc: 'Build scalable modern web applications from scratch using MERN and modern frontend tools.',
    icon: Code,
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Artificial Intelligence',
    desc: 'Dive into machine learning models, neural networks, natural language processing, and computer vision.',
    icon: Cpu,
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Cyber Security',
    icon: Shield,
    desc: 'Understand threat detection, ethical hacking practices, network security, and risk analysis.',
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  {
    title: 'Data Science',
    icon: Database,
    desc: 'Analyze massive datasets, build automated predictive models, and master scientific libraries.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    title: 'UI/UX Design',
    icon: Layers,
    desc: 'Design beautiful, user-centered screens, master modern layouts, and build responsive wireframes.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  {
    title: 'Digital Marketing',
    icon: Globe,
    desc: 'Master organic SEO, social media strategies, audience optimization, and marketing funnels.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: 'Python Programming',
    icon: Terminal,
    desc: 'Build foundational programming skills, object-oriented code, algorithm logic, and basic utilities.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    title: 'Cloud Computing',
    icon: Cloud,
    desc: 'Understand virtual architecture, serverless infrastructure, continuous integration, and deployments.',
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  }
]

const WHY_CHOOSE = [
  {
    title: 'Practical Learning',
    desc: 'Build real-world projects that simulate technical assignments in modern organizations.',
    icon: Code,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Mentor Guidance',
    desc: 'Connect with experienced industry professionals for feedback and track optimization.',
    icon: Users,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Flexible Online Learning',
    desc: 'Learn on your own schedule with self-paced assignments and online resources.',
    icon: Clock,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    title: 'Verified Certificate',
    desc: 'Receive an official verifiable certificate with a unique tracking ID and QR code.',
    icon: Award,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Portfolio Development',
    desc: 'Develop codebases you can host on GitHub to showcase to prospective employers.',
    icon: Sparkles,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Career Skill Development',
    desc: 'Improve your overall engineering practices, problem solving, and design patterns.',
    icon: GraduationCap,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  }
]

const STEPS = [
  {
    step: 'Step 1',
    title: 'Register',
    desc: 'Select your preferred technology track and fill out the details.',
    icon: FileText,
  },
  {
    step: 'Step 2',
    title: 'Get Selected',
    desc: 'Receive your selection notification with credentials and dashboard access.',
    icon: Check,
  },
  {
    step: 'Step 3',
    title: 'Start Learning',
    desc: 'Access video instructions, guidelines, and assignment files.',
    icon: Play,
  },
  {
    step: 'Step 4',
    title: 'Complete Projects',
    desc: 'Submit your completed project assignments for mentor review.',
    icon: Code,
  },
  {
    step: 'Step 5',
    title: 'Receive Certificate',
    desc: 'Download your verified certificate co-signed by our training lead.',
    icon: Award,
  }
]

const TESTIMONIALS = [
  {
    name: 'Sneha Patel',
    course: 'Full Stack Development Intern',
    rating: 5,
    feedback: 'The project-based curriculum was incredible. I built a functional MERN app and verified my certificate instantly on the website. Highly recommended!',
    avatar: '👩‍💻'
  },
  {
    name: 'Rohan Sharma',
    course: 'AI & Data Science Intern',
    rating: 5,
    feedback: 'Excellent mentor support. The feedback on my machine learning assignments was quick and constructive. The self-paced layout fits my college schedule perfectly.',
    avatar: '👨‍🎓'
  },
  {
    name: 'Anjali Gupta',
    course: 'UI/UX Design Intern',
    rating: 5,
    feedback: 'I loved working on responsive prototypes. The program taught me how to present projects on my resume and portfolio.',
    avatar: '👩‍🎨'
  }
]

const FAQS = [
  {
    q: 'Is the internship online?',
    a: 'Yes, all our internship and training programs are 100% online, allowing you to learn from anywhere at your own pace.'
  },
  {
    q: 'How long are the programs?',
    a: 'The standard duration of our programs is 4 to 8 weeks, depending on the speed at which you complete the projects.'
  },
  {
    q: 'Will I receive a certificate?',
    a: 'Absolutely! Upon successful completion of all projects, you will receive a verified certificate co-signed by an industry mentor.'
  },
  {
    q: 'What projects will I build?',
    a: 'You will build practical, real-world projects customized to your track (e.g., full-stack websites, AI models, security audits) to showcase in your portfolio.'
  },
  {
    q: 'Who can apply?',
    a: 'Students, graduates, and professionals wanting to transition into tech can apply. Basic programming logic or track familiarity is recommended.'
  }
]

/* ── NEW: Tech stack strip data (icon-only, no external assets needed) ── */
const TECH_STACK = [
  { name: 'React', icon: Code, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Node.js', icon: Terminal, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Python', icon: FileCode2, color: 'text-amber-500 bg-amber-500/10' },
  { name: 'MongoDB', icon: Database, color: 'text-teal-500 bg-teal-500/10' },
  { name: 'AWS Cloud', icon: Cloud, color: 'text-sky-500 bg-sky-500/10' },
  { name: 'Machine Learning', icon: Cpu, color: 'text-purple-500 bg-purple-500/10' },
  { name: 'Cyber Security', icon: Shield, color: 'text-red-500 bg-red-500/10' },
  { name: 'Analytics', icon: LineChart, color: 'text-indigo-500 bg-indigo-500/10' },
]

/* ── NEW: Trust / guarantee strip data ── */
const TRUST_POINTS = [
  {
    title: 'Verified Certificate',
    desc: 'Every certificate carries a unique ID and QR code that anyone can verify online.',
    icon: Shield,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    title: 'Mentor Support',
    desc: 'Get your project doubts and reviews answered by real mentors, not bots.',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Lifetime Access',
    desc: 'Keep access to your learning material and certificate record even after completion.',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
]

const Hero = () => {
  const { theme } = useTheme()
  const { homepageStats, testimonials, internshipCategories } = useStore()
  const isDark = theme === 'dark'
  const [activeFaq, setActiveFaq] = useState(null)

  /* ── NEW: sticky announcement bar visibility on scroll (pure UI state, no backend calls) ── */
  const [showStickyBar, setShowStickyBar] = useState(false)
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 480)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Icon name → Lucide component map (for DB-stored categories)
  const ICON_MAP = useMemo(() => ({
    Code, Cpu, Shield, Database, Layers, Globe, Terminal, Cloud,
    BookOpen, Users, Award, Sparkles, GraduationCap, Clock, Play,
    FileText, Check, ArrowRight, Star, MessageSquare, LineChart,
    BarChart2: LineChart, Smartphone: MessageSquare, Lock: Shield,
    Zap: Sparkles,
  }), [])

  // Dynamic categories – fall back to static CATEGORIES if DB is empty
  const categoriesList = useMemo(() => {
    if (internshipCategories && internshipCategories.length > 0) {
      return internshipCategories.map(cat => ({
        ...cat,
        icon: ICON_MAP[cat.icon] || Code,
      }))
    }
    return CATEGORIES
  }, [internshipCategories, ICON_MAP])

  // Dynamic testimonials – fall back to static TESTIMONIALS if DB is empty
  const testimonialsList = useMemo(() => {
    if (testimonials && testimonials.length > 0) {
      return testimonials.map(t => ({
        name: t.name,
        course: t.role || t.course || '',
        rating: Number(t.rating) || 5,
        feedback: t.text || t.feedback || '',
        avatar: t.avatar || '👨‍🎓',
      }))
    }
    return TESTIMONIALS
  }, [testimonials])

  const statsList = useMemo(() => {
    return [
      { value: homepageStats?.studentsTrained || '5,000+', label: 'Students Trained', icon: Users, color: 'text-blue-500' },
      { value: homepageStats?.internshipPrograms || '12+',    label: 'Internship Programs', icon: BookOpen, color: 'text-indigo-500' },
      { value: homepageStats?.liveProjects || '800+',   label: 'Live Projects Completed', icon: Code, color: 'text-purple-500' },
      { value: homepageStats?.certificatesIssued || '4,800+', label: 'Certificates Issued', icon: Award, color: 'text-emerald-500' },
    ]
  }, [homepageStats])

  return (
    <>
      <SEO />

      {/* ── NEW: Sticky announcement / CTA bar (pure UI, appears after scrolling) ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold truncate">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Applications are open for the next batch — limited seats available.</span>
              </div>
              <Link
                to="/signup"
                className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-white text-blue-600 text-xs font-extrabold hover:bg-slate-50 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Contact button ── */}
      <a
        href="/contact"
        aria-label="Contact us"
        className="fixed bottom-24 right-6 sm:bottom-6 sm:left-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </a>


      <div className={`w-full min-h-screen relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* Animated Background Grids */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div style={{
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)'
              : 'linear-gradient(rgba(0,0,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.025) 1px,transparent 1px)',
            backgroundSize: '40px 40px'
          }} className="absolute inset-0" />
        </div>

        {/* ── HERO SECTION ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-8 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white dark:bg-slate-900/80 border-emerald-200 dark:border-slate-800 shadow-sm shadow-emerald-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-350">
                  AICTE Internship Portal Registered Organization
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                Learn Today. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Build Tomorrow.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Develop practical skills through project-based internship and training programs in Web Development, Artificial Intelligence, Cyber Security, Data Science, UI/UX Design, Digital Marketing, and other emerging technologies.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/signup" 
                  className="group px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/30 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  Apply for Internship
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#categories" 
                  className="px-8 py-4 rounded-2xl font-extrabold text-sm border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-300 hover:text-indigo-600 dark:hover:bg-slate-800 active:scale-95 transition-all text-center"
                >
                  Explore Programs
                </a>
              </div>

              {/* Highlights tags */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                  {[
                    { label: '100% Online Learning', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Verified Certificate', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Mentor Guidance', color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' },
                    { label: 'Real Projects', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
                    { label: 'Flexible Learning', color: 'text-teal-600 bg-teal-500/10 border-teal-500/20' },
                    { label: 'Career-Focused Training', color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' }
                  ].map((tag) => (
                    <span 
                      key={tag.label} 
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${tag.color} dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/30`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Premium Interactive Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 w-full flex justify-center"
            >
              <TechIllustration />
            </motion.div>
          </div>
        </section>

        {/* ── ABOUT AMITSOLUTIONHUB ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Stats (Grid format) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 grid grid-cols-2 gap-4"
            >
              {statsList.map((stat) => {
                const IconComp = stat.icon
                return (
                  <div key={stat.label} className="p-4 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[130px]">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color} bg-current/10`}>
                      <IconComp className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                        <Counter value={stat.value} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Description Text */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-indigo-500 bg-indigo-500/10 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" /> About Us
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Helping Students Build Real Skills
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                AmitSolutionHub is an education and technology platform focused on practical learning through internship and training programs. Our goal is to help students strengthen their technical skills, build real-world projects, and gain hands-on experience that supports their academic and career growth.
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                We provide structured learning paths, mentor guidance, project-based assignments, and verified internship certificates in multiple technology domains.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Powered By – Tech Marquee */}
        <TechMarquee />

        {/* ── NEW: TECHNOLOGIES YOU'LL WORK WITH (icon strip, no external assets) ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-purple-500 bg-purple-500/10 uppercase tracking-wider">
              Tools & Tech
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Technologies You'll Work With
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {TECH_STACK.map((tech) => {
              const IconComp = tech.icon
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  key={tech.name}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className={`p-2.5 rounded-lg ${tech.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center">{tech.name}</span>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Trusted Payment Partners */}
        <TrustedPartners />

        {/* ── INTERNSHIP CATEGORIES ── */}
        <section id="categories" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 uppercase tracking-wider">
              Explore Paths
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Internship Categories
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Choose from our curated technology tracks designed to teach you coding, logic, and problem-solving through live projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesList.map((cat, idx) => {
              const IconComp = cat.icon
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  key={cat.title} 
                  className="p-6 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Icon & Badges */}
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl border ${cat.color}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                          {cat.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {cat.duration}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  {/* Learn More Button */}
                  <Link 
                    to="/courses"
                    className="mt-6 flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-indigo-400 group-hover:gap-2 transition-all"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── WHY CHOOSE AMITSOLUTIONHUB ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-indigo-500 bg-indigo-500/10 uppercase tracking-wider">
              Our Core Strengths
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Why Choose AmitSolutionHub
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              We focus on delivering high-quality, practical learning experiences to help students bridge the gap between academic theory and technical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CHOOSE.map((item) => {
              const IconComp = item.icon
              return (
                <div key={item.title} className="p-6 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200/85 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-4">
                  <div className={`p-3 rounded-xl border flex-shrink-0 h-fit ${item.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── LEARNING PROCESS (TIMELINE) ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 uppercase tracking-wider">
              Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Our Learning Process
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              A simple, step-by-step roadmap from initial enrollment to certificate delivery.
            </p>
          </div>

          {/* Horizontal Timeline (Desktop) & Vertical (Mobile) */}
          <div className="relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0" />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
              {STEPS.map((step, idx) => {
                const IconComp = step.icon
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={step.title} 
                    className="flex lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-4"
                  >
                    {/* Circle Node */}
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-250 dark:border-slate-850 flex items-center justify-center text-blue-600 dark:text-indigo-400 shadow-sm flex-shrink-0 relative">
                      <IconComp className="w-6 h-6" />
                      {/* Step Number Tag */}
                      <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-slate-800 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Step details */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                        {step.step}
                      </span>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{step.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CERTIFICATE SECTION ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Description */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" /> Certificate
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Verified Internship Certificate
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Students who successfully complete their internship receive a verifiable internship certificate that can be added to resumes and professional profiles.
              </p>

              {/* Certificate Features */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  'Digital Verification',
                  'Resume Friendly',
                  'LinkedIn Ready',
                  'QR Verification'
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                    <span className="text-sm font-bold text-slate-650 dark:text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link 
                  to="/verify" 
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-500 transition-colors"
                >
                  Verify a Certificate <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right: Mockup Certificate Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6"
            >
              <div className="p-5 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[280px] text-center max-w-lg mx-auto">
                {/* Vintage Border styling */}
                <div className="absolute inset-4 border border-indigo-500/20 pointer-events-none" />
                
                {/* Header info */}
                <div className="space-y-1">
                  <div className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Certificate of Completion</div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-blue-600 dark:text-indigo-400">AMITSOLUTIONHUB</h3>
                </div>

                {/* Main signature block */}
                <div className="space-y-2">
                  <div className="font-serif italic text-2xl text-slate-800 dark:text-slate-100">Student Name</div>
                  <p className="text-[10px] text-slate-400 font-medium">has successfully completed all assignments for the</p>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wide">
                    Web Development Track
                  </div>
                </div>

                {/* Footer details co-sign */}
                <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="text-left space-y-0.5">
                    <div>Duration: 6 Weeks</div>
                    <div>Verifiable Online</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-850">
                    <img src={msmeLogo} alt="MSME Seal" className="h-6 object-contain" />
                    <span className="text-[7px] leading-tight">Govt. of India<br/>MSME Registered</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── NEW: TRUST / GUARANTEE STRIP (icon-only, no assets needed) ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST_POINTS.map((point) => {
              const IconComp = point.icon
              return (
                <div
                  key={point.title}
                  className="p-6 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl border flex-shrink-0 ${point.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{point.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{point.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── STUDENT TESTIMONIALS ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-indigo-500 bg-indigo-500/10 uppercase tracking-wider">
              Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Student Testimonials
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Read review write-ups from students who finished their tracks and completed real projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsList.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                key={item.name} 
                className="p-6 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rating stars */}
                <div className="flex gap-1 text-amber-400 text-sm mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Review body */}
                <p className="text-sm text-slate-550 dark:text-slate-350 leading-relaxed font-medium italic flex-grow">
                  "{item.feedback}"
                </p>

                {/* User row */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-200/50 dark:border-slate-800/60 pt-4 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    ['bg-blue-100', 'bg-purple-100', 'bg-emerald-100'][idx % 3]
                  }`}>
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</h4>
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">{item.course}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="text-center mb-12 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 uppercase tracking-wider">
              Answers
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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

        {/* ── FINAL CALL TO ACTION ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-900/50">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 md:p-16 text-center text-white shadow-xl">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Start Your Learning Journey Today
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-semibold max-w-lg mx-auto">
                Take the next step toward building practical skills through structured internship and training programs.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup" 
                  className="px-8 py-4 rounded-xl font-bold text-sm bg-white text-blue-600 hover:bg-slate-50 shadow-md active:scale-95 transition-all"
                >
                  Apply Now
                </Link>
                <Link 
                  to="/contact" 
                  className="px-8 py-4 rounded-xl font-bold text-sm bg-transparent border border-white/35 hover:bg-white/10 active:scale-95 transition-all"
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

export default Hero