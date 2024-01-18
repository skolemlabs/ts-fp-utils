/**
 * Returns a new array, containing `values` which did not pass the given
 * filtering criteria.
 */
export function filter<T>(
  filterText: string,
  values: ReadonlyArray<Filterable<T>>,
  filterMode: FilterMode = 'includes'
): ReadonlyArray<Filterable<T>> {
  const lowercaseFilterText = filterText.toLowerCase()

  return values.filter((value) =>
    FILTER_FUNCTIONS[filterMode](
      lowercaseFilterText,
      value.filterText.toLowerCase()
    )
  )
}

/** Something which may be filtered. */
export type Filterable<T> = T &
  Readonly<{
    filterText: string
  }>

/** Types of filtering that this library can handle. */
export type FilterMode = typeof FILTER_MODES[number]
export const FILTER_MODES = [
  /** Keeps items via {@link String.startsWith}. */
  'starts-with',
  /** Keeps items via {@link String.includes}. */
  'includes',
  /**
   * Keeps items via a fuzzy search -- checks that the string contains the same
   * characters in the search string, in order.
   */
  'fuzzy-linear',
] as const

const FILTER_FUNCTIONS = {
  'starts-with'(lowercaseFilterText: string, lowercaseValue: string): boolean {
    return lowercaseValue.startsWith(lowercaseFilterText)
  },
  includes(lowercaseFilterText: string, lowercaseValue: string): boolean {
    return lowercaseValue.includes(lowercaseFilterText)
  },
  'fuzzy-linear'(lowercaseFilterText: string, lowercaseValue: string): boolean {
    if (lowercaseFilterText.length === 0) return true

    const filterTextLength = lowercaseFilterText.length
    let foundIndex = 0
    let nextCharToFind = lowercaseFilterText.charAt(foundIndex)

    for (const c of lowercaseValue) {
      if (c === nextCharToFind) {
        foundIndex += 1
        if (foundIndex >= filterTextLength) return true

        nextCharToFind = lowercaseFilterText.charAt(foundIndex)
      }
    }

    return false
  },
} as const satisfies Record<
  FilterMode,
  (lowercaseFilterText: string, lowercaseValue: string) => boolean
>
