'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SEO from './SEO'
import TechMarquee from './TechMarquee'
import VerifiedCertificateSection from './VerifiedCertificateSection'
import AshnexaRobot from './robot/AshnexaRobot'
import {
  ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronRight,
  Code, Cpu, Database, Globe, GraduationCap,
  Layers, LineChart, Play, QrCode, Shield, ShieldCheck,
  Sparkles, Star, Users
} from 'lucide-react'

/* ── Smooth subtle animation presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

/* ── Metrics ── */
const STATS = [
  { value: '5,000+', label: 'Learners Trained' },
  { value: '12+', label: 'Certification Tracks' },
  { value: '800+', label: 'Live Projects Built' },
  { value: '4,800+', label: 'Verified Certificates' },
]

/* ── Core Services ── */
const SERVICES = [
  {
    icon: Code,
    title: 'Custom Web & SaaS Development',
    desc: 'Production-ready full-stack applications, enterprise dashboards, and modern cloud platforms built to scale.',
    link: '/services',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL']
  },
  {
    icon: GraduationCap,
    title: 'Certification Programs',
    desc: 'Hands-on engineering tracks with live industry projects and verifiable QR credentials.',
    link: '/programs',
    tags: ['Real Codebases', 'Direct Mentorship', 'Verifiable QR']
  },
  {
    icon: Shield,
    title: 'Technical Support & Systems',
    desc: 'Hardware diagnostics, workstation maintenance, secure local networking, and enterprise IT infrastructure.',
    link: '/services',
    tags: ['Diagnostics', 'Network Setup', 'Enterprise Care']
  },
  {
    icon: LineChart,
    title: 'IT & Cloud Architecture Consulting',
    desc: 'Strategic technology advisory, database optimization, cloud migration, and scalable engineering consulting.',
    link: '/services',
    tags: ['Cloud Strategy', 'DevOps', 'System Design']
  },
]

/* ── Certification Courses ── */
const COURSES = [
  {
    icon: Code,
    title: 'Full Stack Web Engineering',
    desc: 'Master frontend & backend development using modern JavaScript, React, Next.js, REST APIs, and MongoDB.',
    duration: '4–8 Weeks',
    level: 'Beginner to Intermediate'
  },
  {
    icon: Cpu,
    title: 'Artificial Intelligence & ML',
    desc: 'Build intelligent models, neural networks, predictive systems, and natural language applications with Python.',
    duration: '4–8 Weeks',
    level: 'Intermediate'
  },
  {
    icon: ShieldCheck,
    title: 'Cyber Security & Network Defense',
    desc: 'Practical ethical security testing, threat detection, vulnerability analysis, and zero-trust principles.',
    duration: '4–8 Weeks',
    level: 'Intermediate'
  },
  {
    icon: Globe,
    title: 'Cloud Computing & DevOps',
    desc: 'Containerization with Docker, CI/CD automation pipelines, cloud architecture on AWS, and deployment mastery.',
    duration: '4–8 Weeks',
    level: 'Intermediate'
  },
  {
    icon: Database,
    title: 'Data Science & Analytics',
    desc: 'Analyze complex datasets, build automated statistical models, and design executive business dashboards.',
    duration: '4–8 Weeks',
    level: 'Beginner'
  },
  {
    icon: Layers,
    title: 'UI/UX Product Design',
    desc: 'Design intuitive design systems, high-fidelity Figma prototypes, and seamless user experiences.',
    duration: '4–8 Weeks',
    level: 'Beginner'
  }
]

