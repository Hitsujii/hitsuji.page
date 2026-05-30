'use client'

import * as React from 'react'

import { statusConfig } from '@/components/status/config'

export type DiscordPresenceStatus = 'online' | 'idle' | 'dnd' | 'offline'

type LanyardResponse = {
  success?: boolean
  data?: {
    discord_status?: DiscordPresenceStatus
  }
}

export type LanyardPresence = {
  status: DiscordPresenceStatus | null
  isLoading: boolean
  hasError: boolean
}

export const DEFAULT_DISCORD_USER_ID: string = statusConfig.discordUserId

const DEFAULT_REFRESH_INTERVAL_MS = 30_000
const DEFAULT_START_DELAY_MS = 4_000
const LANYARD_ENDPOINT = 'https://api.lanyard.rest/v1/users'

const isDiscordPresenceStatus = (value: unknown): value is DiscordPresenceStatus => {
  return value === 'online' || value === 'idle' || value === 'dnd' || value === 'offline'
}

let snapshot: LanyardPresence = {
  status: null,
  isLoading: true,
  hasError: false,
}

let intervalId: number | null = null
let activeDiscordUserId: string | null = null

const listeners = new Set<(presence: LanyardPresence) => void>()

const setSnapshot = (nextSnapshot: LanyardPresence) => {
  snapshot = nextSnapshot

  listeners.forEach((listener) => {
    listener(snapshot)
  })
}

const fetchPresence = async (discordUserId: string) => {
  try {
    const response = await fetch(`${LANYARD_ENDPOINT}/${discordUserId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Lanyard returned ${response.status}`)
    }

    const json = (await response.json()) as LanyardResponse
    const nextStatus = json.data?.discord_status

    if (!isDiscordPresenceStatus(nextStatus)) {
      throw new Error('Invalid Discord status')
    }

    setSnapshot({
      status: nextStatus,
      isLoading: false,
      hasError: false,
    })
  } catch {
    setSnapshot({
      status: null,
      isLoading: false,
      hasError: true,
    })
  }
}

const stopPolling = () => {
  if (intervalId === null) return

  window.clearInterval(intervalId)
  intervalId = null
}

const startPolling = (discordUserId: string, refreshIntervalMs: number) => {
  stopPolling()

  activeDiscordUserId = discordUserId

  setSnapshot({
    status: snapshot.status,
    isLoading: true,
    hasError: false,
  })

  void fetchPresence(discordUserId)

  intervalId = window.setInterval(
    () => {
      void fetchPresence(discordUserId)
    },
    Math.max(5_000, refreshIntervalMs)
  )
}

const shouldStartPolling = (discordUserId: string) => {
  return intervalId === null || activeDiscordUserId !== discordUserId
}

export const useLanyardPresence = (
  discordUserId: string = DEFAULT_DISCORD_USER_ID,
  refreshIntervalMs: number = DEFAULT_REFRESH_INTERVAL_MS,
  enabled: boolean = true,
  startDelayMs: number = DEFAULT_START_DELAY_MS
) => {
  const [presence, setPresence] = React.useState<LanyardPresence>(() =>
    enabled
      ? snapshot
      : {
          status: null,
          isLoading: false,
          hasError: false,
        }
  )

  React.useEffect(() => {
    if (!enabled) {
      setPresence({
        status: null,
        isLoading: false,
        hasError: false,
      })

      return undefined
    }

    if (!discordUserId) {
      setPresence({
        status: null,
        isLoading: false,
        hasError: true,
      })

      return undefined
    }

    listeners.add(setPresence)
    setPresence(snapshot)

    const start = () => {
      if (!listeners.has(setPresence)) return

      if (shouldStartPolling(discordUserId)) {
        startPolling(discordUserId, refreshIntervalMs)
      }
    }

    const delay = Math.max(0, startDelayMs)

    if (delay > 0) {
      const timeoutId = window.setTimeout(start, delay)

      return () => {
        window.clearTimeout(timeoutId)
        listeners.delete(setPresence)

        if (listeners.size === 0) {
          stopPolling()
        }
      }
    }

    start()

    return () => {
      listeners.delete(setPresence)

      if (listeners.size === 0) {
        stopPolling()
      }
    }
  }, [discordUserId, refreshIntervalMs, enabled, startDelayMs])

  return presence
}
