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
  const [time, setTime] = React.useState(() => formatLocalTime(timeZone))

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
    'inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <time
      {...props}
      className={rootClassName}
      dateTime={time}
      aria-label={`Current time in ${label}: ${time}`}
      title={timeZone}
    >
      <span>{time}</span>
      <span className="text-[var(--muted-foreground)]/80">{label}</span>
    </time>
  )
}

export default LocalTime
