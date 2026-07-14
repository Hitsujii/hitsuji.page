import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import RememberBackUrl from '@/components/RememberBackUrl'
import DiscordStatus from '@/components/DiscordStatus'
import LocalTime from '@/components/LocalTime'
import DesktopIcon from '@/components/desktop/DesktopIcon'
import HistoryLogDisclosure from '@/components/HistoryLogDisclosure'
import { components } from '@/components/MDXComponents'
import { withBasePath } from '@/components/path-utils'
import PostTitleTransition from '@/components/PostTitleTransition'
import { contentTitleTransitionKey } from '@/components/view-transitions'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import type { HistoryItem } from './_lib/history-stream'

const socialLinks = [
  { label: 'github', href: siteMetadata.github },
  { label: 'x', href: siteMetadata.twitter || siteMetadata.x },
  { label: 'linkedin', href: siteMetadata.linkedin },
  { label: 'mail', href: siteMetadata.email ? `mailto:${siteMetadata.email}` : undefined },
] as const

function formatIsoDate(date: string) {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? date.slice(0, 10)
    : parsedDate.toISOString().slice(0, 10)
}

const streamLinkClassName =
  'text-[var(--link)] underline-offset-4 visited:text-[var(--link-visited)] hover:text-[var(--link-hover)] hover:underline hover:decoration-dashed'

export default function Home({ history }: { history: HistoryItem[] }) {
  const newestLogSlug = history.find((item) => item.type === 'LOG')?.slug
  const lastUpdated = history[0]?.date

  return (
    <>
      <RememberBackUrl />

      <main id="main-content" data-layout="index" data-home-path="/" className="app-layout">
        <section id="hero" className="home-hero">
          <div className="home-hero__status">
            <DiscordStatus />
            <span aria-hidden="true">/</span>
            <LocalTime />
          </div>

          <div className="home-hero__grid">
            <div className="home-hero__copy">
              <p className="home-hero__kicker">{'// learning C++ from scratch'}</p>

              <div className="home-hero__title-row">
                <h1 className="title-mark">
                  <span className="title-mark__glyph">Hi World!!</span>
                </h1>

                <a
                  href={withBasePath('/feed.xml')}
                  className="home-hero__rss"
                  aria-label="RSS Feed"
                  title="RSS Feed"
                >
                  <DesktopIcon variant="rss" size={18} />
                  <span className="sr-only">RSS Feed</span>
                </a>
              </div>

              <div className="home-hero__intro">
                <p>
                  I’m Hitsuji. I’m learning C++ from scratch and building this site along the way.
                </p>
              </div>

              {lastUpdated && (
                <p className="home-hero__updated">
                  Last updated: <time dateTime={lastUpdated}>{formatIsoDate(lastUpdated)}</time>
                </p>
              )}

              {socialLinks.some(({ href }) => Boolean(href)) && (
                <div className="home-hero__socials">
                  <span>Links:</span>
                  <div>
                    {socialLinks.map(
                      ({ label, href }) =>
                        href && (
                          <a key={label} href={href}>
                            [{label}]
                          </a>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {history.length > 0 && (
          <section id="history" className="home-history" aria-labelledby="history-heading">
            <div className="section-heading">
              <h2 id="history-heading">Latest</h2>
            </div>
            <ol className="history-stream">
              {history.map((item) =>
                item.type === 'LOG' ? (
                  <li
                    key={`${item.type}:${item.slug}`}
                    className="history-entry history-entry--log"
                  >
                    <HistoryLogDisclosure
                      badges={item.badges}
                      date={item.date}
                      defaultOpen={item.slug === newestLogSlug}
                      duration={item.duration}
                      notes={item.notes}
                      slug={item.slug}
                      title={item.title}
                    >
                      {item.body.raw.trim().length > 0 && (
                        <MDXLayoutRenderer
                          code={item.body.code}
                          components={components}
                          toc={item.toc}
                        />
                      )}
                    </HistoryLogDisclosure>
                  </li>
                ) : (
                  <li
                    key={`${item.type}:${item.href}`}
                    className="history-entry history-entry--post"
                  >
                    <time dateTime={item.date} className="history-entry__date">
                      {formatIsoDate(item.date)}
                    </time>
                    <span className="history-entry__kind">POST</span>
                    <Link href={item.href} className="history-entry__post-title">
                      <h3>
                        <PostTitleTransition transitionKey={contentTitleTransitionKey(item.href)}>
                          {item.title}
                        </PostTitleTransition>
                      </h3>
                    </Link>
                  </li>
                )
              )}
            </ol>
          </section>
        )}

        <nav aria-label="Browse all content" className="home-directory-links">
          <Link href="/blog" className={streamLinkClassName}>
            posts/
          </Link>
          <Link href="/notes" className={streamLinkClassName}>
            notes/
          </Link>
        </nav>
        {siteMetadata.newsletter?.provider && (
          <section
            className="newsletter-section my-8 flex items-center justify-center"
            aria-label="Newsletter"
          >
            <NewsletterForm />
          </section>
        )}
      </main>
    </>
  )
}
