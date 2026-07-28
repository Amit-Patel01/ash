import { Helmet } from 'react-helmet-async'

export default function SEO({ 
  title = 'AmitSolutionHub - Tech Agency & Solutions',
  description = 'AmitSolutionHub is a verified MSME tech company providing premium web development, hardware repair, video editing, and mentorship services.',
  keywords = 'Tech Agency, Web Development, Software Services, Mentorship, Repair, India, MSME, SolutionHub',
  name = 'AmitSolutionHub',
  type = 'website',
  url = 'https://amitsolutionhub.com',
  image = 'https://amitsolutionhub.com/og-banner.png',
  schema = null
}) {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "AmitSolutionHub",
    "url": url,
    "logo": `${url}/src/assets/brand-logo.png`,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Godhra",
      "addressRegion": "Gujarat",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7874248481",
      "contactType": "student service",
      "email": "support@amitsolutionhub.com"
    },
    "sameAs": [
      "https://x.com/AmitSolutionHub",
      "https://www.instagram.com/amitsolutionhub",
      "https://www.linkedin.com/company/amit-solution-hub",
      "https://github.com/Amit-Patel01"
    ]
  }

  const activeSchema = schema || defaultSchema

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
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Structured Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  )
}
