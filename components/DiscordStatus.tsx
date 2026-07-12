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
    color: 'var(--presence-online)',
  },
  idle: {
    label: 'Away',
    color: 'var(--presence-away)',
  },
  dnd: {
    label: 'Busy',
    color: 'var(--presence-busy)',
  },
  offline: {
    label: 'Offline',
    color: 'var(--presence-offline)',
  },
}

const SLEEPING_META = {
  label: 'Sleeping',
  color: 'var(--presence-sleeping)',
}

const LOADING_META = {
  label: 'Checking status',
  color: 'var(--presence-offline)',
}

const ERROR_META = {
  label: 'Status unavailable',
  color: 'var(--presence-offline)',
}

const LoadingDots = () => {
  return (
    <span className="inline-flex w-5 items-end" aria-hidden="true">
      <style>
        {`@keyframes presence-loading-dot {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-0.18em);
          }
        }`}
      </style>

      <span style={{ animation: 'presence-loading-dot 1.2s infinite ease-in-out' }}>.</span>
      <span style={{ animation: 'presence-loading-dot 1.2s infinite ease-in-out 150ms' }}>.</span>
      <span style={{ animation: 'presence-loading-dot 1.2s infinite ease-in-out 300ms' }}>.</span>
    </span>
  )
}

const DiscordStatus = ({
  discordUserId = DEFAULT_DISCORD_USER_ID,
  refreshIntervalMs,
  className,
  ...props
}: DiscordStatusProps) => {
  const { status, isLoading, hasError } = useLanyardPresence(discordUserId, refreshIntervalMs)
  const isConfiguredSleepTime = useIsConfiguredSleepTime()

  const shouldShowSleeping = (status === 'idle' || status === 'offline') && isConfiguredSleepTime

  const meta = isLoading
    ? LOADING_META
    : hasError || !status
      ? ERROR_META
      : shouldShowSleeping
        ? SLEEPING_META
        : STATUS_META[status]

  const rootClassName = [
    'inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]',
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

      <span>
        {meta.label}
        {isLoading && <LoadingDots />}
      </span>
    </span>
  )
}

export default DiscordStatus
