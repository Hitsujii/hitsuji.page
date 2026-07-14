import type { DesktopIconVariant } from '@/components/desktop/DesktopIcon'

export type SiteNavigationItem = {
  header: boolean
  href: string
  icon: DesktopIconVariant
  title: string
}

export const siteNavigationItems: SiteNavigationItem[] = [
  { href: '/blog', title: 'Posts', icon: 'folder', header: true },
  { href: '/notes', title: 'Notes', icon: 'document', header: true },
  { href: '/tags', title: 'Tags', icon: 'tags', header: true },
  { href: '/projects', title: 'Projects', icon: 'projects', header: true },
  { href: '/archives', title: 'Archives', icon: 'archive', header: false },
  { href: '/search', title: 'Find', icon: 'search', header: false },
  { href: '/about', title: 'About', icon: 'about', header: true },
]

const headerNavLinks = siteNavigationItems.filter((item) => item.header)

export default headerNavLinks
