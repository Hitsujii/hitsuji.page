'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SearchButton from './SearchButton'
import ThemeSwitch from './ThemeSwitch'
import { IconArchive, IconMenuDeep, IconUnderline, IconX } from './icons/AstroPaperIcons'

const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'

type SheepState = 'idle' | 'eat' | 'turn' | 'run'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sheepState, setSheepState] = useState<SheepState>('idle')

  const sheepActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheepIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheepHoveringRef = useRef(false)

  const pathname = normalizePath(usePathname() || '/')
  const title =
    typeof siteMetadata.headerTitle === 'string' ? siteMetadata.headerTitle : siteMetadata.title

  const isActive = (href: string) => {
    const current = normalizePath(pathname)
    const target = normalizePath(href)

    if (target === '/') return current === '/'
    return current === target || current.startsWith(`${target}/`)
  }

  const archivesActive = isActive('/archives')
  const searchActive = isActive('/search')

  const clearSheepActionTimer = () => {
    if (sheepActionTimerRef.current) {
      clearTimeout(sheepActionTimerRef.current)
      sheepActionTimerRef.current = null
    }
  }

  const clearSheepIdleTimer = () => {
    if (sheepIdleTimerRef.current) {
      clearTimeout(sheepIdleTimerRef.current)
      sheepIdleTimerRef.current = null
    }
  }

  const scheduleRandomEating = () => {
    clearSheepIdleTimer()

    const delay = 4000 + Math.random() * 7000

    sheepIdleTimerRef.current = setTimeout(() => {
      if (sheepHoveringRef.current) return

      setSheepState('eat')

      sheepActionTimerRef.current = setTimeout(() => {
        setSheepState('idle')
        scheduleRandomEating()
      }, 1900)
    }, delay)
  }

  const startSheepRun = () => {
    sheepHoveringRef.current = true

    clearSheepIdleTimer()
    clearSheepActionTimer()

    setSheepState('turn')

    sheepActionTimerRef.current = setTimeout(() => {
      setSheepState('run')
    }, 220)
  }

  const stopSheepRun = () => {
    sheepHoveringRef.current = false

    clearSheepIdleTimer()
    clearSheepActionTimer()

    setSheepState('idle')
    scheduleRandomEating()
  }

  useEffect(() => {
    scheduleRandomEating()

    return () => {
      clearSheepIdleTimer()
      clearSheepActionTimer()
    }
  }, [])

  return (
    <>
      <a
        id="skip-to-content"
        href="#main-content"
        className="inset-s-16 absolute -top-full z-50 bg-[var(--background)] px-3 py-2 text-[var(--accent)] backdrop-blur-lg transition-all focus:top-4"
      >
        Skip to content
      </a>

      <header className="app-layout flex flex-col items-center justify-between sm:flex-row">
        <div className="relative flex w-full items-baseline justify-between border-b border-[var(--border)] bg-[var(--background)] pt-4 sm:items-center sm:pt-6">
          {/* <Link
            href="/"
            aria-label={title}
            className="absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap text-[var(--foreground)] hover:text-[var(--accent)] sm:static sm:my-auto sm:text-2xl sm:leading-none"
            onClick={() => setMenuOpen(false)}
          >
            {title}
          </Link> */}

          <Link
            href="/"
            aria-label={title}
            className="focus-outline absolute top-4 left-0 z-10 flex h-[54px] w-[75px] shrink-0 items-center sm:static sm:my-auto"
            onMouseEnter={startSheepRun}
            onMouseLeave={stopSheepRun}
            onFocus={startSheepRun}
            onBlur={stopSheepRun}
            onClick={() => setMenuOpen(false)}
          >
            <span className={`sheep-logo sheep-logo--${sheepState}`} aria-hidden="true" />
          </Link>

          <nav
            id="nav-menu"
            className="flex w-full flex-col items-center sm:ms-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
            aria-label="Primary navigation"
          >
            <button
              id="menu-btn"
              className="focus-outline self-end p-2 sm:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-items"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <IconX id="close-icon" className={menuOpen ? 'size-6' : 'hidden'} />
              <IconMenuDeep id="menu-icon" className={menuOpen ? 'hidden' : 'size-6'} />
            </button>

            <ul
              id="menu-items"
              className={[
                'mt-4 w-44 grid-cols-2 place-content-center gap-2 sm:mt-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0 sm:[&>li]:h-8',
                '[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-[var(--accent)]',
                'sm:[&>li>a]:px-2 sm:[&>li>a]:py-1',
                menuOpen ? 'grid' : 'hidden',
              ].join(' ')}
            >
              {headerNavLinks.map((link) => (
                <li key={link.title} className="col-span-2">
                  <Link
                    href={link.href}
                    className={isActive(link.href) ? 'active-nav' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
              <li className="col-span-2 sm:col-span-1">
                <Link
                  href="/archives"
                  className={[
                    'focus-outline flex size-full justify-center p-3 hover:text-[var(--accent)] sm:relative sm:size-8 sm:p-0',
                    archivesActive ? 'active-nav' : '',
                  ].join(' ')}
                  aria-label="Archives"
                  title="Archives"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconArchive className="hidden sm:absolute sm:top-1/2 sm:left-1/2 sm:block sm:size-6 sm:-translate-x-1/2 sm:-translate-y-1/2" />
                  <span className="sm:sr-only">Archives</span>
                  {archivesActive && (
                    <IconUnderline
                      aria-hidden="true"
                      className="scale-125 max-sm:hidden sm:absolute sm:bottom-0 sm:w-6"
                    />
                  )}
                </Link>
              </li>

              <li className="col-span-1 flex items-center justify-center">
                <SearchButton active={searchActive} />
              </li>

              <li className="col-span-1 flex items-center justify-center">
                <ThemeSwitch />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}
