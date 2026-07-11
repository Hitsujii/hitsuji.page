import fs from 'fs'
import path from 'path'
import { getNoteHref, normalizeNotePath } from './notes-path'

export type NotesTreeNode =
  | {
      type: 'folder'
      name: string
      path: string
      children: NotesTreeNode[]
    }
  | {
      type: 'note'
      name: string
      path: string
      href: string
    }

const notesRoot = path.join(process.cwd(), 'data', 'notes')
const ignoredNames = new Set(['.obsidian', '.trash', '.DS_Store'])

function shouldIgnore(name: string) {
  return ignoredNames.has(name) || name.startsWith('.')
}

function stripYamlQuotes(value: string) {
  return value.trim().replace(/^['"]/, '').replace(/['"]$/, '').trim()
}

function titleFromMarkdown(raw: string) {
  const frontmatter = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  const titleLine = frontmatter?.[1].match(/^title:\s*(.+?)\s*$/m)?.[1]
  const titleFromFrontmatter = titleLine ? stripYamlQuotes(titleLine) : null
  const titleFromH1 = raw.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim()

  return titleFromFrontmatter || titleFromH1 || null
}

function isDraftMarkdown(raw: string) {
  const frontmatter = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  return /^draft:\s*true\s*$/im.test(frontmatter?.[1] ?? '')
}

function readMarkdown(filePath: string) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return undefined
  }
}

function readMarkdownTitle(filePath: string) {
  const raw = readMarkdown(filePath)
  return raw && !isDraftMarkdown(raw) ? titleFromMarkdown(raw) : null
}

function isPublicMarkdown(filePath: string) {
  const raw = readMarkdown(filePath)
  return Boolean(raw && !isDraftMarkdown(raw))
}

function cleanName(value: string) {
  return value
    .replace(/\.mdx?$/i, '')
    .replace(/(\d+)-(\d+|x)/gi, (_, left: string, right: string) => {
      const section = right.toLowerCase()
      return `${Number(left)}.${section === 'x' ? 'x' : Number(section)}`
    })
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function folderName(dir: string, fallback: string) {
  return readMarkdownTitle(path.join(dir, 'index.md')) || cleanName(fallback)
}

function noteName(filePath: string) {
  return readMarkdownTitle(filePath) || cleanName(path.basename(filePath))
}

function listDir(dir: string) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => !shouldIgnore(entry.name))
  } catch {
    return []
  }
}

function sortEntries(a: NotesTreeNode, b: NotesTreeNode) {
  const order = { folder: 0, note: 1 }
  const byType = order[a.type] - order[b.type]

  if (byType !== 0) return byType

  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function buildFolder(dir: string, relativeDir: string): Extract<NotesTreeNode, { type: 'folder' }> {
  const folderPath = normalizeNotePath(relativeDir)
  const children: NotesTreeNode[] = []

  for (const entry of listDir(dir)) {
    const entryPath = path.join(dir, entry.name)
    const relativePath = normalizeNotePath(path.posix.join(folderPath, entry.name))

    if (entry.isDirectory()) {
      const folder = buildFolder(entryPath, relativePath)
      const indexPath = path.join(entryPath, 'index.md')

      if (folder.children.length > 0 || isPublicMarkdown(indexPath)) {
        children.push(folder)
      }

      continue
    }

    if (!entry.isFile()) continue
    if (!entry.name.match(/\.mdx?$/i)) continue
    if (entry.name.toLowerCase() === 'index.md') continue
    if (entry.name.toLowerCase() === 'index.mdx') continue
    if (!isPublicMarkdown(entryPath)) continue

    const notePath = normalizeNotePath(relativePath)

    children.push({
      type: 'note',
      name: noteName(entryPath),
      path: notePath,
      href: getNoteHref(notePath),
    })
  }

  children.sort(sortEntries)

  return {
    type: 'folder',
    name: folderName(dir, path.basename(dir)),
    path: folderPath,
    children,
  }
}

export function getNotesTree(): NotesTreeNode[] {
  if (!fs.existsSync(notesRoot)) return []

  return buildFolder(notesRoot, '').children
}

export function findTreeNodeByPath(
  nodes: NotesTreeNode[],
  targetPath: string
): NotesTreeNode | null {
  const normalizedTargetPath = normalizeNotePath(targetPath)

  for (const node of nodes) {
    if (node.path === normalizedTargetPath) {
      return node
    }

    if (node.type === 'folder') {
      const found = findTreeNodeByPath(node.children, normalizedTargetPath)

      if (found) return found
    }
  }

  return null
}

export function getNotesBreadcrumbLabels(tree = getNotesTree()) {
  const labels: Record<string, string> = {
    '/notes': 'Notes',
  }

  function walk(nodes: NotesTreeNode[]) {
    for (const node of nodes) {
      labels[getNoteHref(node.path)] = node.name

      if (node.type === 'folder') {
        walk(node.children)
      }
    }
  }

  walk(tree)

  return labels
}
