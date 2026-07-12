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
    <li className="my-6">
      <Link
        href={href}
        className="inline-block text-lg font-medium text-[var(--link)] underline-offset-4 visited:text-[var(--link-visited)] hover:text-[var(--link-hover)] hover:underline hover:decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <PostTitleTransition title={transitionName(title)}>
          <Heading>{title}</Heading>
        </PostTitleTransition>
      </Link>
      <Datetime date={date} lastmod={lastmod} />
      {summary && <p>{summary}</p>}
    </li>
  )
}
