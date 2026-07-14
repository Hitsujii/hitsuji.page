'use client'

import { useEffect, useRef, useState } from 'react'
import { Logo } from '@react95/icons/Logo'
import LocalTime from '@/components/LocalTime'
import DesktopCalendar from './DesktopCalendar'
import DesktopIcon from './DesktopIcon'
import { DESKTOP_APP_ORDER, useDesktopShell } from './DesktopShellContext'

const appIcons = {
  browser: 'browser',
  explorer: 'computer',
  terminal: 'terminal',
  frieren: 'cpp',
  find: 'search',
} as const

export default function DesktopTaskbar() {
  const {
    activeAppId,
    activateApp,
    closeStart,
    frierenCompiled,
    openBrowser,
    openExplorer,
    openFind,
    openFrierenExecutable,
    openTerminal,
    setAppMode,
    startOpen,
    toggleStart,
    windows,
  } = useDesktopShell()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const clockButtonRef = useRef<HTMLButtonElement>(null)
  const firstItemRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!startOpen) return

    setCalendarOpen(false)

    firstItemRef.current?.focus()

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (
        menuRef.current?.contains(event.target) ||
        startButtonRef.current?.contains(event.target)
      ) {
        return
      }
      closeStart()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      window.requestAnimationFrame(() => startButtonRef.current?.focus())
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeStart, startOpen])

  useEffect(() => {
    if (!calendarOpen) return

    window.requestAnimationFrame(() => {
      calendarRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    })

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (
        calendarRef.current?.contains(event.target) ||
        clockButtonRef.current?.contains(event.target)
      ) {
        return
      }
      setCalendarOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setCalendarOpen(false)
      window.requestAnimationFrame(() => clockButtonRef.current?.focus())
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [calendarOpen])

  const visibleApps = DESKTOP_APP_ORDER.map((id) => windows[id]).filter(
    (app) => app.present && app.mode !== 'closed'
  )

  return (
    <>
      {calendarOpen && (
        <div ref={calendarRef} className="desktop-calendar-shell">
          <DesktopCalendar />
        </div>
      )}

      {startOpen && (
        <nav
          ref={menuRef}
          id="desktop-start-menu"
          className="desktop-start-menu"
          aria-label="Start menu"
        >
          <div className="desktop-start-menu__brand" aria-hidden="true">
            <span>羊++</span>
          </div>

          <div className="desktop-start-menu__items">
            <button
              ref={firstItemRef}
              type="button"
              className="desktop-start-menu__item"
              onClick={openBrowser}
            >
              <DesktopIcon variant="browser" size={32} />
              <span>hitsuji.page</span>
            </button>

            <button type="button" className="desktop-start-menu__item" onClick={openExplorer}>
              <DesktopIcon variant="computer" size={32} />
              <span>Site Explorer</span>
            </button>

            <button type="button" className="desktop-start-menu__item" onClick={openTerminal}>
              <DesktopIcon variant="terminal" size={32} />
              <span>MS-DOS Prompt</span>
            </button>

            {frierenCompiled && (
              <button
                type="button"
                className="desktop-start-menu__item"
                onClick={openFrierenExecutable}
              >
                <DesktopIcon variant="cpp" size={32} />
                <span>frieren.exe</span>
              </button>
            )}

            <div className="desktop-start-menu__separator" aria-hidden="true" />

            <button type="button" className="desktop-start-menu__item" onClick={openFind}>
              <DesktopIcon variant="search" size={32} />
              <span>Find: All Files...</span>
            </button>
          </div>
        </nav>
      )}

      <div
        className="desktop-taskbar retro98"
        data-desktop-taskbar
        role="region"
        aria-label="Desktop taskbar"
      >
        <button
          ref={startButtonRef}
          type="button"
          className="desktop-taskbar__start"
          data-pressed={startOpen ? 'true' : undefined}
          aria-controls="desktop-start-menu"
          aria-expanded={startOpen}
          title="Start (Ctrl+Esc)"
          onClick={() => {
            setCalendarOpen(false)
            toggleStart()
          }}
        >
          <Logo variant="16x16_4" aria-hidden="true" className="desktop-taskbar__start-logo" />
          <span>Start</span>
        </button>

        <div className="desktop-taskbar__apps" role="group" aria-label="Running applications">
          {visibleApps.map((app) => {
            const isActive = activeAppId === app.id && app.mode !== 'minimized'

            return (
              <button
                key={app.id}
                type="button"
                className="desktop-taskbar__app"
                data-active={isActive ? 'true' : undefined}
                data-minimized={app.mode === 'minimized' ? 'true' : undefined}
                data-taskbar-app={app.id}
                aria-label={`${
                  isActive ? 'Minimize' : app.mode === 'minimized' ? 'Restore' : 'Activate'
                } ${app.title}`}
                aria-pressed={isActive}
                title={app.title}
                onClick={() => {
                  if (isActive) {
                    setAppMode(app.id, 'minimized')
                  } else {
                    activateApp(app.id)
                  }
                }}
              >
                <DesktopIcon variant={appIcons[app.id]} />
                <span>{app.title}</span>
              </button>
            )
          })}
        </div>

        <button
          ref={clockButtonRef}
          type="button"
          className="desktop-taskbar__tray"
          aria-label={calendarOpen ? 'Close calendar' : 'Open calendar'}
          aria-controls="desktop-calendar"
          aria-expanded={calendarOpen}
          title="Calendar"
          onClick={() => {
            closeStart()
            setCalendarOpen((open) => !open)
          }}
        >
          <LocalTime className="desktop-taskbar__clock" />
        </button>
      </div>
    </>
  )
}
