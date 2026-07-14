import type { Blog, LearningLog } from 'contentlayer/generated'

type HistoryNoteLink = {
  href: string
  title: string
}

type HistoryPostItem = {
  date: string
  href: string
  title: string
  type: 'POST'
}

type HistoryLogItem = {
  badges: string[]
  body: {
    code: string
    raw: string
  }
  date: string
  duration?: string
  notes: HistoryNoteLink[]
  slug: string
  title: string
  toc: LearningLog['toc']
  type: 'LOG'
}

export type HistoryItem = HistoryPostItem | HistoryLogItem

type HistorySources = {
  blogs: Blog[]
  learningLogs: LearningLog[]
}

function dateValue(date: string) {
  const value = Date.parse(date)
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value
}

function noteTitleFromHref(href: string) {
  return href.split(/[?#]/, 1)[0].split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || href
}

function getLogNotes(notes: unknown): HistoryNoteLink[] {
  if (!Array.isArray(notes)) return []

  return notes.flatMap((note): HistoryNoteLink[] => {
    if (typeof note === 'string') {
      return note.trim() ? [{ href: note, title: noteTitleFromHref(note) }] : []
    }

    if (!note || typeof note !== 'object') return []

    const value = note as Record<string, unknown>
    const href = typeof value.href === 'string' ? value.href.trim() : ''
    if (!href) return []

    return [
      {
        href,
        title:
          typeof value.title === 'string' && value.title.trim()
            ? value.title.trim()
            : noteTitleFromHref(href),
      },
    ]
  })
}

export function getHistoryStream({ blogs, learningLogs }: HistorySources): HistoryItem[] {
  const posts: HistoryPostItem[] = blogs
    .filter((post) => !post.draft)
    .map((post) => ({
      date: post.date,
      href: `/${post.path}`,
      title: post.title,
      type: 'POST',
    }))

  const logs: HistoryLogItem[] = learningLogs
    .filter((entry) => !entry.draft)
    .map((entry) => ({
      badges: entry.badges ?? [],
      body: entry.body,
      date: entry.date,
      duration: entry.duration,
      notes: getLogNotes(entry.notes),
      slug: entry.slug,
      title: entry.title,
      toc: entry.toc,
      type: 'LOG',
    }))

  const typeOrder: Record<HistoryItem['type'], number> = {
    LOG: 0,
    POST: 1,
  }

  return [...posts, ...logs].sort(
    (left, right) =>
      dateValue(right.date) - dateValue(left.date) || typeOrder[left.type] - typeOrder[right.type]
  )
}
