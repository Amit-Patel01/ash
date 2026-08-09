'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const ProgramsPage = dynamic(() => import('@/src/views/ProgramsPage'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <ProgramsPage />
    </Layout>
  )
}