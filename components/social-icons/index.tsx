const socialNames = {
  mail: 'mail',
  github: 'github',
  facebook: 'facebook',
  youtube: 'youtube',
  linkedin: 'linkedin',
  twitter: 'twitter',
  x: 'x',
  mastodon: 'mastodon',
  threads: 'threads',
  instagram: 'instagram',
  medium: 'medium',
  bluesky: 'bluesky',
  pinterest: 'pinterest',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
}

type SocialIconProps = {
  kind: keyof typeof socialNames
  href: string | undefined
  size?: number
}

export default function SocialIcon({ kind, href, size = 24 }: SocialIconProps) {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  ) {
    return null
  }

  const visibleName = socialNames[kind]
  const label = kind === 'mail' ? 'Send an email' : `Visit ${visibleName}`

  return (
    <a
      className="focus-outline inline-flex min-h-11 items-center justify-center px-1.5 text-xs leading-none font-medium whitespace-nowrap transition-colors hover:text-[var(--primary-hover)] sm:min-h-10"
      target={kind === 'mail' ? undefined : '_blank'}
      rel={kind === 'mail' ? undefined : 'noopener noreferrer'}
      href={href}
      aria-label={label}
      title={label}
      style={{ minWidth: Math.max(size + 16, 40) }}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">[{visibleName}]</span>
    </a>
  )
}
