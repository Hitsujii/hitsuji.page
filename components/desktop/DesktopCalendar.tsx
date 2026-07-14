'use client'

import { useEffect, useMemo, useState } from 'react'
import { siteAvailability } from '@/components/status/availability'
import DesktopIcon from './DesktopIcon'

type CalendarDate = {
  day: number
  month: number
  year: number
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function zonedDate(date = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: siteAvailability.timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return { year: value('year'), month: value('month') - 1, day: value('day') }
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)))
}

function calendarCells(year: number, month: number) {
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const sundayBasedDay = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const mondayBasedOffset = (sundayBasedDay + 6) % 7

  return [
    ...Array<null>(mondayBasedOffset).fill(null),
    ...Array.from({ length: days }, (_, index) => index + 1),
  ]
}

export default function DesktopCalendar() {
  const [today, setToday] = useState<CalendarDate | null>(null)
  const [view, setView] = useState<Pick<CalendarDate, 'year' | 'month'> | null>(null)

  useEffect(() => {
    const update = () => {
      const current = zonedDate()
      setToday(current)
      setView((previous) => previous ?? current)
    }

    update()
    const interval = window.setInterval(update, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const cells = useMemo(() => (view ? calendarCells(view.year, view.month) : []), [view])

  if (!today || !view) return null

  function changeMonth(delta: number) {
    setView((current) => {
      if (!current) return current
      const date = new Date(Date.UTC(current.year, current.month + delta, 1))
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
    })
  }

  const viewingCurrentMonth = view.year === today.year && view.month === today.month

  return (
    <div className="retro98 retro98--contents">
      <section
        id="desktop-calendar"
        className="desktop-calendar window"
        role="dialog"
        aria-labelledby="desktop-calendar-title"
      >
        <div className="desktop-calendar__titlebar title-bar">
          <span id="desktop-calendar-title" className="title-bar-text">
            Date/Time Properties
          </span>
        </div>

        <div className="desktop-calendar__month">
          <button
            type="button"
            aria-label="Previous month"
            title="Previous month"
            onClick={() => changeMonth(-1)}
          >
            <DesktopIcon variant="back" />
          </button>
          <strong>{monthLabel(view.year, view.month)}</strong>
          <button
            type="button"
            aria-label="Next month"
            title="Next month"
            onClick={() => changeMonth(1)}
          >
            <DesktopIcon variant="forward" />
          </button>
        </div>

        <div className="sunken-panel">
          <table>
            <thead>
              <tr>
                {WEEKDAYS.map((weekday) => (
                  <th key={weekday} scope="col">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: 7 }, (_, column) => {
                    const day = cells[row * 7 + column]
                    const isToday = viewingCurrentMonth && day === today.day
                    const isoDate = day
                      ? `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      : undefined

                    return (
                      <td key={column} data-today={isToday ? 'true' : undefined}>
                        {day ? <time dateTime={isoDate}>{day}</time> : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="desktop-calendar__status status-bar">
          <span className="status-bar-field">Time zone: {siteAvailability.locationLabel}</span>
        </div>

        <button
          type="button"
          className="desktop-calendar__today"
          title={`${String(today.day).padStart(2, '0')}.${String(today.month + 1).padStart(2, '0')}.${today.year}`}
          onClick={() => setView(today)}
        >
          Today
        </button>
      </section>
    </div>
  )
}
