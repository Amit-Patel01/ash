'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const ProjectDetails = dynamic(() => import('@/src/views/ProjectDetails'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <ProjectDetails />
    </Layout>
  )
}