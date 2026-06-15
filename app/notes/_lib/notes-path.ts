export const NOTES_BASE_PATH = '/notes'

function toPosixPath(value: string) {
  return String(value).replace(/\\/g, '/').trim()
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function decodePath(value: string) {
  return toPosixPath(value)
    .split('/')
    .map((part) => safeDecodeURIComponent(part))
    .join('/')
}

export function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

export function normalizeNotePath(value: string) {
  let normalized = decodePath(value)
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')

  normalized = normalized
    .replace(/^data\/notes\/?/i, '')
    .replace(/^data\/?/i, '')
    .replace(/^(notes\/)+/i, '')
    .replace(/\.mdx?$/i, '')
    .replace(/\/index$/i, '')
    .replace(/^index$/i, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')

  return normalized
}

export function splitNotePath(value: string) {
  const normalized = normalizeNotePath(value)

  return normalized ? normalized.split('/') : []
}

export function encodeNotePath(value: string) {
  return splitNotePath(value).map(encodeURIComponent).join('/')
}

export function getNoteHref(value: string) {
  const encodedPath = encodeNotePath(value)

  return encodedPath ? `${NOTES_BASE_PATH}/${encodedPath}` : NOTES_BASE_PATH
}
