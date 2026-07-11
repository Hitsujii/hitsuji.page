import 'css/tailwind.css'
import 'remark-github-blockquote-alert/alert.css'

import { Analytics, type AnalyticsConfig } from 'pliny/analytics'
import { KBarSearchProvider, type KBarSearchProps } from 'pliny/search/KBar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { Google_Sans_Code } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'

const googleSansCode = Google_Sans_Code({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-google-sans-code',
})

const kbarConfig: KBarSearchProps =
  siteMetadata.search?.provider === 'kbar'
    ? siteMetadata.search.kbarConfig
    : { searchDocumentsPath: false }

const metadataBasePath = process.env.BASE_PATH || ''

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
        url: `${metadataBasePath}/static/favicons/favicon.svg?v=15`,
        type: 'image/svg+xml',
        sizes: 'any',
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
  return (
    <ViewTransitions>
      <html
        lang={siteMetadata.language}
        className={`${googleSansCode.variable} scroll-smooth`}
        suppressHydrationWarning
      >
        <head>
          <meta name="theme-color" content="#f5f7fb" />
        </head>
        <body className="flex min-h-svh flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
          <ThemeProviders>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <KBarSearchProvider kbarConfig={kbarConfig}>
              <Header />
              {children}
              <Footer />
            </KBarSearchProvider>
          </ThemeProviders>
        </body>
      </html>
    </ViewTransitions>
  )
}
