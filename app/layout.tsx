import 'remark-github-blockquote-alert/alert.css'
import 'css/retro98.css'
import 'css/tailwind.css'
import 'css/prism.css'

import { Analytics, type AnalyticsConfig } from 'pliny/analytics'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DesktopShellProvider from '@/components/desktop/DesktopShellProvider'
import siteMetadata from '@/data/siteMetadata'
import { searchDocumentsPath } from '@/data/search'
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

const metadataBasePath = process.env.BASE_PATH || ''

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  manifest: `${metadataBasePath}/static/favicons/site.webmanifest`,
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  icons: {
    icon: [
      {
        url: `${metadataBasePath}/static/favicons/favicon-16x16.png?v=17`,
        type: 'image/png',
        sizes: '16x16',
      },
      {
        url: `${metadataBasePath}/static/favicons/favicon-32x32.png?v=17`,
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: `${metadataBasePath}/static/favicons/favicon.svg?v=17`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    shortcut: `${metadataBasePath}/static/favicons/favicon.ico?v=17`,
    apple: [
      {
        url: `${metadataBasePath}/static/favicons/apple-touch-icon.png?v=17`,
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [
      {
        url: siteMetadata.socialBanner,
        width: 1200,
        height: 630,
        alt: '羊++ — Hitsuji personal devlog',
      },
    ],
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
        style={
          {
            '--desktop-wallpaper-image': `url("${metadataBasePath}/static/images/desktop-clouds.webp")`,
          } as React.CSSProperties
        }
        suppressHydrationWarning
      >
        <head>
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" content="#f5f9ff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#0b1120" media="(prefers-color-scheme: dark)" />
          <meta name="msapplication-TileColor" content="#0b1120" />
          <meta
            name="msapplication-TileImage"
            content={`${metadataBasePath}/static/favicons/mstile-150x150.png?v=17`}
          />
          <link
            rel="mask-icon"
            href={`${metadataBasePath}/static/favicons/safari-pinned-tab.svg?v=17`}
            color="#345bc2"
          />
        </head>
        <body className="flex min-h-svh flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
          <ThemeProviders>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <DesktopShellProvider searchDocumentsPath={searchDocumentsPath}>
              <Header />
              {children}
              <Footer />
            </DesktopShellProvider>
          </ThemeProviders>
        </body>
      </html>
    </ViewTransitions>
  )
}
