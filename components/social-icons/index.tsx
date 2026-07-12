import {
  SocialFacebook,
  SocialGithub,
  SocialLinkedin,
  SocialMail,
  SocialPinterest,
  SocialTelegram,
  SocialWhatsapp,
  SocialX,
} from '@/components/icons/AstroPaperSocialIcons'
import { Bluesky, Instagram, Mastodon, Medium, Threads, Twitter, Youtube } from './icons'

const components = {
  mail: SocialMail,
  github: SocialGithub,
  facebook: SocialFacebook,
  youtube: Youtube,
  linkedin: SocialLinkedin,
  twitter: Twitter,
  x: SocialX,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
  pinterest: SocialPinterest,
  telegram: SocialTelegram,
  whatsapp: SocialWhatsapp,
}

type SocialIconProps = {
  kind: keyof typeof components
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

  const SocialSvg = components[kind]
  const label = kind === 'mail' ? 'Send an email' : kind

  return (
    <a
      className="group inline-flex p-2 transition-transform hover:rotate-6 hover:text-[var(--primary-hover)] sm:p-1"
      target={kind === 'mail' ? undefined : '_blank'}
      rel={kind === 'mail' ? undefined : 'noopener noreferrer'}
      href={href}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <SocialSvg
        aria-hidden="true"
        className="inline-block scale-125 fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent sm:scale-110"
        style={{ width: size, height: size }}
      />
    </a>
  )
}
