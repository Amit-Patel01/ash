'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const ForgotPassword = dynamic(() => import('@/src/views/ForgotPassword'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <ForgotPassword />
    </Layout>
  )
}