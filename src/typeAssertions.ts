/**
 * If A extends B and B extends A, this evaluates to `true` (otherwise `false`).
 *
 * @param X The first input type
 * @param Y The second input type
 * @returns `true` (type) or `false` (type)
 *
 * @example
 * type T = Equals<'a', 'a'> // T = true
 * type T = Equals<'a', 'b'> // T = false
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false

/**
 * Asserts that a type is true.
 *
 * @param X The input type
 * @returns X (produces type error if X is not of type `true`)
 *
 * @example
 * type T = AssertTrue<true> (no type error)
 * type T = AssertTrue<false> (type error)
 */
export type AssertTrue<X extends true> = X

/**
 * Asserts that the three given types are equal, usually by providing `A` in the
 * third position, e.g.:
 *
 * ```typescript
 * assertTypesEqual<Foo, Bar, Foo>()
 * ```
 *
 * This provides better error messages than most type equality checks.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertTypesEqual<A, B extends A, _ extends B>() {}
