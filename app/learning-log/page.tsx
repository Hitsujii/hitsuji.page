import 'css/prism.css'
import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import { components } from '@/components/MDXComponents'
import { genPageMetadata } from 'app/seo'
import {
  formatLearningLogDate,
  getLearningLogNotes,
  getPublicLearningLogs,
} from './_lib/learning-log'

export const metadata: Metadata = genPageMetadata({
  title: 'Learning Log',
  description: 'Short logs from my learning sessions, updated notes, and what was difficult.',
})

export default function LearningLogPage() {
  const entries = getPublicLearningLogs()

  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout learning-log-layout">
        <header className="learning-log-header">
          <h1>Learning Log</h1>
          <p>
            Short logs from study sessions: what I learned, what was difficult, and which notes
            changed.
          </p>
        </header>

        {entries.length === 0 ? (
          <section className="learning-log-empty">
            <h2>No logs yet</h2>
            <p>
              Add markdown files to <code>data/learning-log</code> to start tracking learning
              sessions.
            </p>
          </section>
        ) : (
          <ol className="learning-log-stream">
            {entries.map((entry) => {
              const notes = getLearningLogNotes(entry)
              const hasBody = entry.body.raw.trim().length > 0
              const meta = [entry.duration, entry.tags?.length ? entry.tags.join(' / ') : null]
                .filter(Boolean)
                .join(' · ')

              return (
                <li key={entry.slug} id={entry.slug} className="learning-log-item">
                  <time dateTime={entry.date} className="learning-log-date">
                    {formatLearningLogDate(entry.date)}
                  </time>

                  <article className="learning-log-content">
                    <header className="learning-log-entry-header">
                      <h2>
                        {entry.title}
                        <Link
                          href={`/learning-log#${entry.slug}`}
                          className="learning-log-permalink"
                          aria-label={`Link to ${entry.title}`}
                        >
                          #
                        </Link>
                      </h2>

                      {meta && <p className="learning-log-meta">{meta}</p>}

                      {entry.summary && <p className="learning-log-summary">{entry.summary}</p>}
                    </header>

                    {hasBody && (
                      <div className="learning-log-body post-content app-prose prose dark:prose-invert">
                        <MDXLayoutRenderer
                          code={entry.body.code}
                          components={components}
                          toc={entry.toc}
                        />
                      </div>
                    )}

                    {notes.length > 0 && (
                      <section className="learning-log-notes" aria-label="Updated notes">
                        <h3>Updated notes</h3>
                        <ul>
                          {notes.map((note) => (
                            <li key={note.href}>
                              <Link href={note.href}>{note.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </article>
                </li>
              )
            })}
          </ol>
        )}
      </main>
    </>
  )
}
