/** @fileoverview `fast-check` helpers, for generating specific arbitraries. */

import fc, { Arbitrary } from "fast-check";

import * as Arrays from "../Arrays";
import { zip } from "../Arrays";

/**
 * Generates a list of pairs, each with a unique string in its first position.
 */
export const arbitraryUniquelyKeyedTuples = <V>(
  arbitraryKey: Arbitrary<string>,
  arbitraryValue: Arbitrary<V>,
): Arbitrary<ReadonlyArray<readonly [string, V]>> =>
  fc
    .array(arbitraryKey)
    .map((x) => [...new Set(x)])
    .chain((keys) =>
      fc
        .array(arbitraryValue, {
          minLength: keys.length,
          maxLength: keys.length,
        })
        .map((values) => zip(keys, values)),
    );

/** Generates a record with unique string keys. */
export const arbitraryRecordWithUniqueKeys = <V>(
  arbitraryKey: Arbitrary<string>,
  arbitraryValue: Arbitrary<V>,
): Arbitrary<{ readonly [_: string]: V }> =>
  arbitraryUniquelyKeyedTuples(arbitraryKey, arbitraryValue).map(
    Object.fromEntries,
  );

/**
 * Generates an {@link ReadonlyArray} which is guaranteed to have unique values.
 *
 * Note that if the space of `arbitraryA` is less than the size of the array
 * specified in `constraints`, this may not complete during generation.
 *
 * @param arbitraryA {@link Arbitrary} for array values.
 * @param constraints The constraints on the resulting array.
 * @param eqBy How to determine uniqueness of elements in the resulting array.
 *             Defaults to the identity function.
 */
export function arbitraryUniqueArray<A>(
  arbitraryA: Arbitrary<A>,
  constraints: fc.ArrayConstraints = {},
  eqBy: (_: A) => unknown = (a) => a,
): Arbitrary<ReadonlyArray<A>> {
  return fc
    .array(arbitraryA, constraints)
    .filter((xs) => Arrays.uniqueBy(xs, eqBy).length === xs.length);
}
