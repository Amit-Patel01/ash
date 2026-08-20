'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const RoleSelect = dynamic(() => import('@/src/views/RoleSelect'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <RoleSelect />
    </Layout>
  )
}
