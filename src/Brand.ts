declare const BRAND: unique symbol

/**
 * Creates a new branded type by intersecting a given type with an object
 * containing a unique brand symbol.
 */
export type Brand<T, B> = T & { [BRAND]: B }

/**
 * Computes the type of a branded type, omitting the brand.
 *
 * This can be useful for creating smart constructors which take and validate
 * an unbranded type, then return its branded counterpart.
 */
export type Unbrand<T> = T extends Brand<infer X, unknown> ? X : never

/** Creates a new branded type by intersecting a given type with an object containing a unique brand symbol. */
export function toBrandedType<T, B>(value: T, _brand: B): Brand<T, B> {
  return value as Brand<T, B>
}

export const Brand = {
  apply: toBrandedType,
} as const
