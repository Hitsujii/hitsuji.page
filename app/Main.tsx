import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import RememberBackUrl from '@/components/RememberBackUrl'
import DiscordStatus from '@/components/DiscordStatus'
import LocalTime from '@/components/LocalTime'
import AvatarWindow from '@/components/AvatarWindow'
import { IconArrowRight, IconRss } from '@/components/icons/AstroPaperIcons'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

const POSTS_PER_INDEX = 4
const FEATURED_FALLBACK_COUNT = 3

const socialLinks = [
  { kind: 'github', href: siteMetadata.github },
  { kind: 'x', href: siteMetadata.twitter || siteMetadata.x },
  { kind: 'linkedin', href: siteMetadata.linkedin },
  { kind: 'mail', href: siteMetadata.email ? `mailto:${siteMetadata.email}` : undefined },
] as const

export default function Home({ posts }: { posts: CoreContent<Blog>[] }) {
  const explicitFeaturedPosts = posts.filter((post) => Boolean(post.featured))
  const featuredPosts =
    explicitFeaturedPosts.length > 0
      ? explicitFeaturedPosts.slice(0, FEATURED_FALLBACK_COUNT)
      : posts.slice(0, FEATURED_FALLBACK_COUNT)

  const featuredKeys = new Set(featuredPosts.map((post) => post.path ?? post.slug))
  const recentPosts = posts
    .filter((post) => !featuredKeys.has(post.path ?? post.slug))
    .slice(0, POSTS_PER_INDEX)

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
              <p className="home-hero__kicker">{'// C++, web & avoidable complexity'}</p>

              <div className="home-hero__title-row">
                <h1 className="title-mark">
                  <span className="title-mark__glyph">Hi World!!</span>
                </h1>

                <Link
                  href="/feed.xml"
                  target="_blank"
                  prefetch={false}
                  className="home-hero__rss"
                  aria-label="RSS Feed"
                  title="RSS Feed"
                >
                  <IconRss width={20} height={20} className="stroke-current stroke-3" />
                  <span className="sr-only">RSS Feed</span>
                </Link>
              </div>

              <div className="home-hero__intro">
                <p>
                  I’m Hitsuji. I’m learning C++ from scratch, building this site myself, and
                  accidentally picking up frontend along the way.
                </p>

                <p>
                  Feel free to read the <Link href="/blog">high-cortisol posts</Link> or check out
                  the <Link href="/projects">projects</Link> to see how the overengineering is
                  going.
                </p>
              </div>

              {socialLinks.some(({ href }) => Boolean(href)) && (
                <div className="home-hero__socials">
                  <span>links[]:</span>
                  <div>
                    {socialLinks.map(({ kind, href }) => (
                      <SocialIcon key={kind} kind={kind} href={href} size={24} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AvatarWindow className="home-hero__avatar" priority />
          </div>
        </section>

        {featuredPosts.length > 0 && (
          <section
            id="featured"
            className={[
              'pt-12 pb-6',
              recentPosts.length > 0 ? 'border-b border-[var(--border)]' : '',
            ].join(' ')}
          >
            <div className="section-heading">
              <h2>Featured</h2>
              <span>{String(featuredPosts.length).padStart(2, '0')}</span>
            </div>
            <ul className="post-list">
              {featuredPosts.map((post) => (
                <PostCard key={post.path ?? post.slug} post={post} heading="h3" />
              ))}
            </ul>
          </section>
        )}

        {recentPosts.length > 0 && (
          <section id="recent-posts" className="pt-12 pb-6">
            <div className="section-heading">
              <h2>Recent posts</h2>
              <span>{String(recentPosts.length).padStart(2, '0')}</span>
            </div>
            <ul className="post-list">
              {recentPosts.map((post) => (
                <PostCard key={post.path ?? post.slug} post={post} heading="h3" />
              ))}
            </ul>
          </section>
        )}

        <div className="my-8 text-center">
          <Link href="/blog" className="command-link">
            All Posts
            <IconArrowRight className="inline-block size-5 rtl:-rotate-180" />
          </Link>
        </div>
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
