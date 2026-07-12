import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allNotes, type Note } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import NotesShell from '@/components/notes/NotesShell'
import PostEnhancements from '@/components/PostEnhancements'
import { findTreeNodeByPath, getNotesBreadcrumbLabels, getNotesTree } from '../_lib/notes-tree'
import { getNoteHref, normalizeNotePath, splitNotePath } from '../_lib/notes-path'

function getNoteTitle(note: Pick<Note, 'title' | 'slug'>) {
  return note.title || note.slug.split('/').pop()?.replace(/-/g, ' ') || 'Note'
}

function getSlug(params: { slug: string[] }) {
  return normalizeNotePath(params.slug.join('/'))
}

function getPublicNotes() {
  return Array.isArray(allNotes) ? allNotes.filter((note) => !note.draft) : []
}

function getNoteCandidates(note: Note) {
  return new Set(
    [note.slug, note.path, note.filePath]
      .filter(Boolean)
      .map((value) => normalizeNotePath(String(value)))
  )
}

function findNoteBySlug(slug: string) {
  const normalizedSlug = normalizeNotePath(slug)

  return getPublicNotes().find((note) => getNoteCandidates(note).has(normalizedSlug))
}

function renderFolderChildren(node: NonNullable<ReturnType<typeof findTreeNodeByPath>>) {
  if (node.type !== 'folder') return null

  if (node.children.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        This folder does not contain any visible notes yet.
      </p>
    )
  }

  return (
    <ul className="mt-6 space-y-2">
      {node.children.map((child) => (
        <li key={`${child.type}:${child.path}`}>
          <Link
            href={child.type === 'folder' ? getNoteHref(child.path) : child.href}
            className="text-[var(--link)] underline-offset-4 visited:text-[var(--link-visited)] hover:text-[var(--link-hover)] hover:underline hover:decoration-dashed"
          >
            {child.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export async function generateStaticParams() {
  const tree = getNotesTree()
  const paths: { slug: string[] }[] = []
  const seen = new Set<string>()

  function pushPath(value: string) {
    const normalizedPath = normalizeNotePath(value)

    if (!normalizedPath) return
    if (seen.has(normalizedPath)) return

    seen.add(normalizedPath)

    paths.push({
      slug: splitNotePath(normalizedPath),
    })
  }

  function walk(nodes: typeof tree) {
    for (const node of nodes) {
      pushPath(node.path)

      if (node.type === 'folder') {
        walk(node.children)
      }
    }
  }

  walk(tree)

  return paths
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = getSlug(params)
  const note = findNoteBySlug(slug)

  if (note) {
    return genPageMetadata({
      robots: { index: false, follow: true },
      title: getNoteTitle(note),
      description: note.summary || 'A note from my C++ learning vault.',
    })
  }

  const tree = getNotesTree()
  const node = findTreeNodeByPath(tree, slug)

  if (node?.type === 'folder') {
    return genPageMetadata({
      robots: { index: false, follow: true },
      title: node.name,
      description: 'A folder from my C++ learning vault.',
    })
  }
}

export default async function NotePage(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = getSlug(params)
  const tree = getNotesTree()
  const note = findNoteBySlug(slug)

  if (note) {
    const startsWithH1 = note.body.raw.trimStart().startsWith('# ')

    return (
      <NotesShell tree={tree} activePath={slug} breadcrumbLabels={getNotesBreadcrumbLabels(tree)}>
        {!startsWithH1 && (
          <h1 className="mb-6 text-3xl font-bold text-[var(--primary)]">{getNoteTitle(note)}</h1>
        )}

        <MDXLayoutRenderer code={note.body.code} components={components} toc={note.toc} />

        <PostEnhancements toc={note.toc} hasToc={note.hasToc} />
      </NotesShell>
    )
  }

  const node = findTreeNodeByPath(tree, slug)

  if (node?.type !== 'folder') {
    return notFound()
  }

  return (
    <NotesShell tree={tree} activePath={slug} breadcrumbLabels={getNotesBreadcrumbLabels(tree)}>
      <h1 className="text-2xl font-semibold sm:text-3xl">{node.name}</h1>
      {renderFolderChildren(node)}
    </NotesShell>
  )
}
