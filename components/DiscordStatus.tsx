'use client'

import * as React from 'react'

import { useIsConfiguredSleepTime } from '@/components/status/availability'
import {
  DEFAULT_DISCORD_USER_ID,
  type DiscordPresenceStatus,
  useLanyardPresence,
} from '@/components/status/useLanyardPresence'

type DiscordStatusProps = React.ComponentPropsWithoutRef<'span'> & {
  discordUserId?: string
  refreshIntervalMs?: number
}

const STATUS_META: Record<
  DiscordPresenceStatus,
  {
    label: string
    color: string
  }
> = {
  online: {
    label: 'Online',
    color: '#23a55a',
  },
  idle: {
    label: 'Away',
    color: '#f0b232',
  },
  dnd: {
    label: 'Busy',
    color: '#f23f43',
  },
  offline: {
    label: 'Offline',
    color: '#80848e',
  },
}

const SLEEPING_META = {
  label: 'Sleeping',
  color: '#5865f2',
}

const LOADING_META = {
  label: 'Checking status...',
  color: '#80848e',
}

const ERROR_META = {
  label: 'Status unavailable',
  color: '#80848e',
}

const DiscordStatus = ({
  discordUserId = DEFAULT_DISCORD_USER_ID,
  refreshIntervalMs,
  className,
  ...props
}: DiscordStatusProps) => {
  const { status, isLoading, hasError } = useLanyardPresence(discordUserId, refreshIntervalMs)
  const isConfiguredSleepTime = useIsConfiguredSleepTime()

  const shouldShowSleeping = status === 'idle' && isConfiguredSleepTime

  const meta = isLoading
    ? LOADING_META
    : hasError || !status
      ? ERROR_META
      : shouldShowSleeping
        ? SLEEPING_META
        : STATUS_META[status]

  const rootClassName = [
    'inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      {...props}
      className={rootClassName}
      role="status"
      aria-live="polite"
      aria-label={`Discord status: ${meta.label}`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: meta.color,
          boxShadow: `0 0 8px ${meta.color}`,
        }}
        aria-hidden="true"
      />

      <span>{meta.label}</span>
    </span>
  )
}

export default DiscordStatus
