import type { SVGProps } from 'react'

export type WindowControlGlyphVariant = 'minimize' | 'maximize' | 'restore' | 'close'

export type WindowControlGlyphProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  label?: string
  size?: number | string
  variant: WindowControlGlyphVariant
}

function GlyphArtwork({ variant }: { variant: WindowControlGlyphVariant }) {
  switch (variant) {
    case 'minimize':
      return <rect x="2" y="9" width="8" height="2" fill="currentColor" />

    case 'maximize':
      return (
        <>
          <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" />
          <path d="M2 3.5h8" stroke="currentColor" strokeWidth="2" />
        </>
      )

    case 'restore':
      return (
        <>
          <path d="M3.5 3.5v-2h7v7h-2" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M4 3h6" stroke="currentColor" strokeWidth="2" />
          <rect x="1.5" y="3.5" width="7" height="7" fill="none" stroke="currentColor" />
          <path d="M2 5.5h6" stroke="currentColor" strokeWidth="2" />
        </>
      )

    case 'close':
      return (
        <path
          d="M1 1h2v2h2v2h2V3h2V1h2v2H9v2H7v2h2v2h2v2H9V9H7V7H5v2H3v2H1V9h2V7h2V5H3V3H1z"
          fill="currentColor"
        />
      )
  }
}

export default function WindowControlGlyph({
  variant,
  size = 10,
  label,
  className,
  width,
  height,
  role,
  focusable,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}: WindowControlGlyphProps) {
  const accessibleName = label ?? ariaLabel
  const hidden =
    ariaHidden === undefined ? !accessibleName : ariaHidden === true || ariaHidden === 'true'

  return (
    <svg
      {...props}
      className={['window-control-glyph', `window-control-glyph--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      focusable={focusable ?? 'false'}
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : accessibleName}
      role={role ?? (hidden ? undefined : 'img')}
    >
      <GlyphArtwork variant={variant} />
    </svg>
  )
}
