import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, ArrowRight, CheckCircle2, ShieldCheck, QrCode, ExternalLink } from 'lucide-react'
import CertificateDocument from './Certificate/CertificateDocument'

export default function VerifiedCertificateSection({ courseTitle = "Web Development Track", isDark = false }) {
  const sampleCertificate = {
    certificate_id: "ASH-2026-8942",
    certificateType: "Certificate of Completion",
    studentName: "Student Name",
    courseName: courseTitle,
    approval_date: new Date().toISOString(),
    signatoryName: "Amit Patel",
    signatoryRole: "Director & Founder",
    mentorName: "Naivedh Patel" }

  return (
    <section className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-900/40 border-t border-slate-800' : 'bg-slate-50/60 border-t border-slate-200/60'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 uppercase tracking-wider">
              <Award className="w-4 h-4" /> Official Certificate
            </div>
            <h2 className={`ash-display text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Verified Internship & Course Certificate
            </h2>
            <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Students who successfully complete their training or internship receive an official verifiable certificate with real-time QR code verification, ISO aligned quality standards, and Govt. of India MSME registration.
            </p>

            {/* Certificate Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: 'Digital Verification', desc: 'Instant 24/7 online ID validation' },
                { title: 'Resume Friendly', desc: 'Sharable PDF for job applications' },
                { title: 'LinkedIn Ready', desc: 'Add directly to LinkedIn Licenses' },
                { title: 'QR Scan Verification', desc: 'Scan code to view official ledger' }
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <span className={`text-sm font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feat.title}</span>
                    <span className="text-xs text-slate-400 font-medium">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4 flex-wrap">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all uppercase tracking-wider"
              >
                Verify a Certificate <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Govt. MSME Registered
              </span>
            </div>
          </motion.div>

          {/* Right: REAL CERTIFICATE DOCUMENT PREVIEW */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
            <div className="relative group max-w-xl mx-auto">
              {/* Outer Glow & Decoration */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-45 transition duration-500" />

              <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-transparent dark:bg-slate-900 p-2 sm:p-3 shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-[1.01]">
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-white rounded-t-xl text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real Certificate Sample</span>
                  </div>
                  <span className="text-amber-400 font-mono text-[10px]">MSME GOVT REGISTERED</span>
                </div>

                {/* Real Certificate Document Component */}
                <div className="p-1 sm:p-2 bg-white rounded-b-xl border border-slate-100 shadow-inner">
                  <CertificateDocument certificate={sampleCertificate} />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
