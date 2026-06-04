# Learning log design debug
2026-06-03T00:47:19+02:00

## Git status
?? learning-log-design-debug.md
6ae76ef feat(learning-log): add study session timeline
8e2ec77 chore(notes): clean stale ignore rules
0dd693a fix(notes): avoid duplicating section in breadcrumbs
af3b91e fix(notes): preserve note breadcrumb labels
d321579 fix(notes): improve breadcrumbs and vault semantics
01a3634 docs(notes): sync learncpp exercise notes
ba014fe fix(notes): pass labels into breadcrumbs
dca06a7 fix(notes): keep vault public but out of search index
c4ea292 fix(notes): format x section folder labels
a29d590 fix(notes): include notes routes in pages export
6c5d4e2 ci(pages): verify notes sources before export
25c7886 feat(notes): add notes

## Learning log files

### FILE: app/learning-log/page.tsx
     1	import type { Metadata } from 'next'
     2	import Breadcrumb from '@/components/Breadcrumb'
     3	import Link from '@/components/Link'
     4	import { genPageMetadata } from 'app/seo'
     5	import {
     6	  formatLearningLogDate,
     7	  getLearningLogNotes,
     8	  getPublicLearningLogs,
     9	} from './_lib/learning-log'
    10	
    11	export const metadata: Metadata = genPageMetadata({
    12	  title: 'Learning Log',
    13	  description: 'Short notes from my learning sessions, updated notes, and what I struggled with.',
    14	})
    15	
    16	export default function LearningLogPage() {
    17	  const entries = getPublicLearningLogs()
    18	
    19	  return (
    20	    <>
    21	      <Breadcrumb />
    22	
    23	      <main id="main-content" className="app-layout learning-log-layout">
    24	        <header className="learning-log-header">
    25	          <p className="learning-log-eyebrow">Learning journal</p>
    26	          <h1>Learning Log</h1>
    27	          <p>
    28	            Short notes from study sessions: what I learned, what got stuck, and which notes
    29	            changed.
    30	          </p>
    31	        </header>
    32	
    33	        {entries.length === 0 ? (
    34	          <section className="learning-log-empty">
    35	            <h2>No logs yet</h2>
    36	            <p>
    37	              Add markdown files to <code>data/learning-log</code> to start tracking learning
    38	              sessions.
    39	            </p>
    40	          </section>
    41	        ) : (
    42	          <ol className="learning-log-timeline">
    43	            {entries.map((entry) => {
    44	              const notes = getLearningLogNotes(entry)
    45	
    46	              return (
    47	                <li key={entry.slug} className="learning-log-card">
    48	                  <div className="learning-log-date">{formatLearningLogDate(entry.date)}</div>
    49	
    50	                  <article>
    51	                    <div className="learning-log-card-meta">
    52	                      <span>{entry.duration || 'Study session'}</span>
    53	                      {entry.tags?.length > 0 && (
    54	                        <>
    55	                          <span aria-hidden="true">·</span>
    56	                          <span>{entry.tags.join(' / ')}</span>
    57	                        </>
    58	                      )}
    59	                    </div>
    60	
    61	                    <h2>
    62	                      <Link href={`/${entry.path}`}>{entry.title}</Link>
    63	                    </h2>
    64	
    65	                    {entry.summary && <p className="learning-log-summary">{entry.summary}</p>}
    66	
    67	                    {notes.length > 0 && (
    68	                      <div className="learning-log-notes">
    69	                        <span>Updated notes:</span>
    70	                        <ul>
    71	                          {notes.map((note) => (
    72	                            <li key={note.href}>
    73	                              <Link href={note.href}>{note.title}</Link>
    74	                            </li>
    75	                          ))}
    76	                        </ul>
    77	                      </div>
    78	                    )}
    79	                  </article>
    80	                </li>
    81	              )
    82	            })}
    83	          </ol>
    84	        )}
    85	      </main>
    86	    </>
    87	  )
    88	}

### FILE: app/learning-log/[...slug]/page.tsx
     1	import 'css/prism.css'
     2	import 'katex/dist/katex.css'
     3	
     4	import type { Metadata } from 'next'
     5	import { notFound } from 'next/navigation'
     6	import { MDXLayoutRenderer } from 'pliny/mdx-components'
     7	import Breadcrumb from '@/components/Breadcrumb'
     8	import Link from '@/components/Link'
     9	import { components } from '@/components/MDXComponents'
    10	import PostEnhancements from '@/components/PostEnhancements'
    11	import { genPageMetadata } from 'app/seo'
    12	import {
    13	  formatLearningLogDate,
    14	  getLearningLogBySlug,
    15	  getLearningLogNotes,
    16	  getLearningLogTitle,
    17	  getPublicLearningLogs,
    18	} from '../_lib/learning-log'
    19	
    20	function getSlug(params: { slug: string[] }) {
    21	  return params.slug.join('/')
    22	}
    23	
    24	export async function generateStaticParams() {
    25	  return getPublicLearningLogs().map((entry) => ({
    26	    slug: entry.slug.split('/'),
    27	  }))
    28	}
    29	
    30	export async function generateMetadata(props: {
    31	  params: Promise<{ slug: string[] }>
    32	}): Promise<Metadata | undefined> {
    33	  const params = await props.params
    34	  const entry = getLearningLogBySlug(getSlug(params))
    35	
    36	  if (!entry) return undefined
    37	
    38	  return genPageMetadata({
    39	    title: getLearningLogTitle(entry),
    40	    description: entry.summary || 'A short note from my learning log.',
    41	  })
    42	}
    43	
    44	export default async function LearningLogEntryPage(props: { params: Promise<{ slug: string[] }> }) {
    45	  const params = await props.params
    46	  const entry = getLearningLogBySlug(getSlug(params))
    47	
    48	  if (!entry) return notFound()
    49	
    50	  const notes = getLearningLogNotes(entry)
    51	  const startsWithH1 = entry.body.raw.trimStart().startsWith('# ')
    52	
    53	  return (
    54	    <>
    55	      <Breadcrumb />
    56	
    57	      <main id="main-content" className="app-layout learning-log-entry-layout">
    58	        <article className="post-content app-prose prose dark:prose-invert">
    59	          <header className="learning-log-entry-header not-prose">
    60	            <p className="learning-log-eyebrow">
    61	              {formatLearningLogDate(entry.date)}
    62	              {entry.duration ? ` · ${entry.duration}` : ''}
    63	            </p>
    64	
    65	            {!startsWithH1 && <h1>{getLearningLogTitle(entry)}</h1>}
    66	
    67	            {entry.summary && <p>{entry.summary}</p>}
    68	          </header>
    69	
    70	          <MDXLayoutRenderer code={entry.body.code} components={components} toc={entry.toc} />
    71	
    72	          {notes.length > 0 && (
    73	            <section className="learning-log-entry-notes not-prose" aria-label="Updated notes">
    74	              <h2>Updated notes</h2>
    75	              <ul>
    76	                {notes.map((note) => (
    77	                  <li key={note.href}>
    78	                    <Link href={note.href}>{note.title}</Link>
    79	                  </li>
    80	                ))}
    81	              </ul>
    82	            </section>
    83	          )}
    84	
    85	          <PostEnhancements toc={entry.toc} hasToc={entry.hasToc} />
    86	        </article>
    87	      </main>
    88	    </>
    89	  )
    90	}

### FILE: app/learning-log/_lib/learning-log.ts
     1	import { allLearningLogs, type LearningLog } from 'contentlayer/generated'
     2	
     3	export type LearningLogNoteLink = {
     4	  title: string
     5	  href: string
     6	}
     7	
     8	export function getPublicLearningLogs() {
     9	  return allLearningLogs
    10	    .filter((entry) => !entry.draft)
    11	    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    12	}
    13	
    14	export function getLearningLogBySlug(slug: string) {
    15	  return getPublicLearningLogs().find((entry) => entry.slug === slug)
    16	}
    17	
    18	export function getLearningLogTitle(entry: Pick<LearningLog, 'title' | 'slug'>) {
    19	  return entry.title || entry.slug.split('/').pop()?.replace(/-/g, ' ') || 'Learning log'
    20	}
    21	
    22	export function formatLearningLogDate(date: string) {
    23	  return new Intl.DateTimeFormat('en', {
    24	    day: '2-digit',
    25	    month: 'short',
    26	    year: 'numeric',
    27	  }).format(new Date(date))
    28	}
    29	
    30	export function getLearningLogNotes(entry: Pick<LearningLog, 'notes'>): LearningLogNoteLink[] {
    31	  if (!Array.isArray(entry.notes)) return []
    32	
    33	  return entry.notes
    34	    .map((note) => {
    35	      if (typeof note === 'string') {
    36	        return {
    37	          title: note.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || note,
    38	          href: note,
    39	        }
    40	      }
    41	
    42	      if (!note || typeof note !== 'object') return null
    43	
    44	      const value = note as Record<string, unknown>
    45	      const href = typeof value.href === 'string' ? value.href : ''
    46	      const title =
    47	        typeof value.title === 'string'
    48	          ? value.title
    49	          : href.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || href
    50	
    51	      if (!href) return null
    52	
    53	      return { title, href }
    54	    })
    55	    .filter((note): note is LearningLogNoteLink => Boolean(note))
    56	}

