'use client'

import * as React from 'react'
import type { SVGProps } from 'react'
import { interpolate } from 'flubber'
import svgpath from 'svgpath'

import {
  isTimeInRange,
  parseClockTime,
  siteAvailability,
  useCurrentTimeZoneMinutes,
} from '@/components/status/availability'
import { useLanyardPresence } from '@/components/status/useLanyardPresence'
type MotionFrame = Readonly<{
  t: number
  y: number
  sx: number
  sy: number
  shape: number
  faceY: number
  faceSx: number
  faceSy: number
}>

type IdleSleepMode = 'presence' | 'always' | 'off'

type LogoProps = SVGProps<SVGSVGElement> & {
  title?: string
  decorative?: boolean
  playIntro?: boolean
  playOnInteraction?: boolean
  idleSleep?: IdleSleepMode
  idleSleepDelayMs?: number
  forceSleep?: boolean
}

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const PRESENCE_SLEEP_START_DELAY_MS = 0

const INTRO_DELAY_MS = 160
const INTRO_DURATION_MS = 860
const CLICK_DURATION_MS = 640

const IDLE_SLEEP_DELAY_MS = 10_000
const SLEEP_BREATH_DURATION_MS = 3800
const SLEEP_ENTER_DURATION_MS = 720

const MORPH_MAX_SEGMENT_LENGTH = 4
const MORPH_CACHE_STEPS = 180

const FACE_BASE_TRANSFORM = 'matrix(.53039 0 0 .53039 -207.485 -362.382)'

const CIRCLE_FACE_X = 31
const CIRCLE_FACE_Y = -70
const CIRCLE_FACE_SCALE = 0.82

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

const stageMotionStyle = {
  transformBox: 'fill-box',
  transformOrigin: '50% 92%',
  backfaceVisibility: 'hidden',
  willChange: 'transform',
} as React.CSSProperties

const faceMotionStyle = {
  transformBox: 'fill-box',
  transformOrigin: '50% 28%',
  backfaceVisibility: 'hidden',
  willChange: 'transform',
} as React.CSSProperties

const sleepLayerStyle = {
  transformBox: 'fill-box',
  transformOrigin: '50% 92%',
  backfaceVisibility: 'hidden',
  willChange: 'transform',
} as React.CSSProperties

const sleepFaceStyle = {
  transformBox: 'fill-box',
  transformOrigin: '50% 28%',
  backfaceVisibility: 'hidden',
  willChange: 'transform',
} as React.CSSProperties

