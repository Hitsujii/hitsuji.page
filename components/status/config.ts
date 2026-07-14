import siteMetadata from '@/data/siteMetadata'

export const statusConfig = {
  discordUserId: siteMetadata.presence.discordUserId,
  timeZone: siteMetadata.availability.timeZone,
  locationLabel: siteMetadata.availability.locationLabel,
} as const
