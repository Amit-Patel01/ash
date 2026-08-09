'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const RequestAccount = dynamic(() => import('@/src/views/RequestAccount'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <RequestAccount />
    </Layout>
  )
}