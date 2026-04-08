import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { emailNotify } from '../utils/emailNotify'
import {
  EmployeeBadge,
  EmployeeEmptyState,
  EmployeePageHeader,
  EmployeeSurface,
} from './EmployeePanelUI'

const categories = ['Basic', 'Medium', 'Premium']

export default function SellProjectRequestRefined() {
  const { currentUser, userProfile, createSellRequest } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [form, setForm] = useState({
    projectTitle: '',
    description: '',
    longDescription: '',
    category: 'Basic',
    price: '',
    includeSource: false,
    features: '',
    techStack: '',
    demoUrl: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      await createSellRequest({
        ...form,
        userId: currentUser?.uid,
        userName: userProfile?.displayName || 'Unknown',
        userEmail: currentUser?.email || 'unknown',
      })

      emailNotify('sell_request_admin', {
        sellerName: userProfile?.displayName || 'Employee',
        sellerEmail: currentUser?.email,
        sellerPhone: userProfile?.phone || '',
        projectTitle: form.projectTitle,
        projectDesc: form.description,
        price: form.price,
      })

      emailNotify('sell_request_user', {
        sellerName: userProfile?.displayName || 'Employee',
        sellerEmail: currentUser?.email,
        projectTitle: form.projectTitle,
      })

      setSubmitted(true)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to submit sell request.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <EmployeePageHeader
          eyebrow="Marketplace Desk"
          title="Sell Request Submitted"
          description="Admin review ke liye aapka project successfully queue me chala gaya hai."
        />
        <EmployeeEmptyState
          icon="✅"
          title={form.projectTitle}
          description={`Category: ${form.category} | Price: ₹${Number(form.price || 0).toLocaleString('en-IN')}. Approval ke baad yeh marketplace workflow me दिखाई देगा.`}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <EmployeePageHeader
        eyebrow="Marketplace Desk"
        title="Sell Your Project"
        description="Employee panel se direct project listing request bhejo. Admin approval ke baad yeh marketplace ya custom sales flow me ja sakta hai."
        stats={[
          { label: 'Category', value: form.category },
          { label: 'Source code', value: form.includeSource ? 'Included' : 'Optional' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EmployeeSurface title="Project Listing Form" description="Clear title, pricing aur tech details dena approval ko fast karta hai.">
          {status.message && (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Project Title</label>
                <input
                  value={form.projectTitle}
                  onChange={(event) => setForm(current => ({ ...current, projectTitle: event.target.value }))}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Category</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm(current => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-950">{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Short Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm(current => ({ ...current, description: event.target.value }))}
                rows={3}
                required
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Detailed Description</label>
              <textarea
                value={form.longDescription}
                onChange={(event) => setForm(current => ({ ...current, longDescription: event.target.value }))}
                rows={5}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm(current => ({ ...current, price: event.target.value }))}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Demo URL</label>
                <input
                  value={form.demoUrl}
                  onChange={(event) => setForm(current => ({ ...current, demoUrl: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Features</label>
                <input
                  value={form.features}
                  onChange={(event) => setForm(current => ({ ...current, features: event.target.value }))}
                  placeholder="Responsive, Auth, Dashboard"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Tech Stack</label>
                <input
                  value={form.techStack}
                  onChange={(event) => setForm(current => ({ ...current, techStack: event.target.value }))}
                  placeholder="React, Node, Firebase"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.includeSource}
                onChange={(event) => setForm(current => ({ ...current, includeSource: event.target.checked }))}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              Include source code with the sale
            </label>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Listing Request'}
            </button>
          </form>
        </EmployeeSurface>

        <EmployeeSurface title="Listing Preview" description="Admin ko exactly kya dikhega uska quick summary.">
          <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap gap-2">
              <EmployeeBadge tone="info">{form.category}</EmployeeBadge>
              <EmployeeBadge tone={form.includeSource ? 'success' : 'warning'}>
                {form.includeSource ? 'Source Included' : 'Source Optional'}
              </EmployeeBadge>
            </div>
            <h3 className="text-xl font-black text-white">{form.projectTitle || 'Untitled project'}</h3>
            <p className="text-sm leading-6 text-slate-400">
              {form.description || 'Short project summary yahan preview hogi.'}
            </p>
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07] px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Proposed Price</p>
              <p className="mt-2 text-3xl font-black text-white">
                ₹{Number(form.price || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p><span className="font-semibold text-white">Tech:</span> {form.techStack || 'Not added yet'}</p>
              <p><span className="font-semibold text-white">Features:</span> {form.features || 'Not added yet'}</p>
              <p><span className="font-semibold text-white">Demo:</span> {form.demoUrl || 'Not added yet'}</p>
            </div>
          </div>
        </EmployeeSurface>
      </div>
    </div>
  )
}
