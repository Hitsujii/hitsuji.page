'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function scrollRoot() {
  return (
    document.querySelector<HTMLElement>('[data-browser-scroll-container]') ??
    document.documentElement
  )
}

export default function BackToTopButton() {
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setOverlayRoot(document.getElementById('desktop-browser-overlay-root'))
  }, [])

  useEffect(() => {
    const rootElement = scrollRoot()
    let frameId: number | null = null

    const updateScrollState = () => {
      frameId = null
      const scrollTotal = rootElement.scrollHeight - rootElement.clientHeight
      const scrollTop = rootElement.scrollTop
      const nextPercent =
        scrollTotal > 0
          ? Math.min(100, Math.max(0, Math.floor((scrollTop / scrollTotal) * 100)))
          : 0

      setScrollPercent(nextPercent)
      setVisible(scrollTotal > 0 && scrollTop / scrollTotal > 0.3)
    }

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScrollState)
      }
    }

    updateScrollState()

    rootElement.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      rootElement.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const topProgressStyle = {
    width: `${scrollPercent}%`,
  } as CSSProperties

  const controls = (
    <>
      <div
        className="progress-container browser-progress-container z-10 h-px bg-[var(--background)]"
        aria-hidden="true"
      >
        <div
          id="myBar"
          className="progress-bar h-px bg-[var(--primary)]"
          style={topProgressStyle}
        />
      </div>

      <div
        id="btt-btn-container"
        className={[
          'back-to-top-shell-offset absolute inset-e-4 z-50',
          'transition-opacity duration-150',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!visible}
      >
        <button
          data-button="back-to-top"
          type="button"
          className={[
            'focus-outline inline-flex min-h-11 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 text-xs leading-none font-medium',
            'hover:border-[var(--primary)] hover:text-[var(--primary-hover)] md:min-h-10',
          ].join(' ')}
          aria-label="Back to top"
          tabIndex={visible ? undefined : -1}
          onClick={() =>
            scrollRoot().scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            })
          }
        >
          <span aria-hidden="true">[↑ top]</span>
        </button>
      </div>
    </>
  )

  return overlayRoot ? createPortal(controls, overlayRoot) : controls
}
