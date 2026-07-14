export type SearchDocument = {
  body?: { raw?: string }
  date?: string
  draft?: boolean
  path: string
  summary?: string
  tags?: string[]
  title: string
}

export type TerminalCwd = 'ROOT' | 'ABOUT' | 'POSTS' | 'NOTES' | 'PROJECTS' | 'LOGS'
type ContentDirectory = Exclude<TerminalCwd, 'ROOT' | 'ABOUT'>

export type TerminalLineTone = 'normal' | 'muted' | 'success' | 'error' | 'link'

export type TerminalLine = {
  href?: string
  text: string
  tone: TerminalLineTone
}

export type TerminalAction =
  | { type: 'navigate'; href: string }
  | { type: 'launch-browser' }
  | { type: 'launch-explorer' }
  | { type: 'launch-find' }
  | { type: 'compile-frieren-source' }
  | { type: 'mark-frieren-compiled' }
  | { type: 'launch-frieren-exe' }
  | { type: 'close' }
  | { type: 'clear' }

export type TerminalOpenApp = {
  id: string
  mode?: string
  present?: boolean
  title?: string
}

export type TerminalCommandContext = {
  cwd: TerminalCwd
  documents: readonly SearchDocument[]
  frierenCompiled: boolean
  openApps: readonly TerminalOpenApp[]
}

export type TerminalCommandResult = {
  action?: TerminalAction
  cwd: TerminalCwd
  lines: TerminalLine[]
}

type DocumentEntry = {
  directory: ContentDirectory
  document: SearchDocument
  fileName: string
  href: string
  relativePath: string
}

const DIRECTORIES = ['ABOUT', 'POSTS', 'NOTES', 'PROJECTS', 'LOGS'] as const
const CONTENT_DIRECTORIES = ['POSTS', 'NOTES', 'PROJECTS', 'LOGS'] as const

const STATIC_TARGETS: Readonly<Record<string, string>> = {
  '.': '/',
  ABOUT: '/about',
  'ABOUT.TXT': '/about',
  ARCHIVES: '/archives',
  BLOG: '/blog',
  FEED: '/feed.xml',
  'FEED.XML': '/feed.xml',
  FIND: '/search',
  HOME: '/',
  'HITSUJI.PAGE': '/',
  INDEX: '/',
  'INDEX.HTM': '/',
  LOGS: '/#history',
  NOTES: '/notes',
  POSTS: '/blog',
  PROJECTS: '/projects',
  ROOT: '/',
  RSS: '/feed.xml',
  'RSS.XML': '/feed.xml',
  SEARCH: '/search',
}

const HELP_LINES = [
  'HELP                   Show this list.',
  'DIR [directory]        List files.',
  'CD [directory]         Change directory.',
  'TYPE <file>            Display a text file.',
  'START <file|directory> Open a file or folder.',
  'START HITSUJI.PAGE     Open the web browser.',
  'START EXPLORER         Open Site Explorer.',
  'START FIND             Open Find: All Files.',
  'FIND <text>            Search for text in files.',
  'BCC32 FRIEREN.CPP      Compile a C++ source file.',
  'FRIEREN.EXE            Run the compiled program.',
  'TASKS                  List open desktop applications.',
  'VER                    Display the system version.',
  'DATE                   Show the local date.',
  'TIME                   Show the local time.',
  'CLS                    Clear the prompt.',
  'EXIT                   Close the prompt.',
] as const

function line(text: string, tone: TerminalLineTone = 'normal', href?: string): TerminalLine {
  return href ? { href, text, tone } : { text, tone }
}

function result(
  cwd: TerminalCwd,
  lines: TerminalLine[],
  action?: TerminalAction
): TerminalCommandResult {
  return action ? { action, cwd, lines } : { cwd, lines }
}

