import siteMetadata from '@/data/siteMetadata'
import Image from './Image'
import Link from './Link'
import SocialIcon from './social-icons'
import DesktopIcon from './desktop/DesktopIcon'
import { withBasePath } from './path-utils'

const currentYear = new Date().getFullYear()

const socialLinks = [
  { kind: 'github', href: siteMetadata.github },
  { kind: 'x', href: siteMetadata.twitter || siteMetadata.x },
  { kind: 'linkedin', href: siteMetadata.linkedin },
  { kind: 'mail', href: siteMetadata.email ? `mailto:${siteMetadata.email}` : undefined },
] as const

export default function Footer() {
  return (
    <footer className="site-footer app-layout mt-12">
      <div className="site-footer__row">
        <div className="site-footer__badge">
          <Image
            src="/static/images/human-compiled-88x31.png"
            width={88}
            height={31}
            alt="羊++ — compiled by a human"
            unoptimized
          />
        </div>

        <div className="site-footer__copy">
          <span>&copy; {currentYear} Hitsuji</span>
          <span aria-hidden="true">{'//'}</span>
          <span>C++ / web / notes</span>
        </div>

        <div className="site-footer__links">
          <a href={withBasePath('/feed.xml')} className="site-footer__rss" aria-label="RSS feed">
            <DesktopIcon variant="rss" />
            <span aria-hidden="true">rss</span>
          </a>

          {siteMetadata.siteRepo && (
            <Link href={siteMetadata.siteRepo} className="site-footer__source">
              [source]
            </Link>
          )}

          <div className="site-footer__socials">
            {socialLinks.map(({ kind, href }) => (
              <SocialIcon key={kind} kind={kind} href={href} size={18} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
