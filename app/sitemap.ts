import { MetadataRoute } from 'next'
import { allBlogs, allLearningLogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const learningLogRoutes = allLearningLogs
    .filter((entry) => !entry.draft)
    .map((entry) => ({
      url: `${siteUrl}/${entry.path}`,
      lastModified: entry.lastmod || entry.date,
    }))

  const routes = ['', 'blog', 'learning-log', 'projects', 'archives', 'tags', 'about'].map(
    (route) => ({
      url: `${siteUrl}/${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    })
  )

  return [...routes, ...blogRoutes, ...learningLogRoutes]
}
