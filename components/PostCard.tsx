import type { ElementType } from 'react'
import Datetime from './Datetime'
import Link from './Link'
import PostTitleTransition from './PostTitleTransition'
import { contentTitleTransitionKey } from './view-transitions'

type PostCardData = {
  date: string
  path?: string
  slug?: string
  summary?: string
  title: string
}

type PostCardProps = {
  post: PostCardData
  heading?: 'h2' | 'h3' | 'h4'
}

export default function PostCard({ post, heading = 'h2' }: PostCardProps) {
  const { date, path, slug, summary, title } = post
  const href = path ? `/${path}` : `/blog/${slug}`
  const Heading = heading as ElementType

  return (
    <li className="post-card">
      <Datetime date={date} className="post-card__date" />

      <div className="post-card__body">
        <Link href={href} className="post-card__link">
          <Heading>
            <PostTitleTransition transitionKey={contentTitleTransitionKey(href)}>
              {title}
            </PostTitleTransition>
          </Heading>
        </Link>
        {summary && <p className="post-card__summary">{summary}</p>}
      </div>
    </li>
  )
}
