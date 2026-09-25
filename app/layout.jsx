import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  metadataBase: new URL('https://www.ashnexasystems.com'),
  title: {
    default: 'Ashnexa Systems — Professional IT Solutions, Services & Trading Mentorship',
    template: '%s | Ashnexa Systems',
  },
  description: 'Ashnexa Systems is a premier tech agency offering custom software development, cloud infrastructure, IT services, and verified certification courses.',
  keywords: [
    'Ashnexa Systems',
    'SolutionHub',
    'Software Development Company India',
    'Certification Courses',
    'Web Application Development',
    'Custom Software Solutions',
    'Cloud Architecture',
    'Mumbai Tech Services',
  ],
  authors: [{ name: 'Ashnexa Systems Team', url: 'https://www.ashnexasystems.com' }],
  creator: 'Ashnexa Systems',
  publisher: 'Ashnexa Systems',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ashnexa Systems — Professional IT Solutions, Services & Trading Mentorship',
    description: 'Empowering students and businesses with cutting-edge software development, trading education, certification courses, and tech services.',
    url: 'https://www.ashnexasystems.com',
    siteName: 'Ashnexa Systems',
    images: [
      {
        url: '/brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'Ashnexa Systems Logo & Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashnexa Systems — Professional IT Solutions & Mentorship',
    description: 'Custom software development, trading mentorship, IT services, and certified certification courses.',
    images: ['/brand-logo.png'],
  },
  other: {
    'geo.region': 'IN-MH',
    'geo.placename': 'Mumbai, Maharashtra, India',
    'geo.position': '19.0760;72.8777',
    'ICBM': '19.0760, 72.8777',
  },
  icons: {
    icon: '/tab-icon.png',
    shortcut: '/tab-icon.png',
    apple: '/tab-icon.png',
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.ashnexasystems.com/#organization',
      'name': 'Ashnexa Systems',
      'url': 'https://www.ashnexasystems.com',
      'logo': 'https://www.ashnexasystems.com/logo.png',
      'description': 'Premier tech agency and learning platform providing software development, IT services, and certification courses.',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Mumbai',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://www.ashnexasystems.com/#localbusiness',
      'name': 'Ashnexa Systems',
      'image': 'https://www.ashnexasystems.com/logo.png',
      'priceRange': '₹₹',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Mumbai',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '19.0760',
        'longitude': '72.8777',
      },
      'url': 'https://www.ashnexasystems.com',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.ashnexasystems.com/#website',
      'url': 'https://www.ashnexasystems.com',
      'name': 'Ashnexa Systems',
      'publisher': {
        '@id': 'https://www.ashnexasystems.com/#organization',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/tab-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/tab-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tab-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased text-gray-900 dark:text-gray-100 bg-[#FAFAFA] dark:bg-gray-950 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
