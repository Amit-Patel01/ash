'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
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
import SEO from './SEO'
import msmeQR from '../assets/msme-qr.png'
import msmeLogo from '../assets/msme.png'
import VerifiedCertificateSection from './VerifiedCertificateSection'

/* ── Signature background styles (shared visual language with the rest of the site) ── */
const HeroBackgroundStyles = () => (
  <style>{`

    .ash-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }

    .ash-canvas {
      background:
        radial-gradient(60rem 40rem at 12% -10%, #E0E7FF 0%, transparent 60%),
        radial-gradient(50rem 35rem at 110% 5%, #DBEAFE 0%, transparent 55%),
        radial-gradient(45rem 32rem at 50% 105%, #FCE7F3 0%, transparent 55%),
        transparent;
      background-size: 140% 140%, 140% 140%, 140% 140%, auto;
    }
    @keyframes ashMesh {
      0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
      50% { background-position: 8% 6%, 92% 8%, 46% 92%, 0 0; }
    }

    .ash-particle {
      position: absolute;
      bottom: -10%;
      font-family: 'Space Grotesk', monospace;
      font-weight: 700;
      opacity: 0;
      animation-name: ashRise;
      animation-timing-function: ease-in;
      animation-iteration-count: infinite;
      user-select: none;
    }
    @keyframes ashRise {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      8% { opacity: 0.16; }
      85% { opacity: 0.12; }
      100% { transform: translateY(-115vh) rotate(12deg); opacity: 0; }
    }

    .ash-underline { position: relative; display: inline-block; }
    .ash-underline::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -4px;
      height: 5px;
      border-radius: 4px;
      background: linear-gradient(90deg, #A3E635, #4F46E5 60%, #FB7185);
      background-size: 200% 100%;
      animation: ashSlide 5s linear infinite;
    }
    @keyframes ashSlide {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    .ash-cta { position: relative; overflow: hidden; }
    .ash-cta::before {
      content: '';
      position: absolute;
      top: 0; left: -60%;
      width: 40%; height: 100%;
      background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
      transform: skewX(-20deg);
      transition: left 0.6s ease;
    }
    .ash-cta:hover::before { left: 130%; }

    @media (prefers-reduced-motion: reduce) {
      .ash-canvas, .ash-particle, .ash-underline::after { animation: none !important; }
    }
  `}</style>
)

const HERO_PARTICLES = [
  { glyph: '</>', left: '4%', size: 22, duration: 17, delay: 0, color: '#4F46E5' },
  { glyph: '{ }', left: '14%', size: 15, duration: 13, delay: 3, color: '#FB7185' },
  { glyph: '01', left: '24%', size: 13, duration: 19, delay: 5, color: '#0EA5E9' },
  { glyph: '</>', left: '36%', size: 18, duration: 15, delay: 1, color: '#7C3AED' },
  { glyph: '#', left: '48%', size: 20, duration: 17, delay: 7, color: '#16A34A' },
  { glyph: '{ }', left: '58%', size: 14, duration: 14, delay: 2, color: '#CA8A04' },
  { glyph: '</>', left: '68%', size: 20, duration: 18, delay: 6, color: '#4F46E5' },
  { glyph: '10', left: '78%', size: 13, duration: 12, delay: 4, color: '#FB7185' },
  { glyph: '{ }', left: '88%', size: 16, duration: 16, delay: 8, color: '#7C3AED' },
  { glyph: '</>', left: '95%', size: 18, duration: 20, delay: 2.5, color: '#0EA5E9' },
]

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