const sleepZzzStyle = {
  transformBox: 'fill-box',
  transformOrigin: '50% 50%',
  pointerEvents: 'none',
  userSelect: 'none',
} as React.CSSProperties

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined') return false

  return window.matchMedia(MOTION_QUERY).matches
}

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(getPrefersReducedMotion)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MOTION_QUERY)

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    handleChange()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }

    mediaQuery.addListener(handleChange)

    return () => {
      mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

const FLAT_BODY_RAW =
  'M199.963 0c-10.27.006-20.54 3.91-29.078 11.707-10.822 9.883-23.765 13.449-38.192 10.81-12.84-2.348-24.475.24-35.054 7.735C88.45 36.761 83.17 45.944 79.365 56.35c-4.782 13.074-13.68 22.74-26.816 27.554-21.575 7.908-35.095 30.916-30.988 55.252 2.534 15.02-.555 28.74-9.997 40.795-10.007 12.78-13.708 27.077-10.363 42.951 1.965 9.327 5.635 17.93 13.404 24.118 6.246 4.974 13.537 6.314 21.329 6.314 108.53-.04 217.058-.027 325.587-.027 2.223 0 4.455.077 6.668-.077 8.63-.598 16.377-3.504 21.616-10.591 10.44-14.125 12.704-29.763 7.515-46.543-2.321-7.508-6.947-13.61-11.677-19.932-7.11-11.26-9.27-23.265-7.44-36.184.647-4.563 1.059-9.29.625-13.853-1.83-19.266-11.273-33.67-29.295-41.143-15.035-6.234-24.89-16.54-30.199-31.779-7.954-22.835-30.815-35.159-52.719-30.633-14.098 2.913-26.93-1.177-37.572-10.89-8.54-7.795-18.81-11.688-29.08-11.682'

const CIRCLE_BODY_RAW =
  'M721.085 683.244c-16.937.01-33.874 6.449-47.955 19.307-17.847 16.298-39.191 22.18-62.983 17.828-21.175-3.872-40.364.397-57.81 12.756-15.155 10.734-23.86 25.879-30.137 43.039-7.887 21.561-22.56 37.502-44.224 45.442-35.58 13.04-57.877 50.985-51.105 91.119 4.18 24.771-.914 47.395-16.485 67.277-.737.941-1.315 1.92-2.01 2.87-.155.202-.33.367-.483.574a98 98 0 0 0-3.955 5.765c-13.793 21.76-16.296 45.581-8.44 70.991.976 3.156 2.199 6.162 3.608 9.061 1.843 4.082 4.072 7.962 6.784 11.567 2.784 4.133 5.811 8.16 8.867 12.243 11.723 18.57 15.286 38.367 12.269 59.672-1.066 7.526-1.746 15.323-1.03 22.847 3.018 31.772 18.59 55.526 48.311 67.85 24.795 10.282 41.049 27.277 49.803 52.41 13.118 37.658 50.82 57.982 86.942 50.518 23.25-4.804 44.413 1.941 61.963 17.96 28.166 25.71 67.75 25.675 95.912-.042 17.847-16.298 39.191-22.18 62.983-17.828 21.175 3.872 40.364-.396 57.811-12.755 15.154-10.735 23.859-25.88 30.136-43.04 7.887-21.561 22.561-37.501 44.224-45.441 35.58-13.041 57.877-50.986 51.105-91.12-4.18-24.77.914-47.395 16.485-67.277.732-.935 1.306-1.909 1.997-2.854.16-.207.34-.378.496-.59a98 98 0 0 0 3.994-5.833c13.756-21.742 16.25-45.538 8.4-70.923-.978-3.166-2.205-6.18-3.62-9.087-1.837-4.065-4.058-7.93-6.758-11.521-2.788-4.14-5.82-8.173-8.88-12.262-11.723-18.57-15.286-38.368-12.269-59.673 1.066-7.526 1.746-15.323 1.03-22.847-3.018-31.772-18.59-55.526-48.311-67.85-24.795-10.281-41.049-27.277-49.803-52.41-13.118-37.658-50.82-57.982-86.942-50.518-23.25 4.804-44.413-1.94-61.962-17.96-14.084-12.855-31.021-19.275-47.958-19.265z'

const FACE_PATH =
  'M763 835.201c29.322-.045 58.143-.131 86.965-.12 16.337.005 27.915 11.21 27.915 26.83 0 15.792-11.345 26.954-27.666 27.074-12.161.09-24.323.021-36.485.024h-5.845c.29 3.443.611 6.217.745 9 1.778 37.05-4.11 72.456-23.72 104.561-10.816 17.707-24.913 32.114-45.287 38.842-20.837 6.88-39.886 2.469-57.012-10.39-21.675-16.274-33.809-39-41.497-64.36-7.131-23.523-9.5-47.603-7.363-72.11.1-1.137.013-2.29.013-4.169-8.288 0-16.383.016-24.478-.005-7.159-.018-14.35.346-21.47-.21-14.025-1.094-23.648-12.455-23.707-27.315-.058-14.3 9.654-26.172 23.489-26.91 16.116-.86 32.299-.56 48.454-.597 42.15-.097 84.3-.103 126.949-.145m-58.381 140.681 16.44 17.57c2.81-3.363 4.573-5.798 6.661-7.912 8.065-8.163 16.27-16.187 24.348-24.338 3.41-3.442 3.568-7.562.663-10.67-2.958-3.166-6.923-3.148-10.605.143-1.61 1.439-3.116 3-4.615 4.557-5.28 5.483-10.538 10.988-16.706 17.426-7.228-7.613-13.658-14.536-20.265-21.286-3.909-3.994-8.246-4.156-11.321-.793-2.946 3.222-2.53 7.296 1.162 11.017 4.568 4.606 9.156 9.193 14.238 14.286'

const CHECK_PATH =
  'M704.368 975.633c-4.83-4.844-9.419-9.43-13.987-14.037-3.691-3.72-4.108-7.795-1.162-11.017 3.075-3.362 7.412-3.2 11.321.793 6.607 6.75 13.037 13.673 20.265 21.286 6.168-6.438 11.425-11.943 16.706-17.426 1.5-1.557 3.005-3.118 4.615-4.557 3.682-3.29 7.647-3.309 10.605-.144 2.905 3.11 2.747 7.23-.663 10.671-8.077 8.152-16.283 16.175-24.348 24.338-2.088 2.114-3.851 4.55-6.662 7.912a14921 14921 0 0 0-16.69-17.819'

const FLAT_BODY = svgpath(FLAT_BODY_RAW).matrix([0.87469, 0, 0, 0.87469, 0, 0]).round(3).toString()

const CIRCLE_BODY = svgpath(CIRCLE_BODY_RAW)
  .matrix([0.53039, 0, 0, 0.53039, -207.423, -362.382])
  .matrix([0.82, 0, 0, 0.82, 31, -70])
  .round(3)
  .toString()

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const smooth = (value: number) => {
  const clamped = clamp01(value)

  return clamped * clamped * (3 - 2 * clamped)
}

const mix = (from: number, to: number, progress: number) => {
  return from + (to - from) * progress
}

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 1000) / 1000

  return Object.is(rounded, -0) ? '0' : String(rounded)
}

