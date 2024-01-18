/** Static utilities for functions. */
export const Functions = {
  Fluent: {
    of<A, B>(ab: (a: A) => B): FluentFunction<A, B> {
      // "Clone" `ab`, so we won't mutate it.
      const ab_ = (a: A): B => ab(a)

      ab_.fn = ab

      ab_.compose = function <C>(bc: (b: B) => C): FluentFunction<A, C> {
        return Functions.Fluent.of((a) => bc(ab(a)))
      }

      return ab_
    },
  },
}

/** A function with extra properties, providing a fluent API. */
export type FluentFunction<A, B> = Readonly<{
  /** Call signature -- allows this function to be called as-is.  */
  (a: A): B

  /**
   * Converts this `FluentFunction` into a standard function.
   *
   * Sometimes `FluentFunction`s aren't assignable to the corresponding
   * function type, so this property can be used to get a function type.
   */
  fn(a: A): B

  /**
   * Composes this function with another, resulting in another
   * {@link FluentFunction} of the composed type.
   */
  compose<C>(fn: (b: B) => C): FluentFunction<A, C>
}>
