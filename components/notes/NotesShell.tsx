import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import type { NotesTreeNode } from './NotesTree'
import NotesVaultClient from './NotesVaultClient'

type NotesShellProps = {
  tree: NotesTreeNode[]
  activePath?: string
  children: ReactNode
}

export default function NotesShell({ tree, activePath, children }: NotesShellProps) {
  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout notes-vault-layout pb-4">
        <NotesVaultClient tree={tree} activePath={activePath}>
          {children}
        </NotesVaultClient>
      </main>
    </>
  )
}
