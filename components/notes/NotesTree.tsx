'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from '@/components/Link'

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

export type NotesTreeCommand = 'focus' | 'expand' | 'collapse'

type NotesTreeProps = {
  tree: NotesTreeNode[]
  activePath?: string
  depth?: number
  command?: NotesTreeCommand
  commandKey?: number
}

type FolderDetailsProps = {
  initialOpen: boolean
  resetKey: string
  className: string
  children: ReactNode
}

function FolderDetails({ initialOpen, resetKey, className, children }: FolderDetailsProps) {
  const [open, setOpen] = useState(initialOpen)

  useEffect(() => {
    setOpen(initialOpen)
  }, [initialOpen, resetKey])

  return (
    <details
      open={open}
      className={className}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  )
}

function isActivePath(activePath: string | undefined, nodePath: string) {
  if (!activePath || !nodePath) return false

  return activePath === nodePath || activePath.startsWith(`${nodePath}/`)
}

function folderIndent(depth: number) {
  return `${Math.min(depth * 0.55, 1.65)}rem`
}

function itemIndent(depth: number) {
  return `${Math.min(depth * 0.55 + 1.2, 2.15)}rem`
}

function noteItemStyle(depth: number): CSSProperties {
  return {
    paddingLeft: itemIndent(depth),
  }
}

function shouldOpenFolder(command: NotesTreeCommand, active: boolean) {
  if (command === 'expand') return true
  if (command === 'collapse') return false

  return active
}

function getResetKey(command: NotesTreeCommand, commandKey: number, activePath?: string) {
  if (command === 'focus') {
    return `${command}:${commandKey}:${activePath || ''}`
  }

  return `${command}:${commandKey}`
}

export default function NotesTree({
  tree,
  activePath,
  depth = 0,
  command = 'focus',
  commandKey = 0,
}: NotesTreeProps) {
  if (tree.length === 0) return null

  const resetKey = getResetKey(command, commandKey, activePath)

  return (
    <ol className={depth === 0 ? 'space-y-1' : 'mt-1 space-y-1'}>
      {tree.map((node) => {
        if (node.type === 'folder') {
          const active = isActivePath(activePath, node.path)

          return (
            <li key={`folder-${node.path}`} className="min-w-0">
              <FolderDetails
                initialOpen={shouldOpenFolder(command, active)}
                resetKey={resetKey}
                className="notes-tree-folder group min-w-0"
              >
                <summary
                  className={[
                    'notes-tree-folder-summary flex min-w-0 cursor-pointer list-none items-center gap-1 text-sm',
                    'marker:hidden [&::-webkit-details-marker]:hidden',
                    active
                      ? 'text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                  ].join(' ')}
                  style={{ paddingLeft: folderIndent(depth) }}
                >
                  <span aria-hidden="true" className="notes-tree-folder-toggle">
                    <svg viewBox="0 0 16 16" fill="none">
                      <path d="M6 3.5 10.5 8 6 12.5" />
                    </svg>
                  </span>

                  <Link
                    href={node.path ? `/notes/${node.path}` : '/notes'}
                    data-notes-nav-kind="folder"
                    data-notes-active={active ? 'true' : undefined}
                    className="notes-tree-folder-label min-w-0 truncate underline-offset-4 hover:text-[var(--accent)] hover:underline hover:decoration-dashed"
                    onClick={(event) => event.stopPropagation()}
                    title={node.name}
                  >
                    {node.name}
                  </Link>
                </summary>

                {node.children.length > 0 && (
                  <NotesTree
                    tree={node.children}
                    activePath={activePath}
                    depth={depth + 1}
                    command={command}
                    commandKey={commandKey}
                  />
                )}
              </FolderDetails>
            </li>
          )
        }

        const active = activePath === node.path

        return (
          <li key={`note-${node.path}`} className="min-w-0">
            <Link
              href={node.href}
              data-notes-nav-kind="note"
              data-notes-active={active ? 'true' : undefined}
              aria-current={active ? 'page' : undefined}
              className={[
                'block min-w-0 truncate border-l py-1 pr-2 text-sm underline-offset-4 transition',
                active
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]',
              ].join(' ')}
              style={noteItemStyle(depth)}
              title={node.name}
            >
              {node.name}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
