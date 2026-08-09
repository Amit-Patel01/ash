'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const About = dynamic(() => import('@/src/views/About'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <About />
    </Layout>
  )
}