import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import { getTagCounts } from 'app/tag-data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'
import { parsePageNumber } from 'app/pagination'
import { tagViewTransitionName } from '@/components/view-transitions'

const POSTS_PER_PAGE = 4

export const generateStaticParams = async () => {
  const tagCounts = getTagCounts()

  return Object.keys(tagCounts).flatMap((tag) => {
    const postCount = tagCounts[tag]
    const totalPages = Math.ceil(postCount / POSTS_PER_PAGE)

    return Array.from({ length: totalPages }, (_, index) => ({
      tag,
      page: String(index + 1),
    }))
  })
}

export const dynamicParams = false

export async function generateMetadata(props: {
  params: Promise<{ tag: string; page: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeURI(params.tag)
  const tagCounts = getTagCounts()
  const pageNumber = parsePageNumber(params.page)
  const totalPages = Math.ceil((tagCounts[tag] || 0) / POSTS_PER_PAGE)

  if (!Object.hasOwn(tagCounts, tag) || !pageNumber || pageNumber < 1 || pageNumber > totalPages) {
    return notFound()
  }

  const tagName = tag.replaceAll('-', ' ')

  return genPageMetadata({
    title: pageNumber === 1 ? `Tag: ${tagName}` : `Tag: ${tagName} - Page ${pageNumber}`,
    description: `${siteMetadata.title} ${tagName} tagged content`,
  })
}

export default async function TagPage(props: { params: Promise<{ tag: string; page: string }> }) {
  const params = await props.params
  const tag = decodeURI(params.tag)
  const tagName = tag.replaceAll('-', ' ')
  const pageNumber = parsePageNumber(params.page)

  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) =>
          !post.draft && post.tags && post.tags.map((tagName) => slug(tagName)).includes(tag)
      )
    )
  )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

  if (!pageNumber || pageNumber < 1 || pageNumber > totalPages) {
    return notFound()
  }

  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )

  const pagination = {
    currentPage: pageNumber,
    totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={['Tag:', tagName]}
      description={`All the articles with the tag "${tagName}".`}
      accentViewTransitionName={tagViewTransitionName(tagName)}
    />
  )
}
