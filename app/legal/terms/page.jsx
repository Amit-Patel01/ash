'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const TermsOfService = dynamic(() => import('@/src/views/legal/TermsOfService'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <TermsOfService />
    </Layout>
  )
}