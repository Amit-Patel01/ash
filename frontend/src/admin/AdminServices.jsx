import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext'

const defaultServices = [
  {
    id: 'web-dev',
    name: 'Web & Project Development',
    description: 'Custom websites and web applications built with modern technologies.',
    icon: 'code',
    basePrice: 499,
    category: 'Development',
    active: true,
  },
  {
    id: 'pc-repair',
    name: 'PC & Laptop Repair',
    description: 'Professional hardware and software repair services for all types of computers.',
    icon: 'tool',
    basePrice: 299,
    category: 'Support',
    active: true,
  },
  {
    id: 'video-editing',
    name: 'Video & Photo Editing',
    description: 'Professional editing services for videos and photos.',
    icon: 'video',
    basePrice: 199,
    category: 'Creative',
    active: true,
  },
  {
    id: 'tech-support',
    name: 'Technical Support & Guidance',
    description: 'Expert technical support and guidance for tech-related issues.',
    icon: 'support',
    basePrice: 99,
    category: 'Support',
    active: true,
  },
  {
    id: 'custom-project',
    name: 'Custom Project Development',
    description: 'Tailored project solutions built to specific requirements.',
    icon: 'code',
    basePrice: 1499,
    category: 'Development',
    active: true,
  },
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

export default function AdminServices() {
  const { orders, projects } = useStore()
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_services')
      return saved ? JSON.parse(saved) : defaultServices
    } catch {
      return defaultServices
    }
  })
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', active: true })

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

  const saveServices = (newServices) => {
    setServices(newServices)
    localStorage.setItem('admin_services', JSON.stringify(newServices))
  }

  const toggleActive = (id) => {
    const updated = services.map(s => s.id === id ? { ...s, active: !s.active } : s)
    saveServices(updated)
  }

  const handleAdd = () => {
    const newService = {
      id: `service-${Date.now()}`,
      ...formData,
      basePrice: Number(formData.basePrice) || 0
    }
    saveServices([...services, newService])
    setShowAddModal(false)
    setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', active: true })
  }

  const handleEdit = () => {
    const updated = services.map(s => s.id === editingService.id ? { ...formData, id: s.id, basePrice: Number(formData.basePrice) || 0 } : s)
    saveServices(updated)
    setEditingService(null)
    setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', active: true })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    saveServices(services.filter(s => s.id !== id))
  }

  const openEdit = (service) => {
    setEditingService(service)
    setFormData({ name: service.name, description: service.description, icon: service.icon, basePrice: String(service.basePrice), category: service.category, active: service.active })
  }

  const filteredServices = categoryFilter === 'All'
    ? services
    : services.filter(s => s.category === categoryFilter)

  const ServiceForm = ({ onSubmit, submitLabel }) => (
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
          <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
            <option value="code" className="bg-gray-900">Code</option>
            <option value="tool" className="bg-gray-900">Tool</option>
            <option value="video" className="bg-gray-900">Video</option>
            <option value="support" className="bg-gray-900">Support</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
          <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
            <option value="Development" className="bg-gray-900">Development</option>
            <option value="Support" className="bg-gray-900">Support</option>
            <option value="Creative" className="bg-gray-900">Creative</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Base Price (INR)</label>
        <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} placeholder="499" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => { setShowAddModal(false); setEditingService(null) }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={onSubmit} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">{submitLabel}</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-sm text-gray-400 mt-1">{services.length} services offered</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setEditingService(null); setFormData({ name: '', description: '', icon: 'code', basePrice: '', category: 'Development', active: true }) }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingService) && (
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
          <ServiceForm onSubmit={editingService ? handleEdit : handleAdd} submitLabel={editingService ? 'Save Changes' : 'Add Service'} />
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${categoryFilter === cat
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                <ServiceIcon icon={service.icon} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(service)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(service.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" checked={service.active} onChange={() => toggleActive(service.id)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-blue-500/50 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>

            <h3 className="text-base font-semibold text-white mb-1">{service.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>

            <div className="flex items-center gap-1 mb-4">
              <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-medium text-gray-400">{service.category}</span>
              <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-medium text-gray-400">From ₹{service.basePrice.toLocaleString('en-IN')}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${service.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {service.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-xs text-gray-400">
                <span className="text-white font-medium">{serviceStats[service.id]?.orders || 0}</span> orders
              </div>
              <div className="text-sm font-semibold text-white">₹{(serviceStats[service.id]?.revenue || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-sm">No services found</p>
        </div>
      )}
    </div>
  )
}
