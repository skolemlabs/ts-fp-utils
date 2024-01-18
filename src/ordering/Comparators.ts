import * as Arrays from "../Arrays";
import { type Comparator, makeComparator } from "./Comparator";

/** All comparable types. */
type Comparable =
  | string
  | number
  | bigint
  | Date
  | typeof ALWAYS_LESS
  | typeof ALWAYS_GREATER;

/**
 * This value should always occur first in an sort, regardless of the sort
 * direction.
 */
export const ALWAYS_LESS: unique symbol = Symbol("ALWAYS_FIRST");
/**
 * This value should always occur first in an sort, regardless of the sort
 * direction.
 */
export const ALWAYS_GREATER: unique symbol = Symbol("ALWAYS_LAST");

/** Compares numbers in the natural order - eg. [1, 2, 3, 4, 5].  */
export const NATURAL_ORDER: Comparator<Comparable> = makeComparator((x, y) => {
  if (x === ALWAYS_LESS) return LT;
  if (x === ALWAYS_GREATER) return GT;

  if (y === ALWAYS_LESS) return GT;
  if (y === ALWAYS_GREATER) return LT;

  if (x > y) return GT;
  if (x < y) return LT;
  return EQ;
});

/**
 * Creates a comparator which compares on the returned values from `getter`, in
 * natural order.
 */
export const comparing = <A, B extends Comparable>(
  getter: (a: A) => B,
): Comparator<A> =>
  makeComparator((a1, a2) => NATURAL_ORDER(getter(a1), getter(a2)));

/**
 * Creates {@link Comparator} which compares on the returned values from
 * `getter`, in natural order, but with a twist: if `predicate` returns `true`
 * for a value, then that value will always be sorted first (or last, depending
 * on `priority`). This is useful for sorting arrays of objects by a property,
 * but always putting a certain value first or last.
 *
 * Note: When reversing the returned comparator, the priority will not be reversed
 *
 * @param getter - The function to get the value to compare on
 * @param predicate - The function to determine if a value should be prioritized
 * @param priority - Whether to prioritize values that match the predicate
 *
 * @returns {@link Comparator}
 */
export function comparingWithPriority<A, B extends Comparable>(
  getter: (a: A) => B,
  predicate: (a: A) => boolean,
  priority: typeof ALWAYS_LESS | typeof ALWAYS_GREATER = ALWAYS_GREATER,
): Comparator<A> {
  return comparing(getter).finally(
    comparing((a) =>
      predicate(a)
        ? priority
        : priority === ALWAYS_GREATER
        ? ALWAYS_LESS
        : ALWAYS_GREATER,
    ),
  );
}

/**
 * Creates a comparator which compares on the returned values from `getter`, in
 * natural order.
 *
 * Treats `null` values as less than other values that are encountered.
 *
 * Note that we must use `null` instead of `null | undefined` here - `undefined`
 * values in an array are not handled properly by {@link Array.sort}.
 */
export function nullsFirst<A, B extends Comparable>(
  getter: (a: A) => B | null,
): Comparator<A> {
  return makeComparator((a1, a2) => {
    const [b1, b2] = [getter(a1), getter(a2)];

    if (b1 === null && b2 === null) return EQ;
    if (b1 === null) return LT;
    if (b2 === null) return GT;

    return NATURAL_ORDER(b1, b2);
  });
}

/**
 * Creates a comparator which compares on the returned values from `getter`, in
 * natural order.
 *
 * Treats `null` values as greater than other values that are encountered.
 *
 * Note that we must use `null` instead of `null | undefined` here - `undefined`
 * values in an array are not handled properly by {@link Array.sort}.
 */
export function nullsLast<A, B extends Comparable>(
  getter: (a: A) => B | null,
): Comparator<A> {
  return makeComparator((a1, a2) => {
    const [b1, b2] = [getter(a1), getter(a2)];

    if (b1 === null && b2 === null) return EQ;
    if (b1 === null) return GT;
    if (b2 === null) return LT;

    return NATURAL_ORDER(b1, b2);
  });
}

/**
 * Signifies that the first value in a comparison is greater than the second.
 */
const GT = 1;
/** Signifies that the first value in a comparison is less than the second. */
const LT = -1;
/** Signifies that the values in a comparison are equal. */
const EQ = 0;

/**
 * @param ordering The array of items to order by.
 * @returns  A comparator that orders items given to it based on the order they
 * appear in the `ordering` array.
 */
export function inOrder<T>(ordering: readonly T[]): Comparator<T> {
  return comparing((item) => ordering.indexOf(item));
}

/**
 * @param getter A function which returns a value to compare on
 * @param comparator The comparator to use on the values returned by `getter`.
 * @returns A comparator which compares on the values returned by `getter`.
 */
export function compareBy<T, V>(
  getter: (t: T) => V,
  comparator: Comparator<V>,
): Comparator<T> {
  return makeComparator((t1, t2) => comparator(getter(t1), getter(t2)));
}

export function minimumBy<A>(
  values: readonly A[],
  comparator: Comparator<A>,
): A | undefined {
  const [value, ...rest] = values;
  if (rest.length === 0) return value;

  return Arrays.reduce(rest, value, (next, acc) => {
    if (comparator(next, acc) < 0) return next;
    return acc;
  });
}

export function maximumBy<A>(
  values: readonly A[],
  comparator: Comparator<A>,
): A | undefined {
  const [value, ...rest] = values;
  if (rest.length === 0) return value;

  return Arrays.reduce(rest, value, (next, acc) => {
    if (comparator(next, acc) > 0) return next;
    return acc;
  });
}
