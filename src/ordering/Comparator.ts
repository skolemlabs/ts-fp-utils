/** Compares two `T`s. */
export interface Comparator<T> extends ComparatorExtras<T> {
  /**
   * Call signature - allows {@link Comparator<T>} to be passed directly into
   * {@link Array.sort}, for example.
   */
  (t1: T, t2: T): number
}

/**
 * Extra features on {@link Comparator}, allowing for composition, reversal,
 * etc.
 */
export interface ComparatorExtras<T> {
  /** Composes this comparator with another one. */
  readonly then: (comparator: Comparator<T>) => Comparator<T>

  /**
   * Returns a new {@link Comparator<T>}, which compares in the reverse order.
   */
  readonly reverse: () => Comparator<T>

  readonly finally: (comparator: Comparator<T>) => Comparator<T>
}

/** Given a comparison function, enriches it into a {@link Comparator}. */
export const makeComparator = <T>(
  compareFn: (t1: T, t2: T) => number,
  finalComparator?: Comparator<T>
): Comparator<T> => {
  const result = (t1: T, t2: T): number => {
    const comparisonResult = compareFn(t1, t2)

    if (comparisonResult !== 0) return comparisonResult

    return finalComparator?.(t1, t2) ?? 0
  }

  const props: ComparatorExtras<T> = {
    then: (comparator: Comparator<T>) =>
      makeComparator((t1, t2) => {
        const primaryResult = compareFn(t1, t2)
        if (primaryResult !== 0) return primaryResult

        return comparator(t1, t2)
      }, finalComparator),
    reverse: () =>
      makeComparator((t1, t2) => {
        const result = compareFn(t1, t2)
        // Don't return `-0`.
        if (result !== 0) return -result
        return 0
      }, finalComparator),
    finally: (comparator) => makeComparator(compareFn, comparator),
  }

  return Object.assign(result, props)
}
