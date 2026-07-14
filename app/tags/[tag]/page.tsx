import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import { getTagCounts } from 'app/tag-data'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tagViewTransitionName } from '@/components/view-transitions'

const POSTS_PER_PAGE = 4

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeURI(params.tag)
  const tagCounts = getTagCounts()

  if (!Object.hasOwn(tagCounts, tag)) {
    return notFound()
  }

  const tagName = tag.replaceAll('-', ' ')

  return genPageMetadata({
    title: `Tag: ${tagName}`,
    description: `${siteMetadata.title} ${tagName} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  const tagCounts = getTagCounts()
  return Object.keys(tagCounts).map((tag) => ({
    tag,
  }))
}

export const dynamicParams = false

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params
  const tag = decodeURI(params.tag)
  const tagCounts = getTagCounts()

  if (!Object.hasOwn(tagCounts, tag)) {
    return notFound()
  }

  const tagName = tag.replaceAll('-', ' ')
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => !post.draft && post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
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
