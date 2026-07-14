import Image from './Image'

type AvatarWindowProps = {
  alt?: string
  className?: string
  fileName?: string
  priority?: boolean
  size?: number
  src?: string
}

export default function AvatarWindow({
  alt = 'Frieren holding a C++ programming book',
  className = '',
  fileName = 'frieren.cpp',
  priority = false,
  size = 168,
  src = '/static/images/avatar.png',
}: AvatarWindowProps) {
  return (
    <figure className={['avatar-window', className].filter(Boolean).join(' ')}>
      <div className="avatar-window__bar" aria-hidden="true">
        <span>{fileName}</span>
        <span className="avatar-window__controls">_ □ ×</span>
      </div>

      <div className="avatar-window__image">
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          sizes={`${size}px`}
        />
      </div>

      <figcaption>
        <span>std::profile</span>
        <span aria-hidden="true">736 × 736</span>
      </figcaption>
    </figure>
  )
}
