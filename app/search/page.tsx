import Breadcrumb from '@/components/Breadcrumb'
import PageMain from '@/components/PageMain'
import { genPageMetadata } from 'app/seo'
import SearchClient from './SearchClient'

export const metadata = genPageMetadata({
  title: 'Search',
  description: 'Search posts, notes, and logs.',
  robots: { index: false, follow: true },
})

export default function SearchPage() {
  return (
    <>
      <Breadcrumb />
      <PageMain title="Search" description="Search posts, notes, and learning logs.">
        <SearchClient />
      </PageMain>
    </>
  )
}
