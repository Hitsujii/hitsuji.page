import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import RememberBackUrl from '@/components/RememberBackUrl'
import { IconArrowRight, IconRss } from '@/components/icons/AstroPaperIcons'

const POSTS_PER_INDEX = 4
const FEATURED_FALLBACK_COUNT = 3

const socialLinks = [
  { kind: 'github', href: siteMetadata.github },
  { kind: 'x', href: siteMetadata.twitter || siteMetadata.x },
  { kind: 'linkedin', href: siteMetadata.linkedin },
  { kind: 'mail', href: siteMetadata.email ? `mailto:${siteMetadata.email}` : undefined },
] as const

export default function Home({ posts }) {
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
        <section id="hero" className="border-b border-[var(--border)] pt-8 pb-6">
          <h1 className="my-4 inline-block text-4xl font-bold sm:my-8 sm:text-5xl">Hello!!</h1>{' '}
          <Link
            href="/feed.xml"
            target="_blank"
            className="inline-block"
            aria-label="RSS Feed"
            title="RSS Feed"
          >
            <IconRss
              width={20}
              height={20}
              className="scale-125 stroke-[var(--accent)] stroke-3 rtl:-rotate-90"
            />
            <span className="sr-only">RSS Feed</span>
          </Link>
          <p>
            I’m Hitsuji. I write about learning C++ from scratch, building this site myself and
            accidentally picking up frontend along the way.
          </p>
          <p className="mt-2">
            Feel free to read the{' '}
            <Link
              href="/blog"
              className="underline decoration-dashed underline-offset-4 hover:text-[var(--accent)]"
            >
              high-cortisol posts
            </Link>{' '}
            or check out the{' '}
            <Link
              href="/projects"
              className="underline decoration-dashed underline-offset-4 hover:text-[var(--accent)]"
            >
              projects
            </Link>{' '}
            to see how all the overengineering is going.
          </p>
          {socialLinks.some(({ href }) => Boolean(href)) && (
            <div className="mt-4 flex max-sm:flex-col sm:items-center">
              <div className="me-2 mb-1 whitespace-nowrap sm:mb-0">Social Links:</div>
              <div className="flex flex-wrap items-center gap-1">
                {socialLinks.map(({ kind, href }) => (
                  <SocialIcon key={kind} kind={kind} href={href} size={24} />
                ))}
              </div>
            </div>
          )}
        </section>

        {featuredPosts.length > 0 && (
          <section
            id="featured"
            className={[
              'pt-12 pb-6',
              recentPosts.length > 0 ? 'border-b border-[var(--border)]' : '',
            ].join(' ')}
          >
            <h2 className="text-2xl font-semibold tracking-wide">Featured</h2>
            <ul>
              {featuredPosts.map((post) => (
                <PostCard key={post.path ?? post.slug} post={post} heading="h3" />
              ))}
            </ul>
          </section>
        )}

        {recentPosts.length > 0 && (
          <section id="recent-posts" className="pt-12 pb-6">
            <h2 className="text-2xl font-semibold tracking-wide">Recent Posts</h2>
            <ul>
              {recentPosts.map((post) => (
                <PostCard key={post.path ?? post.slug} post={post} heading="h3" />
              ))}
            </ul>
          </section>
        )}

        <div className="my-8 text-center">
          <Link href="/blog" className="inline-flex items-center gap-1 hover:text-[var(--accent)]">
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
