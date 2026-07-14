'use client'

import * as React from 'react'

import { formatLocalTime, siteAvailability } from '@/components/status/availability'

type LocalTimeProps = React.ComponentPropsWithoutRef<'time'> & {
  timeZone?: string
  label?: string
}

const LocalTime = ({
  timeZone = siteAvailability.timeZone,
  label = siteAvailability.locationLabel,
  className,
  ...props
}: LocalTimeProps) => {
  const [time, setTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    const update = () => {
      setTime(formatLocalTime(timeZone))
    }

    update()

    const intervalId = window.setInterval(update, 30_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [timeZone])

  const rootClassName = [
    'inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <time
      {...props}
      className={rootClassName}
      dateTime={time ?? undefined}
      aria-label={time ? `Current time in ${label}: ${time}` : undefined}
      hidden={!time}
      title={timeZone}
    >
      {time && (
        <>
          <span>{time}</span>
          <span className="text-[var(--text-muted)]">{label}</span>
        </>
      )}
    </time>
  )
}

export default LocalTime
