'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import siteMetadata from '@/data/siteMetadata'
import DesktopIcon from './DesktopIcon'
import { useDesktopShell } from './DesktopShellContext'
import { focusAfterWindowChange } from './focus-desktop'
import useDraggableWindow from './useDraggableWindow'
import WindowControlGlyph from './WindowControlGlyph'
import WindowResizeHandles from './WindowResizeHandles'
import WindowSystemMenu, { type WindowSystemMenuHandle } from './WindowSystemMenu'

export default function BrowserApp({ children }: { children: ReactNode }) {
  const { activeAppId, activateApp, setAppMode, windows } = useDesktopShell()
  const pathname = usePathname() || '/'
  const router = useRouter()
  const browser = windows.browser
  const contentRef = useRef<HTMLDivElement>(null)
  const pointerActivation = useRef(false)
  const previousActivation = useRef(browser.activation)
  const systemMenuRef = useRef<WindowSystemMenuHandle>(null)
  const windowRef = useRef<HTMLElement>(null)
  const isVisible = browser.mode === 'normal' || browser.mode === 'maximized'
  const isOpen = browser.mode !== 'closed'
  const isActive = activeAppId === 'browser' && isVisible
  const { positioned, positionStyle, resizeHandleProps, sized, titleBarProps, wasDraggedRecently } =
    useDraggableWindow({
      appId: 'browser',
      minHeight: 360,
      minWidth: 520,
      mode: browser.mode,
      resizable: true,
      windowRef,
    })

  const title = 'hitsuji.page - Web Browser'
  const address = `${siteMetadata.siteUrl.replace(/\/$/, '')}${pathname}`

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: 'start' })
      } else {
        contentRef.current?.scrollTo({ top: 0 })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return
      window.requestAnimationFrame(() =>
        document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: 'start' })
      )
    }

    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  useEffect(() => {
    if (!isVisible || previousActivation.current === browser.activation) return
    previousActivation.current = browser.activation
    if (pointerActivation.current) {
      pointerActivation.current = false
      return
    }

    window.requestAnimationFrame(() =>
      windowRef.current
        ?.querySelector<HTMLButtonElement>('.desktop-browser__toolbar button')
        ?.focus()
    )
  }, [browser.activation, isVisible])

  if (!isOpen) return null

  const minimize = () => {
    setAppMode('browser', 'minimized')
    focusAfterWindowChange('browser', 'minimized')
  }

  const toggleMaximize = () =>
    setAppMode('browser', browser.mode === 'maximized' ? 'normal' : 'maximized')

  const close = () => {
    setAppMode('browser', 'closed')
    focusAfterWindowChange('browser', 'closed')
  }

  return (
    <div className="retro98 retro98--contents">
      <section
        ref={windowRef}
        className="desktop-browser window"
        hidden={!isVisible}
        data-active={isActive ? 'true' : 'false'}
        data-window-positioned={positioned ? 'true' : undefined}
        data-window-sized={sized ? 'true' : undefined}
        data-window-state={browser.mode}
        aria-label="hitsuji.page web browser"
        style={positionStyle}
        onPointerDown={() => {
          if (!isActive) {
            pointerActivation.current = true
            activateApp('browser')
          }
        }}
        onFocusCapture={() => {
          if (!isActive) activateApp('browser')
        }}
      >
        <div
          className={['desktop-browser__titlebar title-bar', isActive ? null : 'inactive']
            .filter(Boolean)
            .join(' ')}
          title={browser.mode === 'normal' ? 'Drag to move; double-click to maximize' : undefined}
          {...titleBarProps}
          onContextMenu={(event) => {
            if ((event.target as HTMLElement).closest('.desktop-browser__controls')) return
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
            appTitle="hitsuji.page - Web Browser"
            icon={<DesktopIcon variant="browser" size={16} />}
            maximized={browser.mode === 'maximized'}
            onClose={close}
            onMinimize={minimize}
            onToggleMaximize={toggleMaximize}
          />
          <span className="desktop-browser__title title-bar-text" title={title}>
            {title}
          </span>
          <span
            className="desktop-browser__controls title-bar-controls"
            role="group"
            aria-label="Window controls"
          >
            <button
              type="button"
              className="desktop-browser__control minimize"
              aria-label="Minimize web browser"
              title="Minimize"
              onClick={minimize}
            >
              <WindowControlGlyph variant="minimize" />
            </button>
            <button
              type="button"
              className={`desktop-browser__control ${
                browser.mode === 'maximized' ? 'restore' : 'maximize'
              }`}
              aria-label={
                browser.mode === 'maximized' ? 'Restore web browser' : 'Maximize web browser'
              }
              aria-pressed={browser.mode === 'maximized'}
              title={browser.mode === 'maximized' ? 'Restore' : 'Maximize'}
              onClick={toggleMaximize}
            >
              <WindowControlGlyph variant={browser.mode === 'maximized' ? 'restore' : 'maximize'} />
            </button>
            <button
              type="button"
              className="desktop-browser__control close"
              aria-label="Close web browser"
              title="Close"
              onClick={close}
            >
              <WindowControlGlyph variant="close" />
            </button>
          </span>
        </div>

        <div className="desktop-browser__toolbar" role="toolbar" aria-label="Browser navigation">
          <button type="button" title="Back" aria-label="Back" onClick={() => router.back()}>
            <DesktopIcon variant="back" />
            <span>Back</span>
          </button>
          <button
            type="button"
            title="Forward"
            aria-label="Forward"
            onClick={() => router.forward()}
          >
            <DesktopIcon variant="forward" />
            <span>Forward</span>
          </button>
          <button type="button" title="Home" aria-label="Home" onClick={() => router.push('/')}>
            <DesktopIcon variant="home" />
            <span>Home</span>
          </button>
          <button type="button" title="Refresh" onClick={() => router.refresh()}>
            <DesktopIcon variant="refresh" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="desktop-browser__address">
          <label htmlFor="desktop-browser-address">Address</label>
          <output id="desktop-browser-address" title={address}>
            <DesktopIcon variant="document" />
            <span>{address}</span>
          </output>
        </div>

        <div className="desktop-browser__viewport">
          <div ref={contentRef} className="desktop-browser__document" data-browser-scroll-container>
            <div className="desktop-browser__site">{children}</div>
          </div>
          <div id="desktop-browser-overlay-root" className="desktop-browser__overlay-root" />
        </div>

        <div className="desktop-browser__status status-bar" aria-label="Browser status">
          <span className="status-bar-field">Done</span>
          <span className="status-bar-field">Internet</span>
        </div>

        {browser.mode === 'normal' && (
          <WindowResizeHandles
            accessibleName="Resize web browser. Use arrow keys; hold Shift for smaller steps."
            handleProps={resizeHandleProps}
          />
        )}
      </section>
    </div>
  )
}
