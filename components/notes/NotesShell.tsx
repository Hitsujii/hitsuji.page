import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import type { NotesTreeNode } from './NotesTree'
import NotesVaultClient from './NotesVaultClient'

type NotesShellProps = {
  tree: NotesTreeNode[]
  activePath?: string
  breadcrumbLabels?: Record<string, string>
  children: ReactNode
}

export default function NotesShell({
  tree,
  activePath,
  breadcrumbLabels,
  children,
}: NotesShellProps) {
  return (
    <>
      <Breadcrumb labelsByHref={breadcrumbLabels} />

      <main id="main-content" className="app-layout notes-vault-layout pb-4">
        <NotesVaultClient tree={tree} activePath={activePath}>
          {children}
        </NotesVaultClient>
      </main>
    </>
  )
}
