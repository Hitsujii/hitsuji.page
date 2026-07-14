'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SearchButton from './SearchButton'
import ThemeSwitch from './ThemeSwitch'
import DesktopIcon from './desktop/DesktopIcon'
import { useDesktopShell } from './desktop/DesktopShellContext'
import { pageTitleTransitionKey, pageTitleViewTransitionName } from './view-transitions'

const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { closeStart, startOpen } = useDesktopShell()
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
    if (startOpen) setMenuOpen(false)
  }, [startOpen])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      setMenuOpen(false)
      document.getElementById('menu-btn')?.focus()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (document.getElementById('nav-menu')?.contains(event.target)) return

      setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menuOpen])

  return (
    <>
      <a
        id="skip-to-content"
        href="#main-content"
        className="absolute inset-s-4 -top-full z-[90] border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-2 text-[var(--primary)] transition-all focus:top-2"
      >
        Skip to content
      </a>

      <header className="site-header">
        <div className="site-header__row app-layout relative flex w-full items-center gap-2 py-1">
          <div className="site-header__brand">
            <Link
              href="/"
              aria-label={`${title} home`}
              aria-current={pathname === '/' ? 'page' : undefined}
              className={[
                'site-mark-link focus-outline flex min-h-11 flex-none items-center px-2 text-xl leading-none whitespace-nowrap lg:min-h-8 lg:text-lg',
                pathname === '/' ? 'site-mark-link--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true" className="site-mark">
                <span className="site-mark__glyph">羊</span>
                <span className="site-mark__plus">++</span>
              </span>
            </Link>

            <span className="site-header__brand-copy" aria-hidden="true">
              <strong>hitsuji.page</strong>
              <small>personal C++ devlog</small>
            </span>
          </div>

          <nav
            id="nav-menu"
            className="flex min-w-0 flex-1 flex-col items-end lg:flex-row lg:justify-end"
            aria-label="Primary navigation"
          >
            <button
              id="menu-btn"
              className="header-menu-toggle focus-outline flex min-h-11 min-w-11 items-center justify-center self-end px-2 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-items"
              onClick={() =>
                setMenuOpen((open) => {
                  if (!open) closeStart()
                  return !open
                })
              }
              type="button"
            >
              <span>Menu</span>
              <span aria-hidden="true" className="header-menu-caret" />
            </button>

            <ul
              id="menu-items"
              className={[
                'header-menu-panel w-full grid-cols-1 lg:static lg:mt-0 lg:flex lg:w-auto lg:gap-x-px lg:gap-y-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:[&>li]:h-8',
                '[&>li>a]:flex [&>li>a]:min-h-11 [&>li>a]:items-center [&>li>a]:justify-start [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-start [&>li>a]:font-medium',
                'lg:[&>li>a]:h-full lg:[&>li>a]:min-h-0 lg:[&>li>a]:justify-center lg:[&>li>a]:px-2 lg:[&>li>a]:py-0 lg:[&>li>a]:text-center',
                menuOpen ? 'grid' : 'hidden',
              ].join(' ')}
            >
              {headerNavLinks.map((link) => {
                const active = isActive(link.href)
                const pageTransitionKey = active ? undefined : pageTitleTransitionKey(link.href)
                const viewTransitionName = pageTransitionKey
                  ? pageTitleViewTransitionName(pageTransitionKey)
                  : undefined
                const transitionStyle = viewTransitionName
                  ? ({ viewTransitionName } as CSSProperties)
                  : undefined

                return (
                  <li key={link.title} className="col-span-1 min-w-0">
                    <Link
                      href={link.href}
                      className={['nav-link', active ? 'active-nav' : ''].filter(Boolean).join(' ')}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <DesktopIcon className="header-menu-icon" variant={link.icon} />
                      <span style={transitionStyle}>{link.title}</span>
                    </Link>
                  </li>
                )
              })}
              <li className="header-menu-separator" aria-hidden="true" />
              <li className="col-span-1 min-w-0">
                <Link
                  href="/archives"
                  className={[
                    'header-tool focus-outline relative flex min-h-11 w-full items-center justify-center px-2 lg:min-h-8 lg:w-auto',
                    archivesActive ? 'active-nav' : '',
                  ].join(' ')}
                  aria-label="Archives"
                  aria-current={archivesActive ? 'page' : undefined}
                  title="Archives"
                  onClick={() => setMenuOpen(false)}
                >
                  <DesktopIcon className="header-menu-icon" variant="archive" />
                  <span>Archives</span>
                </Link>
              </li>

              <li className="col-span-1 flex min-w-0 items-center justify-center [&>*]:w-full lg:[&>*]:w-auto">
                <SearchButton active={searchActive} />
              </li>

              <li className="col-span-1 flex min-w-0 items-center justify-center [&>*]:w-full lg:[&>*]:w-auto">
                <ThemeSwitch />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}