/* ── Why Ashnexa ── */
const WHY_POINTS = [
  {
    icon: Code,
    title: 'Production-Grade Projects',
    desc: 'Build real-world applications that simulate actual technical assignments in modern technology teams.'
  },
  {
    icon: ShieldCheck,
    title: 'Verifiable Digital Credentials',
    desc: 'Every certificate comes with a unique ID and QR code verifiable 24/7 on our official online registry.'
  },
  {
    icon: Users,
    title: 'Direct Senior Mentor Reviews',
    desc: 'Get your code, architecture, and logic reviewed directly by experienced software engineers.'
  },
  {
    icon: Award,
    title: 'Resume & Portfolio Ready',
    desc: 'Graduates receive complete GitHub repositories, project documentation, and credentials ready for recruiters.'
  }
]

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    name: 'Priya Verma',
    role: 'Full Stack Graduate · Jaipur',
    feedback: 'The QR-verifiable certificate was accepted by my college committee without any questions. The project review by the mentor was genuine and helped me understand real backend structure.',
    rating: 5
  },
  {
    name: 'Rahul Mishra',
    role: 'AI & ML Trainee · Lucknow',
    feedback: 'Unlike generic courses that just share lecture slides, Ashnexa provided real dataset assignments and guided me through model optimization. Highly recommended.',
    rating: 5
  },
  {
    name: 'Kavya Sharma',
    role: 'UI/UX Design Track · Bhopal',
    feedback: 'Structured, practical, and affordable. My Figma portfolio was completed during the track and I was able to show real case studies to clients.',
    rating: 5
  }
]

/* ── Counter Component ── */
function Counter({ target }) {
  const [val, setVal] = useState(0)
  const num = parseInt(target.replace(/\D/g, ''), 10)
  const suffix = target.replace(/[\d,]/g, '')

  useEffect(() => {
    let start = 0
    const step = Math.max(1, Math.ceil(num / 40))
    const timer = setInterval(() => {
      start += step
      if (start >= num) {
        setVal(num)
        clearInterval(timer)
      } else {
        setVal(start)
      }
    }, 35)
    return () => clearInterval(timer)
  }, [num])

  return <>{val.toLocaleString('en-IN')}{suffix}</>
}

