import { slug } from 'github-slugger'
import { allBlogs } from 'contentlayer/generated'

export function getTagCounts(): Record<string, number> {
  const tagCount: Record<string, number> = {}

  allBlogs.forEach((post) => {
    if (!post.tags || post.draft === true) return

    post.tags.forEach((tag) => {
      const formattedTag = slug(tag)
      tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1
    })
  })

  return tagCount
}
