import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext'

const GRADIENT_MAP = [
  'from-blue-500 via-indigo-500 to-purple-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-pink-500 via-purple-500 to-indigo-600',
  'from-cyan-500 via-blue-500 to-violet-600',
  'from-lime-500 via-emerald-500 to-teal-600',
]

function ServiceIcon({ icon }) {
  const icons = {
    code: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
    tool: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.25-2.98a1 1 0 00-1.42.87v5.94a1 1 0 001.42.87l5.25-2.98a1 1 0 000-1.72zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>,
    video: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
    support: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>,
  }
  return icons[icon] || icons.code
}

const ServiceForm = ({ formData, setFormData, onCancel, onSubmit, submitLabel }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Service Name</label>
      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Web Development" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
      <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Brief description of the service" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Icon</label>
        <div className="space-y-2">
          <select 
            value={['code', 'tool', 'video', 'support'].includes(formData.icon) ? formData.icon : 'other'} 
            onChange={e => {
              const val = e.target.value;
              setFormData({ ...formData, icon: val === 'other' ? '' : val });
            }} 
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="code" className="bg-gray-900">Code</option>
            <option value="tool" className="bg-gray-900">Tool</option>
            <option value="video" className="bg-gray-900">Video</option>
            <option value="support" className="bg-gray-900">Support</option>
            <option value="other" className="bg-gray-900">Other (Custom)</option>
          </select>
          {!['code', 'tool', 'video', 'support'].includes(formData.icon) && (
            <input 
              type="text" 
              value={formData.icon} 
              onChange={e => setFormData({ ...formData, icon: e.target.value })} 
              placeholder="Enter icon name..." 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all animate-in fade-in slide-in-from-top-1" 
            />
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
        <div className="space-y-2">
          <select 
            value={['Development', 'Support', 'Creative'].includes(formData.category) ? formData.category : 'other'} 
            onChange={e => {
              const val = e.target.value;
              setFormData({ ...formData, category: val === 'other' ? '' : val });
            }} 
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="Development" className="bg-gray-900">Development</option>
            <option value="Support" className="bg-gray-900">Support</option>
            <option value="Creative" className="bg-gray-900">Creative</option>
            <option value="other" className="bg-gray-900">Other (Custom)</option>
          </select>
          {!['Development', 'Support', 'Creative'].includes(formData.category) && (
            <input 
              type="text" 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })} 
              placeholder="Enter custom category..." 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all animate-in fade-in slide-in-from-top-1" 
            />
          )}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Base Price (INR)</label>
        <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} placeholder="499" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Redirect Path (e.g. /services/web)</label>
        <input type="text" value={formData.path} onChange={e => setFormData({ ...formData, path: e.target.value })} placeholder="/services/details" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <button onClick={onCancel} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">Cancel</button>
      <button onClick={onSubmit} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">{submitLabel}</button>
    </div>
  </div>
)

export default function AdminServices() {
  const { orders, projects, services, addService, updateService, deleteService } = useStore()
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    icon: 'code', 
    basePrice: '', 
    category: 'Development', 
    path: '', 
    active: true 
  })

  const categories = ['All', ...new Set(services.map(s => s.category))]

  const serviceStats = useMemo(() => {
    const stats = {}
    services.forEach(s => {
      const relatedOrders = orders.filter(o => {
        const project = projects.find(p => p.id === o.project_id)
        return project && project.category_name?.toLowerCase().includes(s.category.toLowerCase())
      })
      stats[s.id] = {
        orders: relatedOrders.length,
        revenue: relatedOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
      }
    })
    return stats
  }, [services, orders, projects])

  const toggleActive = async (id) => {
    const service = services.find(s => s.id === id)
    if (!service) return
    try {
      await updateService(id, { active: !service.active })
    } catch (err) {
      console.error(err)
      alert("Failed to update service status.")
    }
  }

  const handleAdd = async () => {
    try {
      await addService({
        ...formData,
        basePrice: Number(formData.basePrice) || 0
      })
      setShowAddModal(false)
      setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', path: '', active: true })
    } catch (err) {
      console.error(err)
      alert("Failed to add service.")
    }
  }

  const handleEdit = async () => {
    try {
      await updateService(editingService.id, {
        ...formData,
        basePrice: Number(formData.basePrice) || 0
      })
      setEditingService(null)
      setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', path: '', active: true })
    } catch (err) {
      console.error(err)
      alert("Failed to update service.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    try {
      await deleteService(id)
    } catch (err) {
      console.error(err)
      alert("Failed to delete service.")
    }
  }

  const openEdit = (service) => {
    setEditingService(service)
    setFormData({ 
      name: service.name, 
      description: service.description, 
      icon: service.icon, 
      basePrice: String(service.basePrice), 
      category: service.category, 
      path: service.path || '', 
      active: service.active 
    })
  }

  const filteredServices = categoryFilter === 'All'
    ? services
    : services.filter(s => s.category === categoryFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Services Platform</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-sm text-gray-500">{services.length} services offered</p>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="text-sm font-medium text-emerald-400">{services.filter(s => s.active).length} active</span>
          </div>
        </div>
        <button 
          onClick={() => { setShowAddModal(true); setEditingService(null); setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', path: '', active: true }) }} 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
        <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        These services are displayed globally across the main website. Customers can request custom projects based on them.
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingService(null) }} />
          <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{editingService ? 'Edit Service' : '✦ New Capability'}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editingService ? 'Update existing service catalog' : 'Add a new service offering to the platform'}</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingService(null) }} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <ServiceForm 
                formData={formData}
                setFormData={setFormData}
                onCancel={() => { setShowAddModal(false); setEditingService(null) }}
                onSubmit={editingService ? handleEdit : handleAdd} 
                submitLabel={editingService ? 'Save Changes' : 'Create Service'} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service, idx) => {
          const gradient = GRADIENT_MAP[idx % GRADIENT_MAP.length]
          return (
            <div
              key={service.id}
              className={`relative group rounded-2xl overflow-hidden border transition-all duration-300 ${
                service.active 
                  ? 'border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1' 
                  : 'border-white/5 opacity-60 hover:opacity-80'
              } bg-gray-900/80 backdrop-blur-xl`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-all duration-500`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-lg`}>
                    <div className="w-full h-full bg-gray-900 rounded-[15px] flex items-center justify-center">
                      <div className={`text-transparent bg-clip-text bg-gradient-to-br ${gradient}`}>
                        <ServiceIcon icon={service.icon} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => openEdit(service)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">{service.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${service.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {service.active ? 'Live' : 'Paused'}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium text-gray-400">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{service.description}</p>
                </div>

                <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium text-xs">Starting Base Price</span>
                    <span className="text-white font-bold tracking-wide">₹{service.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Orders</span>
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {serviceStats[service.id]?.orders || 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Revenue</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="text-[10px]">₹</span>
                        {(serviceStats[service.id]?.revenue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                  <span className="text-xs font-semibold text-gray-400">{service.active ? 'Accepting Requests' : 'Currently Hidden'}</span>
                  <label className="relative inline-flex cursor-pointer shadow-inner">
                    <input type="checkbox" checked={service.active} onChange={() => toggleActive(service.id)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500 border border-gray-700 peer-checked:border-emerald-500/50 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full shadow-sm" />
                  </label>
                </div>
              </div>
            </div>
          )
        })}
        
        <button
          onClick={() => { setShowAddModal(true); setEditingService(null); setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', path: '', active: true }) }}
          className="group rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/40 bg-transparent py-14 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-blue-400 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-wide">Add New Service</span>
        </button>
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-sm">No services found</p>
        </div>
      )}
    </div>
  )
}