export default function Hero() {
  return (
    <>
      <SEO
        title="Ashnexa Systems — Software Engineering & Certification Courses"
        description="Ashnexa Systems is a premier tech solutions agency and certification provider. We engineer scalable web applications and deliver hands-on, verifiable tech certifications."
      />

      <div className="w-full bg-[#FAFAFA] text-slate-900">

        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left: Text, Badges, CTAs */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 space-y-7 text-center lg:text-left"
            >
              {/* Trust Pill */}
              <motion.div variants={fadeUp} className="flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  Industry-Standard Certification · Real-World Engineering Projects
                </span>
              </motion.div>

              {/* Title */}
              <motion.div variants={fadeUp} className="space-y-4">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  Enterprise Engineering &{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Verified Tech Credentials
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Ashnexa Systems delivers custom enterprise software solutions and industry-standard certification courses. Learn by building real, production-level codebases with direct senior mentor guidance.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start items-center gap-3.5 pt-1">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
                >
                  <GraduationCap className="w-4.5 h-4.5" />
                  Explore Programs
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm hover:scale-[1.02]"
                >
                  <QrCode className="w-4.5 h-4.5 text-indigo-600" />
                  Verify Certificate
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 px-3 py-3.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Our IT Services <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Trust Highlights */}
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start items-center gap-5 sm:gap-7 pt-6 border-t border-slate-200/70 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Online & Verifiable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>College Credit Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Production Codebases</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Futuristic AI Coding Robot Beside Laptop */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center w-full mt-6 lg:mt-0"
            >
              <AshnexaRobot action="hero-coding" />
            </motion.div>

          </div>
        </section>

        {/* ── TECH MARQUEE / STACK ── */}
        <section className="py-6 border-y border-slate-200/70 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Technologies We Master & Teach
            </p>
            <TechMarquee />
          </div>
        </section>

        {/* ── KEY METRICS / STATS ── */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center shadow-sm hover:shadow-md transition-all"
              >
                <p className="text-3xl sm:text-4xl font-black text-indigo-600 tabular-nums">
                  <Counter target={s.value} />
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CORE SERVICES ── */}
        <section className="py-16 bg-white border-y border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Enterprise Offerings</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Technology solutions built for performance
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                From scalable SaaS development to hands-on engineer training, we support high-growth technology objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: 4 Service Offerings Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {SERVICES.map((s) => (
                  <div
                    key={s.title}
                    className="p-5 sm:p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200 hover:border-indigo-200 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        <s.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{s.title}</h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{s.desc}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {s.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 mt-3 border-t border-slate-200/60">
                      <Link
                        href={s.link}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Learn more <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Cloud Management Robot Visual */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FAFAFA] border border-slate-200/80">
                <AshnexaRobot action="services-cloud" />
                <div className="text-center pt-2 px-2">
                  <p className="text-xs font-black text-slate-900">Cloud Infrastructure Management</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Automated CI/CD pipelines, container orchestration & 24/7 telemetry</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CERTIFICATION COURSES (CLEAN LIGHT THEME) ── */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Industry-Aligned Programs</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Learn by building real, production codebases
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                Self-paced online tracks with mentor code reviews, comprehensive assignments, and verified certificates.
              </p>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors self-start md:self-auto"
            >
              View All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* AI Mentorship & Hologram Spotlight Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-white border border-indigo-100 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Live 1-on-1 Mentorship Model
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Guided directly by experienced software engineers
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                  Break free from passive tutorials. Every learner is paired with our interactive mentorship system providing line-by-line code reviews, architectural feedback, and verifiable project credentials.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-1 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-on-1 Code Reviews</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Student Hologram Curriculum</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified QR Credential</span>
                </div>
              </div>
              <div className="lg:col-span-5 flex justify-center">
                <AshnexaRobot action="programs-mentor" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((c) => (
              <Link
                key={c.title}
                href="/programs"
                className="group block p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {c.duration}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  {c.desc}
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">{c.level}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Enroll Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── OFFICIAL VERIFIED CERTIFICATE PREVIEW SECTION ── */}
        <VerifiedCertificateSection courseTitle="Full Stack Web Engineering Track" isDark={false} />

        {/* ── WHY ASHNEXA SYSTEMS ── */}
        <section className="py-20 bg-white border-y border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Why Ashnexa Systems</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Bridging academic theory with practical engineering
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                Everything is engineered to ensure you graduate with tangible, demonstrable capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Robot Holding Glowing Digital Shield */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FAFAFA] border border-slate-200/80">
                <AshnexaRobot action="why-us-shield" />
                <div className="text-center pt-2 px-2">
                  <p className="text-xs font-black text-slate-900">Security & Verified Reliability</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tamper-proof credentials, zero data leakage & industry engineering standards</p>
                </div>
              </div>

              {/* Right: 4 Why Points in 2x2 Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {WHY_POINTS.map((w) => (
                  <div
                    key={w.title}
                    className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200 space-y-3 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      <w.icon className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{w.title}</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Student & Client Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Trusted by 5,000+ ambitious learners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    "{t.feedback}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ELEGANT LIGHT CALL TO ACTION / CONTACT SUPPORT ── */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-white via-indigo-50/20 to-white p-8 sm:p-12 shadow-lg shadow-indigo-100/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Enrollment & Dedicated Support Active
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Ready to build your technical future with Ashnexa?
                </h2>

                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Gain verified credentials, build actual production applications, and connect with 24/7 dedicated support and senior technical mentors today.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3.5 pt-2">
                  <Link
                    href="/student-signup"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Enroll in Certification
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Talk to Support Desk <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right: Support Desk Robot with Headset */}
              <div className="lg:col-span-5 flex justify-center">
                <AshnexaRobot action="contact-support" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 mt-8 border-t border-slate-200/60 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Verifiable Digital Credentials</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Online Verification</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-indigo-600" /> Production-Ready Skills</span>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}