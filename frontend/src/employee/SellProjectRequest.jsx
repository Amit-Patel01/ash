import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const categories = ['Basic', 'Medium', 'Premium']

export default function SellProjectRequest() {
  const { currentUser, userProfile, createSellRequest } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    projectTitle: '', description: '', longDescription: '', category: 'Basic',
    price: '', includeSource: false, features: '', techStack: '', demoUrl: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createSellRequest({
      ...form,
      userId: currentUser?.uid,
      userName: userProfile?.displayName || 'Unknown',
      userEmail: currentUser?.email || 'unknown',
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Request Submitted!</h2>
            <p className="text-gray-400 mb-6">Your project listing request has been sent to the admin for review. You'll be notified once it's approved.</p>
            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 border border-blue-500/20 text-left">
              <p className="text-sm text-blue-300"><strong>Project:</strong> {form.projectTitle}</p>
              <p className="text-sm text-blue-300"><strong>Price:</strong> ₹{Number(form.price).toLocaleString('en-IN')}</p>
              <p className="text-sm text-blue-300"><strong>Category:</strong> {form.category}</p>
              <p className="text-sm text-blue-300"><strong>Status:</strong> Pending Review</p>
            </div>
            <a href="/employee" className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold text-center hover:from-emerald-700 hover:to-cyan-700 transition-all">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sell Your Project</h1>
        <p className="text-sm text-gray-400 mt-1">Submit your project for listing on SolutionHub marketplace</p>
      </div>

      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Title *</label>
              <input type="text" value={form.projectTitle} onChange={e => setForm({ ...form, projectTitle: e.target.value })} required placeholder="e.g. Portfolio Website" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all">
                {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Short Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={2} placeholder="Brief description for project cards" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Detailed Description</label>
            <textarea value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} rows={3} placeholder="Full description for the project detail page" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="999" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Demo URL</label>
              <input type="url" value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://your-demo.com" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Features (comma separated)</label>
              <input type="text" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Responsive, Dark Mode, Auth" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tech Stack (comma separated)</label>
              <input type="text" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.includeSource} onChange={e => setForm({ ...form, includeSource: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30" />
            <span className="text-sm text-gray-300">Include source code with sale</span>
          </label>

          <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Listing Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
