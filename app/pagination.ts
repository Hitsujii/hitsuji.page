export function parsePageNumber(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return undefined

  const pageNumber = Number(value)
  return Number.isSafeInteger(pageNumber) ? pageNumber : undefined
}
