import type { DesktopAppId, DesktopWindowMode } from './DesktopShellContext'

const ACTIVE_WINDOW_FOCUS_TARGETS = [
  '.desktop-browser[data-active="true"] .desktop-browser__toolbar button',
  '.desktop-explorer[data-active="true"] .desktop-explorer__find input',
  '.desktop-terminal[data-active="true"] #desktop-terminal-input',
  '.desktop-find[data-active="true"] #desktop-find-input',
  '.avatar-window[data-active="true"] .avatar-window__control--close',
].join(',')

export function focusAfterWindowChange(id: DesktopAppId, mode: DesktopWindowMode) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const activeWindowTarget = document.querySelector<HTMLElement>(ACTIVE_WINDOW_FOCUS_TARGETS)
      if (activeWindowTarget) {
        activeWindowTarget.focus()
        return
      }

      const fallbackSelector =
        mode === 'minimized' ? `[data-taskbar-app="${id}"]` : '.desktop-taskbar__start'
      document.querySelector<HTMLElement>(fallbackSelector)?.focus()
    })
  })
}
