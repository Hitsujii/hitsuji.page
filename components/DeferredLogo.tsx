'use client'

import * as React from 'react'

import {
  isTimeInRange,
  parseClockTime,
  siteAvailability,
  useCurrentTimeZoneMinutes,
} from './status/availability'
import { useLanyardPresence } from './status/useLanyardPresence'
import LogoStatic from './LogoStatic'
import type Logo from './Logo'

type AnimatedLogoProps = React.ComponentProps<typeof Logo>
type AnimatedLogoComponent = typeof Logo

const DEFERRED_LOGO_DELAY_MS = 4_000

const sleepStartMinutes = parseClockTime(siteAvailability.sleepStart)
const sleepEndMinutes = parseClockTime(siteAvailability.sleepEnd)

const DeferredLogo = (props: AnimatedLogoProps) => {
  const [AnimatedLogo, setAnimatedLogo] = React.useState<AnimatedLogoComponent | null>(null)
  const [shouldResolvePresenceImmediately, setShouldResolvePresenceImmediately] =
    React.useState(false)

  const hasStartedLoadingRef = React.useRef(false)
  const decorative =
    props.decorative ?? (props['aria-hidden'] === true || props['aria-hidden'] === 'true')

  const presenceStartDelayMs = shouldResolvePresenceImmediately ? 0 : undefined
  const { status, isLoading, hasError } = useLanyardPresence(
    undefined,
    undefined,
    true,
    presenceStartDelayMs
  )
  const currentMinutes = useCurrentTimeZoneMinutes(siteAvailability.timeZone)

  const isConfiguredSleepTime = isTimeInRange(currentMinutes, sleepStartMinutes, sleepEndMinutes)
  const isSleepPresenceStatus = status === 'idle' || status === 'offline'
  const shouldSleepAfterIntro = isSleepPresenceStatus && isConfiguredSleepTime
  const hasResolvedPresence = !isLoading || hasError || status !== null

  const loadAnimatedLogo = React.useCallback(() => {
    if (hasStartedLoadingRef.current) return

    hasStartedLoadingRef.current = true

    void import('./Logo').then((module) => {
      React.startTransition(() => {
        setAnimatedLogo(() => module.default)
      })
    })
  }, [])

  const loadInteractiveLogoImmediately = React.useCallback(() => {
    setShouldResolvePresenceImmediately(true)
    loadAnimatedLogo()
  }, [loadAnimatedLogo])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(loadAnimatedLogo, DEFERRED_LOGO_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadAnimatedLogo])

  if (!AnimatedLogo || !hasResolvedPresence) {
    return (
      <LogoStatic
        className={props.className}
        decorative={decorative}
        aria-label={props['aria-label']}
        onPointerDown={(event) => {
          props.onPointerDown?.(event)

          if (event.defaultPrevented) return
          if (!event.isPrimary) return
          if (event.button !== 0) return

          loadInteractiveLogoImmediately()
        }}
        onPointerEnter={(event) => {
          props.onPointerEnter?.(event)
          loadAnimatedLogo()
        }}
        onFocus={(event) => {
          props.onFocus?.(event)
          loadInteractiveLogoImmediately()
        }}
        onClick={props.onClick}
        style={props.style}
      />
    )
  }

  return (
    <AnimatedLogo
      key={shouldSleepAfterIntro ? 'animated-logo-sleep-after-intro' : 'animated-logo-awake'}
      {...props}
      decorative={decorative}
      forceSleep={shouldSleepAfterIntro}
      idleSleep={shouldSleepAfterIntro ? 'always' : props.idleSleep}
      idleSleepDelayMs={shouldSleepAfterIntro ? 0 : props.idleSleepDelayMs}
      playIntro={props.playIntro ?? true}
    />
  )
}

export default DeferredLogo
