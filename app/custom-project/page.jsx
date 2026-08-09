'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const CustomProject = dynamic(() => import('@/src/views/CustomProject'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <CustomProject />
    </Layout>
  )
}