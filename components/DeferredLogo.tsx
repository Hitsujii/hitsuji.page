'use client'

import * as React from 'react'

import LogoStatic from './LogoStatic'
import type Logo from './Logo'

type AnimatedLogoProps = React.ComponentProps<typeof Logo>
type AnimatedLogoComponent = typeof Logo

const DEFERRED_LOGO_DELAY_MS = 6_000

const DeferredLogo = (props: AnimatedLogoProps) => {
  const [AnimatedLogo, setAnimatedLogo] = React.useState<AnimatedLogoComponent | null>(null)
  const hasStartedLoadingRef = React.useRef(false)

  const loadAnimatedLogo = React.useCallback(() => {
    if (hasStartedLoadingRef.current) return

    hasStartedLoadingRef.current = true

    void import('./Logo').then((module) => {
      React.startTransition(() => {
        setAnimatedLogo(() => module.default)
      })
    })
  }, [])

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timeoutId = window.setTimeout(loadAnimatedLogo, DEFERRED_LOGO_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadAnimatedLogo])

  if (!AnimatedLogo) {
    return (
      <LogoStatic
        className={props.className}
        decorative={props.decorative ?? props['aria-hidden'] === true}
        aria-label={props['aria-label']}
        onPointerEnter={loadAnimatedLogo}
        onFocus={loadAnimatedLogo}
        onClick={loadAnimatedLogo}
      />
    )
  }

  return <AnimatedLogo key="animated-logo" {...props} playIntro={props.playIntro ?? true} />
}

export default DeferredLogo
