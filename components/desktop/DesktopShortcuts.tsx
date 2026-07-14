'use client'

import { useState } from 'react'
import DesktopIcon, { type DesktopIconVariant } from './DesktopIcon'
import { useDesktopShell } from './DesktopShellContext'

type Shortcut = {
  icon: DesktopIconVariant
  id: string
  label: string
  launch: () => void
}

export default function DesktopShortcuts() {
  const { compileAndRunFrieren, openBrowser, openExplorer, openFind, openTerminal, windows } =
    useDesktopShell()
  const [selected, setSelected] = useState<string | null>(null)
  const mobileWorkspaceCovered =
    (['browser', 'explorer', 'terminal', 'find'] as const).some(
      (id) => windows[id].mode === 'normal' || windows[id].mode === 'maximized'
    ) || windows.frieren.mode === 'maximized'
  const shortcuts: Shortcut[] = [
    { id: 'browser', label: 'hitsuji.page', icon: 'browser', launch: openBrowser },
    { id: 'explorer', label: 'Site Explorer', icon: 'computer', launch: openExplorer },
    { id: 'terminal', label: 'MS-DOS Prompt', icon: 'terminal', launch: openTerminal },
    { id: 'frieren', label: 'frieren.cpp', icon: 'cpp', launch: compileAndRunFrieren },
    { id: 'find', label: 'Find: All Files', icon: 'search', launch: openFind },
  ]

  return (
    <div
      className="desktop-shortcuts"
      data-mobile-covered={mobileWorkspaceCovered ? 'true' : undefined}
      role="group"
      aria-label="Desktop shortcuts"
    >
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.id}
          type="button"
          className="desktop-shortcut"
          data-selected={selected === shortcut.id ? 'true' : undefined}
          aria-label={`${shortcut.label}. Double-click to open.`}
          title={shortcut.label}
          onClick={() => {
            setSelected(shortcut.id)
            if (window.matchMedia('(hover: none), (pointer: coarse)').matches) shortcut.launch()
          }}
          onDoubleClick={shortcut.launch}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            shortcut.launch()
          }}
        >
          <DesktopIcon variant={shortcut.icon} size={32} />
          <span>{shortcut.label}</span>
        </button>
      ))}
    </div>
  )
}
