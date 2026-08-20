'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const EmployeeLayout = dynamic(() => import('@/src/employee/EmployeeLayout'), { ssr: false })
const EmployeeOverview = dynamic(() => import('@/src/employee/EmployeeOverview'), { ssr: false })
const EmployeeTasksRefined = dynamic(() => import('@/src/employee/EmployeeTasksRefined'), { ssr: false })
const EmployeeProjectsRefined = dynamic(() => import('@/src/employee/EmployeeProjectsRefined'), { ssr: false })
const EmployeeCourseManageRefined = dynamic(() => import('@/src/employee/EmployeeCourseManageRefined'), { ssr: false })
const EmployeeBroadcastRefined = dynamic(() => import('@/src/employee/EmployeeBroadcastRefined'), { ssr: false })
const SellProjectRequestRefined = dynamic(() => import('@/src/employee/SellProjectRequestRefined'), { ssr: false })
const EmployeeProfileRefined = dynamic(() => import('@/src/employee/EmployeeProfileRefined'), { ssr: false })
const EmployeeChatRefined = dynamic(() => import('@/src/employee/EmployeeChatRefined'), { ssr: false })
const MentorDashboard = dynamic(() => import('@/src/employee/MentorDashboard'), { ssr: false })

export default function EmployeeSlugPage() {
  const pathname = usePathname() || '/employee'

  let content = <EmployeeOverview />

  if (pathname.includes('/employee/tasks')) content = <EmployeeTasksRefined />
  else if (pathname.includes('/employee/projects')) content = <EmployeeProjectsRefined />
  else if (pathname.includes('/employee/course-manage')) content = <EmployeeCourseManageRefined />
  else if (pathname.includes('/employee/broadcast')) content = <EmployeeBroadcastRefined />
  else if (pathname.includes('/employee/sell-project')) content = <SellProjectRequestRefined />
  else if (pathname.includes('/employee/profile')) content = <EmployeeProfileRefined />
  else if (pathname.includes('/employee/settings')) content = <EmployeeProfileRefined />
  else if (pathname.includes('/employee/chat')) content = <EmployeeChatRefined />
  else if (pathname.includes('/employee/mentor')) content = <MentorDashboard />

  return (
    <EmployeeLayout>
      {content}
    </EmployeeLayout>
  )
}
