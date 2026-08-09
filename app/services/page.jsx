'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Services = dynamic(() => import('@/src/views/Services'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <Services />
    </Layout>
  )
}