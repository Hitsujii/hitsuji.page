'use client'

import * as React from 'react'

import siteMetadata from '@/data/siteMetadata'

export type DiscordPresenceStatus = 'online' | 'idle' | 'dnd' | 'offline'

type LanyardResponse = {
  success?: boolean
  data?: {
    discord_status?: DiscordPresenceStatus
  }
}

type PresenceConfig = {
  discordUserId?: string
}

type SiteMetadataWithPresence = {
  presence?: PresenceConfig
}

export type LanyardPresence = {
  status: DiscordPresenceStatus | null
  isLoading: boolean
  hasError: boolean
}

const metadata = siteMetadata as SiteMetadataWithPresence

export const DEFAULT_DISCORD_USER_ID = metadata.presence?.discordUserId ?? '225253076628406274'

const DEFAULT_REFRESH_INTERVAL_MS = 30_000
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
let activeDiscordUserId = DEFAULT_DISCORD_USER_ID

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

export const useLanyardPresence = (
  discordUserId = DEFAULT_DISCORD_USER_ID,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS
) => {
  const [presence, setPresence] = React.useState(snapshot)

  React.useEffect(() => {
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

    if (listeners.size === 1 || activeDiscordUserId !== discordUserId) {
      startPolling(discordUserId, refreshIntervalMs)
    }

    return () => {
      listeners.delete(setPresence)

      if (listeners.size === 0) {
        stopPolling()
      }
    }
  }, [discordUserId, refreshIntervalMs])

  return presence
}
