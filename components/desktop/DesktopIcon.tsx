import { Back } from '@react95/icons/Back'
import { Computer3 } from '@react95/icons/Computer3'
import { CurvesAndColors100 } from '@react95/icons/CurvesAndColors100'
import { Desktop } from '@react95/icons/Desktop'
import { FileFind } from '@react95/icons/FileFind'
import { FileText } from '@react95/icons/FileText'
import { FileTextSettings } from '@react95/icons/FileTextSettings'
import { Files } from '@react95/icons/Files'
import { Folder } from '@react95/icons/Folder'
import { FolderExe } from '@react95/icons/FolderExe'
import { FolderOpen } from '@react95/icons/FolderOpen'
import { Globe } from '@react95/icons/Globe'
import { MsDos } from '@react95/icons/MsDos'
import { Listicon } from '@react95/icons/Listicon'
import { Refresh } from '@react95/icons/Refresh'
import { Redo } from '@react95/icons/Redo'
import { Undo } from '@react95/icons/Undo'
import { User } from '@react95/icons/User'
import type { SVGProps } from 'react'
import ClassicFeedIcon from '@/components/icons/ClassicFeedIcon'

export type DesktopIconVariant =
  | 'terminal'
  | 'cpp'
  | 'folder'
  | 'search'
  | 'document'
  | 'projects'
  | 'about'
  | 'appearance'
  | 'computer'
  | 'home'
  | 'folder-open'
  | 'archive'
  | 'tags'
  | 'rss'
  | 'back'
  | 'forward'
  | 'up'
  | 'browser'
  | 'refresh'

export type DesktopIconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  label?: string
  size?: number | string
  variant: DesktopIconVariant
}

type LibraryIconProps = SVGProps<SVGSVGElement>

function LibraryIcon({
  variant,
  large,
  iconProps,
}: {
  variant: Exclude<DesktopIconVariant, 'rss'>
  large: boolean
  iconProps: LibraryIconProps
}) {
  const standardSize = large ? '32x32_4' : '16x16_4'

  switch (variant) {
    case 'terminal':
      return <MsDos variant={large ? '32x32_32' : '16x16_32'} {...iconProps} />
    case 'cpp':
      return <FileTextSettings variant={standardSize} {...iconProps} />
    case 'folder':
      return <Folder variant={standardSize} {...iconProps} />
    case 'search':
      return <FileFind variant={standardSize} {...iconProps} />
    case 'document':
      return <FileText variant={standardSize} {...iconProps} />
    case 'projects':
      return <FolderExe variant={standardSize} {...iconProps} />
    case 'about':
      return <User variant={standardSize} {...iconProps} />
    case 'appearance':
      return <CurvesAndColors100 variant={standardSize} {...iconProps} />
    case 'computer':
      return <Computer3 variant={standardSize} {...iconProps} />
    case 'home':
      return <Desktop variant={standardSize} {...iconProps} />
    case 'folder-open':
      return <FolderOpen variant={standardSize} {...iconProps} />
    case 'archive':
      return <Files variant={standardSize} {...iconProps} />
    case 'tags':
      return <Listicon variant="16x16_4" {...iconProps} />
    case 'back':
      return <Undo variant="16x16_4" {...iconProps} />
    case 'forward':
      return <Redo variant="16x16_4" {...iconProps} />
    case 'up':
      return <Back variant="16x16_4" {...iconProps} />
    case 'browser':
      return <Globe variant={standardSize} {...iconProps} />
    case 'refresh':
      return <Refresh variant="16x16_4" {...iconProps} />
  }
}

export function DesktopIcon({
  variant,
  size = 16,
  label,
  className,
  width,
  height,
  role,
  focusable,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}: DesktopIconProps) {
  const accessibleName = label ?? ariaLabel
  const hidden =
    ariaHidden === undefined ? !accessibleName : ariaHidden === true || ariaHidden === 'true'
  const large = typeof size === 'number' && size >= 24
  const pixelSize = typeof size === 'number' ? (large ? 32 : 16) : size
  const iconClassName = ['desktop-icon', `desktop-icon--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  if (variant === 'rss') {
    return (
      <ClassicFeedIcon
        size={typeof pixelSize === 'number' ? pixelSize : 16}
        className={iconClassName}
        alt={hidden ? '' : accessibleName}
        aria-hidden={hidden || undefined}
        role={role ?? (hidden ? undefined : 'img')}
      />
    )
  }

  return (
    <LibraryIcon
      variant={variant}
      large={large}
      iconProps={{
        ...props,
        className: iconClassName,
        width: width ?? pixelSize,
        height: height ?? pixelSize,
        focusable: focusable ?? 'false',
        'aria-hidden': hidden || undefined,
        'aria-label': hidden ? undefined : accessibleName,
        role: role ?? (hidden ? undefined : 'img'),
      }}
    />
  )
}

export default DesktopIcon
