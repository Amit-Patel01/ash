'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const EmployeeLayout = dynamic(() => import('@/src/employee/EmployeeLayout'), { ssr: false })
const EmployeeHomeDashboard = dynamic(() => import('@/src/employee/EmployeeHomeDashboard'), { ssr: false })
const EmployeeTasks = dynamic(() => import('@/src/employee/EmployeeTasks'), { ssr: false })
const EmployeeProjects = dynamic(() => import('@/src/employee/EmployeeProjects'), { ssr: false })
const EmployeeCourseManage = dynamic(() => import('@/src/employee/EmployeeCourseManage'), { ssr: false })
const EmployeeBroadcast = dynamic(() => import('@/src/employee/EmployeeBroadcast'), { ssr: false })
const SellProjectRequest = dynamic(() => import('@/src/employee/SellProjectRequest'), { ssr: false })
const EmployeeProfile = dynamic(() => import('@/src/employee/EmployeeProfile'), { ssr: false })

export default function EmployeePage() {
  const pathname = usePathname() || '/employee'

  let content = <EmployeeHomeDashboard />

  if (pathname.includes('/employee/tasks')) content = <EmployeeTasks />
  else if (pathname.includes('/employee/projects')) content = <EmployeeProjects />
  else if (pathname.includes('/employee/courses')) content = <EmployeeCourseManage />
  else if (pathname.includes('/employee/broadcast')) content = <EmployeeBroadcast />
  else if (pathname.includes('/employee/sell-requests')) content = <SellProjectRequest />
  else if (pathname.includes('/employee/profile')) content = <EmployeeProfile />

  return (
    <EmployeeLayout>
      {content}
    </EmployeeLayout>
  )
}