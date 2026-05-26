import Image from './Image'
import Link from './Link'

interface CardProps {
  title: string
  description: string
  imgSrc?: string
  href?: string
}

export default function Card({ title, description, imgSrc, href }: CardProps) {
  const content = (
    <article className="group my-6">
      {imgSrc && (
        <div className="mb-4 overflow-hidden border border-[var(--border)]">
          <Image
            alt={title}
            src={imgSrc}
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            width={544}
            height={306}
          />
        </div>
      )}

      <h2 className="inline-block text-lg font-medium text-[var(--accent)] underline-offset-4 group-hover:underline group-hover:decoration-dashed">
        {title}
      </h2>

      <p className="mt-2 text-[var(--foreground)]">{description}</p>
    </article>
  )

  if (href) {
    return (
      <Link href={href} aria-label={`Open ${title}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}
