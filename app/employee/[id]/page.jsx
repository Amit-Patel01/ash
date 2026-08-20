'use client'
import dynamic from 'next/dynamic'

const AdminLayout = dynamic(() => import('@/src/admin/AdminLayout'), { ssr: false })
const EmployeeDashboard = dynamic(() => import('@/src/admin/EmployeeDashboard'), { ssr: false })

export default function Page() {
  return (
    <AdminLayout>
      <EmployeeDashboard />
    </AdminLayout>
  )
}