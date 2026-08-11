'use client'
import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Search } from 'lucide-react'

import { parseList } from '../utils/parseList'

export default function AdminProjects() {
  const { projects, addProject, updateProject, deleteProject } = useStore()
  const [viewMode, setViewMode] = useState('grid')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '', description: '', long_description: '', category_name: 'Basic', category_slug: 'basic',
    price_project_only: '', price_with_source: '', features: '', tech_stack: '', is_featured: false, status: 'active',
    thumbnail: ''
  })

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const openCreate = () => {
    setEditingProject(null)
    setFormData({
      title: '', description: '', long_description: '', category_name: 'Basic', category_slug: 'basic',
      price_project_only: '', price_with_source: '', features: '', tech_stack: '', is_featured: false, status: 'active',
      thumbnail: ''
    })
    setShowModal(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    const featList = parseList(project.features)
    const techList = parseList(project.tech_stack)
    setFormData({
      title: project.title, description: project.description, long_description: project.long_description || '',
      category_name: project.category_name, category_slug: project.category_slug,
      price_project_only: String(project.price_project_only), price_with_source: String(project.price_with_source),
      features: featList.join(', '),
      tech_stack: techList.join(', '),
      is_featured: project.is_featured, status: project.status || 'active',
      thumbnail: project.thumbnail || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const featuresArr = formData.features.split(',').map(f => f.trim()).filter(Boolean)
    const techArr = formData.tech_stack.split(',').map(t => t.trim()).filter(Boolean)
    
    setUploading(true)
    const thumbnailUrl = formData.thumbnail

    const payload = {
      ...formData,
      price_project_only: Number(formData.price_project_only),
      price_with_source: Number(formData.price_with_source),
      features: JSON.stringify(featuresArr),
      tech_stack: JSON.stringify(techArr),
      thumbnail: thumbnailUrl
    }
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload)
      } else {
        await addProject(payload)
      }
      setShowModal(false)
    } finally {
      setUploading(false)
    }
  }


  const handleDeleteClick = (project) => {
    setProjectToDelete(project)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return
    const id = projectToDelete.id || projectToDelete._id
    setDeletingId(id)
    try {
      await deleteProject(id)
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error("Error deleting project:", err)
      alert("Failed to delete project: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateProject(id, { status: currentStatus === 'active' ? 'hidden' : 'active' })
    } catch (err) {
      console.error("Error toggling status:", err)
      alert("Failed to update status.")
    }
  }

  const totalSales = projects.reduce((sum, p) => sum + (p.sales || 0), 0)
  const activeCount = projects.filter(p => p.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length} projects | {activeCount} active | {totalSales} total sales</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, color: 'from-blue-500 to-indigo-600', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
          { label: 'Active', value: activeCount, color: 'from-emerald-500 to-green-600', bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
          { label: 'Total Sales', value: totalSales, color: 'from-amber-500 to-orange-600', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
          { label: 'Featured', value: projects.filter(p => p.is_featured).length, color: 'from-purple-500 to-violet-600', bg: '#faf5ff', border: '#e9d5ff', text: '#6d28d9' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: stat.border }}>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: stat.text }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'active', 'hidden'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${statusFilter === status ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/80'}`}>
              {status} ({status === 'all' ? projects.length : projects.filter(p => p.status === status).length})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg 
                className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300 ease-in-out transform group-focus-within:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-12 pr-4 py-2.5 w-56 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-gray-455 focus:outline-none focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 ease-in-out" 
            />
          </div>
          <div className="flex bg-slate-105 border border-slate-200 rounded-xl overflow-hidden p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-400 hover:text-slate-900'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-400 hover:text-slate-900'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map(project => (
            <div key={project.id} className={`group bg-white border rounded-2xl p-5 hover:border-slate-350 hover:shadow-md transition-all duration-300 ${project.status === 'hidden' ? 'border-red-200 bg-red-50/20 opacity-80' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${project.category_slug === 'basic' ? 'bg-green-50 text-green-600 border-green-200' : project.category_slug === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                    {project.category_name}
                  </span>
                  {project.is_featured && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Featured</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleStatus(project.id, project.status)} className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${project.status === 'active' ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={project.status === 'active' ? 'Hide' : 'Show'}>
                    {project.status === 'active' ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                  </button>
                  <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg text-slate-450 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(project)} 
                    disabled={deletingId === project.id} 
                    className="p-1.5 rounded-lg text-slate-450 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {deletingId === project.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1">{project.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{project.description}</p>

              <div className="flex items-center gap-3 mb-3 text-xs font-semibold">
                <span className="text-slate-500">Project: <span className="text-slate-800 font-bold">₹{Number(project.price_project_only).toLocaleString('en-IN')}</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Source: <span className="text-slate-800 font-bold">₹{Number(project.price_with_source).toLocaleString('en-IN')}</span></span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">Slug: <span className="text-slate-500 font-mono font-bold">{project.slug}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                  <span className="text-xs font-bold text-emerald-600">{project.sales || 0} sales</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderBottom: '1px solid #4f46e5' }}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Project</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Price (Project)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Price (Source)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Sales</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(project => (
                <tr key={project.id} className={`hover:bg-slate-50 transition-colors ${project.status === 'hidden' ? 'opacity-80 bg-red-50/10' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {project.is_featured && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Featured</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${project.category_slug === 'basic' ? 'bg-green-50 text-green-600 border-green-200' : project.category_slug === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>{project.category_name}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-bold">₹{Number(project.price_project_only).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-bold">₹{Number(project.price_with_source).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4"><span className="text-sm text-emerald-600 font-bold">{project.sales || 0}</span></td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(project.id, project.status)} className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-650 border-red-200 hover:bg-red-100'}`}>
                      {project.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(project)} className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg></button>
                      <button 
                        onClick={() => handleDeleteClick(project)} 
                        disabled={deletingId === project.id} 
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === project.id ? (
                          <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image URL Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center group relative">
                    {formData.thumbnail ? (
                      <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Project Thumbnail URL *</label>
                    <input 
                      type="text" 
                      value={formData.thumbnail} 
                      onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} 
                      required 
                      placeholder="https://example.com/project-image.jpg" 
                      className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-blue-400 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" 
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Provide a direct link to the image (e.g. from Google Drive, Imgur, etc.)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Project Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Portfolio Website" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Short Description *</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={2} placeholder="Brief description shown on project cards" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Detailed Description</label>
                <textarea value={formData.long_description} onChange={e => setFormData({ ...formData, long_description: e.target.value })} rows={3} placeholder="Full description shown on project detail page" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
                  <select value={formData.category_slug} onChange={e => {
                    const slug = e.target.value
                    const name = slug === 'basic' ? 'Basic' : slug === 'medium' ? 'Medium' : 'Premium'
                    const catId = slug === 'basic' ? 1 : slug === 'medium' ? 2 : 3
                    setFormData({ ...formData, category_slug: slug, category_name: name, category_id: catId })
                  }} className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50 transition-all">
                    <option value="basic" className="bg-white">Basic</option>
                    <option value="medium" className="bg-white">Medium</option>
                    <option value="premium" className="bg-white">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Price (Project Only) *</label>
                  <input type="number" value={formData.price_project_only} onChange={e => setFormData({ ...formData, price_project_only: e.target.value })} required placeholder="499" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Price (With Source) *</label>
                  <input type="number" value={formData.price_with_source} onChange={e => setFormData({ ...formData, price_with_source: e.target.value })} required placeholder="999" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Features (comma separated)</label>
                <input type="text" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} placeholder="Responsive Design, Dark Mode, Contact Form" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tech Stack (comma separated)</label>
                <input type="text" value={formData.tech_stack} onChange={e => setFormData({ ...formData, tech_stack: e.target.value })} placeholder="React, Tailwind CSS, Vite" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-slate-100 text-blue-500 focus:ring-blue-500/30" />
                  <span className="text-sm text-slate-600">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.status === 'active'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'active' : 'hidden' })} className="w-4 h-4 rounded border-white/20 bg-slate-100 text-emerald-500 focus:ring-emerald-500/30" />
                  <span className="text-sm text-slate-600">Active (visible on site)</span>
                </label>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} disabled={uploading} className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
                  {uploading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deletingId && setShowDeleteModal(false)} />
          <div className="relative bg-white border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-50"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Project?</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Are you sure you want to delete <span className="text-slate-900 font-medium">"{projectToDelete?.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  disabled={deletingId}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-slate-900 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {deletingId ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Deleting...</>
                  ) : 'Yes, Delete Project'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