function stripOuterQuotes(value: string) {
  const trimmed = value.trim()
  if (trimmed.length < 2) return trimmed

  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  return (first === '"' && last === '"') || (first === "'" && last === "'")
    ? trimmed.slice(1, -1).trim()
    : trimmed
}

function normalizeForMatch(value: string) {
  const normalized = stripOuterQuotes(value)
    .replaceAll('/', '\\')
    .replace(/\\+/g, '\\')
    .replace(/^\.\\/, '')
    .toUpperCase()

  return normalized.length > 1 ? normalized.replace(/\\$/, '') : normalized
}

function withoutKnownExtension(value: string) {
  return value.replace(/\.(?:CPP|EXE|HTM|HTML|LOG|MD|MDX|TXT|XML)$/i, '')
}

function safeSameSiteHref(path: string) {
  const trimmed = path.trim()
  if (
    !trimmed ||
    [...trimmed].some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    })
  ) {
    return null
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) return null

  const source = trimmed.startsWith('#') ? `/${trimmed}` : trimmed
  if (source.includes('\\')) return null

  try {
    const url = new URL(source.startsWith('/') ? source : `/${source}`, 'https://hitsuji.invalid')
    if (url.origin !== 'https://hitsuji.invalid') return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

function documentDirectory(path: string): ContentDirectory {
  if (path.startsWith('#log-')) return 'LOGS'

  const normalized = path.replace(/^\/+/, '').toLowerCase()

  if (normalized === 'notes' || normalized.startsWith('notes/')) return 'NOTES'
  if (normalized === 'projects' || normalized.startsWith('projects/')) return 'PROJECTS'
  return 'POSTS'
}

function documentRelativePath(document: SearchDocument, directory: ContentDirectory) {
  const rawPath = document.path.trim()

  if (rawPath.startsWith('#')) return `${rawPath.slice(1)}.LOG`.toUpperCase()

  const normalized = rawPath.replace(/^\/+|\/+$/g, '')
  const expectedPrefix =
    directory === 'POSTS' ? 'blog' : directory === 'NOTES' ? 'notes' : 'projects'
  const segments = normalized.split('/').filter(Boolean)

  if (segments[0]?.toLowerCase() === expectedPrefix) segments.shift()
  if (segments.length === 0) return 'INDEX.MD'

  const lastIndex = segments.length - 1
  if (!/\.[a-z\d]+$/i.test(segments[lastIndex])) segments[lastIndex] += '.MD'
  return segments.join('\\').toUpperCase()
}

function createDocumentEntries(documents: readonly SearchDocument[]) {
  return documents.flatMap<DocumentEntry>((document) => {
    if (document.draft === true || !document.title.trim() || !document.path.trim()) return []

    const href = safeSameSiteHref(document.path)
    if (!href) return []

    const directory = documentDirectory(document.path)
    const relativePath = documentRelativePath(document, directory)
    const fileName = relativePath.split('\\').at(-1) ?? relativePath

    return [{ directory, document, fileName, href, relativePath }]
  })
}

function cwdPath(cwd: TerminalCwd) {
  return cwd === 'ROOT' ? 'C:\\HITSUJI.PAGE' : `C:\\HITSUJI.PAGE\\${cwd}`
}

function parseDirectory(value: string, cwd: TerminalCwd): TerminalCwd | null {
  const normalized = normalizeForMatch(value)
  if (!normalized || normalized === '.') return cwd
  if (normalized === 'ROOT') return 'ROOT'
  if (normalized === '\\' || normalized === 'C:' || normalized === 'C:\\') return 'ROOT'

  let parts = normalized.split('\\').filter(Boolean)
  let absolute = normalized.startsWith('\\')

  if (/^[A-Z]:$/.test(parts[0] ?? '')) {
    if (parts[0] !== 'C:') return null
    absolute = true
    parts = parts.slice(1)
  }

  if (parts[0] === 'HITSUJI.PAGE') {
    absolute = true
    parts = parts.slice(1)
  }

  const resolved: string[] = absolute || cwd === 'ROOT' ? [] : [cwd]

  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      if (resolved.length === 0) return null
      resolved.pop()
      continue
    }
    resolved.push(part)
  }

  if (resolved.length === 0) return 'ROOT'
  if (resolved.length === 1 && DIRECTORIES.includes(resolved[0] as (typeof DIRECTORIES)[number])) {
    return resolved[0] as Exclude<TerminalCwd, 'ROOT'>
  }
  return null
}

