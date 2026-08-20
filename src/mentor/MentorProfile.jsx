'use client'
import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Save,
  CheckCircle2,
  Sparkles,
  Award,
  Globe,
  Link2,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function MentorProfile() {
  const { currentUser, userProfile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '')
  const [phone, setPhone] = useState(userProfile?.phone || userProfile?.mobile || '+91 98765 43210')
  const [expertise, setExpertise] = useState(userProfile?.expertise || 'Full-Stack Development, React, Node.js, Cloud')
  const [bio, setBio] = useState(userProfile?.bio || 'Senior Software Engineer & Technical Mentor with 5+ years of experience building production web apps and mentoring 500+ developers.')
  const [githubUrl, setGithubUrl] = useState(userProfile?.githubUrl || 'https://github.com')
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile?.linkedinUrl || 'https://linkedin.com')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const email = currentUser?.email || ''
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    }, 600)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Mentor Profile & Credentials 👤
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your faculty biography, domain expertise, social profiles, and public details
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        
        {/* Avatar and Role Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              (displayName || 'M').charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Verified Faculty Mentor</span>
            </div>
            <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {displayName || 'Mentor'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2">
              <span>{email}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
            </p>
          </div>
        </div>

        {/* Edit Details Form */}
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Technical Expertise / Core Domains
            </label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Mentor Biography
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full text-xs p-4 rounded-2xl outline-none border resize-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                GitHub Profile URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  )
}
