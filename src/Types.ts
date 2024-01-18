/** @fileoverview Extra type functions. */

/** @fileoverview Extra type functions. */
import type { AssertTrue, Equals } from "./typeAssertions";

/** Strips any `readonly` modifiers from `T`. */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type __Assert__Mutable__StripsMutableModifier = AssertTrue<
  Equals<Mutable<{ readonly foo: string }>, { foo: string }>
>;

type __Assert__Mutable__IdentityForNonReadonlyFields = AssertTrue<
  Equals<Mutable<{ bar: string }>, { bar: string }>
>;

/**
 * Specifies string literal (eg. "foo") or string union (eg. "foo" | "bar"), but
 * maps `string` to `never`.
 *
 * This is useful for declaring types with `string` fields, but must be string
 * unions or literals (and not the entire `string` type).
 */
export type StringLiteral<S extends string> = string extends S ? never : S;

/**
 * Specifies a type with a `kind` field which must be a string literal. Useful
 * for creating type operators for tagged unions.
 */
export type Kinded<K extends string> = string extends K
  ? never
  : {
      readonly kind: K;
    };

/**
 * Union between `T` and `NewT`, overwriting keys which occur in both with the
 * types in `NewT`.
 */
export type Overwrite<T, NewT> = Omit<T, keyof NewT> & NewT;

/**
 * Makes a complex type prettier by computing a simpler type from it.
 *
 * See: https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;
