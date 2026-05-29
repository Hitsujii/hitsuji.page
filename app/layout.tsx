import 'css/tailwind.css'
import 'css/animation.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { Space_Grotesk } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider, SearchConfig } from 'pliny/search'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { Source_Code_Pro } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'

const googleSansCode = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-google-sans-code',
})

const metadataBasePath = process.env.BASE_PATH || ''

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  icons: {
    icon: [
      {
        url: `${metadataBasePath}/static/favicons/favicon.svg?v=14`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    apple: [
      {
        url: `${metadataBasePath}/static/favicons/apple-touch-icon.png?v=14`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || ''
  return (
    <ViewTransitions>
      <html
        lang={siteMetadata.language}
        className={`${googleSansCode.variable} ${space_grotesk.variable} scroll-smooth`}
        suppressHydrationWarning
      >
        <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
        <body className="flex min-h-svh flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
          <ThemeProviders>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
              <Header />
              {children}
              <Footer />
            </SearchProvider>
          </ThemeProviders>
        </body>
      </html>
    </ViewTransitions>
  )
}
