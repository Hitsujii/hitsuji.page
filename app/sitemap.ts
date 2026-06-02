import { MetadataRoute } from 'next'
import { allBlogs, allNotes } from 'contentlayer/generated'
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

  const noteRoutes = allNotes
    .filter((note) => !note.draft)
    .map((note) => ({
      url: `${siteUrl}/${note.path}`,
      lastModified: note.lastmod || new Date().toISOString().split('T')[0],
    }))

  const routes = ['', 'blog', 'notes', 'projects', 'archives', 'tags', 'about'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes, ...noteRoutes]
}
