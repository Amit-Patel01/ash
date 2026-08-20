'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const AuthRedirect = dynamic(() => import('@/src/components/DashboardRedirect'), { ssr: false })

export default function DashboardPage() {
  return <AuthRedirect />
}
