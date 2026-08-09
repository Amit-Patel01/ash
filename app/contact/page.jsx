'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Contact = dynamic(() => import('@/src/views/Contact'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <Contact />
    </Layout>
  )
}