'use client'

import { Comments as CommentsComponent, type CommentsConfig } from 'pliny/comments'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

type GiscusCommentsConfig = CommentsConfig & {
  provider?: string
  giscusConfig?: {
    theme?: string
    darkTheme?: string
    [key: string]: unknown
  }
}

const baseCommentsConfig = siteMetadata.comments as GiscusCommentsConfig | undefined

function getGiscusTheme(resolvedTheme?: string) {
  const giscusConfig = baseCommentsConfig?.giscusConfig

  if (resolvedTheme === 'dark') {
    return giscusConfig?.darkTheme || 'transparent_dark'
  }

  return giscusConfig?.theme || 'light'
}

function updateGiscusTheme(theme: string) {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')

  if (!iframe?.contentWindow) return

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme,
        },
      },
    },
    'https://giscus.app'
  )
}

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const { resolvedTheme } = useTheme()

  const commentsConfig = useMemo<CommentsConfig | undefined>(() => {
    if (!baseCommentsConfig) return undefined

    return {
      ...baseCommentsConfig,
      giscusConfig: {
        ...baseCommentsConfig.giscusConfig,
        theme: getGiscusTheme(resolvedTheme),
      },
    } as CommentsConfig
  }, [resolvedTheme])

  useEffect(() => {
    if (!loadComments) return

    updateGiscusTheme(getGiscusTheme(resolvedTheme))
  }, [loadComments, resolvedTheme])

  if (!commentsConfig) {
    return null
  }

  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={commentsConfig} slug={slug} />
      ) : (
        <button onClick={() => setLoadComments(true)}>Load Comments</button>
      )}
    </>
  )
}
