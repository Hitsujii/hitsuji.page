'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeAppPath, withBasePath } from '@/components/path-utils'
import DesktopIcon, { type DesktopIconVariant } from './DesktopIcon'
import { useDesktopShell, type SearchDocument } from './DesktopShellContext'
import { focusAfterWindowChange } from './focus-desktop'
import useDraggableWindow from './useDraggableWindow'
import WindowControlGlyph from './WindowControlGlyph'
import WindowResizeHandles from './WindowResizeHandles'
import WindowSystemMenu, { type WindowSystemMenuHandle } from './WindowSystemMenu'

type ExplorerLocation = 'root' | 'posts' | 'notes' | 'logs'
type ExplorerMenu = 'file' | 'view' | 'go' | 'help'
type SortKey = 'name' | 'modified'

type ExplorerFolder = {
  icon: DesktopIconVariant
  kind: 'folder'
  modified?: string
  name: string
  target: ExplorerLocation
  type: string
}

type ExplorerLink = {
  href: string
  icon: DesktopIconVariant
  kind: 'link'
  modified?: string
  name: string
  type: string
}

type ExplorerItem = ExplorerFolder | ExplorerLink

const LOCATION_LABELS: Record<ExplorerLocation, string> = {
  root: 'C:\\HITSUJI.PAGE',
  posts: 'C:\\HITSUJI.PAGE\\POSTS',
  notes: 'C:\\HITSUJI.PAGE\\NOTES',
  logs: 'C:\\HITSUJI.PAGE\\LOGS',
}

const LOCATION_ROUTES: Record<ExplorerLocation, string> = {
  root: '/',
  posts: '/blog',
  notes: '/notes',
  logs: '/#history',
}

const LOCATION_NAMES: Record<ExplorerLocation, string> = {
  root: 'Site',
  posts: 'Posts',
  notes: 'Notes',
  logs: 'Learning logs',
}

function documentLocation(document: SearchDocument): ExplorerLocation | null {
  if (document.path.startsWith('blog/')) return 'posts'
  if (document.path === 'notes' || document.path.startsWith('notes/')) return 'notes'
  if (document.path.startsWith('#log-')) return 'logs'
  return null
}

function documentHref(document: SearchDocument) {
  return `/${document.path.replace(/^\/+/, '')}`
}

function documentType(location: ExplorerLocation) {
  if (location === 'posts') return 'C++ Source File'
  if (location === 'notes') return 'Markdown Document'
  return 'Log File'
}

function documentIcon(location: ExplorerLocation): DesktopIconVariant {
  if (location === 'posts') return 'cpp'
  return 'document'
}

function shortDate(date?: string) {
  if (!date) return undefined
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date.slice(0, 10) : parsed.toISOString().slice(0, 10)
}

function newestDate(documents: SearchDocument[]) {
  return documents
    .map((document) => shortDate(document.date))
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => right.localeCompare(left))[0]
}

function rootItems(documents: SearchDocument[]): ExplorerItem[] {
  const contentFolders: Array<{
    location: Exclude<ExplorerLocation, 'root'>
    icon: DesktopIconVariant
  }> = [
    { location: 'posts', icon: 'folder' },
    { location: 'notes', icon: 'folder-open' },
    { location: 'logs', icon: 'archive' },
  ]

  const folders = contentFolders.map(({ location, icon }): ExplorerFolder => {
    const children = documents.filter((document) => documentLocation(document) === location)

    return {
      icon,
      kind: 'folder',
      modified: newestDate(children),
      name: LOCATION_NAMES[location],
      target: location,
      type: 'File Folder',
    }
  })

  return [
    ...folders,
    {
      href: '/projects',
      icon: 'projects',
      kind: 'link',
      name: 'Projects',
      type: 'Internet Shortcut',
    },
    { href: '/tags', icon: 'tags', kind: 'link', name: 'Tags', type: 'Internet Shortcut' },
    { href: '/search', icon: 'search', kind: 'link', name: 'Find', type: 'Internet Shortcut' },
    { href: '/about', icon: 'about', kind: 'link', name: 'About', type: 'Text Document' },
    { href: '/feed.xml', icon: 'rss', kind: 'link', name: 'feed.xml', type: 'RSS Feed' },
  ]
}

function locationItems(location: ExplorerLocation, documents: SearchDocument[]): ExplorerItem[] {
  if (location === 'root') return rootItems(documents)

  return documents
    .filter((document) => documentLocation(document) === location)
    .map(
      (document): ExplorerLink => ({
        href: documentHref(document),
        icon: documentIcon(location),
        kind: 'link',
        modified: shortDate(document.date),
        name: document.title,
        type: documentType(location),
      })
    )
}

