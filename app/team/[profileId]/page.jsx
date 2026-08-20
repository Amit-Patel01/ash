'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const PublicEmployeeProfile = dynamic(() => import('@/src/views/PublicEmployeeProfile'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <PublicEmployeeProfile />
    </Layout>
  )
}
