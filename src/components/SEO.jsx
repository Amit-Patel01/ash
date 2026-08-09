'use client'
import { useEffect } from 'react'

export default function SEO({ 
  title = 'Amit Solution Hub — Tech Agency & Learning Platform',
  description = 'Amit Solution Hub is a verified MSME tech company providing premium web development, software solutions, AI workforce, and mentorship programs.',
  keywords = 'Amit Solution Hub, Tech Agency, Web Development, Software Services, Mentorship, Repair, India, MSME',
  name = 'Amit Solution Hub',
  type = 'website',
  url = 'https://amitsolutionhub.com',
  image = 'https://amitsolutionhub.com/og-banner.png',
  schema = null
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = title
    }
  }, [title])

  return null
}
