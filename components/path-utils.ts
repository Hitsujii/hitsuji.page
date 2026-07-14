const configuredBasePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ||
  process.env.BASE_PATH ||
  ''
).replace(/\/$/, '')

function getOrigin() {
  return typeof window === 'undefined' ? 'https://nextpaper.local' : window.location.origin
}

function getBasePath() {
  if (configuredBasePath) return configuredBasePath

  if (typeof window === 'undefined') return ''

  // GitHub Pages project site fallback.
  // https://hitsujii.github.io/next-paper/search -> basePath is /next-paper
  if (window.location.hostname.endsWith('github.io')) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
    return firstSegment ? `/${firstSegment}` : ''
  }

  return ''
}

export function withBasePath(path: string) {
  const basePath = getBasePath()

  if (!basePath || !path.startsWith('/')) return path
  if (path === basePath || path.startsWith(`${basePath}/`)) return path

  return `${basePath}${path}`
}

function stripBasePath(path: string) {
  const basePath = getBasePath()
  if (!basePath) return path || '/'

  let nextPath = path || '/'

  while (nextPath === basePath || nextPath.startsWith(`${basePath}/`)) {
    nextPath = nextPath === basePath ? '/' : nextPath.slice(basePath.length) || '/'
  }

  return nextPath || '/'
}

export function normalizeAppPath(value: string) {
  if (!value) return '/'

  try {
    const origin = getOrigin()
    const parsed = new URL(value, origin)

    if (/^[a-z][a-z\d+\-.]*:/i.test(value) && parsed.origin !== origin) {
      return value
    }

    return `${stripBasePath(parsed.pathname)}${parsed.search}${parsed.hash}`
  } catch {
    return stripBasePath(value)
  }
}
