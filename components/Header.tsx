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

      <header className="app-layout flex flex-col items-center justify-between md:flex-row">
        <div className="relative flex w-full items-baseline justify-between border-b border-[var(--border)] bg-transparent py-4 md:items-center md:py-6">
          <Link
            href="/"
            aria-label={`${title} home`}
            className="site-mark-link focus-outline absolute start-0 top-3.5 flex min-h-11 items-center py-1 text-xl leading-none whitespace-nowrap md:static md:h-10 md:min-h-0 md:py-0 md:text-[1.4375rem]"
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true" className="site-mark">
              <span className="site-mark__glyph">羊</span>
              <span className="site-mark__plus">++</span>
            </span>
          </Link>

          <nav
            id="nav-menu"
            className="flex w-full flex-col items-center md:ms-2 md:flex-row md:justify-end md:space-x-4 md:py-0"
            aria-label="Primary navigation"
          >
            <button
              id="menu-btn"
              className="focus-outline self-end p-2 md:hidden"
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
                'mt-4 w-44 grid-cols-2 place-content-center gap-2 md:mt-0 md:flex md:w-auto md:gap-x-5 md:gap-y-0 md:[&>li]:h-8',
                '[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-[var(--primary-hover)]',
                'md:[&>li>a]:px-2 md:[&>li>a]:py-1',
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
              <li className="col-span-2 md:col-span-1">
                <Link
                  href="/archives"
                  className={[
                    'focus-outline flex size-full justify-center p-3 hover:text-[var(--primary-hover)] md:relative md:size-8 md:p-0',
                    archivesActive ? 'active-nav' : '',
                  ].join(' ')}
                  aria-label="Archives"
                  aria-current={archivesActive ? 'page' : undefined}
                  title="Archives"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconArchive className="hidden md:absolute md:top-1/2 md:left-1/2 md:block md:size-6 md:-translate-x-1/2 md:-translate-y-1/2" />
                  <span className="md:sr-only">Archives</span>
                  {archivesActive && (
                    <IconUnderline
                      aria-hidden="true"
                      className="scale-125 max-md:hidden md:absolute md:bottom-0 md:w-6"
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
