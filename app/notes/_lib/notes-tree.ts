import fs from 'fs'
import path from 'path'

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

function encodeUrlPath(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/')
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

function readMarkdownTitle(filePath: string) {
  try {
    return titleFromMarkdown(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function cleanName(value: string) {
  return value
    .replace(/\.md$/i, '')
    .replace(/(\d+)-(\d+)/g, (_, left: string, right: string) => `${Number(left)}.${Number(right)}`)
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

  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
}

function buildFolder(dir: string, relativeDir: string): Extract<NotesTreeNode, { type: 'folder' }> {
  const children: NotesTreeNode[] = []

  for (const entry of listDir(dir)) {
    const entryPath = path.join(dir, entry.name)
    const relativePath = path.posix.join(relativeDir, entry.name)

    if (entry.isDirectory()) {
      children.push(buildFolder(entryPath, relativePath))
      continue
    }

    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.md')) continue
    if (entry.name.toLowerCase() === 'index.md') continue

    const notePath = relativePath.replace(/\.md$/i, '')

    children.push({
      type: 'note',
      name: noteName(entryPath),
      path: notePath,
      href: `/notes/${encodeUrlPath(notePath)}`,
    })
  }

  children.sort(sortEntries)

  return {
    type: 'folder',
    name: folderName(dir, path.basename(dir)),
    path: relativeDir,
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
  const normalizedTargetPath = targetPath.replace(/^\/+|\/+$/g, '')

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
