'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const RepairService = dynamic(() => import('@/src/technicalsupport/RepairService'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <RepairService />
    </Layout>
  )
}
