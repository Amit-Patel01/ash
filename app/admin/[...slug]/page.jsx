'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const AdminLayout = dynamic(() => import('@/src/admin/AdminLayout'), { ssr: false })
const AdminDashboard = dynamic(() => import('@/src/admin/AdminDashboard'), { ssr: false })
const AdminProjects = dynamic(() => import('@/src/admin/AdminProjects'), { ssr: false })
const AdminTasks = dynamic(() => import('@/src/admin/AdminTasks'), { ssr: false })
const AdminSales = dynamic(() => import('@/src/admin/AdminSales'), { ssr: false })
const AdminReceipts = dynamic(() => import('@/src/admin/AdminReceipts'), { ssr: false })
const AdminServices = dynamic(() => import('@/src/admin/AdminServices'), { ssr: false })
const AdminTestimonials = dynamic(() => import('@/src/admin/AdminTestimonials'), { ssr: false })
const AdminInternshipCategories = dynamic(() => import('@/src/admin/AdminInternshipCategories'), { ssr: false })
const AdminCourses = dynamic(() => import('@/src/admin/AdminCourses'), { ssr: false })
const AdminCoupons = dynamic(() => import('@/src/admin/AdminCoupons'), { ssr: false })
const AdminCourseCategories = dynamic(() => import('@/src/admin/AdminCourseCategories'), { ssr: false })
const AdminCourseEnrollments = dynamic(() => import('@/src/admin/AdminCourseEnrollments'), { ssr: false })
const AdminStudents = dynamic(() => import('@/src/admin/AdminStudents'), { ssr: false })
const AdminEmployees = dynamic(() => import('@/src/admin/AdminEmployees'), { ssr: false })
const AdminTeam = dynamic(() => import('@/src/admin/AdminTeam'), { ssr: false })
const AdminPermissions = dynamic(() => import('@/src/admin/AdminPermissions'), { ssr: false })
const AdminQrCertificates = dynamic(() => import('@/src/admin/AdminQrCertificates'), { ssr: false })
const AdminMessages = dynamic(() => import('@/src/admin/AdminMessages'), { ssr: false })
const AdminServiceRequests = dynamic(() => import('@/src/admin/AdminServiceRequests'), { ssr: false })
const AdminSellRequests = dynamic(() => import('@/src/admin/AdminSellRequests'), { ssr: false })
const AdminAccountRequests = dynamic(() => import('@/src/admin/AdminAccountRequests'), { ssr: false })
const AdminSettings = dynamic(() => import('@/src/admin/AdminSettings'), { ssr: false })
const AdminProfile = dynamic(() => import('@/src/admin/AdminProfile'), { ssr: false })
const AdminAIDepartments = dynamic(() => import('@/src/admin/AdminAIDepartments'), { ssr: false })

export default function AdminSlugPage() {
  const pathname = usePathname() || '/admin'

  let content = <AdminDashboard />

  if (pathname.includes('/admin/projects')) content = <AdminProjects />
  else if (pathname.includes('/admin/tasks')) content = <AdminTasks />
  else if (pathname.includes('/admin/sales')) content = <AdminSales />
  else if (pathname.includes('/admin/receipts')) content = <AdminReceipts />
  else if (pathname.includes('/admin/services')) content = <AdminServices />
  else if (pathname.includes('/admin/testimonials')) content = <AdminTestimonials />
  else if (pathname.includes('/admin/internship-categories')) content = <AdminInternshipCategories />
  else if (pathname.includes('/admin/courses')) content = <AdminCourses />
  else if (pathname.includes('/admin/coupons')) content = <AdminCoupons />
  else if (pathname.includes('/admin/course-categories')) content = <AdminCourseCategories />
  else if (pathname.includes('/admin/course-enrollments')) content = <AdminCourseEnrollments />
  else if (pathname.includes('/admin/students')) content = <AdminStudents />
  else if (pathname.includes('/admin/employees')) content = <AdminEmployees />
  else if (pathname.includes('/admin/team')) content = <AdminTeam />
  else if (pathname.includes('/admin/permissions')) content = <AdminPermissions />
  else if (pathname.includes('/admin/qr-certificates')) content = <AdminQrCertificates />
  else if (pathname.includes('/admin/messages')) content = <AdminMessages />
  else if (pathname.includes('/admin/service-requests')) content = <AdminServiceRequests />
  else if (pathname.includes('/admin/sell-requests')) content = <AdminSellRequests />
  else if (pathname.includes('/admin/account-requests')) content = <AdminAccountRequests />
  else if (pathname.includes('/admin/settings')) content = <AdminSettings />
  else if (pathname.includes('/admin/profile')) content = <AdminProfile />
  else if (pathname.includes('/admin/ai-departments')) content = <AdminAIDepartments />

  return (
    <AdminLayout>
      {content}
    </AdminLayout>
  )
}