/* ── Custom Student Portal Showcase Card ── */
const TechIllustration = () => {
  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Background Soft Glow Orbs */}
      <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

      {/* Main Student Dashboard Showcase Card */}
      <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl space-y-5">

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
              PS
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Priya Sharma</h4>
              <p className="text-[11px] font-semibold text-slate-500">Full Stack Web Intern</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>

        {/* Live Project Card */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-indigo-600" /> Current Project Assignment
            </span>
            <span className="text-[11px] font-black text-indigo-600">85% Done</span>
          </div>

          <p className="text-xs font-semibold text-slate-900">
            MERN E-Commerce Dashboard with Payment Gateway
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1">
            <span>Modules: 12/14</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Code Review Approved
            </span>
          </div>
        </div>

        {/* Mentor Feedback Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            AP
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">Amit Patel (Lead Mentor)</span>
              <span className="text-[10px] font-medium text-slate-400">10m ago</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-tight">
              "Great work on MongoDB schema optimization! Certificate approval dispatched."
            </p>
          </div>
        </div>

        {/* Floating Verified Certificate Pill Overlay */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">QR Certificate Verified</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: ASH-2026-8942</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider px-2 py-0.5 bg-amber-400/10 rounded-md border border-amber-400/20">
            MSME Verified
          </span>
        </div>

      </div>
    </div>
  )
}

/* ── Static Data ── */
const STATS = [
  { value: '5,000+', label: 'Students Trained', icon: Users, color: 'text-blue-500' },
  { value: '12+', label: 'Internship Programs', icon: BookOpen, color: 'text-indigo-500' },
  { value: '800+', label: 'Live Projects Completed', icon: Code, color: 'text-purple-500' },
  { value: '4,800+', label: 'Certificates Issued', icon: Award, color: 'text-emerald-500' },
]

