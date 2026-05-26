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
    <footer className="app-layout mt-auto">
      <div className="flex flex-col items-center justify-between border-t border-[var(--border)] py-6 sm:flex-row-reverse sm:py-4">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {socialLinks.map(({ kind, href }) => (
            <SocialIcon key={kind} kind={kind} href={href} size={24} />
          ))}
        </div>

        <div className="my-2 flex flex-col items-center whitespace-nowrap sm:my-0 sm:flex-row">
          <span>Copyright &#169; {currentYear}</span>
          <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
