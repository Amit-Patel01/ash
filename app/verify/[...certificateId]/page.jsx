'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const VerifyCertificateRefined = dynamic(() => import('@/src/views/VerifyCertificateRefined'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <VerifyCertificateRefined />
    </Layout>
  )
}
