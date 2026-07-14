'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import AvatarWindow from '@/components/AvatarWindow'
import BrowserApp from './BrowserApp'
import DesktopShortcuts from './DesktopShortcuts'
import DesktopTaskbar from './DesktopTaskbar'
import ExplorerApp from './ExplorerApp'
import FindApp from './FindApp'
import { focusAfterWindowChange } from './focus-desktop'
import TerminalApp from './TerminalApp'
import {
  DESKTOP_APP_ORDER,
  DesktopShellContext,
  type DesktopAppId,
  type DesktopAppState,
  type DesktopWindowMode,
  type FrierenBuildJob,
  type SearchDocument,
  type SearchDocumentsStatus,
} from './DesktopShellContext'

type DesktopShellProviderProps = {
  children: ReactNode
  searchDocumentsPath: string | false
}

type ViewTransition = {
  finished: Promise<void>
}

type ViewTransitionDocument = Document & {
  activeViewTransition?: unknown
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransition
}

const initialWindows: Record<DesktopAppId, DesktopAppState> = {
  browser: {
    activation: 1,
    id: 'browser',
    mode: 'normal',
    present: true,
    restoreMode: 'normal',
    title: 'hitsuji.page - Web Browser',
  },
  explorer: {
    activation: 0,
    id: 'explorer',
    mode: 'closed',
    present: true,
    restoreMode: 'normal',
    title: 'Site Explorer',
  },
  terminal: {
    activation: 2,
    id: 'terminal',
    mode: 'normal',
    present: true,
    restoreMode: 'normal',
    title: 'MS-DOS Prompt',
  },
  frieren: {
    activation: 0,
    id: 'frieren',
    mode: 'closed',
    present: true,
    restoreMode: 'normal',
    title: 'frieren.exe',
  },
  find: {
    activation: 0,
    id: 'find',
    mode: 'closed',
    present: true,
    restoreMode: 'normal',
    title: 'Find: All Files',
  },
}

const initialFrierenBuild: FrierenBuildJob = {
  id: 1,
  terminalReturnMode: 'closed',
}

function mostRecentVisibleApp(
  windows: Record<DesktopAppId, DesktopAppState>,
  excludedId: DesktopAppId
) {
  return DESKTOP_APP_ORDER.map((id) => windows[id])
    .filter(
      (app) =>
        app.id !== excludedId && app.present && (app.mode === 'normal' || app.mode === 'maximized')
    )
    .sort((left, right) => right.activation - left.activation)[0]?.id
}

function isSearchDocument(value: unknown): value is SearchDocument {
  if (!value || typeof value !== 'object') return false

  const document = value as Partial<SearchDocument>
  return (
    document.draft !== true &&
    typeof document.title === 'string' &&
    typeof document.path === 'string'
  )
}

