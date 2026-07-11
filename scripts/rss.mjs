import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

const getTagCounts = (posts) => {
  const tagCount = {}

  posts.forEach((post) => {
    if (!post.tags || post.draft === true) return

    post.tags.forEach((tag) => {
      const formattedTag = slug(tag)
      tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1
    })
  })

  return tagCount
}

const generateRssItem = (config, post) => `
  <item>
    <guid>${escape(config.siteUrl)}/blog/${post.slug}/</guid>
    <title>${escape(post.title)}</title>
    <link>${escape(config.siteUrl)}/blog/${post.slug}/</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${escape(config.email)} (${escape(config.author)})</author>
    ${post.tags && post.tags.map((tag) => `<category>${escape(tag)}</category>`).join('')}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${escape(config.siteUrl)}/blog/</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${escape(config.email)} (${escape(config.author)})</managingEditor>
      <webMaster>${escape(config.email)} (${escape(config.author)})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${escape(config.siteUrl)}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    const tagData = getTagCounts(publishPosts)

    for (const tag of Object.keys(tagData)) {
      const filteredPosts = publishPosts.filter((post) =>
        post.tags.map((t) => slug(t)).includes(tag)
      )
      const rss = generateRss(config, sortPosts(filteredPosts), `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
