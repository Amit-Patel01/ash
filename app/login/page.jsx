'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const LoginPage = dynamic(() => import('@/src/views/LoginPage'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <LoginPage />
    </Layout>
  )
}