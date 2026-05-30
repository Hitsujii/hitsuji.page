'use client'

import * as React from 'react'

import LogoStatic from './LogoStatic'
import type Logo from './Logo'

type AnimatedLogoProps = React.ComponentProps<typeof Logo>
type AnimatedLogoComponent = typeof Logo

const DEFERRED_LOGO_DELAY_MS = 2_500

const DeferredLogo = (props: AnimatedLogoProps) => {
  const [AnimatedLogo, setAnimatedLogo] = React.useState<AnimatedLogoComponent | null>(null)

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let isCancelled = false
    let hasStartedLoading = false
    let timeoutId: number | null = null
    let idleCallbackId: number | null = null

    const loadAnimatedLogo = () => {
      if (hasStartedLoading) return

      hasStartedLoading = true

      void import('./Logo').then((module) => {
        if (isCancelled) return

        React.startTransition(() => {
          setAnimatedLogo(() => module.default)
        })
      })
    }

    timeoutId = window.setTimeout(loadAnimatedLogo, DEFERRED_LOGO_DELAY_MS)

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(loadAnimatedLogo, {
        timeout: DEFERRED_LOGO_DELAY_MS,
      })
    }

    return () => {
      isCancelled = true

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      if (idleCallbackId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId)
      }
    }
  }, [])

  if (!AnimatedLogo) {
    return (
      <LogoStatic
        className={props.className}
        decorative={props.decorative ?? props['aria-hidden'] === true}
        aria-label={props['aria-label']}
      />
    )
  }

  return <AnimatedLogo key="animated-logo" {...props} playIntro={props.playIntro ?? true} />
}

export default DeferredLogo
