'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { normalizeAppPath } from '@/components/path-utils'
import DesktopIcon from './DesktopIcon'
import { useDesktopShell } from './DesktopShellContext'
import { focusAfterWindowChange } from './focus-desktop'
import useDraggableWindow from './useDraggableWindow'
import WindowControlGlyph from './WindowControlGlyph'
import WindowResizeHandles from './WindowResizeHandles'
import WindowSystemMenu, { type WindowSystemMenuHandle } from './WindowSystemMenu'

function documentFolder(path: string) {
  if (path.startsWith('#log-')) return 'C:\\HITSUJI.PAGE\\LOGS'

  const segments = path
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
  const root = segments.shift()?.toLocaleLowerCase()
  const folder =
    root === 'blog' ? 'POSTS' : root === 'notes' ? 'NOTES' : root === 'projects' ? 'PROJECTS' : null

  if (!folder) return 'C:\\HITSUJI.PAGE'

  segments.pop()
  const subdirectory = segments.map((segment) => segment.toLocaleUpperCase()).join('\\')
  return `C:\\HITSUJI.PAGE\\${folder}${subdirectory ? `\\${subdirectory}` : ''}`
}

export default function FindApp() {
  const { activeAppId, activateApp, documents, documentsStatus, openBrowser, setAppMode, windows } =
    useDesktopShell()
  const router = useRouter()
  const find = windows.find
  const [input, setInput] = useState('')
  const [query, setQuery] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const systemMenuRef = useRef<WindowSystemMenuHandle>(null)
  const windowRef = useRef<HTMLElement>(null)
  const previousActivation = useRef(find.activation)
  const isVisible = find.mode === 'normal' || find.mode === 'maximized'
  const isActive = activeAppId === 'find' && isVisible
  const { positioned, positionStyle, resizeHandleProps, sized, titleBarProps, wasDraggedRecently } =
    useDraggableWindow({
      appId: 'find',
      minHeight: 300,
      minWidth: 420,
      mode: find.mode,
      resizable: true,
      windowRef,
    })

  const results = useMemo(() => {
    if (query === null) return []
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return documents

    return documents.filter((document) =>
      [
        document.title,
        document.path,
        document.summary,
        document.body?.raw,
        ...(document.tags ?? []),
      ]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLocaleLowerCase().includes(normalized))
    )
  }, [documents, query])

  useEffect(() => {
    if (!isVisible || previousActivation.current === find.activation) return
    previousActivation.current = find.activation
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [find.activation, isVisible])

  if (!isVisible) return null

  const minimize = () => {
    setAppMode('find', 'minimized')
    focusAfterWindowChange('find', 'minimized')
  }
  const toggleMaximize = () =>
    setAppMode('find', find.mode === 'maximized' ? 'normal' : 'maximized')
  const close = () => {
    setAppMode('find', 'closed')
    focusAfterWindowChange('find', 'closed')
  }
  const openResult = (href: string) => {
    router.push(normalizeAppPath(href.startsWith('#') ? `/${href}` : href))
    openBrowser()
  }

  return (
    <div className="retro98 retro98--contents">
      <section
        ref={windowRef}
        className="desktop-find window"
        data-active={isActive ? 'true' : 'false'}
        data-window-positioned={positioned ? 'true' : undefined}
        data-window-sized={sized ? 'true' : undefined}
        data-window-state={find.mode}
        role="dialog"
        aria-label="Find: All Files"
        style={positionStyle}
        onPointerDown={() => {
          if (!isActive) activateApp('find')
        }}
        onFocusCapture={() => {
          if (!isActive) activateApp('find')
        }}
      >
        <div
          className={['desktop-find__titlebar title-bar', isActive ? null : 'inactive']
            .filter(Boolean)
            .join(' ')}
          title={find.mode === 'normal' ? 'Drag to move; double-click to maximize' : undefined}
          {...titleBarProps}
          onContextMenu={(event) => {
            if ((event.target as HTMLElement).closest('.desktop-find__controls')) return
            event.preventDefault()
            systemMenuRef.current?.open()
          }}
          onDoubleClick={(event) => {
            if ((event.target as HTMLElement).closest('button') || wasDraggedRecently()) return
            toggleMaximize()
          }}
        >
          <WindowSystemMenu
            ref={systemMenuRef}
            active={isActive}
            appTitle="Find: All Files"
            icon={<DesktopIcon variant="search" size={16} />}
            maximized={find.mode === 'maximized'}
            onClose={close}
            onMinimize={minimize}
            onToggleMaximize={toggleMaximize}
          />
          <span className="desktop-find__title title-bar-text">Find: All Files</span>
          <span
            className="desktop-find__controls title-bar-controls"
            role="group"
            aria-label="Window controls"
          >
            <button
              type="button"
              className="desktop-find__control minimize"
              aria-label="Minimize Find"
              title="Minimize"
              onClick={minimize}
            >
              <WindowControlGlyph variant="minimize" />
            </button>
            <button
              type="button"
              className={`desktop-find__control ${
                find.mode === 'maximized' ? 'restore' : 'maximize'
              }`}
              aria-label={find.mode === 'maximized' ? 'Restore Find' : 'Maximize Find'}
              aria-pressed={find.mode === 'maximized'}
              title={find.mode === 'maximized' ? 'Restore' : 'Maximize'}
              onClick={toggleMaximize}
            >
              <WindowControlGlyph variant={find.mode === 'maximized' ? 'restore' : 'maximize'} />
            </button>
            <button
              type="button"
              className="desktop-find__control close"
              aria-label="Close Find"
              title="Close"
              onClick={close}
            >
              <WindowControlGlyph variant="close" />
            </button>
          </span>
        </div>

        <form
          className="desktop-find__form"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(input)
          }}
        >
          <DesktopIcon variant="search" size={32} />
          <label htmlFor="desktop-find-input">Containing text:</label>
          <input
            ref={inputRef}
            id="desktop-find-input"
            type="search"
            value={input}
            autoComplete="off"
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" disabled={documentsStatus !== 'ready'}>
            Find Now
          </button>
        </form>

        <div className="desktop-find__results sunken-panel">
          {documentsStatus === 'error' ? (
            <p className="desktop-find__empty">The search index could not be read.</p>
          ) : documentsStatus === 'loading' ? (
            <p className="desktop-find__empty">Reading files...</p>
          ) : query === null ? (
            <p className="desktop-find__empty">Type the words to search for.</p>
          ) : results.length === 0 ? (
            <p className="desktop-find__empty">No files found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In Folder</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((document) => (
                  <tr key={document.path}>
                    <td>
                      <button type="button" onClick={() => openResult(document.path)}>
                        <DesktopIcon variant="document" />
                        <span>{document.title}</span>
                      </button>
                    </td>
                    <td>{documentFolder(document.path)}</td>
                    <td>{document.date?.slice(0, 10) ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="desktop-find__status status-bar" aria-live="polite">
          <span className="status-bar-field">
            {documentsStatus === 'error'
              ? 'The search index could not be read.'
              : documentsStatus === 'loading'
                ? 'Reading files...'
                : query === null
                  ? 'Ready.'
                  : `${results.length} ${results.length === 1 ? 'file' : 'files'} found.`}
          </span>
        </div>

        {find.mode === 'normal' && (
          <WindowResizeHandles
            accessibleName="Resize Find. Use arrow keys; hold Shift for smaller steps."
            handleProps={resizeHandleProps}
          />
        )}
      </section>
    </div>
  )
}
