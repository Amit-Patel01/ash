'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Infrastructure = dynamic(() => import('@/src/views/Infrastructure'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <Infrastructure />
    </Layout>
  )
}