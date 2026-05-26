import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import { IconEdit } from './icons/AstroPaperIcons'

type EditPostProps = {
  path: string
  className?: string
}

export default function EditPost({ path, className = '' }: EditPostProps) {
  if (!siteMetadata.siteRepo) return null

  const contentPath = path.endsWith('.md') || path.endsWith('.mdx') ? path : `data/${path}.mdx`
  const href = `${siteMetadata.siteRepo.replace(/\/$/, '')}/edit/main/${contentPath}`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--accent)]',
        className,
      ].join(' ')}
      aria-label="Edit page"
      title="Edit page"
    >
      <IconEdit className="size-5" />
      <span>Edit page</span>
    </Link>
  )
}
