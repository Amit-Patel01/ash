'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const Checkout = dynamic(() => import('@/src/views/Checkout'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <Checkout />
    </Layout>
  )
}