const CATEGORIES = [
  {
    title: 'Full Stack Development',
    desc: 'Build scalable modern web applications from scratch using MERN and modern frontend tools.',
    icon: Code,
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    title: 'Artificial Intelligence',
    desc: 'Dive into machine learning models, neural networks, natural language processing, and computer vision.',
    icon: Cpu,
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    title: 'Cyber Security',
    icon: Shield,
    desc: 'Understand threat detection, ethical hacking practices, network security, and risk analysis.',
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-red-500 bg-red-500/10 border-red-500/20'
  },
  {
    title: 'Data Science',
    icon: Database,
    desc: 'Analyze massive datasets, build automated predictive models, and master scientific libraries.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20'
  },
  {
    title: 'UI/UX Design',
    icon: Layers,
    desc: 'Design beautiful, user-centered screens, master modern layouts, and build responsive wireframes.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  },
  {
    title: 'Digital Marketing',
    icon: Globe,
    desc: 'Master organic SEO, social media strategies, audience optimization, and marketing funnels.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    title: 'Python Programming',
    icon: Terminal,
    desc: 'Build foundational programming skills, object-oriented code, algorithm logic, and basic utilities.',
    duration: '4-8 Weeks',
    level: 'Beginner',
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
  },
  {
    title: 'Cloud Computing',
    icon: Cloud,
    desc: 'Understand virtual architecture, serverless infrastructure, continuous integration, and deployments.',
    duration: '4-8 Weeks',
    level: 'Intermediate',
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
  }
]

const WHY_CHOOSE = [
  {
    title: 'Practical Learning',
    desc: 'Build real-world projects that simulate technical assignments in modern organizations.',
    icon: Code,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    title: 'Mentor Guidance',
    desc: 'Connect with experienced industry professionals for feedback and track optimization.',
    icon: Users,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    title: 'Flexible Online Learning',
    desc: 'Learn on your own schedule with self-paced assignments and online resources.',
    icon: Clock,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20'
  },
  {
    title: 'Verified Certificate',
    desc: 'Receive an official verifiable certificate with a unique tracking ID and QR code.',
    icon: Award,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'Portfolio Development',
    desc: 'Develop codebases you can host on GitHub to showcase to prospective employers.',
    icon: Sparkles,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    title: 'Career Skill Development',
    desc: 'Improve your overall engineering practices, problem solving, and design patterns.',
    icon: GraduationCap,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
  }
]

const STEPS = [
  {
    step: 'Step 1',
    title: 'Register',
    desc: 'Select your preferred technology track and fill out the details.',
    icon: FileText
  },
  {
    step: 'Step 2',
    title: 'Get Selected',
    desc: 'Receive your selection notification with credentials and dashboard access.',
    icon: Check
  },
  {
    step: 'Step 3',
    title: 'Start Learning',
    desc: 'Access video instructions, guidelines, and assignment files.',
    icon: Play
  },
  {
    step: 'Step 4',
    title: 'Complete Projects',
    desc: 'Submit your completed project assignments for mentor review.',
    icon: Code
  },
  {
    step: 'Step 5',
    title: 'Receive Certificate',
    desc: 'Download your verified certificate co-signed by our training lead.',
    icon: Award
  }
]

const TESTIMONIALS = [
  {
    name: 'Priya Verma',
    course: 'Web Development Intern — Jaipur',
    rating: 5,
    feedback: "Honestly, I was skeptical at first. But when I submitted my first project and got the certificate, I couldn't stop smiling. The QR code actually works — my college accepted it without any issue.",
    avatar: '👩‍💻'
  },
  {
    name: 'Rahul Mishra',
    course: 'AI & ML Intern — Lucknow',
    rating: 5,
    feedback: "I tried 2-3 other platforms before this that just gave PDF certificates. Here I got actual guidance. My mentor reviewed my code directly and gave real feedback. That made a huge difference.",
    avatar: '👨‍🎓'
  },
  {
    name: 'Kavya Sharma',
    course: 'UI/UX Design Intern — Bhopal',
    rating: 5,
    feedback: "I wanted to learn design but was on a tight budget. This was affordable and I actually learned something. My Figma portfolio is ready now and I've already landed a small freelance project.",
    avatar: '👩‍🎨'
  }
]

const FAQS = [
  {
    q: 'Is this internship fully online?',
    a: 'Yes, everything is online. Work from home, at your own pace — no fixed class timings.'
  },
  {
    q: 'How long does it take?',
    a: 'Usually 4 to 8 weeks. It depends on how much time you put into the projects. No strict deadlines.'
  },
  {
    q: 'Will I actually get a certificate?',
    a: 'Yes — a QR-verified certificate that anyone can scan and confirm online. Not just a PDF, a real verifiable one.'
  },
  {
    q: 'Who can apply?',
    a: 'Students, freshers, or anyone who wants to learn tech. No prior experience needed — just the willingness to build.'
  },
  {
    q: 'What is the fee?',
    a: "It's very affordable for what you get. Check the signup page for the latest pricing or contact us directly."
  }
]

/* ── Tech stack strip data (icon-only, no external assets needed) ── */
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

/* ── Trust / guarantee strip data ── */
const TRUST_POINTS = [
  {
    title: 'Verified Certificate',
    desc: 'Every certificate carries a unique ID and QR code that anyone can verify online.',
    icon: Shield,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    title: 'Mentor Support',
    desc: 'Get your project doubts and reviews answered by real mentors, not bots.',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'Lifetime Access',
    desc: 'Keep access to your learning material and certificate record even after completion.',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
]

const Hero = () => {
  const { homepageStats, testimonials, internshipCategories, courseCategories, courses } = useStore()
  const [activeFaq, setActiveFaq] = useState(null)

  // Icon name → Lucide component map (for DB-stored categories)
  const ICON_MAP = useMemo(() => ({
    Code, Cpu, Shield, Database, Layers, Globe, Terminal, Cloud,
    BookOpen, Users, Award, Sparkles, GraduationCap, Clock, Play,
    FileText, Check, ArrowRight, Star, MessageSquare, LineChart,
    BarChart2: LineChart, Smartphone: MessageSquare, Lock: Shield,
    Zap: Sparkles
  }), [])

  // Dynamic categories — fetch real data from MongoDB
  const categoriesList = useMemo(() => {
    if (internshipCategories && internshipCategories.length > 0) {
      return internshipCategories.map(cat => ({
        title: cat.title || cat.name,
        desc: cat.desc || cat.description || `Master ${cat.title || cat.name} with real projects and expert feedback.`,
        icon: ICON_MAP[cat.icon] || Code,
        duration: cat.duration || '4-8 Weeks',
        level: cat.level || 'Beginner',
        color: cat.color || 'text-indigo-600 bg-indigo-50 border-indigo-200'
      }))
    }
    if (courseCategories && courseCategories.length > 0) {
      return courseCategories.map(cat => ({
        title: cat.name || cat.title,
        desc: cat.description || cat.desc || `Explore real-world ${cat.name || cat.title} tracks.`,
        icon: ICON_MAP[cat.icon] || Code,
        duration: cat.duration || '4-8 Weeks',
        level: cat.level || 'Beginner',
        color: cat.color || 'text-indigo-600 bg-indigo-50 border-indigo-200'
      }))
    }
    if (courses && courses.length > 0) {
      return courses.slice(0, 8).map(course => ({
        title: course.title || course.name,
        desc: course.description || course.shortDesc || `Learn ${course.title || course.name} with live mentor support.`,
        icon: ICON_MAP[course.icon] || Code,
        duration: course.duration || '4-8 Weeks',
        level: course.level || 'Beginner',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
      }))
    }
    return CATEGORIES
  }, [internshipCategories, courseCategories, courses, ICON_MAP])

  // Dynamic testimonials – fall back to static TESTIMONIALS if DB is empty
  const testimonialsList = useMemo(() => {
    if (testimonials && testimonials.length > 0) {
      return testimonials.map(t => ({
        name: t.name,
        course: t.role || t.course || '',
        rating: Number(t.rating) || 5,
        feedback: t.text || t.feedback || '',
        avatar: t.avatar || '👨‍🎓'
      }))
    }
    return TESTIMONIALS
  }, [testimonials])

  const statsList = useMemo(() => {
    return [
      { value: homepageStats?.studentsTrained || '5,000+', label: 'Students Trained', icon: Users, color: 'text-blue-500' },
      { value: homepageStats?.internshipPrograms || '12+', label: 'Internship Programs', icon: BookOpen, color: 'text-indigo-500' },
      { value: homepageStats?.liveProjects || '800+', label: 'Live Projects Completed', icon: Code, color: 'text-purple-500' },
      { value: homepageStats?.certificatesIssued || '4,800+', label: 'Certificates Issued', icon: Award, color: 'text-emerald-500' },
    ]
  }, [homepageStats])

  return (
    <>
      <SEO />
      <HeroBackgroundStyles />

      {/* ── Floating Contact button ── */}
      <a
        href="/contact"
        aria-label="Contact us"
        className="fixed bottom-24 right-6 sm:bottom-6 sm:left-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </a>

      <div className="ash-canvas w-full min-h-screen relative overflow-hidden text-slate-800">

        {/* ── HERO SECTION (Clean Centered White Layout) ── */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white border-emerald-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                AICTE Internship Portal Registered Organization
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="ash-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
              Learn Skills. Build Projects. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                Get Certified.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Take on real internships, complete hands-on projects, and earn an official QR-verified certificate co-signed by industry mentors.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                Apply for Certification Course
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#categories"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm border-2 border-slate-300/80 bg-white hover:border-indigo-500 hover:text-indigo-600 active:scale-95 transition-all text-center text-slate-700 shadow-sm"
              >
                Explore Programs
              </a>
            </div>

            {/* Highlights tags */}
            <div className="pt-6 border-t border-slate-200/60 max-w-3xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  { label: '100% Online', icon: Globe, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { label: 'Verified Certificate', icon: Award, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { label: 'Real Projects', icon: Code, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  { label: 'AICTE Registered', icon: Shield, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  { label: 'Mentor Support', icon: Users, color: 'text-teal-600 bg-teal-50 border-teal-200' },
                ].map((tag) => {
                  const TagIcon = tag.icon
                  return (
                    <span
                      key={tag.label}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${tag.color}`}
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                      {tag.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── ABOUT AMITSOLUTIONHUB ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60">
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
                  <div key={stat.label} className="p-4 sm:p-6 rounded-2xl border bg-white/90 border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[130px]">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color} bg-current/10`}>
                      <IconComp className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="ash-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-slate-900">
                        <Counter value={stat.value} />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
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
              <h2 className="ash-display ash-underline text-3xl sm:text-4xl font-extrabold tracking-tight">
                Built by a Developer, for Students
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                My name is <strong className="text-slate-700">Amit Patel</strong> — I'm a developer and trainer. I noticed that a lot of students finish college knowing theory but have no idea how real work actually looks. That gap bothered me.
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                So I built this — a place where you don't just read about tech, you actually build things. Every internship involves a real project, real mentor feedback, and a certificate that anyone can verify online with a QR code.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">A</div>
                <div>
                  <p className="text-sm font-black text-slate-800">Amit Patel</p>
                  <p className="text-xs text-slate-400 font-medium">Founder &amp; Head — Amit Solution Hub</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Powered By – Tech Marquee */}
        <TechMarquee />

        {/* ── TECHNOLOGIES YOU'LL WORK WITH (icon strip, no external assets) ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-purple-500 bg-purple-500/10 uppercase tracking-wider">
              Tools & Tech
            </span>
            <h2 className="ash-display text-2xl sm:text-3xl font-extrabold tracking-tight">
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
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-transparent border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className={`p-2.5 rounded-lg ${tech.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center">{tech.name}</span>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Trusted Payment Partners */}
        <TrustedPartners />

        {/* ── INTERNSHIP CATEGORIES ── */}
        <section id="categories" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 uppercase tracking-wider">
              Explore Paths
            </span>
            <h2 className="ash-display ash-underline text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Certification Categories
            </h2>
            <p className="text-slate-500 text-sm font-medium">
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
                  className="p-6 rounded-2xl border bg-white/90 border-slate-200/80 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Icon & Badges */}
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl border ${cat.color}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                          {cat.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {cat.duration}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors text-slate-900">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  {/* Learn More Button */}
                  <Link
                    href="/courses"
                    className="mt-6 flex items-center justify-between text-xs font-extrabold text-indigo-600 group-hover:gap-2 transition-all"
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
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 uppercase tracking-wider border border-indigo-100">
              Our Core Strengths
            </span>
            <h2 className="ash-display ash-underline text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Why Choose AmitSolutionHub
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              We focus on delivering high-quality, practical learning experiences to help students bridge the gap between academic theory and technical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CHOOSE.map((item) => {
              const IconComp = item.icon
              return (
                <div key={item.title} className="p-6 rounded-2xl border bg-white/90 border-slate-200/85 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-4">
                  <div className={`p-3 rounded-xl border flex-shrink-0 h-fit ${item.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── CERTIFICATE SECTION ── */}
        <VerifiedCertificateSection courseTitle="Web Development & Full Stack Track" />

        {/* ── TRUST / GUARANTEE STRIP (icon-only, no assets needed) ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST_POINTS.map((point) => {
              const IconComp = point.icon
              return (
                <div
                  key={point.title}
                  className="p-6 rounded-2xl border bg-white/90 border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl border flex-shrink-0 ${point.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800">{point.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{point.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── STUDENT TESTIMONIALS ── */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 uppercase tracking-wider border border-indigo-100">
              Feedback
            </span>
            <h2 className="ash-display ash-underline text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Student Testimonials
            </h2>
            <p className="text-slate-500 text-sm font-medium">
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
                className="p-6 rounded-2xl border bg-white/90 border-slate-200/80 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rating stars */}
                <div className="flex gap-1 text-amber-400 text-sm mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Review body */}
                <p className="text-sm text-slate-550 leading-relaxed font-medium italic flex-grow">
                  "{item.feedback}"
                </p>

                {/* User row */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-200/60 pt-4 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${['bg-blue-100', 'bg-purple-100', 'bg-emerald-100'][idx % 3]
                    }`}>
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{item.name}</h4>
                    <span className="text-[10px] font-bold text-slate-450">{item.course}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60">
          <div className="text-center mb-12 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 uppercase tracking-wider">
              Answers
            </span>
            <h2 className="ash-display text-3xl font-extrabold tracking-tight">
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
                  className="rounded-2xl border bg-white/80 border-slate-200/80 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-800 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
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
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
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

      </div>
    </>
  )
}

export default Hero