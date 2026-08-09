'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Hero = dynamic(() => import('@/src/components/Hero'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <Hero />
    </Layout>
  )
}