import { IconCalendar } from './icons/AstroPaperIcons'

type DatetimeProps = {
  date: string
  lastmod?: string | null
  size?: 'sm' | 'lg'
  className?: string
  showIcon?: boolean
}

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  timeZone: 'UTC',
})

function formatAstroPaperDate(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return `${parsedDate.getUTCDate()} ${monthFormatter.format(parsedDate)}, ${parsedDate.getUTCFullYear()}`
}

export default function Datetime({
  date,
  lastmod,
  size = 'sm',
  className = '',
  showIcon = true,
}: DatetimeProps) {
  const isModified = Boolean(lastmod && lastmod > date)
  const displayDate = isModified ? lastmod || date : date

  return (
    <div className={['flex items-center gap-x-2 text-[var(--text-muted)]', className].join(' ')}>
      {showIcon && (
        <IconCalendar
          className={['inline-block size-6 min-w-5.5', size === 'sm' ? 'scale-90' : ''].join(' ')}
        />
      )}
      {isModified && (
        <span className={['text-sm', size === 'lg' ? 'sm:text-base' : ''].join(' ')}>Updated:</span>
      )}
      <time
        className={['text-sm', size === 'lg' ? 'sm:text-base' : ''].join(' ')}
        dateTime={displayDate}
      >
        {formatAstroPaperDate(displayDate)}
      </time>
    </div>
  )
}
