import { statusConfig } from '@/components/status/config'

export const siteAvailability = {
  timeZone: statusConfig.timeZone,
  locationLabel: statusConfig.locationLabel,
} as const

export const formatLocalTime = (timeZone: string, date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  }
}
