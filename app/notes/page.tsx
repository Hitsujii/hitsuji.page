import 'css/prism.css'
import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { allNotes, type Note } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import NotesShell from '@/components/notes/NotesShell'
import PostEnhancements from '@/components/PostEnhancements'
import { getNotesTree, type NotesTreeNode } from './_lib/notes-tree'

export function generateMetadata(): Metadata {
  const note = getRootNote()

  return genPageMetadata({
    robots: { index: false, follow: true },
    title: note ? getNoteTitle(note) : 'Notes',
    description: note?.summary || 'My C++ learning vault.',
  })
}

function normalizeNotePath(value: string) {
  return decodeURI(value)
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .replace(/^data\//i, '')
    .replace(/^(notes\/)+/i, '')
    .replace(/\/index$/i, '')
    .replace(/\/$/, '')
}

function getPublicNotes() {
  return Array.isArray(allNotes) ? allNotes.filter((note) => !note.draft) : []
}

function getRootNote() {
  return getPublicNotes().find((note) => {
    const candidates = [note.slug, note.path, note.filePath]
      .filter(Boolean)
      .map((value) => normalizeNotePath(String(value)))

    return candidates.includes('') || candidates.includes('notes')
  })
}

function getNoteTitle(note: Pick<Note, 'title' | 'slug'>) {
  return note.title || note.slug.split('/').pop()?.replace(/-/g, ' ') || 'Notes'
}

function getTreeNodeHref(node: NotesTreeNode) {
  if (node.type === 'folder') {
    return node.path ? `/notes/${node.path}` : '/notes'
  }

  return node.href
}

function NotesFallbackList({ tree }: { tree: NotesTreeNode[] }) {
  if (tree.length === 0) {
    return (
      <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/40 p-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          No notes were found. Add markdown files to the vault, then run yarn notes:sync to populate
          this page.
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Root <code>index.md</code> was not found, so this page is showing the top-level notes and
        folders instead.
      </p>

      <ul className="mt-6 space-y-2">
        {tree.map((child) => (
          <li key={`${child.type}:${child.path}`}>
            <Link
              href={getTreeNodeHref(child)}
              className="text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed"
            >
              {child.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function NotesIndexPage() {
  const tree = getNotesTree()
  const note = getRootNote()

  if (!note) {
    return (
      <NotesShell tree={tree}>
        <NotesFallbackList tree={tree} />
      </NotesShell>
    )
  }

  const startsWithH1 = note.body.raw.trimStart().startsWith('# ')

  return (
    <NotesShell tree={tree}>
      {!startsWithH1 && (
        <h1 className="mb-6 text-3xl font-bold text-[var(--accent)]">{getNoteTitle(note)}</h1>
      )}

      <MDXLayoutRenderer code={note.body.code} components={components} toc={note.toc} />

      <PostEnhancements toc={note.toc} hasToc={note.hasToc} />
    </NotesShell>
  )
}
