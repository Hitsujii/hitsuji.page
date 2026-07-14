import siteMetadata from '@/data/siteMetadata'

type ShareLinksProps = {
  path: string
  title: string
}

const sharePlatforms = [
  {
    name: 'x',
    label: 'Share this post on X',
    getHref: (url: string, title: string) => `https://x.com/intent/post?url=${url}&text=${title}`,
    external: true,
  },
  {
    name: 'mail',
    label: 'Share this post via email',
    getHref: (url: string, title: string) => `mailto:?subject=${title}&body=${url}`,
    external: false,
  },
] as const

export default function ShareLinks({ path, title }: ShareLinksProps) {
  const pageUrl = `${siteMetadata.siteUrl}/${path}`.replace(/([^:]\/)\/+/, '$1')
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <nav
      className="flex flex-none flex-wrap items-center justify-center gap-x-2 md:justify-start"
      aria-label="Share this post"
    >
      <span className="text-sm text-[var(--text-muted)]" aria-hidden="true">
        Share:
      </span>

      <div className="flex flex-wrap items-center justify-center gap-1 md:justify-start">
        {sharePlatforms.map(({ name, label, getHref, external }) => (
          <a
            key={name}
            href={getHref(encodedUrl, encodedTitle)}
            className="focus-outline inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-xs font-medium transition-colors hover:text-[var(--primary-hover)] sm:min-h-10 sm:min-w-10"
            aria-label={label}
            title={label}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
          >
            <span className="sr-only">{label}</span>
            <span aria-hidden="true">[{name}]</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
