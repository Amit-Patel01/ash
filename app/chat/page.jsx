'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const ChatPage = dynamic(() => import('@/src/views/ChatPage'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <ChatPage />
    </Layout>
  )
}