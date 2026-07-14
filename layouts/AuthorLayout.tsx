import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import AvatarWindow from '@/components/AvatarWindow'
import PageHeader from '@/components/PageHeader'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <main id="main-content" className="app-layout pb-4">
      <PageHeader title="About" description="A bit about me and this blog." />

      <section className="author-card">
        {avatar && (
          <AvatarWindow
            src={avatar}
            alt={`${name}'s profile image: Frieren holding a C++ programming book`}
            fileName="about_me.cpp"
            size={176}
            className="author-card__avatar"
          />
        )}

        <div className="author-card__body">
          <p className="author-card__type" aria-hidden="true">
            struct Author {'{'}
          </p>
          <h2>{name}</h2>

          {(occupation || company) && (
            <p className="author-card__meta">
              {[occupation, company].filter(Boolean).join(' at ')}
            </p>
          )}

          <div className="author-card__socials">
            <SocialIcon kind="mail" href={email ? `mailto:${email}` : undefined} size={24} />
            <SocialIcon kind="github" href={github} size={24} />
            <SocialIcon kind="linkedin" href={linkedin} size={24} />
            <SocialIcon kind="x" href={twitter} size={24} />
            <SocialIcon kind="bluesky" href={bluesky} size={24} />
          </div>

          <p className="author-card__type" aria-hidden="true">
            {'}'};
          </p>
        </div>
      </section>

      <article className="post-content app-prose prose max-w-app dark:prose-invert w-full">
        {children}
      </article>
    </main>
  )
}
