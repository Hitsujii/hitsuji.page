type DatetimeProps = {
  date: string
  className?: string
}

function formatIsoDate(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toISOString().slice(0, 10)
}

export default function Datetime({ date, className = '' }: DatetimeProps) {
  return (
    <div className={['flex items-center gap-x-2 text-[var(--text-muted)]', className].join(' ')}>
      <time className="text-sm" dateTime={date}>
        {formatIsoDate(date)}
      </time>
    </div>
  )
}
