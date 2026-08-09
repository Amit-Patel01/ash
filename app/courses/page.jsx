'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })
const CoursesPage = dynamic(() => import('@/src/views/CoursesPage'), { ssr: false })

export default function Page() {
  return (
    <Layout>
      <CoursesPage />
    </Layout>
  )
}