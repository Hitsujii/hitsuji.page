import siteMetadata from '@/data/siteMetadata'
import {
  SocialFacebook,
  SocialMail,
  SocialPinterest,
  SocialTelegram,
  SocialWhatsapp,
  SocialX,
} from './icons/AstroPaperSocialIcons'

type ShareLinksProps = {
  path: string
  title: string
}

const sharePlatforms = [
  {
    name: 'whatsapp',
    label: 'Share this post on WhatsApp',
    icon: SocialWhatsapp,
    getHref: (url: string, title: string) => `https://wa.me/?text=${title}%20${url}`,
  },
  {
    name: 'facebook',
    label: 'Share this post on Facebook',
    icon: SocialFacebook,
    getHref: (url: string) => `https://www.facebook.com/sharer.php?u=${url}`,
  },
  {
    name: 'x',
    label: 'Share this post on X',
    icon: SocialX,
    getHref: (url: string, title: string) => `https://x.com/intent/post?url=${url}&text=${title}`,
  },
  {
    name: 'telegram',
    label: 'Share this post on Telegram',
    icon: SocialTelegram,
    getHref: (url: string, title: string) => `https://t.me/share/url?url=${url}&text=${title}`,
  },
  {
    name: 'pinterest',
    label: 'Share this post on Pinterest',
    icon: SocialPinterest,
    getHref: (url: string) => `https://pinterest.com/pin/create/button/?url=${url}`,
  },
  {
    name: 'mail',
    label: 'Share this post via email',
    icon: SocialMail,
    getHref: (url: string, title: string) => `mailto:?subject=${title}&body=${url}`,
  },
] as const

export default function ShareLinks({ path, title }: ShareLinksProps) {
  const pageUrl = `${siteMetadata.siteUrl}/${path}`.replace(/([^:]\/)\/+/, '$1')
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex flex-none flex-col items-center justify-center gap-1 md:items-start">
      <span className="italic">Share this post:</span>

      <div className="text-center">
        {sharePlatforms.map(({ name, label, icon: Icon, getHref }) => (
          <a
            key={name}
            href={getHref(encodedUrl, encodedTitle)}
            className="group inline-flex scale-90 p-2 transition-transform hover:rotate-6 hover:text-[var(--primary-hover)] sm:p-1"
            title={label}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon className="inline-block size-6 scale-125 fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent sm:scale-110" />
            <span className="sr-only">{label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