function compareItems(left: ExplorerItem, right: ExplorerItem, sortKey: SortKey) {
  if (left.kind !== right.kind) return left.kind === 'folder' ? -1 : 1

  if (sortKey === 'modified') {
    const dateOrder = (right.modified ?? '').localeCompare(left.modified ?? '')
    if (dateOrder !== 0) return dateOrder
  }

  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
}

export default function ExplorerApp() {
  const { activeAppId, activateApp, documents, documentsStatus, openBrowser, setAppMode, windows } =
    useDesktopShell()
  const router = useRouter()
  const explorer = windows.explorer
  const [history, setHistory] = useState<ExplorerLocation[]>(['root'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [openMenu, setOpenMenu] = useState<ExplorerMenu | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const menuBarRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const systemMenuRef = useRef<WindowSystemMenuHandle>(null)
  const windowRef = useRef<HTMLElement>(null)
  const pointerActivation = useRef(false)
  const previousActivation = useRef(explorer.activation)
  const location = history[historyIndex]
  const isVisible = explorer.mode === 'normal' || explorer.mode === 'maximized'
  const isActive = activeAppId === 'explorer' && isVisible
  const { positioned, positionStyle, resizeHandleProps, sized, titleBarProps, wasDraggedRecently } =
    useDraggableWindow({
      appId: 'explorer',
      minHeight: 300,
      minWidth: 420,
      mode: explorer.mode,
      resizable: true,
      windowRef,
    })

  const allItems = useMemo(() => locationItems(location, documents), [documents, location])
  const hasModifiedDates = allItems.some((item) => Boolean(item.modified))
  const effectiveSortKey = sortKey === 'modified' && !hasModifiedDates ? 'name' : sortKey
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return allItems
      .filter(
        (item) =>
          !needle ||
          item.name.toLocaleLowerCase().includes(needle) ||
          item.type.toLocaleLowerCase().includes(needle)
      )
      .sort((left, right) => compareItems(left, right, effectiveSortKey))
  }, [allItems, effectiveSortKey, query])

  useEffect(() => {
    if (!openMenu) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || menuBarRef.current?.contains(event.target)) return
      setOpenMenu(null)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  useEffect(() => {
    if (!isVisible || previousActivation.current === explorer.activation) return
    previousActivation.current = explorer.activation
    if (pointerActivation.current) {
      pointerActivation.current = false
      return
    }
    window.requestAnimationFrame(() => searchRef.current?.focus())
  }, [explorer.activation, isVisible])

  if (!isVisible) return null

  function navigateLocation(nextLocation: ExplorerLocation) {
    if (nextLocation === location) {
      setOpenMenu(null)
      return
    }

    setHistory((current) => [...current.slice(0, historyIndex + 1), nextLocation])
    setHistoryIndex((current) => current + 1)
    setQuery('')
    setOpenMenu(null)
  }

  function navigateHistory(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= history.length) return
    setHistoryIndex(nextIndex)
    setQuery('')
    setOpenMenu(null)
  }

  function openHref(href: string) {
    setOpenMenu(null)

    if (href.endsWith('.xml')) {
      window.open(withBasePath(href), '_blank', 'noopener,noreferrer')
      return
    }

    router.push(normalizeAppPath(href))
    openBrowser()
  }

  function toggleMenu(menu: ExplorerMenu) {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  const currentRoute = LOCATION_ROUTES[location]
  const emptyText =
    documentsStatus === 'error'
      ? 'The search index could not be read.'
      : documentsStatus === 'loading' && location !== 'root'
        ? 'Reading folder...'
        : query
          ? 'No files found.'
          : 'This folder is empty.'

  function minimizeExplorer() {
    setAppMode('explorer', 'minimized')
    focusAfterWindowChange('explorer', 'minimized')
  }

  function toggleExplorerMaximize() {
    setAppMode('explorer', explorer.mode === 'maximized' ? 'normal' : 'maximized')
  }

  function closeExplorer() {
    setAppMode('explorer', 'closed')
    focusAfterWindowChange('explorer', 'closed')
  }

  return (
    <div className="retro98 retro98--contents">
      <section
        ref={windowRef}
        className="desktop-explorer window"
        data-active={isActive ? 'true' : 'false'}
        data-window-positioned={positioned ? 'true' : undefined}
        data-window-sized={sized ? 'true' : undefined}
        data-window-state={explorer.mode}
        role="dialog"
        aria-label="Site Explorer"
        style={positionStyle}
        onPointerDown={() => {
          if (!isActive) {
            pointerActivation.current = true
            activateApp('explorer')
          }
        }}
        onFocusCapture={() => {
          if (!isActive) activateApp('explorer')
        }}
      >
        <div
          className={['desktop-explorer__titlebar title-bar', isActive ? null : 'inactive']
            .filter(Boolean)
            .join(' ')}
          title={explorer.mode === 'normal' ? 'Drag to move; double-click to maximize' : undefined}
          {...titleBarProps}
          onContextMenu={(event) => {
            if ((event.target as HTMLElement).closest('.desktop-explorer__controls')) return
            event.preventDefault()
            systemMenuRef.current?.open()
          }}
          onDoubleClick={(event) => {
            if ((event.target as HTMLElement).closest('button') || wasDraggedRecently()) return
            toggleExplorerMaximize()
          }}
        >
          <WindowSystemMenu
            ref={systemMenuRef}
            active={isActive}
            appTitle="Site Explorer"
            icon={<DesktopIcon variant="computer" size={16} />}
            maximized={explorer.mode === 'maximized'}
            onClose={closeExplorer}
            onMinimize={minimizeExplorer}
            onToggleMaximize={toggleExplorerMaximize}
          />
          <span className="desktop-explorer__title title-bar-text">
            Site Explorer - {LOCATION_NAMES[location]}
          </span>

          <span
            className="desktop-explorer__controls title-bar-controls"
            role="group"
            aria-label="Window controls"
          >
            <button
              type="button"
              className="desktop-explorer__control minimize"
              aria-label="Minimize Site Explorer"
              title="Minimize"
              onClick={minimizeExplorer}
            >
              <WindowControlGlyph variant="minimize" />
            </button>
            <button
              type="button"
              className={`desktop-explorer__control ${
                explorer.mode === 'maximized' ? 'restore' : 'maximize'
              }`}
              aria-label={
                explorer.mode === 'maximized' ? 'Restore Site Explorer' : 'Maximize Site Explorer'
              }
              aria-pressed={explorer.mode === 'maximized'}
              title={explorer.mode === 'maximized' ? 'Restore' : 'Maximize'}
              onClick={toggleExplorerMaximize}
            >
              <WindowControlGlyph
                variant={explorer.mode === 'maximized' ? 'restore' : 'maximize'}
              />
            </button>
            <button
              type="button"
              className="desktop-explorer__control close"
              aria-label="Close Site Explorer"
              title="Close"
              onClick={closeExplorer}
            >
              <WindowControlGlyph variant="close" />
            </button>
          </span>
        </div>

        <div ref={menuBarRef} className="desktop-explorer__menubar" aria-label="Explorer menu bar">
          <div className="desktop-explorer__menu">
            <button
              type="button"
              aria-expanded={openMenu === 'file'}
              aria-controls="explorer-file-menu"
              onClick={() => toggleMenu('file')}
            >
              File
            </button>
            {openMenu === 'file' && (
              <div id="explorer-file-menu" className="desktop-explorer__menu-popup">
                <button type="button" onClick={() => openHref(currentRoute)}>
                  <DesktopIcon variant="home" />
                  <span>Open</span>
                </button>
                <button type="button" onClick={() => openHref('/feed.xml')}>
                  <DesktopIcon variant="rss" />
                  <span>Open RSS Feed</span>
                </button>
                <span className="desktop-explorer__menu-separator" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    setAppMode('explorer', 'closed')
                    focusAfterWindowChange('explorer', 'closed')
                  }}
                >
                  <WindowControlGlyph variant="close" />
                  <span>Close</span>
                </button>
              </div>
            )}
          </div>

          <div className="desktop-explorer__menu">
            <button
              type="button"
              aria-expanded={openMenu === 'view'}
              aria-controls="explorer-view-menu"
              onClick={() => toggleMenu('view')}
            >
              View
            </button>
            {openMenu === 'view' && (
              <div id="explorer-view-menu" className="desktop-explorer__menu-popup">
                <button
                  type="button"
                  aria-pressed={effectiveSortKey === 'name'}
                  onClick={() => {
                    setSortKey('name')
                    setOpenMenu(null)
                  }}
                >
                  <span className="desktop-explorer__menu-check" aria-hidden="true">
                    {effectiveSortKey === 'name' ? '✓' : ''}
                  </span>
                  <span>Arrange by Name</span>
                </button>
                {hasModifiedDates && (
                  <button
                    type="button"
                    aria-pressed={effectiveSortKey === 'modified'}
                    onClick={() => {
                      setSortKey('modified')
                      setOpenMenu(null)
                    }}
                  >
                    <span className="desktop-explorer__menu-check" aria-hidden="true">
                      {effectiveSortKey === 'modified' ? '✓' : ''}
                    </span>
                    <span>Arrange by Date</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="desktop-explorer__menu">
            <button
              type="button"
              aria-expanded={openMenu === 'go'}
              aria-controls="explorer-go-menu"
              onClick={() => toggleMenu('go')}
            >
              Go
            </button>
            {openMenu === 'go' && (
              <div id="explorer-go-menu" className="desktop-explorer__menu-popup">
                {(Object.keys(LOCATION_NAMES) as ExplorerLocation[]).map((target) => (
                  <button
                    key={target}
                    type="button"
                    aria-current={target === location ? 'location' : undefined}
                    onClick={() => navigateLocation(target)}
                  >
                    <DesktopIcon variant={target === 'root' ? 'computer' : 'folder'} />
                    <span>{LOCATION_NAMES[target]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="desktop-explorer__menu">
            <button
              type="button"
              aria-expanded={openMenu === 'help'}
              aria-controls="explorer-help-menu"
              onClick={() => toggleMenu('help')}
            >
              Help
            </button>
            {openMenu === 'help' && (
              <div id="explorer-help-menu" className="desktop-explorer__menu-popup">
                <button type="button" onClick={() => openHref('/about')}>
                  <DesktopIcon variant="about" />
                  <span>About hitsuji.page</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="desktop-explorer__toolbar" aria-label="Explorer toolbar">
          <div className="desktop-explorer__tool-group" role="group" aria-label="Navigation">
            <button
              type="button"
              disabled={historyIndex === 0}
              aria-label="Back"
              title="Back"
              onClick={() => navigateHistory(historyIndex - 1)}
            >
              <DesktopIcon variant="back" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={historyIndex >= history.length - 1}
              aria-label="Forward"
              title="Forward"
              onClick={() => navigateHistory(historyIndex + 1)}
            >
              <DesktopIcon variant="forward" />
              <span>Forward</span>
            </button>
            <button
              type="button"
              disabled={location === 'root'}
              aria-label="Up"
              title="Up"
              onClick={() => navigateLocation('root')}
            >
              <DesktopIcon variant="up" />
              <span>Up</span>
            </button>
          </div>

          <label className="desktop-explorer__find">
            <DesktopIcon variant="search" />
            <span className="desktop-explorer__find-label">Named:</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              aria-label="File name"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="desktop-explorer__address">
          <span>Address</span>
          <output>
            <DesktopIcon variant={location === 'root' ? 'computer' : 'folder-open'} />
            <span>{LOCATION_LABELS[location]}</span>
          </output>
        </div>

        <div className="desktop-explorer__content sunken-panel">
          <table data-has-modified={hasModifiedDates ? 'true' : 'false'}>
            <thead>
              <tr>
                <th scope="col" aria-sort={effectiveSortKey === 'name' ? 'ascending' : 'none'}>
                  <button type="button" onClick={() => setSortKey('name')}>
                    Name
                  </button>
                </th>
                <th scope="col">Type</th>
                {hasModifiedDates && (
                  <th
                    scope="col"
                    aria-sort={effectiveSortKey === 'modified' ? 'descending' : 'none'}
                  >
                    <button type="button" onClick={() => setSortKey('modified')}>
                      Modified
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.kind === 'folder' ? `folder:${item.target}` : `link:${item.href}`}>
                  <td>
                    <button
                      type="button"
                      className="desktop-explorer__object"
                      title={`Open ${item.name}`}
                      onClick={() =>
                        item.kind === 'folder' ? navigateLocation(item.target) : openHref(item.href)
                      }
                    >
                      <DesktopIcon variant={item.icon} />
                      <span>{item.name}</span>
                    </button>
                  </td>
                  <td>{item.type}</td>
                  {hasModifiedDates && <td>{item.modified ?? '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          {visibleItems.length === 0 && <p className="desktop-explorer__empty">{emptyText}</p>}
        </div>

        <div className="desktop-explorer__status status-bar" role="status">
          <span className="status-bar-field">
            {visibleItems.length} object{visibleItems.length === 1 ? '' : 's'}
            {query ? ` of ${allItems.length}` : ''}
          </span>
          <span className="status-bar-field">{LOCATION_NAMES[location]}</span>
        </div>

        {explorer.mode === 'normal' && (
          <WindowResizeHandles
            accessibleName="Resize Site Explorer with the pointer or arrow keys"
            handleProps={resizeHandleProps}
          />
        )}
      </section>
    </div>
  )
}
