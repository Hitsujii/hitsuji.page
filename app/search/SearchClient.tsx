'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from '@/components/Link'
import { normalizeAppPath, withBasePath } from '@/components/path-utils'
import { IconSearch } from '@/components/icons/AstroPaperIcons'

const getSearchIndexPath = () => withBasePath('/search.json')

type SearchDocument = {
  title?: string
  summary?: string
  path?: string
  slug?: string
  tags?: string[]
  date?: string
  lastmod?: string
  body?: {
    raw?: string
  }
}

type SearchSection = {
  title: string
  text: string
}

const normalize = (value: string) => value.toLowerCase().trim()

function stripMarkdown(value: string) {
  return value
    .replace(/^import\s+.*$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[>*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function highlightText(value: string, query: string) {
  const term = query.trim()
  if (!term) return value

  const index = value.toLowerCase().indexOf(term.toLowerCase())
  if (index === -1) return value

  return (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + term.length)}</mark>
      {value.slice(index + term.length)}
    </>
  )
}

function formatDate(value?: string) {
  if (!value) return ''
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate)
}

function getHref(result: SearchDocument) {
  if (result.path) return `/${result.path}`
  if (result.slug) return `/blog/${result.slug}`
  return '/'
}

function getSections(raw = '') {
  const sections: SearchSection[] = []
  let current: SearchSection = { title: '', text: '' }

  for (const line of raw.split('\n')) {
    const heading = line.match(/^#{2,3}\s+(.+)$/)

    if (heading) {
      if (current.title || current.text.trim()) {
        sections.push(current)
      }

      current = {
        title: stripMarkdown(heading[1]),
        text: '',
      }
      continue
    }

    current.text += `${line}\n`
  }

  if (current.title || current.text.trim()) {
    sections.push(current)
  }

  return sections.filter((section) => section.title.toLowerCase() !== 'table of contents')
}

function snippet(value: string, query: string, length = 150) {
  const clean = stripMarkdown(value)
  const term = query.trim().toLowerCase()
  const index = clean.toLowerCase().indexOf(term)

  if (index === -1) {
    return clean.slice(0, length).trim()
  }

  const start = Math.max(0, index - 40)
  const end = Math.min(clean.length, start + length)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < clean.length ? '…' : ''

  return `${prefix}${clean.slice(start, end).trim()}${suffix}`
}

function score(result: SearchDocument, query: string) {
  const term = normalize(query)
  const title = normalize(result.title ?? '')
  const summary = normalize(result.summary ?? '')
  const tags = normalize((result.tags ?? []).join(' '))
  const body = normalize(result.body?.raw ?? '')

  if (title.startsWith(term)) return 0
  if (title.includes(term)) return 1
  if (summary.includes(term)) return 2
  if (tags.includes(term)) return 3
  if (body.includes(term)) return 4
  return 5
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') ?? '')

    fetch(getSearchIndexPath())
      .then((response) => {
        if (!response.ok) throw new Error('Search index not found')
        return response.json()
      })
      .then((data: SearchDocument[]) => {
        setDocuments(Array.isArray(data) ? data : [])
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }

    const search = params.toString()
    const nextUrl = search ? `/search?${search}` : '/search'
    window.history.replaceState(window.history.state, '', withBasePath(nextUrl))
    sessionStorage.setItem('backUrl', normalizeAppPath(nextUrl))
  }, [query])

  const results = useMemo(() => {
    const term = normalize(query)
    if (!term) return []

    return documents
      .filter((document) => {
        const haystack = normalize(
          [
            document.title,
            document.summary,
            document.path,
            document.slug,
            document.body?.raw,
            ...(document.tags ?? []),
          ]
            .filter(Boolean)
            .join(' ')
        )

        return haystack.includes(term)
      })
      .sort((a, b) => score(a, query) - score(b, query))
  }, [documents, query])

  return (
    <div id="pagefind-search" data-backurl="/search">
      <form
        className="pagefind-ui__form relative mt-6"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="search-input">
          Search posts...
        </label>

        <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[var(--muted-foreground)]" />

        <input
          id="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts..."
          className="pagefind-ui__search-input w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-3 pr-20 pl-12 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-0 focus:outline-none"
          type="search"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-xs hover:text-[var(--accent)]"
          >
            Clear
          </button>
        )}
      </form>

      <div className="pagefind-ui__drawer mt-6">
        {!loaded && (
          <p className="pagefind-ui__message text-[var(--muted-foreground)]">Loading...</p>
        )}

        {loaded && !query && (
          <p className="pagefind-ui__message text-[var(--muted-foreground)]">Search posts...</p>
        )}

        {loaded && query && results.length === 0 && (
          <p className="pagefind-ui__message text-sm font-bold text-[var(--foreground)]">
            No results found
          </p>
        )}

        {results.length > 0 && (
          <>
            <p className="pagefind-ui__message text-sm font-bold text-[var(--foreground)]">
              {results.length} result{results.length === 1 ? '' : 's'} for {query}
            </p>

            <ol className="pagefind-ui__results mt-6 border-t border-[var(--border)]">
              {results.map((result) => {
                const href = getHref(result)
                const key = result.path ?? result.slug ?? result.title ?? href
                const title = result.title ?? href
                const summary = result.summary ?? ''
                const date = formatDate(result.lastmod ?? result.date)
                const sections = getSections(result.body?.raw)
                  .filter((section) =>
                    normalize(`${section.title} ${section.text}`).includes(normalize(query))
                  )
                  .slice(0, 3)

                return (
                  <li
                    key={key}
                    className="pagefind-ui__result border-b border-[var(--border)] py-6"
                  >
                    <Link
                      href={href}
                      className="pagefind-ui__result-link inline-block text-base font-bold text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0"
                    >
                      <h2>{highlightText(title, query)}</h2>
                    </Link>

                    {(summary || date) && (
                      <p className="pagefind-ui__result-excerpt mt-1 text-[0.8125rem] leading-5">
                        {summary ? highlightText(summary, query) : null}
                        {date ? (
                          <>
                            {summary ? ' ' : ''}
                            {date}
                          </>
                        ) : null}
                      </p>
                    )}

                    {sections.length > 0 && (
                      <ul className="pagefind-ui__result-nested mt-3 space-y-2">
                        {sections.map((section) => {
                          const sectionSnippet = snippet(section.text, query)

                          return (
                            <li key={section.title}>
                              <Link
                                href={href}
                                className="text-sm font-bold text-[var(--accent)] hover:underline hover:decoration-dashed"
                              >
                                ↳ {highlightText(section.title, query)}
                              </Link>
                              {sectionSnippet && (
                                <p className="mt-1 ml-4 text-[0.8125rem] leading-5">
                                  {highlightText(sectionSnippet, query)}
                                </p>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
