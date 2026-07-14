'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Link from './Link'
import PostTitleTransition from './PostTitleTransition'
import { contentTitleTransitionKey, contentTitleViewTransitionName } from './view-transitions'

type NoteLink = {
  href: string
  title: string
}

type Props = {
  badges: string[]
  children?: ReactNode
  date: string
  defaultOpen?: boolean
  duration?: string
  notes: NoteLink[]
  slug: string
  title: string
}

type ViewTransition = {
  finished: Promise<void>
}

type ViewTransitionDocument = Document & {
  activeViewTransition?: unknown
  startViewTransition?: (update: () => void) => ViewTransition
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function formatIsoDate(date: string) {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? date.slice(0, 10)
    : parsedDate.toISOString().slice(0, 10)
}

function isModifiedEvent(event: MouseEvent<HTMLElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0
}

export default function HistoryLogDisclosure({
  badges,
  children,
  date,
  defaultOpen = false,
  duration,
  notes,
  slug,
  title,
}: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const panelId = `log-${slug}`
  const titleId = `log-title-${slug}`
  const notesId = `log-notes-${slug}`
  const meta = [
    duration ? `duration: ${duration}` : null,
    badges.length > 0 ? `tags: ${badges.join(', ')}` : null,
  ].filter((part): part is string => Boolean(part))

  useEffect(() => {
    const revealCurrentLog = () => {
      const hash = safeDecode(window.location.hash.slice(1))
      if (hash !== panelId && hash !== slug) return

      const details = detailsRef.current
      if (!details) return

      document.querySelectorAll<HTMLDetailsElement>('.history-log[open]').forEach((entry) => {
        if (entry !== details) entry.open = false
      })
      details.open = true
      window.requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ block: 'start' })
      })
    }

    revealCurrentLog()
    window.addEventListener('hashchange', revealCurrentLog)

    return () => window.removeEventListener('hashchange', revealCurrentLog)
  }, [panelId, slug])

  const handleSummaryClick = (event: MouseEvent<HTMLElement>) => {
    if (isModifiedEvent(event)) return

    const details = detailsRef.current
    const viewTransitionDocument = document as ViewTransitionDocument
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (
      !details ||
      reducedMotion ||
      !viewTransitionDocument.startViewTransition ||
      document.documentElement.dataset.viewTransition === 'running'
    ) {
      return
    }

    if (
      document.documentElement.dataset.historyTransition === 'running' ||
      viewTransitionDocument.activeViewTransition
    ) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    document.documentElement.dataset.historyTransition = 'running'

    const transition = viewTransitionDocument.startViewTransition(() => {
      details.open = !details.open
    })

    transition.finished
      .catch(() => undefined)
      .finally(() => {
        delete document.documentElement.dataset.historyTransition
      })
  }

  const prepareNoteTransition = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isModifiedEvent(event)) return

    const transitionKey = contentTitleTransitionKey(href)
    if (!transitionKey) return

    event.currentTarget.style.viewTransitionName = contentTitleViewTransitionName(transitionKey)
  }

  return (
    <details ref={detailsRef} className="history-log" open={defaultOpen || undefined}>
      <summary
        className="history-log__summary"
        aria-controls={panelId}
        onClick={handleSummaryClick}
      >
        <h3 className="history-log__summary-content">
          <time dateTime={date} className="history-entry__date">
            {formatIsoDate(date)}
          </time>

          <span className="history-entry__kind">LOG</span>

          <span className="history-log__title-row">
            <span className="history-log__marker" aria-hidden="true">
              <span className="history-log__marker-closed">[+]</span>
              <span className="history-log__marker-open">[−]</span>
            </span>
            <span id={titleId} className="history-log__title">
              <PostTitleTransition transitionKey={`log:${slug}`}>{title}</PostTitleTransition>
            </span>
          </span>
        </h3>
      </summary>

      <article id={panelId} aria-labelledby={titleId} className="history-log__panel">
        <span id={slug} className="history-log__legacy-target" aria-hidden="true" />

        <div className="history-log__panel-inner">
          <div className="history-log__meta-row">
            {meta.length > 0 && <p>{meta.join(' // ')}</p>}
            <a
              href={`#${panelId}`}
              className="history-log__permalink"
              aria-label={`Permanent link to ${title}`}
              title="Permanent link"
            >
              [#]
            </a>
          </div>

          {children && (
            <div className="history-log__body post-content app-prose prose dark:prose-invert">
              {children}
            </div>
          )}

          {notes.length > 0 && (
            <section className="history-log__notes" aria-labelledby={notesId}>
              <h4 id={notesId}>Notes:</h4>
              <ul>
                {notes.map((note) => (
                  <li key={note.href}>
                    <Link
                      href={note.href}
                      onClick={(event) => prepareNoteTransition(event, note.href)}
                    >
                      {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </details>
  )
}