function targetDirectory(value: string, cwd: TerminalCwd) {
  const normalized = normalizeForMatch(value)
  const parts = normalized.split('\\').filter(Boolean)
  const explicit = parts.some((part) =>
    CONTENT_DIRECTORIES.includes(part as (typeof CONTENT_DIRECTORIES)[number])
  )

  if (explicit) {
    const directory = parts.find((part) =>
      CONTENT_DIRECTORIES.includes(part as (typeof CONTENT_DIRECTORIES)[number])
    )
    return directory as ContentDirectory
  }

  return cwd === 'ROOT' || cwd === 'ABOUT' ? null : cwd
}

function documentAliases(entry: DocumentEntry) {
  const routePath = entry.document.path.replace(/^#/, 'LOGS\\').replaceAll('/', '\\')
  const pathWithoutPrefix = routePath.replace(/^(?:BLOG|NOTES|PROJECTS)\\/i, '')
  const relativeWithoutExtension = withoutKnownExtension(entry.relativePath)
  const fileWithoutExtension = withoutKnownExtension(entry.fileName)

  return [
    entry.document.title,
    entry.document.path,
    entry.href,
    routePath,
    pathWithoutPrefix,
    entry.relativePath,
    relativeWithoutExtension,
    entry.fileName,
    fileWithoutExtension,
    `${entry.directory}\\${entry.relativePath}`,
    `C:\\HITSUJI.PAGE\\${entry.directory}\\${entry.relativePath}`,
  ].map(normalizeForMatch)
}

function findDocument(
  rawTarget: string,
  cwd: TerminalCwd,
  entries: readonly DocumentEntry[]
): { entry?: DocumentEntry; ambiguous?: boolean } {
  const target = normalizeForMatch(rawTarget)
  if (!target) return {}

  const directory = targetDirectory(rawTarget, cwd)
  const candidates = directory ? entries.filter((entry) => entry.directory === directory) : entries
  const exact = candidates.filter((entry) => documentAliases(entry).includes(target))

  if (exact.length === 1) return { entry: exact[0] }
  if (exact.length > 1) return { ambiguous: true }

  const targetWithoutExtension = withoutKnownExtension(target)
  const extensionless = candidates.filter((entry) =>
    documentAliases(entry).some((alias) => withoutKnownExtension(alias) === targetWithoutExtension)
  )

  if (extensionless.length === 1) return { entry: extensionless[0] }
  if (extensionless.length > 1) return { ambiguous: true }
  return {}
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return null

  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function listDirectory(
  cwd: TerminalCwd,
  entries: readonly DocumentEntry[],
  frierenCompiled: boolean
) {
  const lines = [line(`Directory of ${cwdPath(cwd)}`), line('')]

  if (cwd === 'ROOT') {
    for (const directory of DIRECTORIES) lines.push(line(`<DIR>          ${directory}`, 'muted'))
    lines.push(line('               ABOUT.TXT', 'link', '/about'))
    lines.push(line('               WEBBROWSER.EXE'))
    lines.push(line('               EXPLORER.EXE'))
    lines.push(line('               FIND.EXE'))
    lines.push(line(''), line('5 dir(s), 4 file(s)', 'muted'))
    return lines
  }

  if (cwd === 'ABOUT') {
    lines.push(line('               FRIEREN.CPP'))
    if (frierenCompiled) lines.push(line('               FRIEREN.EXE'))
    lines.push(line(''), line(`${frierenCompiled ? 2 : 1} file(s)`, 'muted'))
    return lines
  }

  const documents = entries.filter((entry) => entry.directory === cwd)
  if (cwd === 'PROJECTS' && documents.length === 0) {
    lines.push(line('               INDEX.HTM', 'link', '/projects'))
    lines.push(line(''), line('1 file(s)', 'muted'))
    return lines
  }

  for (const entry of documents) {
    const date = formatDate(entry.document.date)
    const prefix = date ? `${date}  ` : ''
    lines.push(line(`${prefix}${entry.relativePath}`, 'link', entry.href))
  }

  lines.push(line(''), line(`${documents.length} file(s)`, 'muted'))
  return lines
}

function typeDocument(entry: DocumentEntry) {
  const lines = [line(entry.document.title)]
  const date = formatDate(entry.document.date)

  if (date) lines.push(line(date, 'muted'))
  if (entry.document.summary?.trim()) lines.push(line(entry.document.summary.trim()))
  lines.push(line(entry.href, 'link', entry.href))
  return lines
}

function startTarget(
  rawTarget: string,
  cwd: TerminalCwd,
  entries: readonly DocumentEntry[],
  frierenCompiled: boolean
): TerminalCommandResult {
  const target = normalizeForMatch(rawTarget)
  const virtualTarget = target.replace(/^C:\\HITSUJI\.PAGE\\/, '')
  const targetInAbout = cwd === 'ABOUT' || virtualTarget.startsWith('ABOUT\\')
  const aboutTarget = virtualTarget.replace(/^ABOUT\\/, '')
  if (!target) return result(cwd, [line('Usage: START <file|directory>', 'error')])

  if (
    virtualTarget === 'BROWSER' ||
    virtualTarget === 'HITSUJI.PAGE' ||
    virtualTarget === 'IEXPLORE' ||
    virtualTarget === 'IEXPLORE.EXE' ||
    virtualTarget === 'WEBBROWSER' ||
    virtualTarget === 'WEBBROWSER.EXE'
  ) {
    return result(cwd, [line('Starting hitsuji.page...', 'muted')], {
      type: 'launch-browser',
    })
  }

  if (targetInAbout && aboutTarget === 'FRIEREN.CPP') {
    return result(cwd, [], { type: 'compile-frieren-source' })
  }

  if (targetInAbout && (aboutTarget === 'FRIEREN' || aboutTarget === 'FRIEREN.EXE')) {
    if (!frierenCompiled) {
      return result(cwd, [line('The system cannot find the file specified.', 'error')])
    }

    return result(cwd, [line('Starting frieren.exe...', 'muted')], {
      type: 'launch-frieren-exe',
    })
  }

  if (
    virtualTarget === 'EXPLORER' ||
    virtualTarget === 'EXPLORER.EXE' ||
    virtualTarget === 'SITE EXPLORER'
  ) {
    return result(cwd, [line('Starting Site Explorer...', 'muted')], {
      type: 'launch-explorer',
    })
  }

  if (virtualTarget === 'FIND' || virtualTarget === 'FIND.EXE' || virtualTarget === 'FIND FILES') {
    return result(cwd, [line('Starting Find: All Files...', 'muted')], {
      type: 'launch-find',
    })
  }

  if (cwd === 'PROJECTS' && (virtualTarget === 'INDEX' || virtualTarget === 'INDEX.HTM')) {
    return result(cwd, [line('Opening Projects...', 'muted')], {
      type: 'navigate',
      href: '/projects',
    })
  }

  const directory = parseDirectory(rawTarget, cwd)
  if (directory) {
    const href = directory === 'ROOT' ? '/' : STATIC_TARGETS[directory]
    const label =
      directory === 'ROOT'
        ? 'hitsuji.page'
        : directory.charAt(0) + directory.slice(1).toLocaleLowerCase()
    return result(cwd, [line(`Opening ${label}...`, 'muted')], { type: 'navigate', href })
  }

  const documentMatch = findDocument(rawTarget, cwd, entries)
  if (documentMatch.ambiguous) return result(cwd, [line('File name is ambiguous.', 'error')])
  if (documentMatch.entry) {
    return result(cwd, [line(`Opening ${documentMatch.entry.fileName}...`, 'muted')], {
      type: 'navigate',
      href: documentMatch.entry.href,
    })
  }

  const staticHref = STATIC_TARGETS[virtualTarget]
  if (staticHref) {
    return result(cwd, [line(`Opening ${virtualTarget}...`, 'muted')], {
      type: 'navigate',
      href: staticHref,
    })
  }

  const href = safeSameSiteHref(stripOuterQuotes(rawTarget))
  const allowedHrefs = new Set([
    ...Object.values(STATIC_TARGETS),
    ...entries.map((entry) => entry.href),
  ])
  if (href && allowedHrefs.has(href)) {
    return result(cwd, [line(`Opening ${stripOuterQuotes(rawTarget)}...`, 'muted')], {
      type: 'navigate',
      href,
    })
  }

  return result(cwd, [line('The system cannot find the file specified.', 'error')])
}

function findFiles(
  rawQuery: string,
  cwd: TerminalCwd,
  entries: readonly DocumentEntry[]
): TerminalLine[] {
  const query = stripOuterQuotes(rawQuery.replace(/\s+\*\.\*\s*$/i, ''))
    .trim()
    .toLocaleLowerCase()
  if (!query) return [line('Usage: FIND <text>', 'error')]

  const candidates = cwd === 'ROOT' ? entries : entries.filter((entry) => entry.directory === cwd)
  const matches = candidates.filter((entry) => {
    const document = entry.document
    return [
      document.title,
      document.summary,
      document.path,
      document.body?.raw,
      ...(document.tags ?? []),
    ]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLocaleLowerCase().includes(query))
  })

  if (matches.length === 0) return [line('No files found.', 'muted')]

  return [
    ...matches.map((entry) =>
      line(`${entry.fileName}  ${entry.document.title}`, 'link', entry.href)
    ),
    line(`${matches.length} file(s) found`, 'muted'),
  ]
}

function taskList(openApps: readonly TerminalOpenApp[]) {
  const apps = openApps.filter(
    (app) => app.present !== false && app.mode?.toLowerCase() !== 'closed'
  )
  if (apps.length === 0) return [line('No applications are open.', 'muted')]

  return [
    line('IMAGE NAME          WINDOW TITLE                 STATE', 'muted'),
    ...apps.map((app) => {
      const id = app.id.replace(/[\r\n\t]+/g, ' ').slice(0, 18)
      const title = (app.title ?? '').replace(/[\r\n\t]+/g, ' ').slice(0, 28)
      const state = app.mode?.toLowerCase() === 'minimized' ? 'MINIMIZED' : 'RUNNING'
      return line(`${id.padEnd(20)}${title.padEnd(29)}${state}`.trimEnd())
    }),
  ]
}

function localDateLine(now: Date) {
  const year = now.getFullYear().toString().padStart(4, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return line(`Current date is ${year}-${month}-${day}`)
}

function localTimeLine(now: Date) {
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return line(`Current time is ${hours}:${minutes}:${seconds}`)
}

export function runTerminalCommand(
  input: string,
  { cwd, documents, frierenCompiled, openApps }: TerminalCommandContext
): TerminalCommandResult {
  const trimmed = input.trim()
  if (!trimmed) return result(cwd, [])

  const commandMatch = trimmed.match(/^(\S+)(?:\s+([\s\S]*))?$/)
  if (!commandMatch) return result(cwd, [])

  const command = commandMatch[1].toUpperCase()
  const argument = commandMatch[2]?.trim() ?? ''
  const entries = createDocumentEntries(documents)
  const directTarget = normalizeForMatch(command).replace(/^C:\\HITSUJI\.PAGE\\/, '')

  if (
    (cwd === 'ABOUT' && (directTarget === 'FRIEREN' || directTarget === 'FRIEREN.EXE')) ||
    directTarget === 'ABOUT\\FRIEREN.EXE'
  ) {
    return frierenCompiled
      ? result(cwd, [], { type: 'launch-frieren-exe' })
      : result(cwd, [line('Bad command or file name.', 'error')])
  }

  switch (command) {
    case 'HELP':
      return result(
        cwd,
        HELP_LINES.map((text) => line(text, 'muted'))
      )

    case 'DIR': {
      const directory = argument ? parseDirectory(argument, cwd) : cwd
      if (!directory) {
        return result(cwd, [line('The system cannot find the path specified.', 'error')])
      }
      return result(cwd, listDirectory(directory, entries, frierenCompiled))
    }

    case 'CD':
    case 'CHDIR': {
      if (!argument) return result(cwd, [line(cwdPath(cwd))])
      const directory = parseDirectory(argument, cwd)
      if (!directory) {
        return result(cwd, [line('The system cannot find the path specified.', 'error')])
      }
      return result(directory, [])
    }

    case 'TYPE': {
      if (!argument) return result(cwd, [line('Usage: TYPE <file>', 'error')])
      const target = normalizeForMatch(argument)

      if (
        target === 'ABOUT' ||
        target === 'ABOUT.TXT' ||
        target === 'C:\\HITSUJI.PAGE\\ABOUT.TXT'
      ) {
        return result(cwd, [
          line('ABOUT.TXT', 'muted'),
          line('I am Hitsuji. I am learning C++ and building this site along the way.'),
          line('/about', 'link', '/about'),
        ])
      }

      if (cwd === 'PROJECTS' && (target === 'INDEX' || target === 'INDEX.HTM')) {
        return result(cwd, [line('Projects', 'muted'), line('/projects', 'link', '/projects')])
      }

      const documentMatch = findDocument(argument, cwd, entries)
      if (documentMatch.ambiguous) return result(cwd, [line('File name is ambiguous.', 'error')])
      if (!documentMatch.entry) return result(cwd, [line('File not found.', 'error')])
      return result(cwd, typeDocument(documentMatch.entry))
    }

    case 'START':
      return startTarget(argument, cwd, entries, frierenCompiled)

    case 'FIND':
      return result(cwd, findFiles(argument, cwd, entries))

    case 'BCC32': {
      const target = normalizeForMatch(argument)
      if (!target) return result(cwd, [line('Usage: BCC32 FRIEREN.CPP', 'error')])
      if (
        !(
          (cwd === 'ABOUT' && target === 'FRIEREN.CPP') ||
          target === 'ABOUT\\FRIEREN.CPP' ||
          target === 'C:\\HITSUJI.PAGE\\ABOUT\\FRIEREN.CPP'
        )
      ) {
        return result(cwd, [line(`Fatal: Unable to open file '${argument}'`, 'error')])
      }

      return result(
        cwd,
        [
          line('Borland C++ 5.5 for Win32'),
          line('Compiling frieren.cpp:'),
          line('Linking frieren.exe:'),
          line('0 errors, 0 warnings', 'success'),
        ],
        { type: 'mark-frieren-compiled' }
      )
    }

    case 'TASKS':
      return result(cwd, taskList(openApps))

    case 'VER':
      return result(cwd, [line('Microsoft Windows 98 [Version 4.10.1998]')])

    case 'DATE':
      return result(cwd, [localDateLine(new Date())])

    case 'TIME':
      return result(cwd, [localTimeLine(new Date())])

    case 'CLS':
      return result(cwd, [], { type: 'clear' })

    case 'EXIT':
      return result(cwd, [], { type: 'close' })

    default:
      return result(cwd, [line('Bad command or file name.', 'error')])
  }
}
