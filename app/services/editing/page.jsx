'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const EditingService = dynamic(() => import('@/src/editing/EditingService'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <EditingService />
    </Layout>
  )
}
