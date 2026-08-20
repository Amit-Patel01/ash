'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const AboutTradingMentorship = dynamic(() => import('@/src/views/AboutTradingMentorship'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <AboutTradingMentorship />
    </Layout>
  )
}
