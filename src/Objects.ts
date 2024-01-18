/** @fileoverview Utilities for objects. */

/**
 * Returns a new object, equal to `object` without the mapping with key(s) `keyOrKeys`.
 */
export const omit = <T, F extends keyof T>(
  object: T,
  keyOrKeys: F | F[]
): Omit<T, F> => {
  const result = { ...object }
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  for (const key of keys) {
    delete result[key]
  }

  return result
}

/**
 * Given a record and a function, applies the function to each value in the
 * record, preserving its keys.
 */
export function map<A, B>(
  object: Record<string, A>,
  fn: (_: A) => B
): Record<string, B> {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, fn(v)] as const)
  )
}

/**
 * Given a record and a function, applies the function to each entry in the
 * record.
 */
export function mapEntries<A, B>(
  object: Record<string, A>,
  fn: ([k, v]: readonly [string, A]) => readonly [string, B]
): Record<string, B> {
  return Object.fromEntries(Object.entries(object).map(fn))
}

/**
 * Given a record, returns its entries as tuples.
 */
export function entries<O extends Record<string | number | symbol, unknown>>(
  obj: O
): readonly Entry<O>[] {
  return Object.entries(obj) as Entry<O>[]
}

/** Type operator that gives the type returned by `Object.entries` for a given object */
export type Entry<O, K = keyof O> = K extends keyof O
  ? [K, O[K] extends undefined ? O[K] : Exclude<O[K], undefined>]
  : never

/**
 * Given a list of items, and a function for computing keys, returns an Object
 * where the items are indexed by the returned keys.
 *
 * This uses {@link Object.fromEntries}, so upon key collision, the item
 * occurring latest in the array is associated with that key.
 */
export const groupBy = <T>(
  ts: readonly T[],
  keyGetter: (_: T) => string
): Record<string, T> => {
  const entries = ts.map((t) => [keyGetter(t), t] as const)

  if (entries.some((x) => x[0] === '__proto__')) {
    throw new Error(
      'Encountered "__proto__" key! This is not supported, as it ' +
        'will change the prototype of the returned object. See ' +
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto ' +
        'for more information.'
    )
  }

  return Object.fromEntries(entries)
}

/** Type casted implementation of Object.keys */
export const getKeys = <T extends object>(obj: T): ReadonlyArray<keyof T> =>
  Object.keys(obj) as Array<keyof T>

/**
 * Builds a new object where the keys and values of the input object are
 * swapped.
 *
 * ```typescript
 * const MAPPING = { a: 1, b: 2, c: 3 } as const
 *
 * const INVERTED = invert(MAPPING)
 * //     ^?  const INVERTED: Readonly<{ 1: 'a', 2: 'b', 3: 'c'}>
 * ```
 * */
export function invert<
  K extends string | symbol | number,
  V extends string | symbol | number,
  R extends Record<K, V>
>(r: R): { readonly [K in keyof R as R[K]]: K } {
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [v, k] as const))
}

/**
 * Type operator that returns a union of keys not mapped to `never` for a given object.
 *
 * For example:
 *    const obj = {x: string; y?: number; foo: never}
 *    KeysOfNonNeverValues<obj> // => 'x' | 'y'
 */
export type KeysOfNonNeverValues<O> = Exclude<
  {
    [K in keyof O]: O[K] extends never ? never : K
  }[keyof O],
  undefined
>

/**
 * Type operator that removes all object entries where values are typed as `never`.
 *
 * For example:
 *    const obj = {x: string; y?: number; foo: never}
 *    OmitNeverFromObject<obj> // => {x: string; y?: number}
 */
export type OmitNeverFromObject<O> = Pick<O, KeysOfNonNeverValues<O>>
