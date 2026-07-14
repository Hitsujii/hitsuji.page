import Image, { type ImageProps } from 'next/image'

const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '')

type ClassicFeedIconProps = Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> & {
  size?: number
  alt?: string
}

export default function ClassicFeedIcon({
  size = 16,
  alt = '',
  className = '',
  ...props
}: ClassicFeedIconProps) {
  return (
    <Image
      src={`${basePath}/static/images/feed-icon.svg`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`.trim()}
      draggable={false}
      unoptimized
      {...props}
    />
  )
}
