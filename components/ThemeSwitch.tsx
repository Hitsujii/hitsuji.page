'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { IconMoon, IconSunHigh } from './icons/AstroPaperIcons'

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const syncThemeColor = () => {
    window.requestAnimationFrame(() => {
      const bg = window.getComputedStyle(document.body).backgroundColor
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
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

  return (
    <button
      id="theme-btn"
      type="button"
      className="focus-outline relative size-12 p-4 sm:size-8 hover:[&>svg]:stroke-[var(--accent)]"
      aria-label={mounted ? resolvedTheme || 'system' : 'theme'}
      aria-live="polite"
      onClick={toggleTheme}
    >
      <IconMoon className="absolute top-[50%] left-[50%] translate-[-50%] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <IconSunHigh className="absolute top-[50%] left-[50%] translate-[-50%] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  )
}
