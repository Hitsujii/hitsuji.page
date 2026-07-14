'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import DesktopIcon from './desktop/DesktopIcon'

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const syncThemeColor = () => {
    window.requestAnimationFrame(() => {
      const bg = window.getComputedStyle(document.body).backgroundColor
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((element) => element.setAttribute('content', bg))
    })
  }

  useEffect(() => {
    setMounted(true)
    syncThemeColor()
  }, [])

  useEffect(() => {
    if (mounted) syncThemeColor()
  }, [mounted, resolvedTheme])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const nextTheme = resolvedTheme === 'dark' ? 'Light' : 'Dark'
  const actionLabel = mounted ? `Use ${nextTheme} Colors` : 'Change Colors'

  return (
    <button
      id="theme-btn"
      type="button"
      className="header-tool header-tool--theme focus-outline relative flex min-h-11 items-center justify-center px-2 lg:min-h-8"
      aria-label={actionLabel}
      title={actionLabel}
      aria-live="polite"
      onClick={toggleTheme}
    >
      <DesktopIcon className="header-menu-icon" variant="appearance" />
      <span aria-hidden="true" className="dark:hidden">
        Use Dark Colors
      </span>
      <span aria-hidden="true" className="hidden dark:inline">
        Use Light Colors
      </span>
    </button>
  )
}
