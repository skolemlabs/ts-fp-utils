/** Constructs a set with no values. */
export const empty = <A>(): ReadonlySet<A> => new Set()

/** Given a value, returns a Set containing only that value. */
export const singleton = <A>(a: A): ReadonlySet<A> => new Set([a])

/** Computes the set that contains all elements in `a1` which are not in `a2`. */
export const difference = <A>(
  a1: ReadonlySet<A>,
  a2: ReadonlySet<A>
): ReadonlySet<A> => new Set([...a1].filter((a) => !a2.has(a)))

/**
 * Computes the set that contains all elements which are present in both
 * `a1` and `a2`.
 */
export const intersection = <A>(
  a1: ReadonlySet<A>,
  a2: ReadonlySet<A>
): ReadonlySet<A> => new Set([...a1].filter((a) => a2.has(a)))

/** Computes the set that contains all elements in `a1` and `a2`. */
export const union = <A>(
  a1: ReadonlySet<A>,
  a2: ReadonlySet<A>
): ReadonlySet<A> => new Set([...a1, ...a2])

/**
 * Removes all values from the given `set` which do not return `true` when
 * applied to `test`.
 */
export const filter = <A>(
  set: ReadonlySet<A>,
  test: (_: A) => boolean
): ReadonlySet<A> => new Set([...set].filter(test))
