'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const WebService = dynamic(() => import('@/src/web-service/WebService'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <WebService />
    </Layout>
  )
}
