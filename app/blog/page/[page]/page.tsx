import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'
import { getPaginatedPageNumbers, parsePageNumber } from 'app/pagination'

const POSTS_PER_PAGE = 4

export const generateStaticParams = async () => {
  const publishedBlogs = allBlogs.filter((post) => !post.draft)
  const totalPages = Math.ceil(publishedBlogs.length / POSTS_PER_PAGE)
  return getPaginatedPageNumbers(totalPages).map((page) => ({ page: String(page) }))
}

export const dynamicParams = false

export async function generateMetadata(props: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await props.params
  const pageNumber = parsePageNumber(page)

  return genPageMetadata({
    title: pageNumber ? `Posts - Page ${pageNumber}` : 'Posts',
    description: "All the articles I've posted.",
  })
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  const publishedBlogs = allBlogs.filter((post) => !post.draft)
  const posts = allCoreContent(sortPosts(publishedBlogs))
  const pageNumber = parsePageNumber(params.page)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (!pageNumber || pageNumber < 2 || pageNumber > totalPages) {
    return notFound()
  }
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Posts"
      description="All the articles I\'ve posted."
    />
  )
}
