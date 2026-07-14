import type { ElementType } from 'react'
import Datetime from './Datetime'
import Link from './Link'
import PostTitleTransition from './PostTitleTransition'

type PostCardData = {
  date: string
  lastmod?: string | null
  path?: string
  slug?: string
  summary?: string
  title: string
}

function transitionName(title: string) {
  return title.replaceAll('.', '-')
}

type PostCardProps = {
  post: PostCardData
  heading?: 'h2' | 'h3'
}

export default function PostCard({ post, heading = 'h2' }: PostCardProps) {
  const { date, lastmod, path, slug, summary, title } = post
  const href = path ? `/${path}` : `/blog/${slug}`
  const Heading = heading as ElementType

  return (
    <li className="post-card">
      <Datetime date={date} lastmod={lastmod} className="post-card__date" showIcon={false} />

      <div className="post-card__body">
        <Link href={href} className="post-card__link">
          <PostTitleTransition title={transitionName(title)}>
            <Heading>{title}</Heading>
          </PostTitleTransition>
        </Link>
        {summary && <p className="post-card__summary">{summary}</p>}
      </div>
    </li>
  )
}
