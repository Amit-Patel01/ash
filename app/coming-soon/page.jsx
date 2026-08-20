'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const ComingSoon = dynamic(() => import('@/src/views/ComingSoon'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <ComingSoon />
    </Layout>
  )
}
