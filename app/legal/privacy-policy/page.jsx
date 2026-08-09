'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const PrivacyPolicy = dynamic(() => import('@/src/views/legal/PrivacyPolicy'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <PrivacyPolicy />
    </Layout>
  )
}