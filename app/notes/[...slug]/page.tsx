import 'css/prism.css'
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

function getNoteTitle(note: Pick<Note, 'title' | 'slug'>) {
  return note.title || note.slug.split('/').pop()?.replace(/-/g, ' ') || 'Note'
}

function normalizeNotePath(value: string) {
  const parts = decodeURI(value)
    .replace(/\+/g, ' ')
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .replace(/^data\//i, '')
    .replace(/^(notes\/)+/i, '')
    .replace(/\/index$/i, '')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean)

  const first = parts[0]?.toLowerCase()

  if (first === 'knowledge' || first === 'c++ fundamentals' || first === 'cpp fundamentals') {
    parts[0] = 'cpp-fundamentals'
  }

  if (first === 'learncpp' || first === 'learncpp course') {
    parts[0] = 'learncpp-course'
  }

  return parts.join('/')
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

export async function generateStaticParams() {
  const tree = getNotesTree()
  const paths: { slug: string[] }[] = []

  function pushPath(value: string) {
    const normalizedPath = normalizeNotePath(value)
    if (!normalizedPath) return

    paths.push({
      slug: normalizedPath.split('/').map((segment) => encodeURI(segment)),
    })
  }

  function walk(nodes: typeof tree) {
    for (const node of nodes) {
      if (node.type === 'folder') {
        pushPath(node.path)
        walk(node.children)
      }

      if (node.type === 'note') {
        pushPath(node.path)
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
          <h1 className="mb-6 text-3xl font-bold text-[var(--accent)]">{getNoteTitle(note)}</h1>
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

      {node.children.length > 0 && (
        <ul className="mt-6 space-y-2">
          {node.children.map((child) => {
            const href = child.type === 'folder' ? `/notes/${child.path}` : child.href

            return (
              <li key={`${child.type}:${child.path}`}>
                <Link
                  href={href}
                  className="text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed"
                >
                  {child.name}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </NotesShell>
  )
}
