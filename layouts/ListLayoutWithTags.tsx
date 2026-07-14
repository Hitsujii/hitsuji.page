'use client'

import { usePathname } from 'next/navigation'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import RememberBackUrl from '@/components/RememberBackUrl'
import PageHeader from '@/components/PageHeader'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string | [string, string]
  description?: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
  titleTransitionKey?: string
  accentViewTransitionName?: string
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/$/, '')

  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <nav
      className="mt-auto mb-8 flex items-center justify-center gap-3 text-sm"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
          className="inline-flex min-h-11 items-center px-2 text-[var(--link)] select-none hover:text-[var(--link-hover)]"
        >
          [prev]
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-2 text-[var(--text-muted)] select-none">
          [prev]
        </span>
      )}

      <span className="text-[var(--text-muted)]">
        page {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
      </span>

      {nextPage ? (
        <Link
          href={`/${basePath}/page/${currentPage + 1}`}
          rel="next"
          className="inline-flex min-h-11 items-center px-2 text-[var(--link)] select-none hover:text-[var(--link-hover)]"
        >
          [next]
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-2 text-[var(--text-muted)] select-none">
          [next]
        </span>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  description,
  initialDisplayPosts = [],
  pagination,
  titleTransitionKey,
  accentViewTransitionName,
}: ListLayoutProps) {
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <RememberBackUrl />
      <Breadcrumb />

      <main id="main-content" className="app-layout pb-4">
        <PageHeader
          title={title}
          description={description}
          titleTransitionKey={titleTransitionKey}
          accentViewTransitionName={accentViewTransitionName}
        />

        <ul className="post-list">
          {!displayPosts.length && 'No posts found.'}
          {displayPosts.map((post) => (
            <PostCard key={post.path ?? post.slug} post={post} />
          ))}
        </ul>
      </main>

      {pagination && pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
