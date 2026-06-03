import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync, existsSync, readdirSync } from 'fs'
import readingTime from 'reading-time'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
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
import { sortPosts } from 'pliny/utils/contentlayer.js'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

function extractAstroPaperCodeFileName(meta?: string) {
  if (!meta) return undefined

  const match = meta.match(/(?:^|\s)file=(?:"([^"]+)"|'([^']+)'|([^\s]+))/)
  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function visitAstroPaperMdast(
  node: any,
  visitor: (node: any, index?: number, parent?: any) => void,
  parent?: any,
  index?: number
) {
  visitor(node, index, parent)

  if (!node || !Array.isArray(node.children)) return

  node.children.forEach((child: any, childIndex: number) => {
    visitAstroPaperMdast(child, visitor, node, childIndex)
  })
}

function remarkAstroPaperCodeMeta() {
  return (tree: any) => {
    visitAstroPaperMdast(tree, (node: any) => {
      if (!node || node.type !== 'code') return

      const fileName = extractAstroPaperCodeFileName(node.meta)

      if (!fileName) return

      node.data = node.data || {}
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
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

function normalizeNoteAliases(value: string) {
  const parts = normalizeSlashes(safeDecode(value)).replace(/\+/g, ' ').split('/').filter(Boolean)
  const first = parts[0]?.toLowerCase()

  if (first === 'knowledge' || first === 'c++ fundamentals' || first === 'cpp fundamentals') {
    parts[0] = 'cpp-fundamentals'
  }

  if (first === 'learncpp' || first === 'learncpp course') {
    parts[0] = 'learncpp-course'
  }

  return parts.join('/')
}

function normalizeNoteDocPath(value: string) {
  return normalizeNoteAliases(
    normalizeSlashes(value)
      .replace(/\.mdx?$/i, '')
      .replace(/^data\//i, '')
      .replace(/^notes\/notes\/?/i, '')
      .replace(/^notes\/?/i, '')
      .replace(/\/index$/i, '')
      .replace(/^\/+/, '')
      .replace(/\/$/, '')
  )
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

    return normalizeNoteDocPath(path.relative(baseDir, fullPath))
  })
}

function getNoteSlugs() {
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

function collectFilePathCandidates(file: any) {
  const candidates: string[] = []

  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      candidates.push(value)
    }
  }

  push(file?.data?.rawDocumentData?._raw?.sourceFilePath)
  push(file?.data?.rawDocumentData?.sourceFilePath)
  push(file?.data?.rawDocumentData?._raw?.flattenedPath)
  push(file?.data?.rawDocumentData?.flattenedPath)
  push(file?.data?.sourceFilePath)

  if (Array.isArray(file?.history)) {
    file.history.forEach(push)
  }

  push(file?.path)
  push(file?.dirname)
  push(file?.basename)
  push(file?.stem)

  return candidates
}

function getCurrentNotePath(file: any) {
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

function getCurrentNoteDir(file: any) {
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

function resolveNoteSlug(rawTarget: string, file: any) {
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

function noteTargetToHref(target: string, file: any) {
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

function normalizeMarkdownLink(url: string, file: any) {
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

  if (hasNonMarkdownExtension(decodedPath)) {
    return url
  }

  if (decodedPath.endsWith('.md') || !path.posix.extname(decodedPath)) {
    return noteTargetToHref(rawHeading ? `${decodedPath}#${rawHeading}` : decodedPath, file)
  }

  return url
}

function linkNode(url: string, label: string, file: any) {
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

function convertWikiText(value: string, file: any) {
  const regex = /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g
  const children: any[] = []
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

function transformNoteLinks(node: any, file: any) {
  if (!node) return

  if (node.type === 'link' && typeof node.url === 'string') {
    node.url = normalizeMarkdownLink(node.url, file)
  }

  if (!Array.isArray(node.children)) return

  node.children = node.children.flatMap((child: any) => {
    if (child?.type === 'text') {
      return convertWikiText(child.value, file)
    }

    transformNoteLinks(child, file)
    return child
  })
}

function remarkWikiLinks() {
  return (tree: any, file: any) => {
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

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

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

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(sortPosts(allBlogs))
    )
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
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
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
    summary: { type: 'string' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
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
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: icon,
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
        path: `learning-log#${entry.slug}`,
      }))

    createSearchIndex([...sortPosts(allBlogs), ...sortPosts(publicLearningLogs), ...publicNotes])
  },
})
