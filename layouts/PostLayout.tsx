import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Authors, Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import BackButton from '@/components/BackButton'
import BackToTopButton from '@/components/BackToTopButton'
import Link from '@/components/Link'
import ShareLinks from '@/components/ShareLinks'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import PostTitleTransition from '@/components/PostTitleTransition'
import PostEnhancements from '@/components/PostEnhancements'
import { contentTitleTransitionKey } from '@/components/view-transitions'

type TocItem = {
  value?: string
  url?: string
  depth?: number
}

type ContentWithToc = CoreContent<Blog> & {
  toc?: TocItem[]
  hasToc?: boolean
}

interface LayoutProps {
  content: ContentWithToc
  authorDetails?: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

function AdjacentPostNav({
  next,
  prev,
}: {
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}) {
  if (!next && !prev) return null

  return (
    <nav
      data-pagefind-ignore
      className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2"
      aria-label="Adjacent posts"
    >
      {prev?.path ? (
        <Link
          href={`/${prev.path}`}
          className="group flex min-h-11 w-full min-w-0 items-center gap-2 hover:text-[var(--primary-hover)]"
        >
          <span className="flex-none text-[var(--text-muted)]" aria-hidden="true">
            [prev]
          </span>
          <div className="min-w-0">
            <span className="sr-only">Previous post: </span>
            <span className="text-sm break-words text-[var(--link)] group-hover:text-[var(--link-hover)]">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : null}

      {next?.path && (
        <Link
          href={`/${next.path}`}
          className="group flex min-h-11 w-full min-w-0 items-center justify-end gap-2 text-end hover:text-[var(--primary-hover)] sm:col-start-2"
        >
          <div className="min-w-0">
            <span className="sr-only">Next post: </span>
            <span className="text-sm break-words text-[var(--link)] group-hover:text-[var(--link-hover)]">
              {next.title}
            </span>
          </div>
          <span className="flex-none text-[var(--text-muted)]" aria-hidden="true">
            [next]
          </span>
        </Link>
      )}
    </nav>
  )
}

function toIsoDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10)
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, lastmod, title, tags } = content
  const wasUpdated = Boolean(lastmod && lastmod > date)
  const contentPath = path.endsWith('.md') || path.endsWith('.mdx') ? path : `data/${path}.mdx`
  const repo = siteMetadata.siteRepo?.replace(/\/$/, '')
  const sourceHref = repo ? `${repo}/blob/main/${contentPath}` : undefined
  const permalink = `${siteMetadata.siteUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const correctionsHref = siteMetadata.email
    ? `mailto:${siteMetadata.email}?subject=${encodeURIComponent(`Correction: ${title}`)}`
    : undefined

  return (
    <>
      <div className="app-layout flex items-center justify-start">
        <BackButton fallbackHref="/" />
      </div>

      <main id="main-content" className="app-layout pb-4" data-pagefind-body>
        <PostEnhancements toc={content.toc} />
        <header className="article-header">
          <span className="article-header__path" aria-label="Source file">
            ~/{contentPath}
          </span>
          <h1>
            <PostTitleTransition transitionKey={contentTitleTransitionKey(path)}>
              {title}
            </PostTitleTransition>
          </h1>

          <div className="article-header__meta">
            <span>
              published: <time dateTime={date}>{toIsoDate(date)}</time>
            </span>
            {wasUpdated && lastmod && (
              <span>
                updated: <time dateTime={lastmod}>{toIsoDate(lastmod)}</time>
              </span>
            )}
          </div>

          <nav className="article-header__links" aria-label="Article utilities">
            {sourceHref && <Link href={sourceHref}>[source]</Link>}
            <Link href={permalink}>[permalink]</Link>
            {correctionsHref && <Link href={correctionsHref}>[corrections]</Link>}
          </nav>
        </header>

        <article
          id="article"
          className="post-content app-prose prose max-w-app dark:prose-invert mt-8 w-full"
        >
          {children}
        </article>

        <hr className="my-8 border-dashed" />

        <BackToTopButton />

        {tags?.length > 0 && (
          <ul className="mt-4 mb-8 flex flex-wrap gap-4 sm:my-8">
            {tags.map((tag) => (
              <li key={tag}>
                <Tag text={tag} size="sm" />
              </li>
            ))}
          </ul>
        )}

        <div className="clear-both">
          <ShareLinks path={path} title={title} />
        </div>

        {siteMetadata.comments?.provider && (
          <div id="comment" className="clear-both pt-6 pb-6 text-center text-[var(--text-muted)]">
            <Comments slug={slug} />
          </div>
        )}

        <hr className="my-8 border-dashed" />

        <div className="clear-both">
          <AdjacentPostNav prev={prev} next={next} />
        </div>
      </main>
    </>
  )
}
