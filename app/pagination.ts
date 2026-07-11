export function parsePageNumber(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return undefined

  const pageNumber = Number(value)
  return Number.isSafeInteger(pageNumber) ? pageNumber : undefined
}

export function getPaginatedPageNumbers(totalPages: number) {
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2)
}
