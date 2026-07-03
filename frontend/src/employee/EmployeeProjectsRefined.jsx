import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { Folder } from 'lucide-react'
import {
  EmployeeBadge,
  EmployeeEmptyState,
  EmployeePageHeader,
  EmployeeSurface,
} from './EmployeePanelUI'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee,
} from './employeeUtils'

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
          'Project summary is not available yet. Tasks and delivery progress are tracked below.',
      }
    }).sort((a, b) => b.totalTasks - a.totalTasks)
  }, [myTasks, projects])

  const activeProjects = myProjects.filter(project => project.progress < 100).length
  const completedProjects = myProjects.filter(project => project.progress === 100).length
  const totalProjectTasks = myProjects.reduce((sum, project) => sum + project.totalTasks, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <EmployeePageHeader
        eyebrow="Project Map"
        title="Assigned Projects"
        description="All mapped projects are aggregated here so you can see workload, completion, and active delivery at a glance."
        stats={[
          { label: 'Projects', value: myProjects.length },
          { label: 'Active', value: activeProjects },
          { label: 'Completed', value: completedProjects },
          { label: 'Project tasks', value: totalProjectTasks },
        ]}
        actions={
          <Link
            to="/employee/tasks"
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
          >
            Open Task Board
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Active Delivery', value: activeProjects, tone: 'info', hint: 'Projects still moving' },
          { label: 'Finished Work', value: completedProjects, tone: 'success', hint: 'Completed project buckets' },
          { label: 'Task Load', value: totalProjectTasks, tone: 'neutral', hint: 'All mapped tasks across projects' },
        ].map(card => (
          <EmployeeSurface key={card.label} className="p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-4xl font-black text-slate-900">{card.value}</p>
              <EmployeeBadge tone={card.tone}>{card.label}</EmployeeBadge>
            </div>
            <p className="mt-3 text-sm text-slate-400">{card.hint}</p>
          </EmployeeSurface>
        ))}
      </section>

      <EmployeeSurface
        title="Project Contribution Board"
        description="Progress for each project is driven by the tasks assigned to you."
      >
        {myProjects.length === 0 ? (
          <EmployeeEmptyState
            icon={<Folder className="w-12 h-12 text-slate-500" strokeWidth={1.5} />}
            title="No active project mapping yet"
            description="When an administrator assigns tasks to your name or employee ID, projects will appear here automatically."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {myProjects.map((project, index) => (
              <div key={project.id} className="rounded-[26px] border border-slate-300 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <EmployeeBadge tone={project.progress === 100 ? 'success' : 'info'}>
                        {project.progress === 100 ? 'Completed' : 'Active'}
                      </EmployeeBadge>
                      <EmployeeBadge>Project #{index + 101}</EmployeeBadge>
                    </div>
                    <h3 className="mt-4 text-xl font-black text-slate-900">{project.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-300 bg-black/20 px-4 py-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Progress</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{project.progress}%</p>
                  </div>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                    <p className="text-xl font-black text-slate-900">{project.totalTasks}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">Total</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-3">
                    <p className="text-xl font-black text-emerald-300">{project.completedTasks}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200/60">Done</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.06] px-3 py-3">
                    <p className="text-xl font-black text-amber-300">{project.pendingTasks + project.inProgressTasks}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-amber-200/60">Open</p>
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
