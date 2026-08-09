'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const HelpPage = dynamic(() => import('@/src/views/help'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <HelpPage />
    </Layout>
  )
}