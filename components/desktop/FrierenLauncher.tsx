'use client'

import Image from '@/components/Image'
import DesktopIcon from './DesktopIcon'
import { useDesktopShell } from './DesktopShellContext'

type FrierenLauncherProps = {
  alt: string
  src: string
}

export default function FrierenLauncher({ alt, src }: FrierenLauncherProps) {
  const { compileAndRunFrieren } = useDesktopShell()

  return (
    <button
      type="button"
      className="author-profile-launcher"
      aria-label="Compile and run frieren.cpp"
      title="Compile with Borland C++ and run frieren.exe"
      onClick={compileAndRunFrieren}
    >
      <span className="author-profile-launcher__preview sunken-panel">
        <Image src={src} alt={alt} width={736} height={736} sizes="176px" />
      </span>
      <span className="author-profile-launcher__file">
        <DesktopIcon variant="cpp" size={16} />
        <span>frieren.cpp</span>
      </span>
    </button>
  )
}
