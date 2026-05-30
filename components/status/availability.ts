'use client'

import * as React from 'react'

import { statusConfig } from '@/components/status/config'

export const siteAvailability = {
  timeZone: statusConfig.timeZone,
  locationLabel: statusConfig.locationLabel,
  sleepStart: statusConfig.sleepStart,
  sleepEnd: statusConfig.sleepEnd,
} as const

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export const parseClockTime = (value: string, fallback = '01:00') => {
  const match = CLOCK_TIME_PATTERN.exec(value) ?? CLOCK_TIME_PATTERN.exec(fallback)

  if (!match) return 60

  const hour = Number(match[1])
  const minute = Number(match[2])

  return hour * 60 + minute
}

export const getTimeZoneMinutes = (timeZone: string, date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)

    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)

    return hour * 60 + minute
  } catch {
    return date.getHours() * 60 + date.getMinutes()
  }
}

export const formatLocalTime = (timeZone: string, date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  }
}

export const isTimeInRange = (current: number, start: number, end: number) => {
  if (start === end) return true

  if (start < end) {
    return current >= start && current < end
  }

  return current >= start || current < end
}

export const useCurrentTimeZoneMinutes = (
  timeZone = siteAvailability.timeZone,
  enabled = true,
  startDelayMs = 0
) => {
  const [minutes, setMinutes] = React.useState(() =>
    enabled && startDelayMs === 0 ? getTimeZoneMinutes(timeZone) : 0
  )

  React.useEffect(() => {
    if (!enabled) {
      setMinutes(0)
      return undefined
    }

    const update = () => {
      setMinutes(getTimeZoneMinutes(timeZone))
    }

    const delay = Math.max(0, startDelayMs)
    let intervalId: number | null = null

    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        update()
        intervalId = window.setInterval(update, 30_000)
      }, delay)

      return () => {
        window.clearTimeout(timeoutId)

        if (intervalId !== null) {
          window.clearInterval(intervalId)
        }
      }
    }

    update()
    intervalId = window.setInterval(update, 30_000)

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [timeZone, enabled, startDelayMs])

  return minutes
}

export const useIsConfiguredSleepTime = () => {
  const currentMinutes = useCurrentTimeZoneMinutes(siteAvailability.timeZone)
  const sleepStartMinutes = parseClockTime(siteAvailability.sleepStart)
  const sleepEndMinutes = parseClockTime(siteAvailability.sleepEnd)

  return isTimeInRange(currentMinutes, sleepStartMinutes, sleepEndMinutes)
}
