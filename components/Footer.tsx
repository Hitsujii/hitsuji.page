import siteMetadata from '@/data/siteMetadata'
import SocialIcon from './social-icons'

const currentYear = new Date().getFullYear()

const socialLinks = [
  { kind: 'github', href: siteMetadata.github },
  { kind: 'x', href: siteMetadata.twitter || siteMetadata.x },
  { kind: 'linkedin', href: siteMetadata.linkedin },
  { kind: 'mail', href: siteMetadata.email ? `mailto:${siteMetadata.email}` : undefined },
] as const

export default function Footer() {
  return (
    <footer className="site-footer app-layout mt-auto">
      <div className="site-footer__row">
        <div className="site-footer__socials">
          {socialLinks.map(({ kind, href }) => (
            <SocialIcon key={kind} kind={kind} href={href} size={24} />
          ))}
        </div>

        <div className="site-footer__copy">
          <span>&copy; {currentYear} Hitsuji</span>
          <span aria-hidden="true">{'//'}</span>
          <span>C++ notes with CSS consequences.</span>
        </div>

        <span className="site-footer__eof" aria-hidden="true">
          EOF
        </span>
      </div>
    </footer>
  )
}
