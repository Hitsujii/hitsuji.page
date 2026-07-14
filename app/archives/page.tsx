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
      <PageMain
        title="Archives"
        description="All the articles I've archived."
        className="archive-page"
      >
        {Object.entries(groupBy(posts, (post) => new Date(post.date).getUTCFullYear()))
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, yearGroup]) => (
            <section key={year} className="archive-year" aria-labelledby={`archive-year-${year}`}>
              <h2 id={`archive-year-${year}`} className="archive-year__heading">
                {year}
              </h2>

              {Object.entries(groupBy(yearGroup, (post) => new Date(post.date).getUTCMonth() + 1))
                .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                .map(([month, monthGroup]) => (
                  <section key={`${year}-${month}`} className="archive-month">
                    <div className="archive-month__label">
                      <h3 className="archive-month__heading">
                        {monthFormatter.format(new Date(Date.UTC(2000, Number(month) - 1, 1)))}
                      </h3>
                    </div>

                    <ul className="post-list archive-post-list">
                      {monthGroup
                        .sort(
                          (a, b) =>
                            Math.floor(new Date(b.date).getTime() / 1000) -
                            Math.floor(new Date(a.date).getTime() / 1000)
                        )
                        .map((post) => (
                          <PostCard
                            key={post.path ?? post.slug ?? post.title}
                            post={post}
                            heading="h4"
                          />
                        ))}
                    </ul>
                  </section>
                ))}
            </section>
          ))}
      </PageMain>
    </>
  )
}
