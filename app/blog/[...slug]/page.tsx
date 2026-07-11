import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'

const defaultLayout = 'PostLayout' as const
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

function decodeSlug(parts: string[]) {
  try {
    return decodeURI(parts.join('/'))
  } catch {
    return ''
  }
}

function getPublishedPost(slug: string) {
  return allBlogs.find((post) => !post.draft && post.slug === slug)
}

function getAuthorDetails(post: Blog) {
  return (post.authors || ['default']).flatMap((author) => {
    const authorResult = allAuthors.find((candidate) => candidate.slug === author)
    return authorResult ? [coreContent(authorResult)] : []
  })
}

function getPostImages(images: unknown) {
  if (typeof images === 'string') return [images]
  if (!Array.isArray(images)) return [siteMetadata.socialBanner]

  const imageList = images.filter(
    (image): image is string => typeof image === 'string' && Boolean(image)
  )
  return imageList.length > 0 ? imageList : [siteMetadata.socialBanner]
}

function absoluteSiteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value

  return new URL(
    value.replace(/^\/+/, ''),
    `${siteMetadata.siteUrl.replace(/\/+$/, '')}/`
  ).toString()
}

function isLayoutName(value: string | undefined): value is keyof typeof layouts {
  return Boolean(value && Object.hasOwn(layouts, value))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeSlug(params.slug)
  const post = getPublishedPost(slug)

  if (!post) {
    return
  }

  const authorDetails = getAuthorDetails(post)

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  const imageList = getPostImages(post.images)
  const ogImages = imageList.map((image) => ({ url: absoluteSiteUrl(image) }))

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: post.canonicalUrl || './',
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  return allBlogs
    .filter((post) => !post.draft)
    .map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeSlug(params.slug)
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allBlogs.filter((post) => !post.draft)))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = getPublishedPost(slug)

  if (!post) {
    return notFound()
  }

  const authorDetails = getAuthorDetails(post)
  const mainContent = coreContent(post)
  const jsonLd = {
    ...(post.structuredData as Record<string, unknown>),
    author: authorDetails.map((author) => ({
      '@type': 'Person',
      name: author.name,
    })),
  }
  const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  const Layout = isLayoutName(post.layout) ? layouts[post.layout] : layouts[defaultLayout]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializedJsonLd }} />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
