'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SearchButton from './SearchButton'
import ThemeSwitch from './ThemeSwitch'
import { IconArchive, IconMenuDeep, IconUnderline, IconX } from './icons/AstroPaperIcons'

const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
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

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      setMenuOpen(false)
      document.getElementById('menu-btn')?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <>
      <a
        id="skip-to-content"
        href="#main-content"
        className="absolute inset-s-16 -top-full z-50 border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-2 text-[var(--primary)] transition-all focus:top-4"
      >
        Skip to content
      </a>

      <header className="app-layout flex flex-col items-center justify-between sm:flex-row">
        <div className="relative flex w-full items-baseline justify-between border-b border-[var(--border)] bg-transparent py-4 sm:items-center sm:py-6">
          <Link
            href="/"
            aria-label={title}
            className="focus-outline absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--primary-hover)] sm:static sm:my-auto sm:text-2xl sm:leading-none"
            onClick={() => setMenuOpen(false)}
          >
            {title}
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
                '[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-[var(--primary-hover)]',
                'sm:[&>li>a]:px-2 sm:[&>li>a]:py-1',
                menuOpen ? 'grid' : 'hidden',
              ].join(' ')}
            >
              {headerNavLinks.map((link) => (
                <li key={link.title} className="col-span-2">
                  <Link
                    href={link.href}
                    className={isActive(link.href) ? 'active-nav' : undefined}
                    aria-current={isActive(link.href) ? 'page' : undefined}
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
                    'focus-outline flex size-full justify-center p-3 hover:text-[var(--primary-hover)] sm:relative sm:size-8 sm:p-0',
                    archivesActive ? 'active-nav' : '',
                  ].join(' ')}
                  aria-label="Archives"
                  aria-current={archivesActive ? 'page' : undefined}
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
