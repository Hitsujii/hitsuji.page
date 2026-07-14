'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

export type WindowSystemMenuHandle = {
  open: () => void
}

type WindowSystemMenuProps = {
  active: boolean
  appTitle: string
  icon: ReactNode
  maximized: boolean
  onClose: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
}

const WindowSystemMenu = forwardRef<WindowSystemMenuHandle, WindowSystemMenuProps>(
  function WindowSystemMenu(
    { active, appTitle, icon, maximized, onClose, onMinimize, onToggleMaximize },
    forwardedRef
  ) {
    const [open, setOpen] = useState(false)
    const menuId = useId()
    const rootRef = useRef<HTMLSpanElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const closeMenu = useCallback(() => setOpen(false), [])
    const openMenu = useCallback(() => setOpen(true), [])

    useImperativeHandle(
      forwardedRef,
      () => ({
        open: openMenu,
      }),
      [openMenu]
    )

    useEffect(() => {
      if (!open) return

      const focusFrame = window.requestAnimationFrame(() => {
        rootRef.current
          ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
          ?.focus()
      })

      const handlePointerDown = (event: PointerEvent) => {
        if (!(event.target instanceof Node) || rootRef.current?.contains(event.target)) return
        closeMenu()
      }

      document.addEventListener('pointerdown', handlePointerDown)
      return () => {
        window.cancelAnimationFrame(focusFrame)
        document.removeEventListener('pointerdown', handlePointerDown)
      }
    }, [closeMenu, open])

    useEffect(() => {
      if (!active) {
        closeMenu()
        return
      }

      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (open && event.key === 'Escape') {
          event.preventDefault()
          closeMenu()
          window.requestAnimationFrame(() => triggerRef.current?.focus())
          return
        }

        if (event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'Space') {
          event.preventDefault()
          openMenu()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [active, closeMenu, open, openMenu])

    const execute = (action: () => void) => {
      closeMenu()
      action()
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
      )
      if (items.length === 0) return

      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        triggerRef.current?.focus()
        return
      }

      const mnemonic = items.find((item) => item.dataset.menuKey === event.key.toLocaleLowerCase())
      if (mnemonic) {
        event.preventDefault()
        mnemonic.click()
        return
      }

      if (!['ArrowDown', 'ArrowUp', 'End', 'Home'].includes(event.key)) return

      event.preventDefault()
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
      const nextIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : event.key === 'ArrowDown'
              ? (currentIndex + 1 + items.length) % items.length
              : (currentIndex - 1 + items.length) % items.length
      items[nextIndex]?.focus()
    }

    return (
      <span
        ref={rootRef}
        className="desktop-system-menu"
        data-open={open ? 'true' : undefined}
        data-window-no-drag
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          ) {
            return
          }
          closeMenu()
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          className="desktop-system-menu__trigger"
          aria-controls={menuId}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-keyshortcuts="Alt+Space"
          aria-label={`Open the ${appTitle} window menu`}
          title="Window menu (Alt+Space; double-click to close)"
          onClick={() => setOpen((current) => !current)}
          onDoubleClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            execute(onClose)
          }}
        >
          {icon}
        </button>

        {open && (
          <div
            id={menuId}
            className="desktop-system-menu__popup"
            role="menu"
            tabIndex={-1}
            aria-label={`${appTitle} window menu`}
            onKeyDown={handleMenuKeyDown}
          >
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-menu-key="r"
              disabled={!maximized}
              onClick={() => execute(onToggleMaximize)}
            >
              <span>
                <u>R</u>estore
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-menu-key="n"
              onClick={() => execute(onMinimize)}
            >
              <span>
                Mi<u>n</u>imize
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-menu-key="x"
              disabled={maximized}
              onClick={() => execute(onToggleMaximize)}
            >
              <span>
                Ma<u>x</u>imize
              </span>
            </button>
            <span className="desktop-system-menu__separator" role="separator" />
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-menu-key="c"
              onClick={() => execute(onClose)}
            >
              <span>
                <u>C</u>lose
              </span>
            </button>
          </div>
        )}
      </span>
    )
  }
)

export default WindowSystemMenu
