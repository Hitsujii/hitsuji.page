import Link from './Link'
import { IconSearch, IconUnderline } from './icons/AstroPaperIcons'

type SearchButtonProps = {
  active?: boolean
}

export default function SearchButton({ active = false }: SearchButtonProps) {
  return (
    <Link
      href="/search"
      className={['focus-outline relative size-8 hover:text-[var(--accent)]', ''].join(' ')}
      aria-label="Search"
      title="Search"
    >
      <IconSearch className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2" />
      <span className="sr-only">Search</span>
      {active && (
        <IconUnderline
          aria-hidden="true"
          className="absolute bottom-0 w-6 scale-125 max-sm:inset-s-2"
        />
      )}
    </Link>
  )
}
