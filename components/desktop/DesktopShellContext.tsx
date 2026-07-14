'use client'

import { createContext, useContext } from 'react'

export type DesktopAppId = 'browser' | 'explorer' | 'terminal' | 'frieren' | 'find'
export const DESKTOP_APP_ORDER: readonly DesktopAppId[] = [
  'browser',
  'explorer',
  'terminal',
  'frieren',
  'find',
]
export type DesktopWindowMode = 'closed' | 'normal' | 'maximized' | 'minimized'
export type SearchDocumentsStatus = 'loading' | 'ready' | 'error'

export type FrierenBuildJob = {
  id: number
  terminalReturnMode: Extract<DesktopWindowMode, 'closed' | 'minimized'>
}

export type SearchDocument = {
  body?: { raw?: string }
  date?: string
  draft?: boolean
  path: string
  summary?: string
  tags?: string[]
  title: string
}

export type DesktopAppState = {
  activation: number
  id: DesktopAppId
  mode: DesktopWindowMode
  present: boolean
  restoreMode: Extract<DesktopWindowMode, 'normal' | 'maximized'>
  title: string
}

export type DesktopShellContextValue = {
  activeAppId: DesktopAppId | null
  activateApp: (id: DesktopAppId) => void
  closeStart: () => void
  compileAndRunFrieren: () => void
  documents: SearchDocument[]
  documentsStatus: SearchDocumentsStatus
  finishFrierenBuild: (jobId: number) => void
  frierenBuild: FrierenBuildJob | null
  frierenCompiled: boolean
  markFrierenCompiled: () => void
  openBrowser: () => void
  openExplorer: () => void
  openFind: () => void
  openFrierenExecutable: () => void
  openTerminal: () => void
  setAppMode: (id: DesktopAppId, mode: DesktopWindowMode) => void
  startOpen: boolean
  toggleStart: () => void
  windows: Record<DesktopAppId, DesktopAppState>
}

export const DesktopShellContext = createContext<DesktopShellContextValue | null>(null)

export function useDesktopShell() {
  const context = useContext(DesktopShellContext)

  if (!context) {
    throw new Error('useDesktopShell must be used inside DesktopShellProvider')
  }

  return context
}
