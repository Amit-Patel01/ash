'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const GrievanceCell = dynamic(() => import('@/src/views/legal/GrievanceCell'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <GrievanceCell />
    </Layout>
  )
}
