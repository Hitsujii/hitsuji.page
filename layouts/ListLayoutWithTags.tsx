'use client'

import { usePathname } from 'next/navigation'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import RememberBackUrl from '@/components/RememberBackUrl'
import { IconArrowLeft, IconArrowRight } from '@/components/icons/AstroPaperIcons'

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
      className="mt-auto mb-8 flex justify-center gap-4"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
          className="inline-flex items-center gap-1 select-none hover:text-[var(--accent)]"
        >
          <IconArrowLeft className="inline-block rtl:rotate-180" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 opacity-50 select-none">
          <IconArrowLeft className="inline-block rtl:rotate-180" />
          Previous
        </span>
      )}

      <span>
        {currentPage} / {totalPages}
      </span>

      {nextPage ? (
        <Link
          href={`/${basePath}/page/${currentPage + 1}`}
          rel="next"
          className="inline-flex items-center gap-1 select-none hover:text-[var(--accent)]"
        >
          Next
          <IconArrowRight className="inline-block rtl:rotate-180" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 opacity-50 select-none">
          Next
          <IconArrowRight className="inline-block rtl:rotate-180" />
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
}: ListLayoutProps) {
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <RememberBackUrl />
      <Breadcrumb />

      <main id="main-content" className="app-layout pb-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {Array.isArray(title) ? (
            <>
              {title[0]} <span className="text-[var(--accent)]">{title[1]}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {description && <p className="mt-2 mb-6 italic">{description}</p>}

        <ul>
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
