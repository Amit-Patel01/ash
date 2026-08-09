'use client'
import dynamic from 'next/dynamic'

// Load Layout dynamically with SSR disabled to prevent auth context crashes during prerendering
const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Projects = dynamic(() => import('@/src/views/Projects'), { ssr: false })

export const dynamic_mode = 'force-dynamic'

export default function ProjectsPage() {
  return (
    <Layout>
      <Projects />
    </Layout>
  )
}
