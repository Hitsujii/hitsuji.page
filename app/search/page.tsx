import Breadcrumb from '@/components/Breadcrumb'
import PageMain from '@/components/PageMain'
import { genPageMetadata } from 'app/seo'
import SearchClient from './SearchClient'

export const metadata = genPageMetadata({
  title: 'Search',
  description: 'Search any article ...',
  robots: { index: false, follow: true },
})

export default function SearchPage() {
  return (
    <>
      <Breadcrumb />
      <PageMain title="Search" description="Search any article ...">
        <SearchClient />
      </PageMain>
    </>
  )
}
