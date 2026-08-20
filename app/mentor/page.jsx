'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const MentorLayout = dynamic(() => import('@/src/mentor/MentorLayout'), { ssr: false })
const MentorOverview = dynamic(() => import('@/src/mentor/MentorOverview'), { ssr: false })
const MentorCourses = dynamic(() => import('@/src/mentor/MentorCourses'), { ssr: false })
const MentorStudents = dynamic(() => import('@/src/mentor/MentorStudents'), { ssr: false })
const MentorAssignments = dynamic(() => import('@/src/mentor/MentorAssignments'), { ssr: false })
const MentorDoubts = dynamic(() => import('@/src/mentor/MentorDoubts'), { ssr: false })
const MentorBroadcast = dynamic(() => import('@/src/mentor/MentorBroadcast'), { ssr: false })
const MentorProfile = dynamic(() => import('@/src/mentor/MentorProfile'), { ssr: false })

export default function MentorPage() {
  const pathname = usePathname() || '/mentor'

  let content = <MentorOverview />

  if (pathname.includes('/mentor/courses')) content = <MentorCourses />
  else if (pathname.includes('/mentor/students')) content = <MentorStudents />
  else if (pathname.includes('/mentor/assignments')) content = <MentorAssignments />
  else if (pathname.includes('/mentor/doubts')) content = <MentorDoubts />
  else if (pathname.includes('/mentor/broadcast')) content = <MentorBroadcast />
  else if (pathname.includes('/mentor/profile')) content = <MentorProfile />

  return (
    <MentorLayout>
      {content}
    </MentorLayout>
  )
}
