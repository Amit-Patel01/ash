import { Helmet } from 'react-helmet-async'

export default function SEO({ 
  title = 'AmitSolutionHub - Tech Agency & Solutions',
  description = 'AmitSolutionHub is a verified MSME tech company providing premium web development, hardware repair, video editing, and mentorship services.',
  keywords = 'Tech Agency, Web Development, Software Services, Mentorship, Repair, India, MSME, SolutionHub',
  name = 'AmitSolutionHub',
  type = 'website',
  url = 'https://amitsolutionhub.com' // Adjust to real domain later
}) {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      <meta property="og:url" content={url} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
