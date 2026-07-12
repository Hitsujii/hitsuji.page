'use client'

import siteMetadata from '@/data/siteMetadata'
import { useEffect, useState } from 'react'

const ArrowUpIcon = ({ className = '' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="m18 11-6-6-6 6" />
  </svg>
)

const CommentIcon = ({ className = '' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    <path d="M8 9h8" />
    <path d="M8 13h5" />
  </svg>
)

const FloatingButton = ({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="focus-outline rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-2 text-[var(--foreground)] transition-all hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary-hover)]"
  >
    {children}
  </button>
)

export default function ScrollTopAndComment() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleWindowScroll = () => {
      const scrollTop = window.scrollY
      setShow(scrollTop > 50)
    }

    handleWindowScroll()

    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    window.addEventListener('resize', handleWindowScroll)

    return () => {
      window.removeEventListener('scroll', handleWindowScroll)
      window.removeEventListener('resize', handleWindowScroll)
    }
  }, [])

  return (
    <>
      <div
        className={[
          'fixed right-6 bottom-6 z-50 hidden flex-col gap-3 transition-all duration-200 md:flex',
          show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        ].join(' ')}
      >
        {siteMetadata.comments?.provider && (
          <FloatingButton
            label="Scroll to comment"
            onClick={() =>
              document.getElementById('comment')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <CommentIcon className="size-5" />
          </FloatingButton>
        )}

        <FloatingButton
          label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUpIcon className="size-5" />
        </FloatingButton>
      </div>
    </>
  )
}
