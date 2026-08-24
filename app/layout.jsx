import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  metadataBase: new URL('https://www.amitsolutionhub.com'),
  title: {
    default: 'Amit Solution Hub — Professional IT Solutions, Services & Trading Mentorship',
    template: '%s | Amit Solution Hub',
  },
  description: 'Amit Solution Hub is a verified MSME tech agency offering custom software development, AI workforce integration, trading mentorship, IT services, and certified certification courses.',
  keywords: [
    'Amit Solution Hub',
    'SolutionHub',
    'Software Development Company India',
    'Trading Mentorship Program',
    'Certification Courses',
    'Web Application Development',
    'MSME Certified Tech Agency',
    'Custom AI Solutions',
    'Mumbai Tech Services',
  ],
  authors: [{ name: 'Amit Solution Hub Team', url: 'https://www.amitsolutionhub.com' }],
  creator: 'Amit Solution Hub',
  publisher: 'Amit Solution Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Amit Solution Hub — Professional IT Solutions, Services & Trading Mentorship',
    description: 'Empowering students and businesses with cutting-edge software development, trading education, certification courses, and tech services.',
    url: 'https://www.amitsolutionhub.com',
    siteName: 'Amit Solution Hub',
    images: [
      {
        url: '/brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'Amit Solution Hub Logo & Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amit Solution Hub — Professional IT Solutions & Mentorship',
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
      '@id': 'https://www.amitsolutionhub.com/#organization',
      'name': 'Amit Solution Hub',
      'url': 'https://www.amitsolutionhub.com',
      'logo': 'https://www.amitsolutionhub.com/logo.png',
      'description': 'Verified MSME tech agency and learning platform providing software development, trading mentorship, IT services, and certification courses.',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Mumbai',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://www.amitsolutionhub.com/#localbusiness',
      'name': 'Amit Solution Hub',
      'image': 'https://www.amitsolutionhub.com/logo.png',
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
      'url': 'https://www.amitsolutionhub.com',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.amitsolutionhub.com/#website',
      'url': 'https://www.amitsolutionhub.com',
      'name': 'Amit Solution Hub',
      'publisher': {
        '@id': 'https://www.amitsolutionhub.com/#organization',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
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
      <body suppressHydrationWarning className="ash-canvas antialiased text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
