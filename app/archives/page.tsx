import Breadcrumb from '@/components/Breadcrumb'
import PageMain from '@/components/PageMain'
import PostCard from '@/components/PostCard'
import { genPageMetadata } from 'app/seo'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

export const metadata = genPageMetadata({
  title: 'Archives',
  description: "All the articles I've archived.",
})

function groupBy<T>(items: T[], getKey: (item: T) => string | number) {
  const result: Record<string, T[]> = {}

  for (const item of items) {
    const key = String(getKey(item))

    if (!result[key]) {
      result[key] = []
    }

    result[key].push(item)
  }

  return result
}

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  timeZone: 'UTC',
})

export default async function ArchivesPage() {
  const posts = allCoreContent(sortPosts(allBlogs.filter((post) => !post.draft)))

  return (
    <>
      <Breadcrumb />
      <PageMain title="Archives" description="All the articles I've archived.">
        {Object.entries(groupBy(posts, (post) => new Date(post.date).getUTCFullYear()))
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, yearGroup]) => (
            <div key={year}>
              <span className="text-2xl font-bold">{year}</span>
              <sup className="text-sm text-[var(--text-muted)]">{yearGroup.length}</sup>

              {Object.entries(groupBy(yearGroup, (post) => new Date(post.date).getUTCMonth() + 1))
                .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                .map(([month, monthGroup]) => (
                  <div key={`${year}-${month}`} className="flex flex-col sm:flex-row">
                    <div className="mt-6 min-w-36 text-lg sm:my-6">
                      <span className="font-bold">
                        {monthFormatter.format(new Date(Date.UTC(2000, Number(month) - 1, 1)))}
                      </span>
                      <sup className="text-xs text-[var(--text-muted)]">{monthGroup.length}</sup>
                    </div>

                    <ul>
                      {monthGroup
                        .sort(
                          (a, b) =>
                            Math.floor(new Date(b.date).getTime() / 1000) -
                            Math.floor(new Date(a.date).getTime() / 1000)
                        )
                        .map((post) => (
                          <PostCard key={post.path ?? post.slug ?? post.title} post={post} />
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          ))}
      </PageMain>
    </>
  )
}
