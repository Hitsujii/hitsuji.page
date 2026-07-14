'use client'

import { useEffect } from 'react'
import { withBasePath } from '@/components/path-utils'

export default function LearningLogRedirect() {
  useEffect(() => {
    const hash = window.location.hash || '#history'
    window.location.replace(`${withBasePath('/')}${hash}`)
  }, [])

  return null
}
