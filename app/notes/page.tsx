import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { allNotes, type Note } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import NotesShell from '@/components/notes/NotesShell'
import PostEnhancements from '@/components/PostEnhancements'
import { getNotesBreadcrumbLabels, getNotesTree, type NotesTreeNode } from './_lib/notes-tree'
import { getNoteHref, normalizeNotePath } from './_lib/notes-path'

export function generateMetadata(): Metadata {
  const note = getRootNote()

  return genPageMetadata({
    robots: { index: false, follow: true },
    title: note ? getNoteTitle(note) : 'Notes',
    description: note?.summary || 'My C++ learning vault.',
  })
}

function getPublicNotes() {
  return Array.isArray(allNotes) ? allNotes.filter((note) => !note.draft) : []
}

function getRootNote() {
  return getPublicNotes().find((note) => {
    const candidates = [note.slug, note.path, note.filePath]
      .filter(Boolean)
      .map((value) => normalizeNotePath(String(value)))

    return candidates.includes('')
  })
}

function getNoteTitle(note: Pick<Note, 'title' | 'slug'>) {
  return note.title || note.slug.split('/').pop()?.replace(/-/g, ' ') || 'Notes'
}

function getTreeNodeHref(node: NotesTreeNode) {
  return node.type === 'folder' ? getNoteHref(node.path) : node.href
}

function NotesFallbackList({ tree }: { tree: NotesTreeNode[] }) {
  if (tree.length === 0) {
    return (
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          No notes were found. Add markdown files to the vault, then run npm run notes:sync to
          populate this page.
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        Root <code>index.md</code> was not found, so this page is showing the top-level notes and
        folders instead.
      </p>

      <ul className="mt-6 space-y-2">
        {tree.map((child) => (
          <li key={`${child.type}:${child.path}`}>
            <Link
              href={getTreeNodeHref(child)}
              className="text-[var(--link)] underline-offset-4 visited:text-[var(--link-visited)] hover:text-[var(--link-hover)] hover:underline hover:decoration-dashed"
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
      <NotesShell tree={tree} breadcrumbLabels={getNotesBreadcrumbLabels(tree)}>
        <NotesFallbackList tree={tree} />
      </NotesShell>
    )
  }

  const startsWithH1 = note.body.raw.trimStart().startsWith('# ')

  return (
    <NotesShell tree={tree} activePath="" breadcrumbLabels={getNotesBreadcrumbLabels(tree)}>
      {!startsWithH1 && (
        <h1 className="mb-6 text-3xl font-bold text-[var(--primary)]">{getNoteTitle(note)}</h1>
      )}

      <MDXLayoutRenderer code={note.body.code} components={components} toc={note.toc} />

      <PostEnhancements toc={note.toc} hasToc={note.hasToc} />
    </NotesShell>
  )
}
