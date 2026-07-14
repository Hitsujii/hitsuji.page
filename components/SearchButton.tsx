import Link from './Link'
import DesktopIcon from './desktop/DesktopIcon'

type SearchButtonProps = {
  active?: boolean
}

export default function SearchButton({ active = false }: SearchButtonProps) {
  return (
    <Link
      href="/search"
      className={[
        'header-tool focus-outline relative flex min-h-11 items-center justify-center px-2 lg:min-h-8',
        active ? 'active-nav' : '',
      ].join(' ')}
      aria-label="Find posts and notes"
      aria-current={active ? 'page' : undefined}
      title="Find posts and notes"
    >
      <DesktopIcon className="header-menu-icon" variant="search" />
      <span>Find</span>
    </Link>
  )
}
