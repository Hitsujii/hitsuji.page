import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import Image from '@/components/Image'
import SocialIcon from '@/components/social-icons'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <main id="main-content" className="app-layout pb-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">About</h1>
      <p className="mt-2 mb-6 italic">A bit about me and this blog.</p>

      <section className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center">
        {avatar && (
          <Image
            src={avatar}
            alt={name}
            width={96}
            height={96}
            className="size-24 rounded-full border border-[var(--border)] object-cover"
          />
        )}

        <div className="min-w-0">
          <h2 className="text-xl font-semibold">{name}</h2>

          {(occupation || company) && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {[occupation, company].filter(Boolean).join(' at ')}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <SocialIcon kind="mail" href={email ? `mailto:${email}` : undefined} size={24} />
            <SocialIcon kind="github" href={github} size={24} />
            <SocialIcon kind="linkedin" href={linkedin} size={24} />
            <SocialIcon kind="x" href={twitter} size={24} />
            <SocialIcon kind="bluesky" href={bluesky} size={24} />
          </div>
        </div>
      </section>

      <article className="post-content app-prose prose max-w-app dark:prose-invert w-full">
        {children}
      </article>
    </main>
  )
}
