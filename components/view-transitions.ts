function slugifyForViewTransition(value: string | undefined) {
  return (value || 'item')
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function hashViewTransitionKey(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

function transitionName(prefix: string, key: string | undefined) {
  const value = key || 'item'
  const slug = slugifyForViewTransition(value).slice(0, 64) || 'item'

  return `${prefix}-${slug}-${hashViewTransitionKey(value)}`
}

function decodeTransitionKey(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizePathReference(reference: string) {
  return decodeTransitionKey(reference.split(/[?#]/, 1)[0]).replace(/^\/+|\/+$/g, '')
}

const supportedPageTitlePaths = new Set(['blog', 'notes', 'tags', 'about', 'projects'])

export function contentTitleTransitionKey(reference: string | undefined) {
  if (!reference) return undefined

  const value = reference.trim()
  const hashIndex = value.indexOf('#')
  const rawPath = hashIndex === -1 ? value : value.slice(0, hashIndex)
  const rawHash = hashIndex === -1 ? '' : value.slice(hashIndex + 1).split('?', 1)[0]
  const path = normalizePathReference(rawPath)

  if (path.startsWith('blog/')) {
    return `post:${path}`
  }

  if (!path && rawHash.startsWith('log-')) {
    return `log:${decodeTransitionKey(rawHash.slice(4))}`
  }

  if (path === 'learning-log' && rawHash) {
    const slug = rawHash.startsWith('log-') ? rawHash.slice(4) : rawHash
    return `log:${decodeTransitionKey(slug)}`
  }

  if (path === 'notes' || path.startsWith('notes/')) {
    return `note:${path}`
  }

  return undefined
}

export function pageTitleTransitionKey(reference: string | undefined) {
  if (!reference) return undefined

  const path = normalizePathReference(reference)

  return supportedPageTitlePaths.has(path) ? `page:${path}` : undefined
}

export function contentTitleViewTransitionName(key: string | undefined) {
  return transitionName('content-title', key)
}

export function pageTitleViewTransitionName(key: string | undefined) {
  return transitionName('page-title', key)
}

export function tagViewTransitionName(tag: string | undefined) {
  return transitionName('tag', slugifyForViewTransition(tag) || 'item')
}
