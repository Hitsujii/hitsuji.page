import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync, existsSync, readFileSync, readdirSync } from 'fs'
import readingTime from 'reading-time'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { searchDocumentsPath } from './data/search'
import { sortPosts } from 'pliny/utils/contentlayer.js'

const root = process.cwd()

type MdastNode = {
  type: string
  children?: MdastNode[]
  data?: Record<string, unknown>
  meta?: string | null
  url?: string
  value?: string
}

type ContentlayerFile = {
  data?: Record<string, unknown>
  history?: unknown
  path?: unknown
  dirname?: unknown
  basename?: unknown
  stem?: unknown
}

type SearchSourceDocument = {
  title?: string
  summary?: string
  path?: string
  slug?: string
  tags?: string[]
  date?: string
  lastmod?: string
  draft?: boolean
  body?: {
    raw?: string
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

function getRawDocumentValue(file: ContentlayerFile, key: string) {
  const rawDocumentData = asRecord(file.data?.rawDocumentData)
  const nestedRawDocumentData = asRecord(rawDocumentData?._raw)
  const value = rawDocumentData?.[key] ?? nestedRawDocumentData?.[key]

  return typeof value === 'string' && value.trim() ? value : undefined
}

function absoluteSiteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value

  const baseUrl = `${siteMetadata.siteUrl.replace(/\/+$/, '')}/`
  return new URL(value.replace(/^\/+/, ''), baseUrl).toString()
}

function getDocumentImage(images: unknown) {
  const image =
    typeof images === 'string'
      ? images
      : Array.isArray(images)
        ? images.find((value): value is string => typeof value === 'string' && Boolean(value))
        : undefined

  return absoluteSiteUrl(image || siteMetadata.socialBanner)
}

function extractAstroPaperCodeFileName(meta?: string | null) {
  if (!meta) return undefined

  const match = meta.match(/(?:^|\s)file=(?:"([^"]+)"|'([^']+)'|([^\s]+))/)
  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function visitAstroPaperMdast(node: MdastNode, visitor: (node: MdastNode) => void) {
  visitor(node)

  if (!Array.isArray(node.children)) return

  node.children.forEach((child) => {
    visitAstroPaperMdast(child, visitor)
  })
}

function remarkAstroPaperCodeMeta() {
  return (tree: MdastNode) => {
    visitAstroPaperMdast(tree, (node) => {
      if (node.type !== 'code') return

      const fileName = extractAstroPaperCodeFileName(node.meta)

      if (!fileName) return

      node.data = node.data ?? {}
      node.data.hProperties = {
        ...asRecord(node.data.hProperties),
        'data-file': fileName,
        'data-meta': node.meta || '',
      }
    })
  }
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const noteMarkdownRoot = path.join(root, 'data', 'notes')
let cachedNoteSlugs: Set<string> | undefined

function normalizeSlashes(value: string) {
  return value.replace(/\\/g, '/')
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeNoteDocPath(value: string) {
  return normalizeSlashes(safeDecode(value))
    .replace(/\.mdx?$/i, '')
    .replace(/^data\//i, '')
    .replace(/^notes\/notes\/?/i, '')
    .replace(/^notes\/?/i, '')
    .replace(/\/index$/i, '')
    .replace(/^index$/i, '')
    .replace(/^\/+/, '')
    .replace(/\/$/, '')
}

function isDraftMarkdownFile(filePath: string) {
  try {
    const raw = readFileSync(filePath, 'utf8')
    const frontmatter = raw.match(/^---\s*\n([\s\S]*?)\n---/)
    return /^draft:\s*true\s*$/im.test(frontmatter?.[1] ?? '')
  } catch {
    return false
  }
}

function readNoteSlugs(dir: string, baseDir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === '.obsidian' || entry.name === '.trash') {
      return []
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return readNoteSlugs(fullPath, baseDir)
    }

    if (!entry.name.endsWith('.md')) {
      return []
    }

    if (isDraftMarkdownFile(fullPath)) {
      return []
    }

    return normalizeNoteDocPath(path.relative(baseDir, fullPath))
  })
}

function getNoteSlugs() {
  if (process.env.NODE_ENV !== 'production') {
    return new Set(readNoteSlugs(noteMarkdownRoot, noteMarkdownRoot))
  }

  if (!cachedNoteSlugs) {
    cachedNoteSlugs = new Set(readNoteSlugs(noteMarkdownRoot, noteMarkdownRoot))
  }

  return cachedNoteSlugs
}

function normalizeNoteSourcePath(value: string) {
  let normalized = normalizeSlashes(safeDecode(value)).replace(/\\/g, '/')

  const dataNotesNotesMarker = '/data/notes/notes/'
  const dataNotesMarker = '/data/notes/'

  if (normalized.includes(dataNotesNotesMarker)) {
    normalized = normalized.slice(
      normalized.indexOf(dataNotesNotesMarker) + dataNotesNotesMarker.length
    )
  } else if (normalized.includes(dataNotesMarker)) {
    normalized = normalized.slice(normalized.indexOf(dataNotesMarker) + dataNotesMarker.length)
  }

  normalized = normalized
    .replace(/^notes\/notes\//, '')
    .replace(/^notes\//, '')
    .replace(/^\.\//, '')
    .replace(/\.md$/i, '')

  if (normalized.endsWith('/index')) {
    normalized = normalized.replace(/\/index$/, '')
  }

  return normalized
}

function collectFilePathCandidates(file: ContentlayerFile) {
  const candidates: string[] = []

  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      candidates.push(value)
    }
  }

  push(getRawDocumentValue(file, 'sourceFilePath'))
  push(getRawDocumentValue(file, 'flattenedPath'))
  push(file.data?.sourceFilePath)

  if (Array.isArray(file.history)) {
    file.history.forEach(push)
  }

  push(file?.path)
  push(file?.dirname)
  push(file?.basename)
  push(file?.stem)

  return candidates
}

function getCurrentNotePath(file: ContentlayerFile) {
  const candidates = collectFilePathCandidates(file)

  for (const candidate of candidates) {
    const normalized = normalizeNoteSourcePath(candidate)

    if (!normalized) continue
    if (normalized === '.' || normalized === '/') continue
    if (normalized.includes('node_modules')) continue
    if (normalized.includes('hitsuji.page')) continue
    if (normalized.startsWith('home/')) continue

    return normalized
  }

  return ''
}

function getCurrentNoteDir(file: ContentlayerFile) {
  const sourceFileDir = getRawDocumentValue(file, 'sourceFileDir')

  if (sourceFileDir) {
    return normalizeNoteDocPath(sourceFileDir)
  }

  const currentNotePath = getCurrentNotePath(file)

  if (!currentNotePath) return ''

  const dir = path.posix.dirname(currentNotePath)

  return dir === '.' ? '' : dir
}

function encodeUrlPath(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function splitHash(value: string) {
  const hashIndex = value.indexOf('#')

  if (hashIndex === -1) {
    return { rawPath: value, rawHeading: '' }
  }

  return {
    rawPath: value.slice(0, hashIndex),
    rawHeading: value.slice(hashIndex + 1),
  }
}

function getWikiLinkLabel(target: string, alias?: string) {
  if (alias?.trim()) return alias.trim()

  return target.split('#')[0]?.split('/').pop()?.replace(/\.md$/i, '').trim() || target
}

function resolveNoteSlug(rawTarget: string, file: ContentlayerFile) {
  const noteSlugs = getNoteSlugs()
  const currentDir = getCurrentNoteDir(file)
  const decodedTarget = safeDecode(rawTarget.trim())
  const target = normalizeSlashes(decodedTarget)
    .replace(/\.md$/i, '')
    .replace(/^\/+/, '')
    .replace(/^\.\//, '')

  const candidates: string[] = []

  if (target.startsWith('../') || target.startsWith('./')) {
    candidates.push(path.posix.normalize(`${currentDir}/${target}`))
  } else if (target.includes('/')) {
    if (currentDir) {
      candidates.push(path.posix.normalize(`${currentDir}/${target}`))
    }

    candidates.push(target)
  } else {
    if (currentDir) {
      candidates.push(`${currentDir}/${target}`)
    }

    candidates.push(target)
  }

  for (const candidate of candidates) {
    const normalized = normalizeNoteDocPath(candidate)

    if (noteSlugs.has(normalized)) {
      return normalized
    }
  }

  const basenameMatches = [...noteSlugs].filter((slug) => slug.split('/').at(-1) === target)

  if (basenameMatches.length === 1) {
    return basenameMatches[0]
  }

  return normalizeNoteDocPath(candidates[0] || target)
}

function noteTargetToHref(target: string, file: ContentlayerFile) {
  const { rawPath, rawHeading } = splitHash(target)
  const slug = resolveNoteSlug(rawPath, file)
  const hash = rawHeading ? `#${slugifyHeading(rawHeading)}` : ''

  return slug ? `/notes/${encodeUrlPath(slug)}${hash}` : `/notes${hash}`
}

function isExternalUrl(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)
}

function hasNonMarkdownExtension(value: string) {
  const cleanPath = value.split('#')[0] || ''
  const ext = path.posix.extname(cleanPath).toLowerCase()

  return Boolean(ext && ext !== '.md' && ext !== '.mdx')
}

function normalizeMarkdownLink(url: string, file: ContentlayerFile) {
  if (!url || isExternalUrl(url) || url.startsWith('#')) {
    return url
  }

  const { rawPath, rawHeading } = splitHash(url)
  const decodedPath = safeDecode(rawPath)
  const hash = rawHeading ? `#${slugifyHeading(rawHeading)}` : ''

  if (!decodedPath) {
    return rawHeading ? hash : url
  }

  if (url.startsWith('/notes/notes/')) {
    return url.replace(/^\/notes\/notes\//, '/notes/')
  }

  if (url.startsWith('/notes/')) {
    return url
  }

  if (url.startsWith('/')) {
    return url
  }

  if (hasNonMarkdownExtension(decodedPath)) {
    return url
  }

  if (decodedPath.endsWith('.md') || !path.posix.extname(decodedPath)) {
    return noteTargetToHref(rawHeading ? `${decodedPath}#${rawHeading}` : decodedPath, file)
  }

  return url
}

function linkNode(url: string, label: string, file: ContentlayerFile): MdastNode {
  if (hasNonMarkdownExtension(url)) {
    return {
      type: 'text',
      value: label,
    }
  }

  return {
    type: 'link',
    url: normalizeMarkdownLink(url, file),
    children: [{ type: 'text', value: label }],
  }
}

function convertWikiText(value: string, file: ContentlayerFile) {
  const regex = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g
  const children: MdastNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(value))) {
    if (match.index > 0 && value[match.index - 1] === '!') {
      continue
    }

    if (match.index > lastIndex) {
      children.push({ type: 'text', value: value.slice(lastIndex, match.index) })
    }

    const target = match[1].trim()
    const alias = match[2]?.trim()
    children.push(linkNode(target, getWikiLinkLabel(target, alias), file))

    lastIndex = regex.lastIndex
  }

  if (children.length === 0) {
    return [{ type: 'text', value }]
  }

  if (lastIndex < value.length) {
    children.push({ type: 'text', value: value.slice(lastIndex) })
  }

  return children
}

function transformNoteLinks(node: MdastNode, file: ContentlayerFile) {
  if (node.type === 'link' && typeof node.url === 'string') {
    node.url = normalizeMarkdownLink(node.url, file)
  }

  if (!Array.isArray(node.children)) return

  node.children = node.children.flatMap((child) => {
    if (child.type === 'text' && typeof child.value === 'string') {
      return convertWikiText(child.value, file)
    }

    transformNoteLinks(child, file)
    return child
  })
}

function remarkWikiLinks() {
  return (tree: MdastNode, file: ContentlayerFile) => {
    const sourceFilePath = getRawDocumentValue(file, 'sourceFilePath')
    const normalizedSourcePath = sourceFilePath
      ? normalizeSlashes(sourceFilePath).replace(/^data\//i, '')
      : ''

    if (!normalizedSourcePath.startsWith('notes/')) return

    transformNoteLinks(tree, file)
  }
}

const noteComputedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => normalizeNoteDocPath(doc._raw.flattenedPath),
  },
  path: {
    type: 'string',
    resolve: (doc) => {
      const slug = normalizeNoteDocPath(doc._raw.flattenedPath)
      return slug ? `notes/${slug}` : 'notes'
    },
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
  hasToc: {
    type: 'boolean',
    resolve: (doc) => /^##\s+Table of contents\s*$/im.test(doc.body.raw),
  },
}

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
  hasToc: {
    type: 'boolean',
    resolve: (doc) => /^##\s+Table of contents\s*$/im.test(doc.body.raw),
  },
}

function toSearchDocument(document: SearchSourceDocument) {
  return {
    title: document.title,
    summary: document.summary,
    path: document.path,
    slug: document.slug,
    tags: document.tags,
    date: document.date,
    lastmod: document.lastmod,
    ...(document.body?.raw ? { body: { raw: document.body.raw } } : {}),
  }
}

function createSearchIndex(documents: SearchSourceDocument[]) {
  if (searchDocumentsPath) {
    const publicDocuments = documents
      .filter((document) => document.draft !== true)
      .map(toSearchDocument)

    writeFileSync(`public/${path.basename(searchDocumentsPath)}`, JSON.stringify(publicDocuments))
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    featured: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: getDocumentImage(doc.images),
        url: absoluteSiteUrl(`${doc._raw.flattenedPath}/`),
      }),
    },
  },
}))

