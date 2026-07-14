'use client'

import * as React from 'react'

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

const DiscordStatus = ({
  discordUserId = DEFAULT_DISCORD_USER_ID,
  refreshIntervalMs,
  className,
  ...props
}: DiscordStatusProps) => {
  const { status, isLoading, hasError } = useLanyardPresence(discordUserId, refreshIntervalMs)
  const isPending = isLoading && !status && !hasError

  if (isPending || hasError || !status) return null

  const meta = STATUS_META[status]

  const rootClassName = [
    'discord-presence inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      {...props}
      className={rootClassName}
      data-discord-status={status}
      role="status"
      aria-live="polite"
      aria-label={`Discord status: ${meta.label}`}
    >
      <span
        className="discord-presence__dot"
        style={{
          backgroundColor: meta.color,
        }}
        aria-hidden="true"
      />

      <span>
        status: <strong className="discord-presence__value">{meta.label.toLowerCase()}</strong>
      </span>
    </span>
  )
}

export default DiscordStatus
