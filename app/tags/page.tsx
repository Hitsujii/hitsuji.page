import Breadcrumb from '@/components/Breadcrumb'
import PageMain from '@/components/PageMain'
import Tag from '@/components/Tag'
import { getTagCounts } from 'app/tag-data'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Tags',
  description: 'All the tags used in posts.',
})

export default async function Page() {
  const tagCounts = getTagCounts()
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <>
      <Breadcrumb />
      <PageMain title="Tags" description="All the tags used in posts.">
        {sortedTags.length === 0 ? (
          <p>No tags found.</p>
        ) : (
          <ul className="flex flex-wrap gap-6">
            {sortedTags.map((tag) => (
              <li key={tag}>
                <Tag text={tag} size="lg" transition />
              </li>
            ))}
          </ul>
        )}
      </PageMain>
    </>
  )
}