export const Note = defineDocumentType(() => ({
  name: 'Note',
  filePathPattern: 'notes/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string' },
    summary: { type: 'string' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    draft: { type: 'boolean' },
    lastmod: { type: 'date' },
  },
  computedFields: noteComputedFields,
}))

export const LearningLog = defineDocumentType(() => ({
  name: 'LearningLog',
  filePathPattern: 'learning-log/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    duration: { type: 'string' },
    badges: { type: 'list', of: { type: 'string' }, default: [] },
    notes: { type: 'json' },
    draft: { type: 'boolean' },
    lastmod: { type: 'date' },
  },
  computedFields: {
    ...computedFields,
    toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
    hasToc: {
      type: 'boolean',
      resolve: (doc) => /^##\s+Table of contents\s*$/im.test(doc.body.raw),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    bluesky: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, Note, LearningLog],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkWikiLinks,
      remarkCodeTitles,
      remarkAstroPaperCodeMeta,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          test: ['h2', 'h3', 'h4', 'h5', 'h6'],
          headingProperties: {
            className: ['content-header'],
          },
          properties: {
            className: ['heading-link'],
          },
          content: {
            type: 'text',
            value: '#',
          },
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const generatedData = await importData()
    const allBlogs = Array.isArray(generatedData.allBlogs) ? generatedData.allBlogs : []
    const allLearningLogs = Array.isArray(generatedData.allLearningLogs)
      ? generatedData.allLearningLogs
      : []
    const allNotes = Array.isArray(generatedData.allNotes) ? generatedData.allNotes : []

    const publicNotes = allNotes
      .filter((note) => !note.draft)
      .sort((a, b) => (a.title || a.slug).localeCompare(b.title || b.slug))

    const publicLearningLogs = allLearningLogs
      .filter((entry) => !entry.draft)
      .map((entry) => ({
        ...entry,
        path: `#log-${entry.slug}`,
      }))

    const publicBlogs = sortPosts(allBlogs.filter((post) => !post.draft))

    createSearchIndex([...publicBlogs, ...sortPosts(publicLearningLogs), ...publicNotes])
  },
})
