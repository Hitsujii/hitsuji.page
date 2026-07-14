'use client'

import { useCallback, useEffect, useId, useRef, type CSSProperties } from 'react'
import Image from './Image'
import DesktopIcon from './desktop/DesktopIcon'
import { useDesktopShell, type DesktopWindowMode } from './desktop/DesktopShellContext'
import { focusAfterWindowChange } from './desktop/focus-desktop'
import useDraggableWindow from './desktop/useDraggableWindow'
import WindowControlGlyph from './desktop/WindowControlGlyph'
import WindowSystemMenu, { type WindowSystemMenuHandle } from './desktop/WindowSystemMenu'

type AvatarWindowProps = {
  alt?: string
  className?: string
  fileName?: string
  priority?: boolean
  size?: number
  src?: string
}

type FocusTarget = 'close' | 'minimize' | 'taskbar'

export default function AvatarWindow({
  alt = 'Frieren holding a C++ programming book',
  className = '',
  fileName = 'frieren.exe',
  priority = false,
  size = 168,
  src = '/static/images/avatar.png',
}: AvatarWindowProps) {
  const {
    activeAppId,
    activateApp,
    setAppMode,
    windows: { frieren },
  } = useDesktopShell()
  const mode = frieren.mode
  const isMaximized = mode === 'maximized'
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const minimizeButtonRef = useRef<HTMLButtonElement>(null)
  const systemMenuRef = useRef<WindowSystemMenuHandle>(null)
  const windowRef = useRef<HTMLElement>(null)
  const pointerActivation = useRef(false)
  const pendingFocus = useRef<FocusTarget | null>(null)
  const previousActivation = useRef(frieren.activation)
  const imageId = useId()
  const isActive = activeAppId === 'frieren'
  const { positioned, positionStyle, titleBarProps, wasDraggedRecently } = useDraggableWindow({
    appId: 'frieren',
    mode,
    windowRef,
  })

  useEffect(() => {
    const focusTarget = pendingFocus.current
    if (!focusTarget) return

    pendingFocus.current = null
    switch (focusTarget) {
      case 'minimize':
        minimizeButtonRef.current?.focus()
        break
      case 'taskbar':
        document.querySelector<HTMLButtonElement>('[data-taskbar-app="frieren"]')?.focus()
        break
      default:
        closeButtonRef.current?.focus()
    }
  }, [mode])

  useEffect(() => {
    if (previousActivation.current === frieren.activation) return
    previousActivation.current = frieren.activation
    if (activeAppId !== 'frieren' || mode === 'minimized' || mode === 'closed') return
    if (pointerActivation.current) {
      pointerActivation.current = false
      return
    }

    window.requestAnimationFrame(() => closeButtonRef.current?.focus())
  }, [activeAppId, frieren.activation, mode, positioned])

  const changeMode = useCallback(
    (nextMode: DesktopWindowMode, focusTarget?: FocusTarget) => {
      if (nextMode === mode) return

      if (focusTarget) pendingFocus.current = focusTarget
      setAppMode('frieren', nextMode)
    },
    [mode, setAppMode]
  )

  const toggleMaximize = () => changeMode(isMaximized ? 'normal' : 'maximized', 'close')

  const frameStyle = { '--avatar-window-size': `${size}px` } as CSSProperties

  const closeWindow = () => {
    setAppMode('frieren', 'closed')
    focusAfterWindowChange('frieren', 'closed')
  }

  if (!frieren.present) return null

  if (mode === 'closed') {
    return <span className="sr-only">{fileName} is closed</span>
  }

  return (
    <div
      className={['avatar-window-frame', className].filter(Boolean).join(' ')}
      data-active={isActive ? 'true' : 'false'}
      data-frieren-window
      data-window-positioned={positioned ? 'true' : undefined}
      data-window-state={mode}
      data-maximized={isMaximized ? 'true' : undefined}
      style={frameStyle}
    >
      {mode === 'minimized' ? (
        <span className="sr-only">{fileName} is minimized to the taskbar</span>
      ) : (
        <div className="retro98 retro98--contents">
          <figure
            ref={windowRef}
            className="avatar-window window"
            data-active={isActive ? 'true' : 'false'}
            data-window-positioned={positioned ? 'true' : undefined}
            data-window-state={mode}
            style={positionStyle}
            onPointerDown={() => {
              if (activeAppId !== 'frieren') {
                pointerActivation.current = true
                activateApp('frieren')
              }
            }}
            onFocusCapture={() => {
              if (activeAppId !== 'frieren') activateApp('frieren')
            }}
          >
            <div
              className={['avatar-window__bar title-bar', isActive ? null : 'inactive']
                .filter(Boolean)
                .join(' ')}
              title={mode === 'normal' ? 'Drag to move; double-click to maximize' : undefined}
              {...titleBarProps}
              onContextMenu={(event) => {
                if ((event.target as HTMLElement).closest('.avatar-window__controls')) return
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
                appTitle={fileName}
                icon={<DesktopIcon variant="cpp" size={16} />}
                maximized={isMaximized}
                onClose={closeWindow}
                onMinimize={() => changeMode('minimized', 'taskbar')}
                onToggleMaximize={toggleMaximize}
              />
              <span className="avatar-window__filename title-bar-text" title={fileName}>
                {fileName}
              </span>

              <div
                className="avatar-window__controls title-bar-controls"
                role="group"
                aria-label="Window controls"
              >
                <button
                  ref={minimizeButtonRef}
                  type="button"
                  className="avatar-window__control avatar-window__control--minimize minimize"
                  aria-controls={imageId}
                  aria-expanded="true"
                  aria-label={`Minimize ${fileName}`}
                  title="Minimize to taskbar"
                  onClick={() => changeMode('minimized', 'taskbar')}
                >
                  <WindowControlGlyph variant="minimize" />
                </button>

                <button
                  type="button"
                  className={`avatar-window__control avatar-window__control--maximize ${
                    isMaximized ? 'restore' : 'maximize'
                  }`}
                  aria-controls={imageId}
                  aria-label={isMaximized ? `Restore ${fileName}` : `Maximize ${fileName}`}
                  aria-pressed={isMaximized}
                  title={isMaximized ? 'Restore' : 'Maximize'}
                  onClick={toggleMaximize}
                >
                  <WindowControlGlyph variant={isMaximized ? 'restore' : 'maximize'} />
                </button>

                <button
                  ref={closeButtonRef}
                  type="button"
                  className="avatar-window__control avatar-window__control--close close"
                  aria-label={`Close ${fileName}`}
                  title="Close"
                  onClick={closeWindow}
                >
                  <WindowControlGlyph variant="close" />
                </button>
              </div>
            </div>

            <div id={imageId} className="avatar-window__image">
              <Image
                src={src}
                alt={alt}
                width={736}
                height={736}
                priority={priority}
                sizes={isMaximized ? '100vw' : `${size}px`}
              />
            </div>

            <figcaption className="status-bar">
              <span className="status-bar-field">Ready</span>
              <span className="status-bar-field" aria-hidden="true">
                736 x 736 pixels
              </span>
            </figcaption>
          </figure>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {mode === 'normal' || mode === 'maximized'
          ? `${fileName} is open`
          : mode === 'minimized'
            ? `${fileName} is minimized`
            : `${fileName} exited with code zero`}
      </span>
    </div>
  )
}
