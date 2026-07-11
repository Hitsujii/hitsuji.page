'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import NotesTree, { type NotesTreeCommand, type NotesTreeNode } from './NotesTree'

type NotesVaultClientProps = {
  tree: NotesTreeNode[]
  activePath?: string
  children: ReactNode
}

const STORAGE_KEY = 'notes-explorer-collapsed'
const MOBILE_OPEN_KEY = 'notes-explorer-mobile-open'
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function isMobileViewport() {
  return window.matchMedia('(max-width: 639px)').matches
}

function ExplorerToolbarIcon({ command }: { command: NotesTreeCommand }) {
  if (command === 'focus') {
    return (
      <svg aria-hidden="true" className="notes-vault-control-icon" viewBox="0 0 16 16" fill="none">
        <path d="M8 2.25v2M8 11.75v2M2.25 8h2M11.75 8h2" />
        <circle cx="8" cy="8" r="2.7" />
      </svg>
    )
  }

  if (command === 'expand') {
    return (
      <svg aria-hidden="true" className="notes-vault-control-icon" viewBox="0 0 16 16" fill="none">
        <path d="M8 3.25v9.5M3.25 8h9.5" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="notes-vault-control-icon" viewBox="0 0 16 16" fill="none">
      <path d="M3.25 8h9.5" />
    </svg>
  )
}

function revealActiveExplorerItem(shouldFocus = false) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const currentPage = document.querySelector<HTMLElement>(
        '#notes-vault-explorer [aria-current="page"]'
      )
      const activeItems = Array.from(
        document.querySelectorAll<HTMLElement>('#notes-vault-explorer [data-notes-active="true"]')
      )
      const activeItem = currentPage || activeItems.at(-1)

      if (!activeItem) return

      activeItem.scrollIntoView({ block: 'center', inline: 'nearest' })

      if (shouldFocus) {
        activeItem.focus({ preventScroll: true })
      }
    })
  })
}