const interpolateBodyPath = interpolate(FLAT_BODY, CIRCLE_BODY, {
  maxSegmentLength: MORPH_MAX_SEGMENT_LENGTH,
})

const getMorphPathSample = (progress: number) => {
  const index = Math.round(clamp01(progress) * MORPH_CACHE_STEPS)

  return {
    index,
    path: interpolateBodyPath(index / MORPH_CACHE_STEPS),
  }
}

const introFrames: readonly MotionFrame[] = [
  { t: 0, y: 0, sx: 1, sy: 1, shape: 0, faceY: 0, faceSx: 1, faceSy: 1 },
  { t: 0.12, y: 6, sx: 1.13, sy: 0.82, shape: 0.06, faceY: 3, faceSx: 1.06, faceSy: 0.91 },
  { t: 0.29, y: -30, sx: 0.93, sy: 1.12, shape: 1, faceY: -6, faceSx: 0.96, faceSy: 1.09 },
  { t: 0.45, y: -20, sx: 0.99, sy: 1.03, shape: 0.9, faceY: -4, faceSx: 0.98, faceSy: 1.04 },
  { t: 0.61, y: 6, sx: 1.16, sy: 0.8, shape: 0.22, faceY: 4, faceSx: 1.07, faceSy: 0.89 },
  { t: 0.77, y: -8, sx: 0.98, sy: 1.06, shape: 0.05, faceY: -2, faceSx: 0.99, faceSy: 1.04 },
  { t: 0.9, y: 2, sx: 1.03, sy: 0.98, shape: 0, faceY: 1, faceSx: 1.01, faceSy: 0.99 },
  { t: 1, y: 0, sx: 1, sy: 1, shape: 0, faceY: 0, faceSx: 1, faceSy: 1 },
]

const clickFrames: readonly MotionFrame[] = [
  { t: 0, y: 0, sx: 1, sy: 1, shape: 0, faceY: 0, faceSx: 1, faceSy: 1 },
  { t: 0.1, y: 5, sx: 1.12, sy: 0.83, shape: 0.06, faceY: 3, faceSx: 1.05, faceSy: 0.91 },
  { t: 0.27, y: -28, sx: 0.94, sy: 1.1, shape: 1, faceY: -6, faceSx: 0.96, faceSy: 1.08 },
  { t: 0.44, y: -17, sx: 1, sy: 1.01, shape: 0.8, faceY: -3, faceSx: 0.98, faceSy: 1.03 },
  { t: 0.62, y: 5, sx: 1.14, sy: 0.82, shape: 0.18, faceY: 4, faceSx: 1.06, faceSy: 0.9 },
  { t: 0.78, y: -6, sx: 0.99, sy: 1.05, shape: 0.04, faceY: -2, faceSx: 0.99, faceSy: 1.03 },
  { t: 0.9, y: 2, sx: 1.02, sy: 0.99, shape: 0, faceY: 1, faceSx: 1.01, faceSy: 0.99 },
  { t: 1, y: 0, sx: 1, sy: 1, shape: 0, faceY: 0, faceSx: 1, faceSy: 1 },
]

