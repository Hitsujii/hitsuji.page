import { allLearningLogs, type LearningLog } from 'contentlayer/generated'

export type LearningLogNoteLink = {
  title: string
  href: string
}

export function getPublicLearningLogs() {
  return allLearningLogs
    .filter((entry) => !entry.draft)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
}

export function formatLearningLogDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

export function getLearningLogNotes(entry: Pick<LearningLog, 'notes'>): LearningLogNoteLink[] {
  if (!Array.isArray(entry.notes)) return []

  return entry.notes
    .map((note) => {
      if (typeof note === 'string') {
        return {
          title: note.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || note,
          href: note,
        }
      }

      if (!note || typeof note !== 'object') return null

      const value = note as Record<string, unknown>
      const href = typeof value.href === 'string' ? value.href : ''
      const title =
        typeof value.title === 'string'
          ? value.title
          : href.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || href

      if (!href) return null

      return { title, href }
    })
    .filter((note): note is LearningLogNoteLink => Boolean(note))
}
