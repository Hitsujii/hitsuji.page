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

type IdleDeadlineLike = {
  didTimeout: boolean
  timeRemaining: () => number
}

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout?: number }
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

const MIN_DEFERRED_LOGO_DELAY_MS = 2_000
const MAX_DEFERRED_LOGO_DELAY_MS = 9_000
const IDLE_RETRY_DELAY_MS = 450
const MIN_IDLE_BUDGET_MS = 14

const sleepStartMinutes = parseClockTime(siteAvailability.sleepStart)
const sleepEndMinutes = parseClockTime(siteAvailability.sleepEnd)

const DeferredLogo = (props: AnimatedLogoProps) => {
  const [AnimatedLogo, setAnimatedLogo] = React.useState<AnimatedLogoComponent | null>(null)
  const [shouldResolvePresenceImmediately, setShouldResolvePresenceImmediately] =
    React.useState(false)
  const hasStartedLoadingRef = React.useRef(false)

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const idleWindow = window as WindowWithIdleCallback
    const startedAt = performance.now()

    let isCancelled = false
    let minDelayTimeoutId: number | null = null
    let fallbackTimeoutId: number | null = null
    let retryTimeoutId: number | null = null
    let idleCallbackId: number | null = null

    const clearScheduledIdleCallback = () => {
      if (idleCallbackId === null) return

      idleWindow.cancelIdleCallback?.(idleCallbackId)
      idleCallbackId = null
    }

    const clearRetryTimeout = () => {
      if (retryTimeoutId === null) return

      window.clearTimeout(retryTimeoutId)
      retryTimeoutId = null
    }

    const scheduleRetry = (callback: () => void) => {
      clearRetryTimeout()
      retryTimeoutId = window.setTimeout(callback, IDLE_RETRY_DELAY_MS)
    }

    const shouldForceLoad = () => {
      return performance.now() - startedAt >= MAX_DEFERRED_LOGO_DELAY_MS
    }

    const tryLoadAnimatedLogo = () => {
      if (isCancelled || hasStartedLoadingRef.current) return

      if (!idleWindow.requestIdleCallback) {
        if (shouldForceLoad()) {
          loadAnimatedLogo()
          return
        }

        scheduleRetry(tryLoadAnimatedLogo)
        return
      }

      clearScheduledIdleCallback()

      idleCallbackId = idleWindow.requestIdleCallback((deadline) => {
        idleCallbackId = null

        if (isCancelled || hasStartedLoadingRef.current) return

        const hasEnoughIdleBudget = deadline.timeRemaining() >= MIN_IDLE_BUDGET_MS

        if (hasEnoughIdleBudget || shouldForceLoad()) {
          loadAnimatedLogo()
          return
        }

        scheduleRetry(tryLoadAnimatedLogo)
      })
    }

    minDelayTimeoutId = window.setTimeout(tryLoadAnimatedLogo, MIN_DEFERRED_LOGO_DELAY_MS)
    fallbackTimeoutId = window.setTimeout(loadAnimatedLogo, MAX_DEFERRED_LOGO_DELAY_MS)

    return () => {
      isCancelled = true

      if (minDelayTimeoutId !== null) {
        window.clearTimeout(minDelayTimeoutId)
      }

      if (fallbackTimeoutId !== null) {
        window.clearTimeout(fallbackTimeoutId)
      }

      clearRetryTimeout()
      clearScheduledIdleCallback()
    }
  }, [loadAnimatedLogo])

  if (!AnimatedLogo || !hasResolvedPresence) {
    return (
      <LogoStatic
        className={props.className}
        decorative={props.decorative ?? props['aria-hidden'] === true}
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
      forceSleep={shouldSleepAfterIntro}
      idleSleep={shouldSleepAfterIntro ? 'always' : props.idleSleep}
      idleSleepDelayMs={shouldSleepAfterIntro ? 0 : props.idleSleepDelayMs}
      playIntro={props.playIntro ?? true}
    />
  )
}

export default DeferredLogo