export default function NotesVaultClient({ tree, activePath, children }: NotesVaultClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileViewport, setMobileViewport] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [treeCommand, setTreeCommand] = useState<NotesTreeCommand>('focus')
  const [treeCommandKey, setTreeCommandKey] = useState(0)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const explorerRef = useRef<HTMLElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)')

    const syncViewport = () => {
      setMobileViewport(mediaQuery.matches)

      if (mediaQuery.matches) {
        setMobileOpen(window.sessionStorage.getItem(MOBILE_OPEN_KEY) === 'true')
      } else {
        setMobileOpen(false)
      }
    }

    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === 'true')
    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => {
      mediaQuery.removeEventListener('change', syncViewport)
    }
  }, [])

  useEffect(() => {
    setTreeCommand('focus')
    setTreeCommandKey((current) => current + 1)

    if (!mobileViewport || mobileOpen) {
      revealActiveExplorerItem()
    }
  }, [activePath, mobileOpen, mobileViewport])

  useEffect(() => {
    document.documentElement.classList.toggle('notes-drawer-open', mobileOpen)

    if (mobileOpen) {
      closeButtonRef.current?.focus()
    }

    return () => {
      document.documentElement.classList.remove('notes-drawer-open')
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileViewport || !mobileOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileExplorer()
        return
      }

      if (event.key !== 'Tab') return

      const explorer = explorerRef.current
      if (!explorer) return

      const focusableElements = Array.from(
        explorer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute('disabled'))
      const first = focusableElements[0]
      const last = focusableElements.at(-1)

      if (!first || !last) return

      if (
        event.shiftKey &&
        (document.activeElement === first || !explorer.contains(document.activeElement))
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen, mobileViewport])

  function runTreeCommand(nextCommand: NotesTreeCommand) {
    setTreeCommand(nextCommand)
    setTreeCommandKey((current) => current + 1)

    if (nextCommand === 'focus') {
      revealActiveExplorerItem(true)
    }
  }

  function toggleDesktopExplorer() {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  function openExplorer() {
    if (isMobileViewport()) {
      window.sessionStorage.setItem(MOBILE_OPEN_KEY, 'true')
      setMobileOpen(true)
      return
    }

    setCollapsed(false)
    window.localStorage.setItem(STORAGE_KEY, 'false')
  }

  function closeExplorer() {
    if (isMobileViewport()) {
      window.sessionStorage.removeItem(MOBILE_OPEN_KEY)
      setMobileOpen(false)
      return
    }

    toggleDesktopExplorer()
  }

  function closeMobileExplorer() {
    window.sessionStorage.removeItem(MOBILE_OPEN_KEY)
    setMobileOpen(false)
    window.requestAnimationFrame(() => toggleButtonRef.current?.focus())
  }

  function handleNavClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest('a')

    if (!link || !isMobileViewport()) {
      return
    }

    const kind = link.dataset.notesNavKind

    if (kind !== 'folder' && kind !== 'note') {
      return
    }

    window.sessionStorage.setItem(MOBILE_OPEN_KEY, 'true')
    setMobileOpen(true)
  }

  return (
    <div
      className={[
        'notes-vault-shell',
        collapsed ? 'is-collapsed' : '',
        mobileOpen ? 'is-mobile-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <aside
        ref={explorerRef}
        id="notes-vault-explorer"
        data-pagefind-ignore
        className="notes-vault-sidebar not-prose"
        aria-label="Notes explorer"
        aria-hidden={mobileViewport && !mobileOpen ? true : undefined}
        aria-modal={mobileViewport && mobileOpen ? true : undefined}
        inert={mobileViewport && !mobileOpen ? true : undefined}
        role={mobileViewport && mobileOpen ? 'dialog' : undefined}
      >
        <div className="notes-vault-title">
          <div>
            <div className="notes-vault-heading">Notes</div>
            <p>C++ vault</p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="notes-vault-close focus-outline"
            onClick={closeExplorer}
          >
            <span className="notes-vault-close-mobile">Close</span>
            <span className="notes-vault-close-desktop">Hide</span>
          </button>
        </div>

        <div className="notes-vault-toolbar" aria-label="Explorer toolbar">
          <div className="notes-vault-controls" role="group" aria-label="Explorer actions">
            <button
              type="button"
              aria-label="Focus current branch"
              title="Focus current branch"
              onClick={() => runTreeCommand('focus')}
            >
              <ExplorerToolbarIcon command="focus" />
            </button>
            <button
              type="button"
              aria-label="Expand all folders"
              title="Expand all folders"
              onClick={() => runTreeCommand('expand')}
            >
              <ExplorerToolbarIcon command="expand" />
            </button>
            <button
              type="button"
              aria-label="Collapse all folders"
              title="Collapse all folders"
              onClick={() => runTreeCommand('collapse')}
            >
              <ExplorerToolbarIcon command="collapse" />
            </button>
          </div>
        </div>

        <nav onClickCapture={handleNavClick} aria-label="Notes explorer tree">
          <NotesTree
            tree={tree}
            activePath={activePath}
            command={treeCommand}
            commandKey={treeCommandKey}
          />
        </nav>
      </aside>

      <button
        type="button"
        className="notes-vault-backdrop"
        aria-label="Close notes explorer"
        tabIndex={-1}
        onClick={closeMobileExplorer}
      />

      <div className="notes-vault-main" inert={mobileViewport && mobileOpen ? true : undefined}>
        <button
          ref={toggleButtonRef}
          type="button"
          className="notes-vault-toggle focus-outline"
          aria-expanded={mobileViewport ? mobileOpen : !collapsed}
          aria-controls="notes-vault-explorer"
          onClick={openExplorer}
        >
          <span aria-hidden="true">☰</span>
          <span>Explorer</span>
        </button>

        <article
          id="article"
          className="notes-vault-content post-content app-prose prose dark:prose-invert"
        >
          {children}
        </article>
      </div>
    </div>
  )
}
