export function slugifyForViewTransition(value: string | undefined) {
  return (value || 'item')
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function postTitleViewTransitionName(title: string | undefined) {
  return `post-title-${slugifyForViewTransition(title) || 'item'}`
}

export function tagViewTransitionName(tag: string | undefined) {
  return `tag-${slugifyForViewTransition(tag) || 'item'}`
}
