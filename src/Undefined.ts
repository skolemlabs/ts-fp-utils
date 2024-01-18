export const Undefined = {
  /**
   * Given a value that is possibly `undefined`:
   * - Returns `undefined` if it is `undefined`
   * - Otherwise, applies `f` to it.
   */
  map<A, B>(a: A | undefined, f: (_: A) => B): B | undefined {
    if (a === undefined) return undefined

    return f(a)
  },

  /**
   * Finds the first value which is not undefined. Returns `undefined` if all
   * values are `undefined`.
   */
  first<A>(
    ...values: readonly [A | undefined, ...(A | undefined)[]]
  ): A | undefined {
    return values.find((a) => a !== undefined)
  },

  /**
   * Given a record `t` that has values which may be `undefined`:
   *
   * - Returns `undefined` if any of the values are `undefined`
   * - Returns `t` if all of its values are not `undefined`, typing it properly.
   */
  all<T extends Record<string, unknown>>(
    t: T
  ): { readonly [K in keyof T]: Exclude<T[K], undefined> } | undefined {
    if (Object.values(t).some((v) => v === undefined)) return undefined

    // Casting here is OK - we just verified that each value is not `undefined`.
    return t as { readonly [K in keyof T]: Exclude<T[K], undefined> }
  },

  /**
   * Maps over a record `t` with the values which may be `undefined`:
   *
   * If any of the values are `undefined`, returns `undefined`
   * Otherwise, applies the function `f` to the object `t` with all undefined
   * values excluded, and returns the result of `f`.
   *
   * @param {T} t - The object to map over
   * @param {function} f - The function to apply to the object `t` with undefined values excluded
   * @returns {U|undefined} - The result of `f` applied to the object `t`, or `undefined` if any values are `undefined`.
   */
  mapAll<T extends Record<string, unknown>, U>(
    t: T,
    f: (result: { readonly [K in keyof T]: Exclude<T[K], undefined> }) => U
  ): U | undefined {
    return Undefined.map(Undefined.all(t), f)
  },

  /**
   * Given a value that is possibly `undefined`:
   * - Returns `[]` if it is `undefined`
   * - Otherwise, wraps the given value in a singleton list.
   *
   * There are lost of reasons to use this, but one useful pattern is to filter
   * out `undefined` values from a list:
   *
   * ```typescript
   * import { Undefined } from './Undefined';
   * ...
   * const listWithMissingValues: ReadonlyArray<string | undefined> = ...;
   *
   * const filteredList: readonly string[] =
   *   listWithMissingValues.flatMap(Undefined.toList);
   * ```
   */
  toList<A>(a: A | undefined): readonly [A] | readonly [] {
    if (a === undefined) return []

    return [a]
  },

  /**
   * Maps an optional value a to a list using the provided function f:
   *
   * - If the value a is undefined, returns an empty list.
   *
   * - Otherwise, applies the function f to the value a, and returns a list
   * containing the result of f.
   */
  mapToList<A, B>(
    a: A | undefined,
    f: (_: A) => B
  ): readonly [B] | readonly [] {
    return Undefined.toList(Undefined.map(a, f))
  },

  /**
   * Returns the given value, unless it is `undefined` - in which case an {@link Error}
   * `e` is thrown.
   *
   * `e` contains the given `errorMessage`, or a generic one if `errorMessage` is
   * not provided.
   */
  throwIfUndefined<A>(value: A | undefined, errorMessage?: string): A {
    if (value !== undefined) return value

    throw new Error(
      errorMessage ?? 'Expected the given value not to be undefined.'
    )
  },
} as const
