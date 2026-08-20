'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const UserLayout = dynamic(() => import('@/src/user/UserLayout'), { ssr: false })
const UserOverview = dynamic(() => import('@/src/user/UserOverview'), { ssr: false })
const UserMyCourses = dynamic(() => import('@/src/user/UserMyCourses'), { ssr: false })
const UserOrders = dynamic(() => import('@/src/user/UserOrders'), { ssr: false })
const UserCertificates = dynamic(() => import('@/src/user/UserCertificates'), { ssr: false })
const UserCustomProject = dynamic(() => import('@/src/user/UserCustomProject'), { ssr: false })
const UserProfile = dynamic(() => import('@/src/user/UserProfile'), { ssr: false })
const UserSupport = dynamic(() => import('@/src/user/UserSupport'), { ssr: false })
const AboutTradingMentorship = dynamic(() => import('@/src/views/AboutTradingMentorship'), { ssr: false })

export default function UserPage() {
  const pathname = usePathname() || '/user'

  let content = <UserOverview />

  if (pathname.includes('/user/my-courses')) content = <UserMyCourses />
  else if (pathname.includes('/user/orders')) content = <UserOrders />
  else if (pathname.includes('/user/receipts')) content = <UserOrders />
  else if (pathname.includes('/user/certificates')) content = <UserCertificates />
  else if (pathname.includes('/user/custom-project')) content = <UserCustomProject />
  else if (pathname.includes('/user/profile')) content = <UserProfile />
  else if (pathname.includes('/user/support')) content = <UserSupport />
  else if (pathname.includes('/user/trading-mentorship')) content = <AboutTradingMentorship />

  return (
    <UserLayout>
      {content}
    </UserLayout>
  )
}