const sampleFrames = (frames: readonly MotionFrame[], progress: number): MotionFrame => {
  const firstFrame = frames[0]
  const lastFrame = frames[frames.length - 1]

  if (!firstFrame || !lastFrame) {
    throw new Error('Logo animation requires at least one motion frame.')
  }

  const p = clamp01(progress)

  if (p <= firstFrame.t) return firstFrame
  if (p >= lastFrame.t) return lastFrame

  for (let i = 0; i < frames.length - 1; i += 1) {
    const current = frames[i]
    const next = frames[i + 1]

    if (!current || !next) continue
    if (p < current.t || p > next.t) continue

    const span = next.t - current.t
    const local = span === 0 ? 1 : smooth((p - current.t) / span)

    return {
      t: p,
      y: mix(current.y, next.y, local),
      sx: mix(current.sx, next.sx, local),
      sy: mix(current.sy, next.sy, local),
      shape: mix(current.shape, next.shape, local),
      faceY: mix(current.faceY, next.faceY, local),
      faceSx: mix(current.faceSx, next.faceSx, local),
      faceSy: mix(current.faceSy, next.faceSy, local),
    }
  }

  return lastFrame
}

const Logo = ({
  className,
  onPointerDown,
  onPointerEnter,
  onFocus,
  onKeyDown,
  onClick,
  style,
  title = 'Logo',
  decorative = false,
  playIntro = true,
  playOnInteraction = true,
  idleSleep = 'presence',
  idleSleepDelayMs = IDLE_SLEEP_DELAY_MS,
  forceSleep = false,
  role,
  tabIndex,
  focusable,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: LogoProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldUsePresenceSleep = idleSleep !== 'off' && idleSleep !== 'always'
  const { status: discordStatus } = useLanyardPresence(
    undefined,
    undefined,
    shouldUsePresenceSleep,
    PRESENCE_SLEEP_START_DELAY_MS
  )
  const currentMinutes = useCurrentTimeZoneMinutes(
    siteAvailability.timeZone,
    shouldUsePresenceSleep,
    PRESENCE_SLEEP_START_DELAY_MS
  )
  const sleepStartMinutes = parseClockTime(siteAvailability.sleepStart)
  const sleepEndMinutes = parseClockTime(siteAvailability.sleepEnd)
  const [isSleeping, setIsSleeping] = React.useState(false)
  const [isSleepEntering, setIsSleepEntering] = React.useState(false)
  const titleId = React.useId()

  const bodyRef = React.useRef<SVGPathElement>(null)
  const stageRef = React.useRef<SVGGElement>(null)
  const facePositionRef = React.useRef<SVGGElement>(null)
  const faceJellyRef = React.useRef<SVGGElement>(null)

  const rafRef = React.useRef<number | null>(null)
  const introDelayRef = React.useRef<number | null>(null)
  const idleSleepDelayRef = React.useRef<number | null>(null)
  const lastMorphIndexRef = React.useRef<number | null>(null)
  const hasIntroSettledRef = React.useRef(false)
  const isSleepingRef = React.useRef(false)
  const scheduleIdleSleepRef = React.useRef<(() => void) | null>(null)

  const isInteractive = Boolean(
    playOnInteraction && (onPointerDown || onClick || role === 'button')
  )

  const resolvedRole = decorative ? undefined : (role ?? (isInteractive ? 'button' : 'img'))
  const resolvedTabIndex = tabIndex ?? (isInteractive ? 0 : undefined)
  const resolvedFocusable = focusable ?? (isInteractive ? true : undefined)

  const resolvedAriaLabel = decorative ? undefined : ariaLabel
  const resolvedAriaLabelledBy =
    decorative || ariaLabel ? ariaLabelledBy : (ariaLabelledBy ?? titleId)

  const isConfiguredSleepTime = isTimeInRange(currentMinutes, sleepStartMinutes, sleepEndMinutes)
  const isSleepPresenceStatus = discordStatus === 'idle' || discordStatus === 'offline'

  const shouldSleepFastFromPresence = forceSleep || (isSleepPresenceStatus && isConfiguredSleepTime)

  const canUseIdleSleep =
    idleSleep === 'always' || (idleSleep === 'presence' && shouldSleepFastFromPresence)

  const shouldScheduleIdleSleep = idleSleep !== 'off' && canUseIdleSleep

  const svgStyle = React.useMemo<React.CSSProperties>(
    () => ({
      overflow: 'visible',
      ...(isInteractive ? { cursor: 'pointer' } : null),
      ...style,
    }),
    [isInteractive, style]
  )

  const clearIntroDelay = React.useCallback(() => {
    if (introDelayRef.current === null) return

    window.clearTimeout(introDelayRef.current)
    introDelayRef.current = null
  }, [])

  const clearIdleSleepDelay = React.useCallback(() => {
    if (idleSleepDelayRef.current === null) return

    window.clearTimeout(idleSleepDelayRef.current)
    idleSleepDelayRef.current = null
  }, [])

  const stopAnimation = React.useCallback(() => {
    if (rafRef.current === null) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const exitSleep = React.useCallback(() => {
    isSleepingRef.current = false
    setIsSleeping(false)
    setIsSleepEntering(false)
  }, [])

  const enterSleep = React.useCallback(() => {
    if (!isSleepingRef.current && !prefersReducedMotion) {
      setIsSleepEntering(true)
    }

    isSleepingRef.current = true
    setIsSleeping(true)
  }, [prefersReducedMotion])

  const scheduleIdleSleep = React.useCallback(() => {
    clearIdleSleepDelay()

    if (!shouldScheduleIdleSleep) {
      exitSleep()
      return
    }

    if (!hasIntroSettledRef.current && playIntro && !prefersReducedMotion) {
      return
    }

    if (shouldSleepFastFromPresence) {
      enterSleep()
      return
    }

    exitSleep()

    idleSleepDelayRef.current = window.setTimeout(
      () => {
        idleSleepDelayRef.current = null
        enterSleep()
      },
      Math.max(0, idleSleepDelayMs)
    )
  }, [
    clearIdleSleepDelay,
    enterSleep,
    exitSleep,
    idleSleepDelayMs,
    playIntro,
    prefersReducedMotion,
    shouldScheduleIdleSleep,
    shouldSleepFastFromPresence,
  ])

  scheduleIdleSleepRef.current = scheduleIdleSleep

  const wakeLogo = React.useCallback(() => {
    if (shouldSleepFastFromPresence) return

    if (isSleeping) {
      exitSleep()
    }

    scheduleIdleSleep()
  }, [exitSleep, isSleeping, scheduleIdleSleep, shouldSleepFastFromPresence])

  const applyFrame = React.useCallback((frame: MotionFrame) => {
    const shapeProgress = clamp01(frame.shape)
    const morphSample = getMorphPathSample(shapeProgress)

    if (bodyRef.current && lastMorphIndexRef.current !== morphSample.index) {
      bodyRef.current.setAttribute('d', morphSample.path)
      lastMorphIndexRef.current = morphSample.index
    }

    if (stageRef.current) {
      stageRef.current.style.transform = [
        `translate3d(0, ${formatNumber(frame.y)}px, 0)`,
        `scale(${formatNumber(frame.sx)}, ${formatNumber(frame.sy)})`,
      ].join(' ')
    }

    if (facePositionRef.current) {
      const faceX = mix(0, CIRCLE_FACE_X, shapeProgress)
      const faceY = mix(0, CIRCLE_FACE_Y, shapeProgress)
      const faceScale = mix(1, CIRCLE_FACE_SCALE, shapeProgress)

      facePositionRef.current.setAttribute(
        'transform',
        `translate(${formatNumber(faceX)} ${formatNumber(faceY)}) scale(${formatNumber(faceScale)})`
      )
    }

    if (faceJellyRef.current) {
      faceJellyRef.current.style.transform = [
        `translate3d(0, ${formatNumber(frame.faceY)}px, 0)`,
        `scale(${formatNumber(frame.faceSx)}, ${formatNumber(frame.faceSy)})`,
      ].join(' ')
    }
  }, [])

  const runAnimation = React.useCallback(
    (frames: readonly MotionFrame[], durationMs: number) => {
      clearIntroDelay()
      stopAnimation()
      exitSleep()

      if (prefersReducedMotion) {
        applyFrame(sampleFrames(frames, 1))
        hasIntroSettledRef.current = true
        scheduleIdleSleepRef.current?.()
        return
      }

      if (typeof document !== 'undefined' && document.hidden) {
        applyFrame(sampleFrames(frames, 1))
        hasIntroSettledRef.current = true
        scheduleIdleSleepRef.current?.()
        return
      }

      const duration = Math.max(1, durationMs)
      const startedAt = performance.now()

      const tick = (now: number) => {
        const progress = clamp01((now - startedAt) / duration)

        applyFrame(sampleFrames(frames, progress))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        rafRef.current = null
        applyFrame(sampleFrames(frames, 1))
        hasIntroSettledRef.current = true
        scheduleIdleSleepRef.current?.()
      }

      applyFrame(sampleFrames(frames, 0))
      rafRef.current = requestAnimationFrame(tick)
    },
    [applyFrame, clearIntroDelay, exitSleep, prefersReducedMotion, stopAnimation]
  )

  const playInteractionAnimation = React.useCallback(() => {
    if (!playOnInteraction) return
    if (prefersReducedMotion) return
    if (shouldSleepFastFromPresence) return

    runAnimation(clickFrames, CLICK_DURATION_MS)
  }, [playOnInteraction, prefersReducedMotion, runAnimation, shouldSleepFastFromPresence])

  useIsomorphicLayoutEffect(() => {
    clearIntroDelay()
    stopAnimation()

    hasIntroSettledRef.current = false
    lastMorphIndexRef.current = null
    applyFrame(sampleFrames(introFrames, 0))

    if (!playIntro || prefersReducedMotion) {
      hasIntroSettledRef.current = true
      scheduleIdleSleepRef.current?.()
      return
    }

    introDelayRef.current = window.setTimeout(() => {
      introDelayRef.current = null
      runAnimation(introFrames, INTRO_DURATION_MS)
    }, INTRO_DELAY_MS)

    return () => {
      clearIntroDelay()
      stopAnimation()
    }
  }, [applyFrame, clearIntroDelay, playIntro, prefersReducedMotion, runAnimation, stopAnimation])

  React.useEffect(() => {
    scheduleIdleSleep()

    return () => {
      clearIdleSleepDelay()
    }
  }, [clearIdleSleepDelay, scheduleIdleSleep])

  React.useEffect(() => {
    if (!isSleepEntering) return undefined

    const timeoutId = window.setTimeout(() => {
      setIsSleepEntering(false)
    }, SLEEP_ENTER_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isSleepEntering])

  const handlePointerDown = React.useCallback<React.PointerEventHandler<SVGSVGElement>>(
    (event) => {
      onPointerDown?.(event)
      wakeLogo()

      if (event.defaultPrevented) return
      if (!event.isPrimary) return
      if (event.button !== 0) return

      playInteractionAnimation()
    },
    [onPointerDown, playInteractionAnimation, wakeLogo]
  )

  const handlePointerEnter = React.useCallback<React.PointerEventHandler<SVGSVGElement>>(
    (event) => {
      onPointerEnter?.(event)
      wakeLogo()
    },
    [onPointerEnter, wakeLogo]
  )

  const handleFocus = React.useCallback<React.FocusEventHandler<SVGSVGElement>>(
    (event) => {
      onFocus?.(event)
      wakeLogo()
    },
    [onFocus, wakeLogo]
  )

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<SVGSVGElement>>(
    (event) => {
      onKeyDown?.(event)
      wakeLogo()

      if (event.defaultPrevented) return
      if (!isInteractive) return
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      playInteractionAnimation()
    },
    [isInteractive, onKeyDown, playInteractionAnimation, wakeLogo]
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 349.876 221.589"
      className={className}
      role={resolvedRole}
      tabIndex={resolvedTabIndex}
      focusable={resolvedFocusable}
      aria-hidden={decorative ? true : undefined}
      aria-label={resolvedAriaLabel}
      aria-labelledby={resolvedAriaLabelledBy}
      data-logo-sleeping={isSleeping ? 'true' : undefined}
      data-logo-sleep-entering={isSleepEntering ? 'true' : undefined}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      style={svgStyle}
      {...props}
    >
      <style>
        {`
          .logo-sleep-breath,
          .logo-sleep-face-soft,
          .logo-sleep-zzzs,
          .logo-sleep-zzzs text {
            animation-play-state: paused;
          }

          .logo-sleep-zzzs {
            opacity: 0;
            pointer-events: none;
            transition: opacity 420ms ease-out;
          }

          .logo-sleep-zzzs text {
            --sleep-z-offset-x: 0px;
            --sleep-z-offset-y: 0px;

            opacity: 0;
            fill: var(--logo-secondary);
            stroke: var(--logo-detail);
            stroke-width: 4px;
            paint-order: stroke;
            transform-box: fill-box;
            transform-origin: 50% 50%;
            filter: drop-shadow(0 3px 7px rgb(0 0 0 / 0.55));
          }

          @media (max-width: 640px) {
            .logo-sleep-zzzs .sleep-z-1 {
              --sleep-z-offset-x: -16px;
              --sleep-z-offset-y: 12px;
            }

            .logo-sleep-zzzs .sleep-z-2 {
              --sleep-z-offset-x: -21px;
              --sleep-z-offset-y: 15px;
            }

            .logo-sleep-zzzs .sleep-z-3 {
              --sleep-z-offset-x: -25px;
              --sleep-z-offset-y: 18px;
            }
          }

          [data-logo-sleeping='true'] .logo-sleep-breath {
            animation: logoSleepBreath ${SLEEP_BREATH_DURATION_MS}ms ease-in-out infinite;
          }

          [data-logo-sleeping='true'] .logo-sleep-face-soft {
            animation: logoSleepFace ${SLEEP_BREATH_DURATION_MS}ms ease-in-out infinite;
          }

          [data-logo-sleep-entering='true'] .logo-sleep-breath {
            animation: logoSleepEnter ${SLEEP_ENTER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          [data-logo-sleep-entering='true'] .logo-sleep-face-soft {
            animation: logoSleepFaceEnter ${SLEEP_ENTER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          [data-logo-sleeping='true'] .logo-sleep-zzzs {
            opacity: 1;
          }

          [data-logo-sleeping='true'][data-logo-sleep-entering='true'] .logo-sleep-zzzs {
            opacity: 0;
          }

          [data-logo-sleeping='true'] .logo-sleep-zzzs .sleep-z {
            animation: logoSleepZFall ${SLEEP_BREATH_DURATION_MS}ms ease-in-out infinite;
          }

          [data-logo-sleeping='true'] .logo-sleep-zzzs .sleep-z-1 {
            animation-delay: 0ms;
          }

          [data-logo-sleeping='true'] .logo-sleep-zzzs .sleep-z-2 {
            animation-delay: 420ms;
          }

          [data-logo-sleeping='true'] .logo-sleep-zzzs .sleep-z-3 {
            animation-delay: 840ms;
          }

          @keyframes logoSleepEnter {
            0% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }

            42% {
              transform: translate3d(0, 3px, 0) scale(1.024, 0.976);
            }

            72% {
              transform: translate3d(0, 0.8px, 0) scale(1.006, 0.994);
            }

            100% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }
          }

          @keyframes logoSleepFaceEnter {
            0% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }

            42% {
              transform: translate3d(0, 1.5px, 0) scale(1.01, 0.976);
            }

            72% {
              transform: translate3d(0, 0.4px, 0) scale(1.002, 0.996);
            }

            100% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }
          }

          @keyframes logoSleepBreath {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }

            28% {
              transform: translate3d(0, 3.2px, 0) scale(1.026, 0.974);
            }

            50% {
              transform: translate3d(0, 0.8px, 0) scale(1.004, 0.996);
            }

            74% {
              transform: translate3d(0, 2.8px, 0) scale(1.022, 0.978);
            }
          }

          @keyframes logoSleepFace {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1, 1);
            }

            28% {
              transform: translate3d(0, 1.6px, 0) scale(1.012, 0.972);
            }

            50% {
              transform: translate3d(0, 0.4px, 0) scale(1.002, 0.996);
            }

            74% {
              transform: translate3d(0, 1.4px, 0) scale(1.01, 0.976);
            }
          }

          @keyframes logoSleepZFall {
            0% {
              opacity: 0;
              transform: translate3d(var(--sleep-z-offset-x), var(--sleep-z-offset-y), 0) scale(0.62) rotate(-8deg);
            }

            16% {
              opacity: 1;
            }

            54% {
              opacity: 1;
              transform: translate3d(calc(var(--sleep-z-offset-x) + 13px), calc(var(--sleep-z-offset-y) - 22px), 0) scale(0.92) rotate(1deg);
            }

            82% {
              opacity: 0;
              transform: translate3d(calc(var(--sleep-z-offset-x) + 34px), calc(var(--sleep-z-offset-y) - 54px), 0) scale(1.16) rotate(9deg);
            }

            100% {
              opacity: 0;
              transform: translate3d(calc(var(--sleep-z-offset-x) + 34px), calc(var(--sleep-z-offset-y) - 54px), 0) scale(1.16) rotate(9deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .logo-sleep-breath,
            .logo-sleep-face-soft,
            .logo-sleep-zzzs,
            .logo-sleep-zzzs text {
              animation: none !important;
            }

            [data-logo-sleeping='true'] .logo-sleep-zzzs text {
              opacity: 1;
            }
          }
        `}
      </style>

      {!decorative && !ariaLabel && title ? <title id={titleId}>{title}</title> : null}

      <g className="logo-sleep-breath" style={sleepLayerStyle}>
        <g ref={stageRef} style={stageMotionStyle}>
          <path
            ref={bodyRef}
            d={FLAT_BODY}
            fill="var(--logo-primary)"
            fillOpacity={1}
            stroke="none"
            strokeLinecap="round"
          />

          <g ref={facePositionRef}>
            <g className="logo-sleep-face-soft" style={sleepFaceStyle}>
              <g ref={faceJellyRef} style={faceMotionStyle}>
                <path fill="var(--logo-secondary)" d={FACE_PATH} transform={FACE_BASE_TRANSFORM} />

                <path fill="var(--logo-detail)" d={CHECK_PATH} transform={FACE_BASE_TRANSFORM} />
              </g>
            </g>
          </g>

          <g className="logo-sleep-zzzs" style={sleepZzzStyle} aria-hidden="true">
            <text
              className="sleep-z sleep-z-1"
              x="206"
              y="124"
              fill="var(--logo-secondary)"
              stroke="var(--logo-detail)"
              strokeWidth="3"
              paintOrder="stroke"
              fontSize="40"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              fontWeight="950"
            >
              Z
            </text>

            <text
              className="sleep-z sleep-z-2"
              x="230"
              y="104"
              fill="var(--logo-secondary)"
              stroke="var(--logo-detail)"
              strokeWidth="3"
              paintOrder="stroke"
              fontSize="46"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              fontWeight="950"
            >
              Z
            </text>

            <text
              className="sleep-z sleep-z-3"
              x="257"
              y="83"
              fill="var(--logo-secondary)"
              stroke="var(--logo-detail)"
              strokeWidth="3.5"
              paintOrder="stroke"
              fontSize="52"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              fontWeight="950"
            >
              Z
            </text>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default Logo
