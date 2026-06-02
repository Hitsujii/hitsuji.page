import 'css/prism.css'
import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import { components } from '@/components/MDXComponents'
import PostEnhancements from '@/components/PostEnhancements'
import { genPageMetadata } from 'app/seo'
import {
  formatLearningLogDate,
  getLearningLogBySlug,
  getLearningLogNotes,
  getLearningLogTitle,
  getPublicLearningLogs,
} from '../_lib/learning-log'

function getSlug(params: { slug: string[] }) {
  return params.slug.join('/')
}

export async function generateStaticParams() {
  return getPublicLearningLogs().map((entry) => ({
    slug: entry.slug.split('/'),
  }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const entry = getLearningLogBySlug(getSlug(params))

  if (!entry) return undefined

  return genPageMetadata({
    title: getLearningLogTitle(entry),
    description: entry.summary || 'A short note from my learning log.',
  })
}

export default async function LearningLogEntryPage(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const entry = getLearningLogBySlug(getSlug(params))

  if (!entry) return notFound()

  const notes = getLearningLogNotes(entry)
  const startsWithH1 = entry.body.raw.trimStart().startsWith('# ')

  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout learning-log-entry-layout">
        <article className="post-content app-prose prose dark:prose-invert">
          <header className="learning-log-entry-header not-prose">
            <p className="learning-log-eyebrow">
              {formatLearningLogDate(entry.date)}
              {entry.duration ? ` · ${entry.duration}` : ''}
            </p>

            {!startsWithH1 && <h1>{getLearningLogTitle(entry)}</h1>}

            {entry.summary && <p>{entry.summary}</p>}
          </header>

          <MDXLayoutRenderer code={entry.body.code} components={components} toc={entry.toc} />

          {notes.length > 0 && (
            <section className="learning-log-entry-notes not-prose" aria-label="Updated notes">
              <h2>Updated notes</h2>
              <ul>
                {notes.map((note) => (
                  <li key={note.href}>
                    <Link href={note.href}>{note.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <PostEnhancements toc={entry.toc} hasToc={entry.hasToc} />
        </article>
      </main>
    </>
  )
}