export default function DesktopShellProvider({
  children,
  searchDocumentsPath,
}: DesktopShellProviderProps) {
  const pathname = usePathname()
  const [activeAppId, setActiveAppId] = useState<DesktopAppId | null>('terminal')
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [documentsStatus, setDocumentsStatus] = useState<SearchDocumentsStatus>(
    searchDocumentsPath ? 'loading' : 'ready'
  )
  const [startOpen, setStartOpen] = useState(false)
  const [windows, setWindows] = useState(initialWindows)
  const [frierenBuild, setFrierenBuild] = useState<FrierenBuildJob | null>(initialFrierenBuild)
  const [frierenCompiled, setFrierenCompiled] = useState(false)
  const activationSequence = useRef(2)
  const buildSequence = useRef(1)
  const frierenBuildRef = useRef<FrierenBuildJob | null>(initialFrierenBuild)
  const windowsRef = useRef(windows)

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  useEffect(() => {
    setStartOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!searchDocumentsPath) return

    const abortController = new AbortController()
    setDocumentsStatus('loading')

    void fetch(searchDocumentsPath, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Search index returned ${response.status}`)
        return response.json() as Promise<unknown>
      })
      .then((value) => {
        if (!Array.isArray(value)) throw new Error('Search index is not an array')
        setDocuments(value.filter(isSearchDocument))
        setDocumentsStatus('ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setDocuments([])
        setDocumentsStatus('error')
      })

    return () => abortController.abort()
  }, [searchDocumentsPath])

  const closeStart = useCallback(() => setStartOpen(false), [])
  const toggleStart = useCallback(() => setStartOpen((open) => !open), [])

  const setAppMode = useCallback((id: DesktopAppId, mode: DesktopWindowMode) => {
    if (id === 'terminal' && mode === 'closed' && frierenBuildRef.current) {
      frierenBuildRef.current = null
      setFrierenBuild(null)
    }

    const update = () => {
      const activation =
        mode === 'normal' || mode === 'maximized' ? ++activationSequence.current : null

      setWindows((current) => {
        const app = current[id]
        if (app.mode === mode) return current

        return {
          ...current,
          [id]: {
            ...app,
            activation: activation ?? app.activation,
            mode,
            restoreMode:
              mode === 'minimized' && (app.mode === 'normal' || app.mode === 'maximized')
                ? app.mode
                : app.restoreMode,
          },
        }
      })

      if (mode === 'normal' || mode === 'maximized') {
        setActiveAppId(id)
        setStartOpen(false)
      } else {
        const fallback = mostRecentVisibleApp(windowsRef.current, id)
        setActiveAppId((active) => (active === id ? (fallback ?? null) : active))
      }
    }

    const transitionDocument = document as ViewTransitionDocument
    const documentElement = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const transitionFlag =
      id === 'frieren'
        ? 'avatarTransition'
        : id === 'explorer'
          ? 'explorerTransition'
          : id === 'terminal'
            ? 'terminalTransition'
            : id === 'browser'
              ? 'browserTransition'
              : 'findTransition'

    if (
      reducedMotion ||
      !transitionDocument.startViewTransition ||
      transitionDocument.activeViewTransition ||
      documentElement.dataset[transitionFlag] === 'running' ||
      documentElement.dataset.viewTransition === 'running' ||
      documentElement.dataset.historyTransition === 'running'
    ) {
      update()
      return
    }

    documentElement.dataset[transitionFlag] = 'running'

    try {
      const transition = transitionDocument.startViewTransition(() => flushSync(update))
      transition.finished
        .catch(() => undefined)
        .finally(() => delete documentElement.dataset[transitionFlag])
    } catch {
      delete documentElement.dataset[transitionFlag]
      update()
    }
  }, [])

  const activateApp = useCallback(
    (id: DesktopAppId) => {
      const app = windowsRef.current[id]
      if (!app.present) return

      if (app.mode === 'closed' || app.mode === 'minimized') {
        setAppMode(id, app.mode === 'minimized' ? app.restoreMode : 'normal')
        return
      }

      const activation = ++activationSequence.current
      setWindows((current) => ({
        ...current,
        [id]: {
          ...current[id],
          activation,
        },
      }))
      setActiveAppId(id)
      setStartOpen(false)
    },
    [setAppMode]
  )

  const openTerminal = useCallback(() => activateApp('terminal'), [activateApp])
  const openExplorer = useCallback(() => activateApp('explorer'), [activateApp])
  const openBrowser = useCallback(() => activateApp('browser'), [activateApp])
  const openFind = useCallback(() => activateApp('find'), [activateApp])

  const compileAndRunFrieren = useCallback(() => {
    if (frierenBuildRef.current) {
      activateApp('terminal')
      return
    }

    const terminal = windowsRef.current.terminal
    const job: FrierenBuildJob = {
      id: ++buildSequence.current,
      terminalReturnMode: terminal.mode === 'closed' ? 'closed' : 'minimized',
    }
    const activation = ++activationSequence.current

    frierenBuildRef.current = job
    setFrierenBuild(job)
    setWindows((current) => ({
      ...current,
      terminal: {
        ...current.terminal,
        activation,
        mode: 'normal',
        present: true,
        restoreMode: 'normal',
      },
      frieren: {
        ...current.frieren,
        mode: 'closed',
      },
    }))
    setActiveAppId('terminal')
    setStartOpen(false)
  }, [activateApp])

  const openFrierenExecutable = useCallback(() => {
    if (frierenBuildRef.current) {
      activateApp('terminal')
      return
    }

    if (!frierenCompiled) {
      compileAndRunFrieren()
      return
    }

    activateApp('frieren')
  }, [activateApp, compileAndRunFrieren, frierenCompiled])

  const markFrierenCompiled = useCallback(() => setFrierenCompiled(true), [])

  const finishFrierenBuild = useCallback((jobId: number) => {
    const job = frierenBuildRef.current
    if (!job || job.id !== jobId) return

    const activation = ++activationSequence.current
    frierenBuildRef.current = null
    setFrierenBuild(null)
    setFrierenCompiled(true)
    setWindows((current) => ({
      ...current,
      terminal: {
        ...current.terminal,
        mode: job.terminalReturnMode,
      },
      frieren: {
        ...current.frieren,
        activation,
        mode: 'normal',
        present: true,
        restoreMode: 'normal',
        title: 'frieren.exe',
      },
    }))
    setActiveAppId('frieren')
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Escape') {
        event.preventDefault()
        setStartOpen((open) => !open)
        return
      }

      if (event.ctrlKey && event.key === 'F6') {
        const available = DESKTOP_APP_ORDER.filter((id) => {
          const app = windowsRef.current[id]
          return app.present && app.mode !== 'closed'
        })

        if (available.length === 0) return

        event.preventDefault()
        const currentIndex = activeAppId ? available.indexOf(activeAppId) : -1
        activateApp(available[(currentIndex + 1) % available.length])
        return
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'F4' && activeAppId) {
        event.preventDefault()
        setAppMode(activeAppId, 'closed')
        focusAfterWindowChange(activeAppId, 'closed')
        return
      }

      if (event.key === 'Escape') setStartOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activateApp, activeAppId, setAppMode])

  const hasMaximizedWindow = DESKTOP_APP_ORDER.some(
    (id) => windows[id].present && windows[id].mode === 'maximized'
  )

  useEffect(() => {
    document.documentElement.toggleAttribute('data-desktop-maximized', hasMaximizedWindow)

    return () => {
      document.documentElement.removeAttribute('data-desktop-maximized')
    }
  }, [hasMaximizedWindow])

  const value = useMemo(
    () => ({
      activeAppId,
      activateApp,
      closeStart,
      compileAndRunFrieren,
      documents,
      documentsStatus,
      finishFrierenBuild,
      frierenBuild,
      frierenCompiled,
      markFrierenCompiled,
      openBrowser,
      openExplorer,
      openFind,
      openFrierenExecutable,
      openTerminal,
      setAppMode,
      startOpen,
      toggleStart,
      windows,
    }),
    [
      activeAppId,
      activateApp,
      closeStart,
      compileAndRunFrieren,
      documents,
      documentsStatus,
      finishFrierenBuild,
      frierenBuild,
      frierenCompiled,
      markFrierenCompiled,
      openBrowser,
      openExplorer,
      openFind,
      openFrierenExecutable,
      openTerminal,
      setAppMode,
      startOpen,
      toggleStart,
      windows,
    ]
  )

  return (
    <DesktopShellContext.Provider value={value}>
      <DesktopShortcuts />
      <BrowserApp>{children}</BrowserApp>
      <ExplorerApp />
      <TerminalApp />
      <FindApp />
      <AvatarWindow priority />
      <DesktopTaskbar />
    </DesktopShellContext.Provider>
  )
}
