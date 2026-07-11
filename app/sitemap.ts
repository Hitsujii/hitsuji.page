import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl.replace(/\/+$/, '')

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}/`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'blog', 'learning-log', 'projects', 'archives', 'tags', 'about'].map(
    (route) => ({ url: route ? `${siteUrl}/${route}/` : `${siteUrl}/` })
  )

  return [...routes, ...blogRoutes]
}
