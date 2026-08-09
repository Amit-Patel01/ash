'use client'
import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const gradients = [
  { from: '#3b82f6', to: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  { from: '#8b5cf6', to: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  { from: '#06b6d4', to: '#0ea5e9', glow: 'rgba(6,182,212,0.3)' },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.3)' },
  { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.3)' },
  { from: '#ec4899', to: '#f43f5e', glow: 'rgba(236,72,153,0.3)' },
]

function ProjectCard({ project, index }) {
  const g = gradients[index % gradients.length]
  const isDone = project.progress === 100
  const progressColor = isDone
    ? 'linear-gradient(90deg, #10b981, #34d399)'
    : `linear-gradient(90deg, ${g.from}, ${g.to})`

  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 12px 40px ${g.glow}, 0 4px 24px rgba(0,0,0,0.4)`;
        e.currentTarget.style.borderColor = `${g.from}35`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {/* Ambient blob */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${g.from}, transparent)`, filter: 'blur(30px)' }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, boxShadow: `0 4px 16px ${g.glow}` }}
        >
          <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </div>

        <span
          className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
          style={isDone ? {
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#34d399' } : {
            background: `${g.from}15`,
            border: `1px solid ${g.from}35`,
            color: g.from }}
        >
          {isDone ? '✓ Complete' : 'In Progress'}
        </span>
      </div>

      {/* Project name */}
      <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-blue-300 transition-colors">
        {project.name}
      </h3>
      <p className="text-[12px] text-slate-600 mb-6">Enterprise delivery · #{index + 101}</p>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-1">Completion</p>
            <p className="text-3xl font-black text-slate-900">{project.progress}<span className="text-lg text-slate-500">%</span></p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-1">Tasks</p>
            <p className="text-lg font-black text-slate-900">{project.completedTasks}<span className="text-sm text-slate-600">/{project.totalTasks}</span></p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${project.progress}%`, background: progressColor, boxShadow: isDone ? '0 0 10px rgba(52,211,153,0.4)' : `0 0 10px ${g.glow}` }}
          />
        </div>
      </div>

      {/* Footer avatars */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[8px] font-black text-slate-400"
              style={{ borderColor: '#020617', background: 'rgba(255,255,255,0.06)' }}
            >
              TM
            </div>
          ))}
          <div className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[8px] font-black text-slate-900" style={{ borderColor: '#020617', background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
            +2
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          {project.totalTasks - project.completedTasks} remaining
        </p>
      </div>
    </div>
  )
}

export default function EmployeeProjects() {
  const { userProfile } = useAuth()
  const { tasks, projects } = useStore()

  const myTasks = useMemo(() => {
    if (!userProfile) return []
    const myName = (userProfile.displayName || '').toLowerCase()
    const myInitial = (userProfile.displayName?.charAt(0) || '').toUpperCase()
    const myEmail = (userProfile.email || '').toLowerCase()

    return tasks.filter(t => {
      const assignee = (t.assignee || '').toLowerCase()
      return assignee === myName ||
        assignee === myInitial.toLowerCase() ||
        assignee === myEmail ||
        (t.assignee && t.assignee.length === 1 && t.assignee.toUpperCase() === myInitial)
    })
  }, [tasks, userProfile])

  const myProjects = useMemo(() => {
    const pNames = [...new Set(myTasks.map(t => t.project).filter(Boolean))]
    return pNames.map(name => {
      const pTasks = myTasks.filter(t => t.project === name)
      const doneTasks = pTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
      const progress = pTasks.length > 0 ? Math.round((doneTasks / pTasks.length) * 100) : 0
      const storeProj = projects.find(p => p.title === name)
      return { id: storeProj?.id || name, name, progress, totalTasks: pTasks.length, completedTasks: doneTasks }
    })
  }, [myTasks, projects])

  const completed = myProjects.filter(p => p.progress === 100).length
  const inProgress = myProjects.length - completed

  if (!userProfile) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mr-3" />
      <span className="text-slate-400">Loading projects...</span>
    </div>
  )

  return (
    <div className="space-y-6 pb-20" style={{ animation: 'fadeInUp 0.45s ease forwards' }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Projects</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Direct oversight of your technical contributions</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Total', val: myProjects.length, from: '#6366f1', to: '#8b5cf6' },
            { label: 'In Progress', val: inProgress, from: '#f59e0b', to: '#f97316' },
            { label: 'Completed', val: completed, from: '#10b981', to: '#34d399' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-2 flex items-center gap-2"
              style={{ background: `${s.from}12`, border: `1px solid ${s.from}25` }}
            >
              <span className="text-lg font-black" style={{ background: `linear-gradient(90deg, ${s.from}, ${s.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      {myProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map((proj, idx) => (
            <ProjectCard key={proj.id} project={proj} index={idx} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-3xl py-20 px-6 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-18 w-18 rounded-full flex items-center justify-center mb-5 h-16 w-16"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-slate-400 mb-1">No Active Assignments</h3>
          <p className="text-[12px] text-slate-600 max-w-sm">
            As soon as the admin assigns you to a project task, it will appear here in real time.
          </p>
        </div>
      )}
    </div>
  )
}
