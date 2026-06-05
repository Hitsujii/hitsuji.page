'use client'

import { useEffect } from 'react'

type TocItem = {
  value?: string
  url?: string
  depth?: number
}

type PostEnhancementsProps = {
  toc?: TocItem[]
  hasToc?: boolean
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanHeadingText(heading: Element) {
  const clone = heading.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.heading-link').forEach((link) => link.remove())
  return clone.textContent?.trim() ?? ''
}

function ensureHeadingId(heading: HTMLElement) {
  if (!heading.id) {
    heading.id = slugifyHeading(cleanHeadingText(heading))
  }

  return heading.id
}

function normalizeTocHref(url: string | undefined, value: string | undefined) {
  if (url) return url.startsWith('#') ? url : `#${url}`
  return `#${slugifyHeading(value ?? '')}`
}

function codeText(pre: HTMLPreElement) {
  const code = pre.querySelector('code')

  if (code?.innerText) {
    return code.innerText.trimEnd()
  }

  const clone = pre.cloneNode(true) as HTMLPreElement
  clone.querySelectorAll('button.copy-code').forEach((button) => button.remove())
  clone.querySelectorAll('.code-file-name').forEach((label) => label.remove())
  return clone.innerText.trimEnd()
}

function extractFileNameFromMeta(meta: string | null | undefined) {
  if (!meta) return undefined

  const match = meta.match(/(?:^|\s)file=(?:"([^"]+)"|'([^']+)'|([^\s]+))/)
  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function readPreviousFileLabel(pre: HTMLPreElement) {
  const previous = pre.previousElementSibling as HTMLElement | null
  if (!previous) return undefined

  const text = previous.textContent?.trim() ?? ''
  const className = previous.getAttribute('class') ?? ''

  if (/rehype-code-title|code-title|filename|file-name/.test(className) && text) {
    return { fileName: text, element: previous }
  }

  const match = text.match(/^file:\s*(.+)$/i)

  if (match?.[1]) {
    return { fileName: match[1].trim(), element: previous }
  }

  return undefined
}

function findExplicitTocHeading(article: HTMLElement) {
  return Array.from(article.querySelectorAll('h2, h3')).find((heading) => {
    return cleanHeadingText(heading).toLowerCase() === 'table of contents'
  }) as HTMLElement | undefined
}

function isTocLikeList(list: HTMLElement) {
  const links = Array.from(list.querySelectorAll('a[href^="#"]'))
  const items = Array.from(list.querySelectorAll('li'))

  if (links.length < 3 || items.length < 3) return false

  return links.length >= Math.ceil(items.length * 0.6)
}

function findFallbackTocList(article: HTMLElement) {
  const firstLists = Array.from(article.querySelectorAll('ul, ol')).slice(0, 3)

  return firstLists.find((list) => {
    if (!(list instanceof HTMLElement)) return false
    if (list.closest('details')) return false
    if (list.closest('nav')) return false

    return isTocLikeList(list)
  }) as HTMLElement | undefined
}

function buildGeneratedTocList(article: HTMLElement, toc: TocItem[]) {
  const list = document.createElement('ul')

  const items =
    toc.length > 0
      ? toc.filter((item) => item.value && item.value.toLowerCase() !== 'table of contents')
      : Array.from(article.querySelectorAll('h2, h3, h4, h5, h6')).map((heading) => {
          const headingElement = heading as HTMLElement
          const value = cleanHeadingText(headingElement)
          const depth = Number(headingElement.tagName.slice(1))
          const id = ensureHeadingId(headingElement)

          return {
            value,
            url: id ? `#${id}` : undefined,
            depth,
          }
        })

  items
    .filter((item) => item.value && item.value.toLowerCase() !== 'table of contents')
    .forEach((item) => {
      const li = document.createElement('li')
      li.style.marginInlineStart = `${Math.max((item.depth ?? 2) - 2, 0)}rem`

      const link = document.createElement('a')
      link.href = normalizeTocHref(item.url, item.value)
      link.textContent = item.value ?? ''

      li.appendChild(link)
      list.appendChild(li)
    })

  return list
}

function makeCollapsedToc(content: HTMLElement) {
  const details = document.createElement('details')
  details.className = 'astro-toc-collapse'
  details.removeAttribute('open')

  const summary = document.createElement('summary')
  summary.textContent = 'Open Table of contents'

  const nav = document.createElement('nav')
  nav.setAttribute('aria-label', 'Table of contents')
  nav.appendChild(content)

  details.appendChild(summary)
  details.appendChild(nav)

  return details
}

function enhanceTableOfContents(article: HTMLElement, toc: TocItem[]) {
  if (article.querySelector('details.astro-toc-collapse')) return

  const explicitHeading = findExplicitTocHeading(article)

  if (explicitHeading) {
    const next = explicitHeading.nextElementSibling as HTMLElement | null

    if (next && ['UL', 'OL', 'NAV'].includes(next.tagName)) {
      explicitHeading.insertAdjacentElement('afterend', makeCollapsedToc(next))
      return
    }

    explicitHeading.insertAdjacentElement(
      'afterend',
      makeCollapsedToc(buildGeneratedTocList(article, toc))
    )
    return
  }

  const fallbackList = findFallbackTocList(article)

  if (!fallbackList) return

  const heading = document.createElement('h2')
  heading.textContent = 'Table of contents'

  fallbackList.insertAdjacentElement('beforebegin', heading)
  heading.insertAdjacentElement('afterend', makeCollapsedToc(fallbackList))
}

function removeGeneratedHeadingAnchors(heading: HTMLElement, id: string) {
  const expectedHref = `#${id}`

  Array.from(heading.querySelectorAll(':scope > a')).forEach((anchor) => {
    if (!(anchor instanceof HTMLAnchorElement)) return

    const href = anchor.getAttribute('href')
    const text = anchor.textContent?.trim() ?? ''
    const hasIcon = Boolean(anchor.querySelector('svg'))
    const isKnownGeneratedAnchor =
      anchor.classList.contains('anchor') ||
      anchor.classList.contains('heading-link') ||
      anchor.classList.contains('icon-link') ||
      anchor.getAttribute('aria-hidden') === 'true'

    if (
      href === expectedHref &&
      (isKnownGeneratedAnchor || hasIcon || text === '' || text === '#')
    ) {
      anchor.remove()
    }
  })
}

function enhanceHeadings(article: HTMLElement) {
  const headings = Array.from(article.querySelectorAll('h2, h3, h4, h5, h6'))

  for (const heading of headings) {
    if (!(heading instanceof HTMLElement)) continue
    if (heading.closest('.astro-toc-collapse')) continue

    const id = ensureHeadingId(heading)
    if (!id) continue

    removeGeneratedHeadingAnchors(heading, id)

    heading.classList.add('group')
    heading.dataset.headingEnhanced = 'true'

    const link = document.createElement('a')
    link.className = 'heading-link'
    link.href = `#${id}`
    link.setAttribute('aria-label', `Link to ${cleanHeadingText(heading)}`)

    const span = document.createElement('span')
    span.setAttribute('aria-hidden', 'true')
    span.textContent = '#'

    link.appendChild(span)
    heading.appendChild(link)
  }
}

function enhanceCodeBlocks(article: HTMLElement) {
  const codeBlocks = Array.from(article.querySelectorAll('pre'))

  for (const codeBlock of codeBlocks) {
    if (!(codeBlock instanceof HTMLPreElement)) continue
    if (codeBlock.dataset.copyEnhanced === 'true') continue
    if (codeBlock.closest('.code-block-wrapper')) continue

    const code = codeBlock.querySelector('code') as HTMLElement | null
    const previousFileLabel = readPreviousFileLabel(codeBlock)

    const fileName =
      codeBlock.dataset.file ||
      code?.dataset.file ||
      extractFileNameFromMeta(codeBlock.dataset.meta) ||
      extractFileNameFromMeta(code?.dataset.meta) ||
      previousFileLabel?.fileName

    const languageClass =
      Array.from(code?.classList ?? []).find((className) => className.startsWith('language-')) ??
      Array.from(codeBlock.classList).find((className) => className.startsWith('language-'))

    const language = languageClass?.replace(/^language-/, '')

    codeBlock.dataset.copyEnhanced = 'true'
    codeBlock.setAttribute('tabindex', '0')

    if (language) {
      codeBlock.dataset.language = language
    }

    codeBlock.classList.add('astro-code', 'astro-code-themes', 'min-light', 'night-owl', 'mt-8')

    codeBlock.style.setProperty('--shiki-light', '#24292eff')
    codeBlock.style.setProperty('--shiki-dark', '#d6deeb')
    codeBlock.style.setProperty('--shiki-light-bg', '#ffffff')
    codeBlock.style.setProperty('--shiki-dark-bg', '#011627')
    codeBlock.style.setProperty('--file-name-offset', '-0.75rem')
    codeBlock.style.overflowX = 'auto'

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    wrapper.style.position = 'relative'

    if (fileName) {
      wrapper.dataset.file = fileName
      wrapper.style.setProperty('--file-name-offset', '-0.75rem')
      codeBlock.dataset.file = fileName
    }

    const parent = codeBlock.parentNode
    if (!parent) continue

    if (previousFileLabel?.element) {
      previousFileLabel.element.remove()
    }

    parent.insertBefore(wrapper, codeBlock)
    wrapper.appendChild(codeBlock)

    if (fileName) {
      const fileLabel = document.createElement('span')
      fileLabel.className = 'code-file-name'
      fileLabel.textContent = fileName
      wrapper.appendChild(fileLabel)
    }

    const copyButton = document.createElement('button')
    copyButton.type = 'button'
    copyButton.className = 'copy-code'
    copyButton.textContent = 'Copy'

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeText(codeBlock))
        copyButton.textContent = 'Copied'
        window.setTimeout(() => {
          copyButton.textContent = 'Copy'
        }, 700)
      } catch {
        copyButton.textContent = 'Error'
        window.setTimeout(() => {
          copyButton.textContent = 'Copy'
        }, 700)
      }
    })

    wrapper.appendChild(copyButton)
  }
}

export default function PostEnhancements({ toc = [] }: PostEnhancementsProps) {
  useEffect(() => {
    const article = document.getElementById('article')
    if (!article) return

    enhanceTableOfContents(article, Array.isArray(toc) ? toc : [])
    // enhanceHeadings(article)
    enhanceCodeBlocks(article)
  }, [toc])

  return null
}
