'use client'

import { useEffect } from 'react'
import { normalizeAppPath } from './path-utils'

type RememberBackUrlProps = {
  value?: string
}

export default function RememberBackUrl({ value }: RememberBackUrlProps) {
  useEffect(() => {
    const rawBackUrl = value || `${window.location.pathname}${window.location.search}`
    const backUrl = normalizeAppPath(rawBackUrl)

    sessionStorage.setItem('backUrl', backUrl)
  }, [value])

  return null
}
