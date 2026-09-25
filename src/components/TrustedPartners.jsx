import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
export default function TrustedPartners() {
  const partners = [
    {
      name: 'Vercel',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_2020.svg',
      height: 'h-6',
      desc: 'Cloud & Edge Infrastructure',
      type: 'image'
    },

    {
      name: 'Razorpay',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
      height: 'h-8',
      desc: 'Official Secure Gateway',
      type: 'image'
    },

    {
      name: 'MongoDB',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
      height: 'h-8',
      desc: 'Official Database Partner',
      type: 'image'
    },

    {
      name: 'GitHub',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
      height: 'h-9',
      desc: 'Source Code & Versioning',
      type: 'image'
    }
  ]

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/40 dark:border-slate-900/50">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 uppercase tracking-widest">
          Certifications & Security
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Trusted Partners
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Accredited certifications and secure transaction systems.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {partners.map((partner, index) => {
          const IconComp = partner.icon
          return (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="w-full p-6 rounded-3xl border bg-transparent dark:bg-slate-955/40 border-slate-200/60 dark:border-slate-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 group"
            >
              <div className="h-12 flex items-center justify-center">
                {partner.type === 'image' ? (
                  <img
                    src={partner.logo?.src || partner.logo}
                    alt={partner.name}
                    className={`${partner.height} w-auto object-contain transition-all duration-300 group-hover:scale-105`}
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center shadow-md shadow-orange-500/10`}>
                    <IconComp className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{partner.name}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{partner.desc}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
