'use client'
import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { Folder } from 'lucide-react'
import {
  EmployeeBadge,
  EmployeeEmptyState,
  EmployeePageHeader,
  EmployeeSurface } from './EmployeePanelUI'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee } from './employeeUtils'

const isDone = (status) => ['done', 'completed', 'complete', 'closed'].includes(normalize(status))
const isInProgress = (status) => ['in-progress', 'in progress', 'progress', 'working'].includes(normalize(status))

export default function EmployeeProjectsRefined() {
  const { currentUser, userProfile } = useAuth()
  const { tasks, projects, teamMembers } = useStore()

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const identities = useMemo(
    () => getEmployeeIdentitySet(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myTasks = useMemo(
    () => tasks.filter(task => taskBelongsToEmployee(task, identities)),
    [tasks, identities]
  )

  const myProjects = useMemo(() => {
    const projectNames = [...new Set(myTasks.map(task => task.project).filter(Boolean))]

    return projectNames.map(name => {
      const projectTasks = myTasks.filter(task => task.project === name)
      const completedTasks = projectTasks.filter(task => isDone(task.status)).length
      const inProgressTasks = projectTasks.filter(task => isInProgress(task.status)).length
      const storeProject = projects.find(project => normalize(project.title) === normalize(name))

      return {
        id: storeProject?.id || name,
        name,
        progress: projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0,
        totalTasks: projectTasks.length,
        completedTasks,
        inProgressTasks,
        pendingTasks: projectTasks.length - completedTasks - inProgressTasks,
        description:
          storeProject?.description ||
          'Project summary is currently tracked under your active tasks below.' }
    }).sort((a, b) => b.totalTasks - a.totalTasks)
  }, [myTasks, projects])

  const totalAssignedTasks = myTasks.length
  const completedAssignedTasks = myTasks.filter(task => isDone(task.status)).length

  return (
    <div className="space-y-6 font-['Outfit',sans-serif]">
      <EmployeePageHeader
        eyebrow="Employee Projects"
        title="Assigned Projects & Code Repos"
        description="Every project assigned to your identity with real-time delivery percentages and completion tracking."
        stats={[
          { label: 'Projects Mapped', value: myProjects.length },
          { label: 'Total Tasks', value: totalAssignedTasks },
          { label: 'Completed Tasks', value: completedAssignedTasks },
        ]}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            value: myProjects.length,
            tone: 'info',
            label: 'Mapped Projects',
            hint: 'Active project boards' },
          {
            value: totalAssignedTasks,
            tone: 'warning',
            label: 'Total Tasks',
            hint: 'Tasks across all assigned projects' },
          {
            value: completedAssignedTasks,
            tone: 'success',
            label: 'Finished Items',
            hint: 'Tasks verified & closed' },
        ].map((card, idx) => (
          <EmployeeSurface key={idx}>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-black text-slate-900">{card.value}</p>
              <EmployeeBadge tone={card.tone}>{card.label}</EmployeeBadge>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">{card.hint}</p>
          </EmployeeSurface>
        ))}
      </section>

      <EmployeeSurface
        title="Project Contribution Board"
        description="Progress for each project is automatically calculated based on your assigned tasks."
      >
        {myProjects.length === 0 ? (
          <EmployeeEmptyState
            icon={<Folder className="w-10 h-10 text-blue-500" strokeWidth={1.5} />}
            title="No active project mapping yet"
            description="When tasks are assigned to your name or employee ID, project boards will appear here automatically."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {myProjects.map((project, index) => (
              <div key={project.id} className="rounded-[26px] border border-slate-200/90 bg-slate-50/50 p-6 transition hover:border-blue-300 hover:bg-white hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <EmployeeBadge tone={project.progress === 100 ? 'success' : 'info'}>
                        {project.progress === 100 ? 'Completed' : 'Active'}
                      </EmployeeBadge>
                      <EmployeeBadge>Project #{index + 101}</EmployeeBadge>
                    </div>
                    <h3 className="mt-3.5 text-lg font-black text-slate-900 tracking-tight">{project.name}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">{project.description}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-center shadow-2xs flex-shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">Progress</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{project.progress}%</p>
                  </div>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-2xs">
                    <p className="text-lg font-black text-slate-900">{project.totalTasks}</p>
                    <p className="mt-0.5 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Total</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-3 py-3">
                    <p className="text-lg font-black text-emerald-700">{project.completedTasks}</p>
                    <p className="mt-0.5 text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600">Done</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-3 py-3">
                    <p className="text-lg font-black text-amber-800">{project.pendingTasks + project.inProgressTasks}</p>
                    <p className="mt-0.5 text-[10px] uppercase font-bold tracking-[0.2em] text-amber-700">Open</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <EmployeeBadge tone="success">{project.completedTasks} completed</EmployeeBadge>
                  <EmployeeBadge tone="warning">{project.pendingTasks} pending</EmployeeBadge>
                  <EmployeeBadge tone="info">{project.inProgressTasks} in progress</EmployeeBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </EmployeeSurface>
    </div>
  )
}
