'use client'
import { useEffect } from 'react'

export default function SEO({ 
  title = 'Ashnexa Systems — Tech Agency & Learning Platform',
  description = 'Ashnexa Systems is a premier tech company providing modern web development, custom software solutions, IT services, and certification courses.',
  keywords = 'Ashnexa Systems, Tech Agency, Web Development, Software Services, Certification Courses, IT Solutions, India',
  name = 'Ashnexa Systems',
  type = 'website',
  url = 'https://ashnexasystems.com',
  image = 'https://ashnexasystems.com/og-banner.png',
  schema = null
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = title
    }
  }, [title])

  return null
}
