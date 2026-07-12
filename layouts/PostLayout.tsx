import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Authors, Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import BackButton from '@/components/BackButton'
import BackToTopButton from '@/components/BackToTopButton'
import Datetime from '@/components/Datetime'
import EditPost from '@/components/EditPost'
import Link from '@/components/Link'
import ShareLinks from '@/components/ShareLinks'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import PostTitleTransition from '@/components/PostTitleTransition'
import PostEnhancements from '@/components/PostEnhancements'
import { IconArrowLeft, IconArrowRight } from '@/components/icons/AstroPaperIcons'

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
          className="group flex w-full min-w-0 gap-1 hover:text-[var(--primary-hover)]"
        >
          <IconArrowLeft className="inline-block flex-none rtl:rotate-180" />
          <div className="min-w-0">
            <span className="block">Previous post</span>
            <div className="text-sm text-[var(--link)] group-hover:text-[var(--link-hover)]">
              <span className="break-words">{prev.title}</span>
            </div>
          </div>
        </Link>
      ) : null}

      {next?.path && (
        <Link
          href={`/${next.path}`}
          className="group flex w-full min-w-0 justify-end gap-1 text-end hover:text-[var(--primary-hover)] sm:col-start-2"
        >
          <div className="min-w-0">
            <span className="block">Next post</span>
            <div className="text-sm text-[var(--link)] group-hover:text-[var(--link-hover)]">
              <span className="break-words">{next.title}</span>
            </div>
          </div>
          <IconArrowRight className="inline-block flex-none rtl:rotate-180" />
        </Link>
      )}
    </nav>
  )
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, lastmod, title, tags } = content

  return (
    <>
      <div className="app-layout flex items-center justify-start">
        <BackButton fallbackHref="/" />
      </div>

      <main id="main-content" className="app-layout pb-4" data-pagefind-body>
        <PostEnhancements toc={content.toc} hasToc={Boolean(content.hasToc)} />
        <h1 className="inline-block text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          <PostTitleTransition title={title.replaceAll('.', '-')}>{title}</PostTitleTransition>
        </h1>

        <div className="my-2 flex flex-wrap items-center gap-2">
          <Datetime date={date} lastmod={lastmod} size="lg" />
          <span aria-hidden="true" className="text-[var(--text-muted)] max-sm:hidden">
            |
          </span>
          <EditPost path={path} className="max-sm:hidden" />
        </div>

        <article
          id="article"
          className="post-content app-prose prose max-w-app dark:prose-invert mt-8 w-full"
        >
          {children}
        </article>

        <hr className="my-8 border-dashed" />

        <div className="clear-both">
          <EditPost path={path} className="sm:hidden" />
        </div>

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
