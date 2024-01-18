/**
 * Returns the given value, unless it is `null` - in which case an {@link Error}
 * `e` is thrown.
 *
 * `e` contains the given `errorMessage`, or a generic one if `errorMessage` is
 * not provided.
 */
export function throwIfNull<A>(value: A | null, errorMessage?: string): A {
  if (value !== null) return value

  throw new Error(errorMessage ?? 'Expected the given value not to be null.')
}