### FILE: data/learning-log/2026-06-03-learncpp-2x.mdx
     1	---
     2	title: 'LearnCpp 2.x exercises'
     3	date: '2026-06-03'
     4	duration: '5h'
     5	summary: 'I worked through the end of chapter 2 exercises and updated the related notes.'
     6	tags: ['cpp', 'learncpp']
     7	notes:
     8	  - title: '2.x / Q1'
     9	    href: '/notes/learncpp-course/exercises/02-x/q1'
    10	  - title: '2.x / Q2'
    11	    href: '/notes/learncpp-course/exercises/02-x/q2'
    12	  - title: '2.x / Q3'
    13	    href: '/notes/learncpp-course/exercises/02-x/q3'
    14	---
    15	
    16	## Learned
    17	
    18	I practiced the basics from the end of chapter 2 and connected a few scattered pieces around variables, initialization, and simple program flow.
    19	
    20	## Difficult
    21	
    22	The hardest part was noticing the difference between actually understanding the solution and only recognizing the shape of a previous example.
    23	
    24	## Next
    25	
    26	Repeat the mistakes from these exercises, then move to the next LearnCpp section.

## Contentlayer relevant parts
491:function createSearchIndex(allBlogs) {
553:export const LearningLog = defineDocumentType(() => ({
554:  name: 'LearningLog',
598:  documentTypes: [Blog, Authors, Note, LearningLog],
633:    const allLearningLogs = Array.isArray(generatedData.allLearningLogs)
634:      ? generatedData.allLearningLogs
642:    const publicLearningLogs = allLearningLogs.filter((entry) => !entry.draft)
644:    createSearchIndex([...sortPosts(allBlogs), ...sortPosts(publicLearningLogs), ...publicNotes])
     1	import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
     2	import { writeFileSync, existsSync, readdirSync } from 'fs'
     3	import readingTime from 'reading-time'
     4	import path from 'path'
     5	import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
     6	// Remark packages
     7	import remarkGfm from 'remark-gfm'
     8	import remarkMath from 'remark-math'
     9	import { remarkAlert } from 'remark-github-blockquote-alert'
    10	import {
    11	  remarkExtractFrontmatter,
    12	  remarkCodeTitles,
    13	  remarkImgToJsx,
    14	  extractTocHeadings,
    15	} from 'pliny/mdx-plugins/index.js'
    16	// Rehype packages
    17	import rehypeSlug from 'rehype-slug'
    18	import rehypeAutolinkHeadings from 'rehype-autolink-headings'
    19	import rehypeKatex from 'rehype-katex'
    20	import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
    21	import rehypeCitation from 'rehype-citation'
    22	import rehypePrismPlus from 'rehype-prism-plus'
    23	import rehypePresetMinify from 'rehype-preset-minify'
    24	import siteMetadata from './data/siteMetadata'
    25	import { sortPosts } from 'pliny/utils/contentlayer.js'
    26	
    27	const root = process.cwd()
    28	const isProduction = process.env.NODE_ENV === 'production'
    29	
    30	function extractAstroPaperCodeFileName(meta?: string) {
    31	  if (!meta) return undefined
    32	
    33	  const match = meta.match(/(?:^|\s)file=(?:"([^"]+)"|'([^']+)'|([^\s]+))/)
    34	  return match?.[1] ?? match?.[2] ?? match?.[3]
    35	}
    36	
    37	function visitAstroPaperMdast(
    38	  node: any,
    39	  visitor: (node: any, index?: number, parent?: any) => void,
    40	  parent?: any,
    41	  index?: number
    42	) {
    43	  visitor(node, index, parent)
    44	
    45	  if (!node || !Array.isArray(node.children)) return
    46	
    47	  node.children.forEach((child: any, childIndex: number) => {
    48	    visitAstroPaperMdast(child, visitor, node, childIndex)
    49	  })
    50	}
    51	
    52	function remarkAstroPaperCodeMeta() {
    53	  return (tree: any) => {
    54	    visitAstroPaperMdast(tree, (node: any) => {
    55	      if (!node || node.type !== 'code') return
    56	
    57	      const fileName = extractAstroPaperCodeFileName(node.meta)
    58	
    59	      if (!fileName) return
    60	
    61	      node.data = node.data || {}
    62	      node.data.hProperties = {
    63	        ...(node.data.hProperties || {}),
    64	        'data-file': fileName,
    65	        'data-meta': node.meta || '',
    66	      }
    67	    })
    68	  }
    69	}
    70	
    71	function slugifyHeading(value: string) {
    72	  return value
    73	    .toLowerCase()
    74	    .trim()
    75	    .normalize('NFKD')
    76	    .replace(/[\u0300-\u036f]/g, '')
    77	    .replace(/[^a-z0-9\s-]/g, '')
    78	    .replace(/\s+/g, '-')
    79	    .replace(/-+/g, '-')
    80	    .replace(/^-|-$/g, '')
    81	}
    82	
    83	const noteMarkdownRoot = path.join(root, 'data', 'notes')
    84	let cachedNoteSlugs: Set<string> | undefined
    85	
    86	function normalizeSlashes(value: string) {
    87	  return value.replace(/\\/g, '/')
    88	}
    89	
    90	function safeDecode(value: string) {
    91	  try {
    92	    return decodeURIComponent(value)
    93	  } catch {
    94	    return value
    95	  }
    96	}
    97	
    98	function normalizeNoteAliases(value: string) {
    99	  const parts = normalizeSlashes(safeDecode(value)).replace(/\+/g, ' ').split('/').filter(Boolean)
   100	  const first = parts[0]?.toLowerCase()
   101	
   102	  if (first === 'knowledge' || first === 'c++ fundamentals' || first === 'cpp fundamentals') {
   103	    parts[0] = 'cpp-fundamentals'
   104	  }
   105	
   106	  if (first === 'learncpp' || first === 'learncpp course') {
   107	    parts[0] = 'learncpp-course'
   108	  }
   109	
   110	  return parts.join('/')
   111	}
   112	
   113	function normalizeNoteDocPath(value: string) {
   114	  return normalizeNoteAliases(
   115	    normalizeSlashes(value)
   116	      .replace(/\.mdx?$/i, '')
   117	      .replace(/^data\//i, '')
   118	      .replace(/^notes\/notes\/?/i, '')
   119	      .replace(/^notes\/?/i, '')
   120	      .replace(/\/index$/i, '')
   121	      .replace(/^\/+/, '')
   122	      .replace(/\/$/, '')
   123	  )
   124	}
   125	
   126	function readNoteSlugs(dir: string, baseDir: string): string[] {
   127	  if (!existsSync(dir)) return []
   128	
   129	  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
   130	    if (entry.name.startsWith('.') || entry.name === '.obsidian' || entry.name === '.trash') {
   131	      return []
   132	    }
   133	
   134	    const fullPath = path.join(dir, entry.name)
   135	
   136	    if (entry.isDirectory()) {
   137	      return readNoteSlugs(fullPath, baseDir)
   138	    }
   139	
   140	    if (!entry.name.endsWith('.md')) {
   141	      return []
   142	    }
   143	
   144	    return normalizeNoteDocPath(path.relative(baseDir, fullPath))
   145	  })
   146	}
   147	
   148	function getNoteSlugs() {
   149	  if (!cachedNoteSlugs) {
   150	    cachedNoteSlugs = new Set(readNoteSlugs(noteMarkdownRoot, noteMarkdownRoot))
   151	  }
   152	
   153	  return cachedNoteSlugs
   154	}
   155	
   156	function normalizeNoteSourcePath(value: string) {
   157	  let normalized = normalizeSlashes(safeDecode(value)).replace(/\\/g, '/')
   158	
   159	  const dataNotesNotesMarker = '/data/notes/notes/'
   160	  const dataNotesMarker = '/data/notes/'
   161	
   162	  if (normalized.includes(dataNotesNotesMarker)) {
   163	    normalized = normalized.slice(
   164	      normalized.indexOf(dataNotesNotesMarker) + dataNotesNotesMarker.length
   165	    )
   166	  } else if (normalized.includes(dataNotesMarker)) {
   167	    normalized = normalized.slice(normalized.indexOf(dataNotesMarker) + dataNotesMarker.length)
   168	  }
   169	
   170	  normalized = normalized
   171	    .replace(/^notes\/notes\//, '')
   172	    .replace(/^notes\//, '')
   173	    .replace(/^\.\//, '')
   174	    .replace(/\.md$/i, '')
   175	
   176	  if (normalized.endsWith('/index')) {
   177	    normalized = normalized.replace(/\/index$/, '')
   178	  }
   179	
   180	  return normalized
   181	}
   182	
   183	function collectFilePathCandidates(file: any) {
   184	  const candidates: string[] = []
   185	
   186	  const push = (value: unknown) => {
   187	    if (typeof value === 'string' && value.trim()) {
   188	      candidates.push(value)
   189	    }
   190	  }
   191	
   192	  push(file?.data?.rawDocumentData?._raw?.sourceFilePath)
   193	  push(file?.data?.rawDocumentData?.sourceFilePath)
   194	  push(file?.data?.rawDocumentData?._raw?.flattenedPath)
   195	  push(file?.data?.rawDocumentData?.flattenedPath)
   196	  push(file?.data?.sourceFilePath)
   197	
   198	  if (Array.isArray(file?.history)) {
   199	    file.history.forEach(push)
   200	  }
   201	
   202	  push(file?.path)
   203	  push(file?.dirname)
   204	  push(file?.basename)
   205	  push(file?.stem)
   206	
   207	  return candidates
   208	}
   209	
   210	function getCurrentNotePath(file: any) {
   211	  const candidates = collectFilePathCandidates(file)
   212	
   213	  for (const candidate of candidates) {
   214	    const normalized = normalizeNoteSourcePath(candidate)
   215	
   216	    if (!normalized) continue
   217	    if (normalized === '.' || normalized === '/') continue
   218	    if (normalized.includes('node_modules')) continue
   219	    if (normalized.includes('hitsuji.page')) continue
   220	    if (normalized.startsWith('home/')) continue
   221	
   222	    return normalized
   223	  }
   224	
   225	  return ''
   226	}
   227	
   228	function getCurrentNoteDir(file: any) {
   229	  const currentNotePath = getCurrentNotePath(file)
   230	
   231	  if (!currentNotePath) return ''
   232	
   233	  const dir = path.posix.dirname(currentNotePath)
   234	
   235	  return dir === '.' ? '' : dir
   236	}
   237	
   238	function encodeUrlPath(value: string) {
   239	  return value
   240	    .split('/')
   241	    .filter(Boolean)
   242	    .map((part) => encodeURIComponent(part))
   243	    .join('/')
   244	}
   245	
   246	function splitHash(value: string) {
   247	  const hashIndex = value.indexOf('#')
   248	
   249	  if (hashIndex === -1) {
   250	    return { rawPath: value, rawHeading: '' }
   251	  }
   252	
   253	  return {
   254	    rawPath: value.slice(0, hashIndex),
   255	    rawHeading: value.slice(hashIndex + 1),
   256	  }
   257	}
   258	
   259	function getWikiLinkLabel(target: string, alias?: string) {
   260	  if (alias?.trim()) return alias.trim()
   261	
   262	  return target.split('#')[0]?.split('/').pop()?.replace(/\.md$/i, '').trim() || target
   263	}
   264	
   265	function resolveNoteSlug(rawTarget: string, file: any) {
   266	  const noteSlugs = getNoteSlugs()
   267	  const currentDir = getCurrentNoteDir(file)
   268	  const decodedTarget = safeDecode(rawTarget.trim())
   269	  const target = normalizeSlashes(decodedTarget)
   270	    .replace(/\.md$/i, '')
   271	    .replace(/^\/+/, '')
   272	    .replace(/^\.\//, '')
   273	
   274	  const candidates: string[] = []
   275	
   276	  if (target.startsWith('../') || target.startsWith('./')) {
   277	    candidates.push(path.posix.normalize(`${currentDir}/${target}`))
   278	  } else if (target.includes('/')) {
   279	    if (currentDir) {
   280	      candidates.push(path.posix.normalize(`${currentDir}/${target}`))
   281	    }
   282	
   283	    candidates.push(target)
   284	  } else {
   285	    if (currentDir) {
   286	      candidates.push(`${currentDir}/${target}`)
   287	    }
   288	
   289	    candidates.push(target)
   290	  }
   291	
   292	  for (const candidate of candidates) {
   293	    const normalized = normalizeNoteDocPath(candidate)
   294	
   295	    if (noteSlugs.has(normalized)) {
   296	      return normalized
   297	    }
   298	  }
   299	
   300	  const basenameMatches = [...noteSlugs].filter((slug) => slug.split('/').at(-1) === target)
   301	
   302	  if (basenameMatches.length === 1) {
   303	    return basenameMatches[0]
   304	  }
   305	
   306	  return normalizeNoteDocPath(candidates[0] || target)
   307	}
   308	
   309	function noteTargetToHref(target: string, file: any) {
   310	  const { rawPath, rawHeading } = splitHash(target)
   311	  const slug = resolveNoteSlug(rawPath, file)
   312	  const hash = rawHeading ? `#${slugifyHeading(rawHeading)}` : ''
   313	
   314	  return slug ? `/notes/${encodeUrlPath(slug)}${hash}` : `/notes${hash}`
   315	}
   316	
   317	function isExternalUrl(value: string) {
   318	  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)
   319	}
   320	
   321	function hasNonMarkdownExtension(value: string) {
   322	  const cleanPath = value.split('#')[0] || ''
   323	  const ext = path.posix.extname(cleanPath).toLowerCase()
   324	
   325	  return Boolean(ext && ext !== '.md' && ext !== '.mdx')
   326	}
   327	
   328	function normalizeMarkdownLink(url: string, file: any) {
   329	  if (!url || isExternalUrl(url) || url.startsWith('#')) {
   330	    return url
   331	  }
   332	
   333	  const { rawPath, rawHeading } = splitHash(url)
   334	  const decodedPath = safeDecode(rawPath)
   335	  const hash = rawHeading ? `#${slugifyHeading(rawHeading)}` : ''
   336	
   337	  if (!decodedPath) {
   338	    return rawHeading ? hash : url
   339	  }
   340	
   341	  if (url.startsWith('/notes/notes/')) {
   342	    return url.replace(/^\/notes\/notes\//, '/notes/')
   343	  }
   344	
   345	  if (url.startsWith('/notes/')) {
   346	    return url
   347	  }
   348	
   349	  if (hasNonMarkdownExtension(decodedPath)) {
   350	    return url
   351	  }
   352	
   353	  if (decodedPath.endsWith('.md') || !path.posix.extname(decodedPath)) {
   354	    return noteTargetToHref(rawHeading ? `${decodedPath}#${rawHeading}` : decodedPath, file)
   355	  }
   356	
   357	  return url
   358	}
   359	
   360	function linkNode(url: string, label: string, file: any) {
   361	  if (hasNonMarkdownExtension(url)) {
   362	    return {
   363	      type: 'text',
   364	      value: label,
   365	    }
   366	  }
   367	
   368	  return {
   369	    type: 'link',
   370	    url: normalizeMarkdownLink(url, file),
   371	    children: [{ type: 'text', value: label }],
   372	  }
   373	}
   374	
   375	function convertWikiText(value: string, file: any) {
   376	  const regex = /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g
   377	  const children: any[] = []
   378	  let lastIndex = 0
   379	  let match: RegExpExecArray | null
   380	
   381	  while ((match = regex.exec(value))) {
   382	    if (match.index > 0 && value[match.index - 1] === '!') {
   383	      continue
   384	    }
   385	
   386	    if (match.index > lastIndex) {
   387	      children.push({ type: 'text', value: value.slice(lastIndex, match.index) })
   388	    }
   389	
   390	    const target = match[1].trim()
   391	    const alias = match[2]?.trim()
   392	    children.push(linkNode(target, getWikiLinkLabel(target, alias), file))
   393	
   394	    lastIndex = regex.lastIndex
   395	  }
   396	
   397	  if (children.length === 0) {
   398	    return [{ type: 'text', value }]
   399	  }
   400	
   401	  if (lastIndex < value.length) {
   402	    children.push({ type: 'text', value: value.slice(lastIndex) })
   403	  }
   404	
   405	  return children
   406	}
   407	
   408	function transformNoteLinks(node: any, file: any) {
   409	  if (!node) return
   410	
   411	  if (node.type === 'link' && typeof node.url === 'string') {
   412	    node.url = normalizeMarkdownLink(node.url, file)
   413	  }
   414	
   415	  if (!Array.isArray(node.children)) return
   416	
   417	  node.children = node.children.flatMap((child: any) => {
   418	    if (child?.type === 'text') {
   419	      return convertWikiText(child.value, file)
   420	    }

## Routing and nav

### FILE: app/sitemap.ts
     1	import { MetadataRoute } from 'next'
     2	import { allBlogs, allLearningLogs } from 'contentlayer/generated'
     3	import siteMetadata from '@/data/siteMetadata'
     4	
     5	export const dynamic = 'force-static'
     6	
     7	export default function sitemap(): MetadataRoute.Sitemap {
     8	  const siteUrl = siteMetadata.siteUrl
     9	
    10	  const blogRoutes = allBlogs
    11	    .filter((post) => !post.draft)
    12	    .map((post) => ({
    13	      url: `${siteUrl}/${post.path}`,
    14	      lastModified: post.lastmod || post.date,
    15	    }))
    16	
    17	  const learningLogRoutes = allLearningLogs
    18	    .filter((entry) => !entry.draft)
    19	    .map((entry) => ({
    20	      url: `${siteUrl}/${entry.path}`,
    21	      lastModified: entry.lastmod || entry.date,
    22	    }))
    23	
    24	  const routes = ['', 'blog', 'learning-log', 'projects', 'archives', 'tags', 'about'].map(
    25	    (route) => ({
    26	      url: `${siteUrl}/${route}`,
    27	      lastModified: new Date().toISOString().split('T')[0],
    28	    })
    29	  )
    30	
    31	  return [...routes, ...blogRoutes, ...learningLogRoutes]
    32	}

### FILE: data/headerNavLinks.ts
     1	const headerNavLinks = [
     2	  { href: '/blog', title: 'Posts' },
     3	  { href: '/notes', title: 'Notes' },
     4	  { href: '/learning-log', title: 'Log' },
     5	  { href: '/tags', title: 'Tags' },
     6	  { href: '/about', title: 'About' },
     7	  { href: '/projects', title: 'Projects' },
     8	]
     9	
    10	export default headerNavLinks

### FILE: components/Breadcrumb.tsx
     1	'use client'
     2	
     3	import { usePathname } from 'next/navigation'
     4	import Link from './Link'
     5	
     6	const labels: Record<string, string> = {
     7	  blog: 'Posts',
     8	  posts: 'Posts',
     9	  tags: 'Tags',
    10	  about: 'About',
    11	  projects: 'Projects',
    12	  search: 'Search',
    13	  archives: 'Archives',
    14	  notes: 'Notes',
    15	  'learning-log': 'Learning Log',
    16	}
    17	
    18	function safeDecode(value: string) {
    19	  try {
    20	    return decodeURIComponent(value)
    21	  } catch {
    22	    return value
    23	  }
    24	}
    25	
    26	function formatSegment(segment: string, index: number, label?: string) {
    27	  if (label) return label
    28	
    29	  const decoded = safeDecode(segment)
    30	
    31	  if (labels[decoded]) return labels[decoded]
    32	
    33	  const text = decoded
    34	    .replace(/(\d+)-(\d+|x)/gi, (_, left: string, right: string) => {
    35	      const section = right.toLowerCase()
    36	      return `${Number(left)}.${section === 'x' ? 'x' : Number(section)}`
    37	    })
    38	    .replaceAll('-', ' ')
    39	
    40	  return index === 0 ? text.replace(/^\w/, (char) => char.toUpperCase()) : text
    41	}
    42	
    43	type BreadcrumbProps = {
    44	  labelsByHref?: Record<string, string>
    45	}
    46	
    47	export default function Breadcrumb({ labelsByHref = {} }: BreadcrumbProps) {
    48	  const pathname = usePathname()
    49	  const segments = pathname.split('/').filter(Boolean)
    50	
    51	  if (segments.length === 0) return null
    52	
    53	  const visibleSegments =
    54	    segments[0] === 'blog' && segments[1] === 'page'
    55	      ? [`Posts (page ${segments[2] || 1})`]
    56	      : segments[0] === 'tags' && segments[2] === 'page'
    57	        ? ['Tags', `${segments[1]}${segments[3] ? ` (page ${segments[3]})` : ''}`]
    58	        : segments[0] === 'blog'
    59	          ? ['Posts']
    60	          : segments
    61	
    62	  return (
    63	    <nav className="app-layout mt-8 mb-1" aria-label="breadcrumb">
    64	      <ul className="font-light [&>li]:inline">
    65	        <li>
    66	          <Link href="/" className="opacity-80 hover:opacity-100">
    67	            Home
    68	          </Link>{' '}
    69	          <span aria-hidden="true" className="opacity-80">
    70	            &raquo;
    71	          </span>{' '}
    72	        </li>
    73	
    74	        {visibleSegments.map((segment, index) => {
    75	          const isLast = index === visibleSegments.length - 1
    76	          const href =
    77	            segment === 'Posts' || String(segment).startsWith('Posts ')
    78	              ? '/blog'
    79	              : segment === 'Tags'
    80	                ? '/tags'
    81	                : `/${segments.slice(0, index + 1).join('/')}`
    82	
    83	          const label = labelsByHref[href]
    84	
    85	          return (
    86	            <li key={`${segment}-${index}`}>
    87	              {isLast ? (
    88	                <span className="opacity-75" aria-current="page">
    89	                  {formatSegment(segment, index, label)}
    90	                </span>
    91	              ) : (
    92	                <>
    93	                  <Link href={href} className="opacity-70 hover:opacity-100">
    94	                    {formatSegment(segment, index, label)}
    95	                  </Link>{' '}
    96	                  <span aria-hidden="true" className="opacity-70">
    97	                    &raquo;
    98	                  </span>{' '}
    99	                </>
   100	              )}
   101	            </li>
   102	          )
   103	        })}
   104	      </ul>
   105	    </nav>
   106	  )
   107	}

## Design references

### FILE: app/blog/page.tsx
     1	import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
     2	import { allBlogs } from 'contentlayer/generated'
     3	import { genPageMetadata } from 'app/seo'
     4	import ListLayout from '@/layouts/ListLayoutWithTags'
     5	
     6	const POSTS_PER_PAGE = 4
     7	
     8	export const metadata = genPageMetadata({ title: 'Blog' })
     9	
    10	export default async function BlogPage(props: { searchParams: Promise<{ page: string }> }) {
    11	  const posts = allCoreContent(sortPosts(allBlogs.filter((post) => !post.draft)))
    12	  const pageNumber = 1
    13	  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
    14	  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
    15	  const pagination = {
    16	    currentPage: pageNumber,
    17	    totalPages: totalPages,
    18	  }
    19	
    20	  return (
    21	    <ListLayout
    22	      posts={posts}
    23	      initialDisplayPosts={initialDisplayPosts}
    24	      pagination={pagination}
    25	      title="Posts"
    26	      description="All the articles I\'ve posted."
    27	    />
    28	  )
    29	}

### FILE: app/archives/page.tsx
     1	import Breadcrumb from '@/components/Breadcrumb'
     2	import PageMain from '@/components/PageMain'
     3	import PostCard from '@/components/PostCard'
     4	import { genPageMetadata } from 'app/seo'
     5	import { allBlogs } from 'contentlayer/generated'
     6	import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
     7	
     8	export const metadata = genPageMetadata({
     9	  title: 'Archives',
    10	  description: "All the articles I've archived.",
    11	})
    12	
    13	function groupBy<T>(items: T[], getKey: (item: T) => string | number) {
    14	  const result: Record<string, T[]> = {}
    15	
    16	  for (const item of items) {
    17	    const key = String(getKey(item))
    18	
    19	    if (!result[key]) {
    20	      result[key] = []
    21	    }
    22	
    23	    result[key].push(item)
    24	  }
    25	
    26	  return result
    27	}
    28	
    29	const monthFormatter = new Intl.DateTimeFormat('en', {
    30	  month: 'long',
    31	  timeZone: 'UTC',
    32	})
    33	
    34	export default async function ArchivesPage() {
    35	  const posts = allCoreContent(sortPosts(allBlogs.filter((post) => !post.draft)))
    36	
    37	  return (
    38	    <>
    39	      <Breadcrumb />
    40	      <PageMain title="Archives" description="All the articles I've archived.">
    41	        {Object.entries(groupBy(posts, (post) => new Date(post.date).getUTCFullYear()))
    42	          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    43	          .map(([year, yearGroup]) => (
    44	            <div key={year}>
    45	              <span className="text-2xl font-bold">{year}</span>
    46	              <sup className="text-sm text-[var(--muted-foreground)]">{yearGroup.length}</sup>
    47	
    48	              {Object.entries(groupBy(yearGroup, (post) => new Date(post.date).getUTCMonth() + 1))
    49	                .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
    50	                .map(([month, monthGroup]) => (
    51	                  <div key={`${year}-${month}`} className="flex flex-col sm:flex-row">
    52	                    <div className="mt-6 min-w-36 text-lg sm:my-6">
    53	                      <span className="font-bold">
    54	                        {monthFormatter.format(new Date(Date.UTC(2000, Number(month) - 1, 1)))}
    55	                      </span>
    56	                      <sup className="text-xs text-[var(--muted-foreground)]">
    57	                        {monthGroup.length}
    58	                      </sup>
    59	                    </div>
    60	
    61	                    <ul>
    62	                      {monthGroup
    63	                        .sort(
    64	                          (a, b) =>
    65	                            Math.floor(new Date(b.date).getTime() / 1000) -
    66	                            Math.floor(new Date(a.date).getTime() / 1000)
    67	                        )
    68	                        .map((post) => (
    69	                          <PostCard key={post.path ?? post.slug ?? post.title} post={post} />
    70	                        ))}
    71	                    </ul>
    72	                  </div>
    73	                ))}
    74	            </div>
    75	          ))}
    76	      </PageMain>
    77	    </>
    78	  )
    79	}

### FILE: app/projects/page.tsx
     1	import Breadcrumb from '@/components/Breadcrumb'
     2	import Link from '@/components/Link'
     3	import projectsData from '@/data/projectsData'
     4	import { genPageMetadata } from 'app/seo'
     5	
     6	export const metadata = genPageMetadata({
     7	  title: 'Projects',
     8	  description: 'Things I have built or worked on.',
     9	})
    10	
    11	export default function Projects() {
    12	  return (
    13	    <>
    14	      <Breadcrumb />
    15	
    16	      <main id="main-content" className="app-layout pb-4">
    17	        <h1 className="text-2xl font-semibold sm:text-3xl">Projects</h1>
    18	        <p className="mt-2 mb-6 italic">Things I have built or worked on.</p>
    19	
    20	        {projectsData.length > 0 ? (
    21	          <ul>
    22	            {projectsData.map((project) => {
    23	              const href = project.href
    24	
    25	              return (
    26	                <li key={project.title} className="my-6">
    27	                  {href ? (
    28	                    <Link
    29	                      href={href}
    30	                      className="inline-block text-lg font-medium text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0"
    31	                    >
    32	                      <h2>{project.title}</h2>
    33	                    </Link>
    34	                  ) : (
    35	                    <h2 className="inline-block text-lg font-medium text-[var(--accent)]">
    36	                      {project.title}
    37	                    </h2>
    38	                  )}
    39	
    40	                  {project.description && <p>{project.description}</p>}
    41	                </li>
    42	              )
    43	            })}
    44	          </ul>
    45	        ) : (
    46	          <p>No projects found.</p>
    47	        )}
    48	      </main>
    49	    </>
    50	  )
    51	}

### FILE: components/PostCard.tsx
     1	import type { ElementType } from 'react'
     2	import Datetime from './Datetime'
     3	import Link from './Link'
     4	import PostTitleTransition from './PostTitleTransition'
     5	
     6	type PostCardData = {
     7	  date: string
     8	  lastmod?: string | null
     9	  path?: string
    10	  slug?: string
    11	  summary?: string
    12	  title: string
    13	}
    14	
    15	function transitionName(title: string) {
    16	  return title.replaceAll('.', '-')
    17	}
    18	
    19	type PostCardProps = {
    20	  post: PostCardData
    21	  heading?: 'h2' | 'h3'
    22	}
    23	
    24	export default function PostCard({ post, heading = 'h2' }: PostCardProps) {
    25	  const { date, lastmod, path, slug, summary, title } = post
    26	  const href = path ? `/${path}` : `/blog/${slug}`
    27	  const Heading = heading as ElementType
    28	
    29	  return (
    30	    <li className="my-6">
    31	      <Link
    32	        href={href}
    33	        className="inline-block text-lg font-medium text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0"
    34	      >
    35	        <PostTitleTransition title={transitionName(title)}>
    36	          <Heading>{title}</Heading>
    37	        </PostTitleTransition>
    38	      </Link>
    39	      <Datetime date={date} lastmod={lastmod} />
    40	      {summary && <p>{summary}</p>}
    41	    </li>
    42	  )
    43	}

### FILE: components/Card.tsx
     1	import Image from './Image'
     2	import Link from './Link'
     3	
     4	interface CardProps {
     5	  title: string
     6	  description: string
     7	  imgSrc?: string
     8	  href?: string
     9	}
    10	
    11	export default function Card({ title, description, imgSrc, href }: CardProps) {
    12	  const content = (
    13	    <article className="group my-6">
    14	      {imgSrc && (
    15	        <div className="mb-4 overflow-hidden border border-[var(--border)]">
    16	          <Image
    17	            alt={title}
    18	            src={imgSrc}
    19	            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
    20	            width={544}
    21	            height={306}
    22	          />
    23	        </div>
    24	      )}
    25	
    26	      <h2 className="inline-block text-lg font-medium text-[var(--accent)] underline-offset-4 group-hover:underline group-hover:decoration-dashed">
    27	        {title}
    28	      </h2>
    29	
    30	      <p className="mt-2 text-[var(--foreground)]">{description}</p>
    31	    </article>
    32	  )
    33	
    34	  if (href) {
    35	    return (
    36	      <Link href={href} aria-label={`Open ${title}`} className="block">
    37	        {content}
    38	      </Link>
    39	    )
    40	  }
    41	
    42	  return content
    43	}

### FILE: components/PageTitle.tsx
     1	import type { ReactNode } from 'react'
     2	import PostTitleTransition from './PostTitleTransition'
     3	
     4	interface Props {
     5	  children: ReactNode
     6	  viewTransitionTitle?: string
     7	  asChild?: boolean
     8	}
     9	
    10	export default function PageTitle({ children, viewTransitionTitle, asChild = false }: Props) {
    11	  const title = viewTransitionTitle ?? (typeof children === 'string' ? children : undefined)
    12	
    13	  if (asChild) {
    14	    return (
    15	      <PostTitleTransition title={title}>
    16	        <span className="inline-block">{children}</span>
    17	      </PostTitleTransition>
    18	    )
    19	  }
    20	
    21	  return (
    22	    <PostTitleTransition title={title}>
    23	      <h1 className="inline-block text-2xl font-bold text-[var(--accent)] sm:text-3xl">
    24	        {children}
    25	      </h1>
    26	    </PostTitleTransition>
    27	  )
    28	}

### FILE: components/PageMain.tsx
     1	import type { ReactNode } from 'react'
     2	import RememberBackUrl from './RememberBackUrl'
     3	
     4	type PageMainProps = {
     5	  title: string | [string, string]
     6	  description?: string
     7	  children: ReactNode
     8	  className?: string
     9	}
    10	
    11	export default function PageMain({ title, description, children, className = '' }: PageMainProps) {
    12	  return (
    13	    <>
    14	      <RememberBackUrl />
    15	      <main id="main-content" className={['app-layout pb-4', className].filter(Boolean).join(' ')}>
    16	        <h1 className="text-2xl font-semibold sm:text-3xl">
    17	          {Array.isArray(title) ? (
    18	            <>
    19	              {title[0]} <span className="text-[var(--accent)]">{title[1]}</span>
    20	            </>
    21	          ) : (
    22	            title
    23	          )}
    24	        </h1>
    25	        {description && <p className="mt-2 mb-6 italic">{description}</p>}
    26	        {children}
    27	      </main>
    28	    </>
    29	  )
    30	}

### FILE: components/SectionContainer.tsx
     1	import { ReactNode } from 'react'
     2	
     3	interface Props {
     4	  children: ReactNode
     5	}
     6	
     7	export default function SectionContainer({ children }: Props) {
     8	  return <section className="app-layout">{children}</section>
     9	}

### FILE: css/tailwind.css
     1	@import 'tailwindcss';
     2	@plugin '@tailwindcss/forms';
     3	@plugin '@tailwindcss/typography';
     4	@source '../node_modules/pliny';
     5	@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
     6	
     7	/* Core theme configuration */
     8	@theme {
     9	  /* Font families */
    10	  --font-sans:
    11	    var(--font-google-sans-code), 'Google Sans Code', ui-monospace, SFMono-Regular, Menlo, Monaco,
    12	    Consolas, 'Liberation Mono', 'Courier New', monospace;
    13	
    14	  /* Colors */
    15	  /* Copied from https://tailwindcss.com/docs/theme#default-theme-variable-reference */
    16	  --color-primary-50: oklch(0.971 0.014 343.198);
    17	  --color-primary-100: oklch(0.948 0.028 342.258);
    18	  --color-primary-200: oklch(0.899 0.061 343.231);
    19	  --color-primary-300: oklch(0.823 0.12 346.018);
    20	  --color-primary-400: oklch(0.718 0.202 349.761);
    21	  --color-primary-500: oklch(0.656 0.241 354.308);
    22	  --color-primary-600: oklch(0.592 0.249 0.584);
    23	  --color-primary-700: oklch(0.525 0.223 3.958);
    24	  --color-primary-800: oklch(0.459 0.187 3.815);
    25	  --color-primary-900: oklch(0.408 0.153 2.432);
    26	  --color-primary-950: oklch(0.284 0.109 3.907);
    27	
    28	  --color-gray-50: oklch(0.985 0.002 247.839);
    29	  --color-gray-100: oklch(0.967 0.003 264.542);
    30	  --color-gray-200: oklch(0.928 0.006 264.531);
    31	  --color-gray-300: oklch(0.872 0.01 258.338);
    32	  --color-gray-400: oklch(0.707 0.022 261.325);
    33	  --color-gray-500: oklch(0.551 0.027 264.364);
    34	  --color-gray-600: oklch(0.446 0.03 256.802);
    35	  --color-gray-700: oklch(0.373 0.034 259.733);
    36	  --color-gray-800: oklch(0.278 0.033 256.848);
    37	  --color-gray-900: oklch(0.21 0.034 264.665);
    38	  --color-gray-950: oklch(0.13 0.028 261.692);
    39	
    40	  /* Line heights */
    41	  --line-height-11: 2.75rem;
    42	  --line-height-12: 3rem;
    43	  --line-height-13: 3.25rem;
    44	  --line-height-14: 3.5rem;
    45	
    46	  /* Z-index values */
    47	  --z-60: 60;
    48	  --z-70: 70;
    49	  --z-80: 80;
    50	}
    51	
    52	/*
    53	  The default border color has changed to `currentColor` in Tailwind CSS v4,
    54	  so we've added these compatibility styles to make sure everything still
    55	  looks the same as it did with Tailwind CSS v3.
    56	
    57	  If we ever want to remove these styles, we need to add an explicit border
    58	  color utility to any element that depends on these defaults.
    59	*/
    60	@layer base {
    61	  *,
    62	  ::after,
    63	  ::before,
    64	  ::backdrop,
    65	  ::file-selector-button {
    66	    border-color: var(--color-gray-200, currentColor);
    67	  }
    68	
    69	  a,
    70	  button {
    71	    outline-color: var(--color-primary-500);
    72	  }
    73	
    74	  a:focus-visible,
    75	  button:focus-visible {
    76	    outline: 2px solid;
    77	    border-radius: var(--radius-sm);
    78	    outline-color: var(--color-primary-500);
    79	  }
    80	}
    81	
    82	@layer utilities {
    83	  .prose {
    84	    & a {
    85	      color: var(--color-primary-500);
    86	      &:hover {
    87	        color: var(--color-primary-600);
    88	      }
    89	      & code {
    90	        color: var(--color-primary-400);
    91	      }
    92	    }
    93	    & :where(h1, h2) {
    94	      font-weight: 700;
    95	      letter-spacing: var(--tracking-tight);
    96	    }
    97	    & h3 {
    98	      font-weight: 600;
    99	    }
   100	    & :where(code):not(pre code) {
   101	      color: var(--color-indigo-500);
   102	    }
   103	  }
   104	
   105	  .prose-invert {
   106	    & a {
   107	      color: var(--color-primary-500);
   108	      &:hover {
   109	        color: var(--color-primary-400);
   110	      }
   111	      & code {
   112	        color: var(--color-primary-400);
   113	      }
   114	    }
   115	    & :where(h1, h2, h3, h4, h5, h6) {
   116	      color: var(--color-gray-100);
   117	    }
   118	  }
   119	}
   120	
   121	.task-list-item::before {
   122	  @apply hidden;
   123	}
   124	
   125	.task-list-item {
   126	  @apply list-none;
   127	}
   128	
   129	.footnotes {
   130	  @apply mt-12 border-t border-gray-200 pt-8 dark:border-gray-700;
   131	}
   132	
   133	.data-footnote-backref {
   134	  @apply no-underline;
   135	}
   136	
   137	.csl-entry {
   138	  @apply my-5;
   139	}
   140	
   141	.no-scrollbar::-webkit-scrollbar {
   142	  display: none;
   143	}
   144	
   145	.no-scrollbar {
   146	  -ms-overflow-style: none; /* IE and Edge */
   147	  scrollbar-width: none; /* Firefox */
   148	}
   149	
   150	/* https://stackoverflow.com/questions/61083813/how-to-avoid-internal-autofill-selected-style-to-be-applied */
   151	input:-webkit-autofill,
   152	input:-webkit-autofill:focus {
   153	  transition:
   154	    background-color 600000s 0s,
   155	    color 600000s 0s;
   156	}
   157	
   158	.katex-display {
   159	  overflow: auto hidden;
   160	}
   161	
   162	.content-header-link {
   163	  opacity: 0;
   164	  margin-left: -24px;
   165	  padding-right: 4px;
   166	}
   167	
   168	.content-header:hover .content-header-link,
   169	.content-header-link:hover {
   170	  opacity: 1;
   171	}
   172	
   173	.linkicon {
   174	  display: inline-block;
   175	  vertical-align: middle;
   176	}
   177	
   178	/* NextPaper View Transition lock */
   179	html[data-view-transition='running'] a {
   180	  pointer-events: none;
   181	}
   182	
   183	/* NextPaper AstroPaper shared element transitions */
   184	@supports (view-transition-name: root) {
   185	  ::view-transition-group(*),
   186	  ::view-transition-old(*),
   187	  ::view-transition-new(*) {
   188	    animation-duration: 220ms;
   189	    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
   190	  }
   191	}
   192	
   193	/* NextPaper AstroPaper canonical CSS baseline */
   194	@theme inline {
   195	  --color-background: var(--background);
   196	  --color-foreground: var(--foreground);
   197	  --color-accent: var(--accent);
   198	  --color-accent-foreground: var(--accent-foreground);
   199	  --color-muted: var(--muted);
   200	  --color-muted-foreground: var(--muted-foreground);
   201	  --color-border: var(--border);
   202	  --font-app: var(--font-google-sans-code);
   203	  --font-sans:
   204	    var(--font-google-sans-code), 'Google Sans Code', ui-monospace, SFMono-Regular, Menlo, Monaco,
   205	    Consolas, 'Liberation Mono', 'Courier New', monospace;
   206	}
   207	
   208	@layer base {
   209	  :root,
   210	  [data-theme='light'] {
   211	    --background: #fefae0;
   212	    --foreground: #282728;
   213	    --foreground-strong: #15130e;
   214	    --accent: #d7591b;
   215	    --accent-foreground: #fefae0;
   216	    --muted: #eeeae1;
   217	    --muted-foreground: #71695d;
   218	    --border: #e4ded2;
   219	    --border-strong: #8f806a;
   220	    --ring: #d7591b;
   221	    --logo-primary: #f0641e;
   222	    --logo-secondary: #fefae0;
   223	  }
   224	  [data-theme='dark'] {
   225	    --background: #15130e;
   226	    --foreground: #f4efe5;
   227	    --foreground-strong: #fefae0;
   228	    --accent: #ff6b01;
   229	    --accent-foreground: #15130e;
   230	    --muted: #201d16;
   231	    --muted-foreground: #c8c0ae;
   232	    --border: #3b3426;
   233	    --border-strong: #85765d;
   234	    --ring: #ff6b01;
   235	    --logo-primary: #d7591b;
   236	    --logo-secondary: #f4efe5;
   237	  }
   238	
   239	  *,
   240	  ::after,
   241	  ::before,
   242	  ::backdrop,
   243	  ::file-selector-button {
   244	    border-color: var(--border);
   245	    outline-color: color-mix(in srgb, var(--accent) 75%, transparent);
   246	    scrollbar-width: auto;
   247	    scrollbar-color: var(--muted) transparent;
   248	  }
   249	
   250	  html,
   251	  body {
   252	    min-height: 100%;
   253	    background: var(--background) !important;
   254	  }
   255	
   256	  body {
   257	    min-height: 100svh;
   258	    display: flex;
   259	    flex-direction: column;
   260	    overflow-x: hidden;
   261	    color: var(--foreground);
   262	    font-family:
   263	      var(--font-google-sans-code), 'Google Sans Code', ui-monospace, SFMono-Regular, Menlo, Monaco,
   264	      Consolas, 'Liberation Mono', 'Courier New', monospace;
   265	    font-size: 1rem;
   266	    line-height: 1.5;
   267	  }
   268	
   269	  main {
   270	    background: var(--background);
   271	  }
   272	
   273	  a,
   274	  button {
   275	    outline-color: var(--accent);
   276	    outline-offset: 1px;
   277	  }
   278	
   279	  a:focus-visible,
   280	  button:focus-visible {
   281	    outline: 2px dashed var(--accent);
   282	    text-decoration-line: none;
   283	  }
   284	
   285	  button:not(:disabled),
   286	  [role='button']:not(:disabled) {
   287	    cursor: pointer;
   288	  }
   289	
   290	  svg {
   291	    flex-shrink: 0;
   292	  }
   293	
   294	  ::selection {
   295	    background: color-mix(in srgb, var(--accent) 75%, transparent);
   296	    color: var(--accent-foreground);
   297	  }
   298	
   299	  :target {
   300	    scroll-margin-block: 1rem;
   301	  }
   302	}
   303	
   304	@layer utilities {
   305	  .max-w-app {
   306	    max-width: 48rem;
   307	  }
   308	
   309	  .app-layout {
   310	    width: 100%;
   311	    max-width: 48rem;
   312	    margin-inline: auto;
   313	    padding-inline: 1rem;
   314	  }
   315	
   316	  .active-nav {
   317	    text-decoration-line: underline;
   318	    text-decoration-style: wavy;
   319	    text-decoration-thickness: 2px;
   320	    text-underline-offset: 8px;
   321	  }
   322	
   323	  .focus-outline {
   324	    outline: 2px solid transparent;
   325	    outline-offset: 1px;
   326	  }
   327	
   328	  .focus-outline:focus-visible {
   329	    outline: 2px dashed var(--accent);
   330	  }
   331	
   332	  @media (max-width: 639px) {
   333	    #menu-items a,
   334	    #menu-items button {
   335	      -webkit-tap-highlight-color: transparent;
   336	    }
   337	  }
   338	
   339	  @media (prefers-reduced-motion: reduce) {
   340	    *,
   341	    ::before,
   342	    ::after {
   343	      animation-duration: 0.01ms !important;
   344	      animation-iteration-count: 1 !important;
   345	      scroll-behavior: auto !important;
   346	      transition-duration: 0.01ms !important;
   347	    }
   348	  }
   349	}
   350	
   351	/* NextPaper AstroPaper canonical typography */
   352	.post-content,
   353	.app-prose {
   354	  color: var(--foreground);
   355	  line-height: 1.75;
   356	}
   357	
   358	.post-content :where(h1, h2, h3, h4, th),
   359	.app-prose :where(h1, h2, h3, h4, th) {
   360	  margin-bottom: 0.75rem;

## Current build check
 ⚠ Specified "headers" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
   ▲ Next.js 15.5.12

   Creating an optimized production build ...
(node:100140) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node-22 --trace-deprecation ...` to show where the warning was created)
successCallback /home/hitsuji/Projects/personal/hitsuji.page/.contentlayer
Local search index generated...
Generated 37 documents in .contentlayer
 ⨯ Failed to find font override values for font `Google Sans Code`
 ⨯ Failed to find font override values for font `Google Sans Code`
 ✓ Compiled successfully in 11.4s
   Linting and checking validity of types ...
 ⚠ TypeScript project references are not fully supported. Attempting to build in incremental mode.
   Collecting page data ...
   Generating static pages (0/50) ...
   Generating static pages (12/50) 
   Generating static pages (24/50) 
   Generating static pages (37/50) 
 ✓ Generating static pages (50/50)
   Finalizing page optimization ...
   Collecting build traces ...
 ⚠ rewrites, redirects, and headers are not applied when exporting your application, detected (headers). See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
   Exporting (0/2) ...
 ✓ Exporting (2/2)

Route (app)                                    Size  First Load JS
┌ ○ /                                       4.24 kB         111 kB
├ ○ /_not-found                               132 B         103 kB
├ ○ /about                                  2.04 kB         115 kB
├ ƒ /api/newsletter                           132 B         103 kB
├ ○ /archives                                2.1 kB         109 kB
├ ○ /blog                                   2.34 kB         112 kB
├ ● /blog/[...slug]                         10.9 kB         126 kB
├   └ /blog/getting-ready-to-get-ready
├ ● /blog/page/[page]                       2.34 kB         112 kB
├   └ /blog/page/1
├ ○ /learning-log                           2.02 kB         109 kB
├ ● /learning-log/[...slug]                    4 kB         117 kB
├   └ /learning-log/2026-06-03-learncpp-2x
├ ○ /notes                                    130 B         119 kB
├ ● /notes/[...slug]                          130 B         119 kB
├   ├ /notes/cpp-fundamentals
├   ├ /notes/cpp-fundamentals/compiler
├   ├ /notes/cpp-fundamentals/functions
├   └ [+23 more paths]
├ ○ /projects                               2.02 kB         109 kB
├ ○ /robots.txt                               132 B         103 kB
├ ○ /search                                 3.12 kB         113 kB
├ ○ /sitemap.xml                              132 B         103 kB
├ ○ /tags                                   4.87 kB         114 kB
├ ● /tags/[tag]                             2.34 kB         112 kB
├   ├ /tags/learning
├   ├ /tags/cpp
├   └ /tags/mistake
└ ● /tags/[tag]/page/[page]                 2.34 kB         112 kB
    ├ /tags/learning/page/1
    ├ /tags/cpp/page/1
    └ /tags/mistake/page/1
+ First Load JS shared by all                103 kB
  ├ chunks/255-ef32d9df8c19a027.js          46.2 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js     54.4 kB
  └ other shared chunks (total)             2.03 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

RSS feed generated...

## Exported learning log text

### out/learning-log/index.html
Learning Log | Hitsuji ((a,b,c,d,e,f,g,h)=>{let i=document.documentElement,j=["light","dark"];function k(b){var c;(Array.isArray(a)?a:[a]).forEach(a=>{let c="class"===a,d=c&&f?e.map(a=>f[a]||a):e;c?(i.classList.remove(...d),i.classList.add(f&&f[b]?f[b]:b)):i.setAttribute(a,b)}),c=b,h&&j.includes(c)&&(i.style.colorScheme=c)}if(d)k(d);else try{let a=localStorage.getItem(b)||c,d=g&&"system"===a?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":a;k(d)}catch(a){}})("data-theme","theme","system",null,["light","dark"],null,true,true) Skip to content Posts Notes Log Tags About Projects Archives Search Home » Learning Log Learning journal Learning Log Short notes from study sessions: what I learned, what got stuck, and which notes changed. Jun 03, 2026 5h · cpp / learncpp LearnCpp 2.x exercises I worked through the end of chapter 2 exercises and updated the related notes. Updated notes: 2.x / Q1 2.x / Q2 2.x / Q3 github x Send an email Copyright © 2026 | All rights reserved. (self.__next_f=self.__next_f||[]).push([0]) self.__next_f.push([1,"1:\"$Sreact.fragment\"\n2:I[2738,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks/app/layout-bf71bf37f1e70c7e.js\"],\"ViewTransitions\"]\n3:I[6271,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks/app/layout-bf71bf37f1e70c7e.js\"],\"ThemeProviders\"]\n4:I[7599,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks/app/layout-bf71bf37f1e70c7e.js\"],\"KBarSearchProvider\"]\n5:I[6408,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks

### out/learning-log/2026-06-03-learncpp-2x/index.html
LearnCpp 2.x exercises | Hitsuji ((a,b,c,d,e,f,g,h)=>{let i=document.documentElement,j=["light","dark"];function k(b){var c;(Array.isArray(a)?a:[a]).forEach(a=>{let c="class"===a,d=c&&f?e.map(a=>f[a]||a):e;c?(i.classList.remove(...d),i.classList.add(f&&f[b]?f[b]:b)):i.setAttribute(a,b)}),c=b,h&&j.includes(c)&&(i.style.colorScheme=c)}if(d)k(d);else try{let a=localStorage.getItem(b)||c,d=g&&"system"===a?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":a;k(d)}catch(a){}})("data-theme","theme","system",null,["light","dark"],null,true,true) Skip to content Posts Notes Log Tags About Projects Archives Search Home » Learning Log » 2026.6 03 learncpp 2x Jun 03, 2026 · 5h LearnCpp 2.x exercises I worked through the end of chapter 2 exercises and updated the related notes. Learned I practiced the basics from the end of chapter 2 and connected a few scattered pieces around variables, initialization, and simple program flow. Difficult The hardest part was noticing the difference between actually understanding the solution and only recognizing the shape of a previous example. Next Repeat the mistakes from these exercises, then move to the next LearnCpp section. Updated notes 2.x / Q1 2.x / Q2 2.x / Q3 github x Send an email Copyright © 2026 | All rights reserved. (self.__next_f=self.__next_f||[]).push([0]) self.__next_f.push([1,"1:\"$Sreact.fragment\"\n2:I[2738,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks/app/layout-bf71bf37f1e70c7e.js\"],\"ViewTransitions\"]\n3:I[6271,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/775-5aca5fcee546b8fc.js\",\"177\",\"static/chunks/app/layout-bf71bf37f1e70c7e.js\"],\"ThemeProviders\"]\n4:I[7599,[\"738\",\"static/chunks/738-2a1b88bd1dfff501.js\",\"340\",\"static/chunks/340-8753bf2dc9d643f7.js\",\"775\",\"static/chunks/7

## Search index learning log entries
[
  {
    "title": "LearnCpp 2.x exercises",
    "date": "2026-06-03T00:00:00.000Z",
    "duration": "5h",
    "summary": "I worked through the end of chapter 2 exercises and updated the related notes.",
    "tags": [
      "cpp",
      "learncpp"
    ],
    "notes": [
      {
        "title": "2.x / Q1",
        "href": "/notes/learncpp-course/exercises/02-x/q1"
      },
      {
        "title": "2.x / Q2",
        "href": "/notes/learncpp-course/exercises/02-x/q2"
      },
      {
        "title": "2.x / Q3",
        "href": "/notes/learncpp-course/exercises/02-x/q3"
      }
    ],
    "body": {
      "raw": "\n## Learned\n\nI practiced the basics from the end of chapter 2 and connected a few scattered pieces around variables, initialization, and simple program flow.\n\n## Difficult\n\nThe hardest part was noticing the difference between actually understanding the solution and only recognizing the shape of a previous example.\n\n## Next\n\nRepeat the mistakes from these exercises, then move to the next LearnCpp section.\n",
      "code": "var Component=(()=>{var p=Object.create;var l=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var f=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty;var w=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports),g=(n,e)=>{for(var t in e)l(n,t,{get:e[t],enumerable:!0})},i=(n,e,t,s)=>{if(e&&typeof e==\"object\"||typeof e==\"function\")for(let r of m(e))!u.call(n,r)&&r!==t&&l(n,r,{get:()=>e[r],enumerable:!(s=x(e,r))||s.enumerable});return n};var v=(n,e,t)=>(t=n!=null?p(f(n)):{},i(e||!n||!n.__esModule?l(t,\"default\",{value:n,enumerable:!0}):t,n)),N=n=>i(l({},\"__esModule\",{value:!0}),n);var h=w((_,c)=>{c.exports=_jsx_runtime});var k={};g(k,{default:()=>o,frontmatter:()=>M});var a=v(h()),M={title:\"LearnCpp 2.x exercises\",date:\"2026-06-03\",duration:\"5h\",summary:\"I worked through the end of chapter 2 exercises and updated the related notes.\",tags:[\"cpp\",\"learncpp\"],notes:[{title:\"2.x / Q1\",href:\"/notes/learncpp-course/exercises/02-x/q1\"},{title:\"2.x / Q2\",href:\"/notes/learncpp-course/exercises/02-x/q2\"},{title:\"2.x / Q3\",href:\"/notes/learncpp-course/exercises/02-x/q3\"}]};function d(n){let e={a:\"a\",h2:\"h2\",p:\"p\",path:\"path\",span:\"span\",svg:\"svg\",...n.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(e.h2,{className:\"content-header\",id:\"learned\",children:[(0,a.jsx)(e.a,{\"aria-hidden\":\"true\",href:\"#learned\",tabIndex:\"-1\",children:(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(e.span,{className:\"content-header-link\",children:(0,a.jsxs)(e.svg,{className:\"h-5 linkicon w-5\",fill:\"currentColor\",viewBox:\"0 0 20 20\",xmlns:\"http://www.w3.org/2000/svg\",children:[(0,a.jsx)(e.path,{d:\"M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z\"}),(0,a.jsx)(e.path,{d:\"M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z\"})]})})})}),\"Learned\"]}),(0,a.jsx)(e.p,{children:\"I practiced the basics from the end of chapter 2 and connected a few scattered pieces around variables, initialization, and simple program flow.\"}),(0,a.jsxs)(e.h2,{className:\"content-header\",id:\"difficult\",children:[(0,a.jsx)(e.a,{\"aria-hidden\":\"true\",href:\"#difficult\",tabIndex:\"-1\",children:(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(e.span,{className:\"content-header-link\",children:(0,a.jsxs)(e.svg,{className:\"h-5 linkicon w-5\",fill:\"currentColor\",viewBox:\"0 0 20 20\",xmlns:\"http://www.w3.org/2000/svg\",children:[(0,a.jsx)(e.path,{d:\"M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z\"}),(0,a.jsx)(e.path,{d:\"M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z\"})]})})})}),\"Difficult\"]}),(0,a.jsx)(e.p,{children:\"The hardest part was noticing the difference between actually understanding the solution and only recognizing the shape of a previous example.\"}),(0,a.jsxs)(e.h2,{className:\"content-header\",id:\"next\",children:[(0,a.jsx)(e.a,{\"aria-hidden\":\"true\",href:\"#next\",tabIndex:\"-1\",children:(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(e.span,{className:\"content-header-link\",children:(0,a.jsxs)(e.svg,{className:\"h-5 linkicon w-5\",fill:\"currentColor\",viewBox:\"0 0 20 20\",xmlns:\"http://www.w3.org/2000/svg\",children:[(0,a.jsx)(e.path,{d:\"M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z\"}),(0,a.jsx)(e.path,{d:\"M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z\"})]})})})}),\"Next\"]}),(0,a.jsx)(e.p,{children:\"Repeat the mistakes from these exercises, then move to the next LearnCpp section.\"})]})}function o(n={}){let{wrapper:e}=n.components||{};return e?(0,a.jsx)(e,{...n,children:(0,a.jsx)(d,{...n})}):d(n)}return N(k);})();\n;return Component;"
    },
    "_id": "learning-log/2026-06-03-learncpp-2x.mdx",
    "_raw": {
      "sourceFilePath": "learning-log/2026-06-03-learncpp-2x.mdx",
      "sourceFileName": "2026-06-03-learncpp-2x.mdx",
      "sourceFileDir": "learning-log",
      "contentType": "mdx",
      "flattenedPath": "learning-log/2026-06-03-learncpp-2x"
    },
    "type": "LearningLog",
    "readingTime": {
      "text": "1 min read",
      "minutes": 0.315,
      "time": 18900,
      "words": 63
    },
    "slug": "2026-06-03-learncpp-2x",
    "path": "learning-log/2026-06-03-learncpp-2x",
    "filePath": "learning-log/2026-06-03-learncpp-2x.mdx",
    "toc": [
      {
        "value": "Learned",
        "url": "#learned",
        "depth": 2
      },
      {
        "value": "Difficult",
        "url": "#difficult",
        "depth": 2
      },
      {
        "value": "Next",
        "url": "#next",
        "depth": 2
      }
    ],
    "hasToc": false
  }
]
