import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import {
  formatLearningLogDate,
  getLearningLogNotes,
  getPublicLearningLogs,
} from './_lib/learning-log'

export const metadata: Metadata = genPageMetadata({
  title: 'Learning Log',
  description: 'Short notes from my learning sessions, updated notes, and what I struggled with.',
})

export default function LearningLogPage() {
  const entries = getPublicLearningLogs()

  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout learning-log-layout">
        <header className="learning-log-header">
          <p className="learning-log-eyebrow">Learning journal</p>
          <h1>Learning Log</h1>
          <p>
            Short notes from study sessions: what I learned, what got stuck, and which notes
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
          <ol className="learning-log-timeline">
            {entries.map((entry) => {
              const notes = getLearningLogNotes(entry)

              return (
                <li key={entry.slug} className="learning-log-card">
                  <div className="learning-log-date">{formatLearningLogDate(entry.date)}</div>

                  <article>
                    <div className="learning-log-card-meta">
                      <span>{entry.duration || 'Study session'}</span>
                      {entry.tags?.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{entry.tags.join(' / ')}</span>
                        </>
                      )}
                    </div>

                    <h2>
                      <Link href={`/${entry.path}`}>{entry.title}</Link>
                    </h2>

                    {entry.summary && <p className="learning-log-summary">{entry.summary}</p>}

                    {notes.length > 0 && (
                      <div className="learning-log-notes">
                        <span>Updated notes:</span>
                        <ul>
                          {notes.map((note) => (
                            <li key={note.href}>
                              <Link href={note.href}>{note.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
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
