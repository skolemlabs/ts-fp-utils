/**
 * The `partition` function takes a predicate and a list, and returns the pair
 * of lists of elements which do and do not satisfy the predicate, respectively:
 *
 * ```typescript
 * >>> const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
 * >>> partition(toList("Hello, World!"), x => vowels.has(x))
 * [toList("eoo"), toList("Hll Wrld!")]
 * ```
 */
export const partition = <A>(
  xs: readonly A[],
  predicate: (_: A) => boolean,
): [readonly A[], readonly A[]] => {
  const falses: A[] = [];
  const trues: A[] = [];

  xs.forEach((x) => {
    if (predicate(x)) {
      trues.push(x);
    } else {
      falses.push(x);
    }
  });

  return [trues, falses];
};

/** Narrows `ts` to an array which contains at least one element. */
export function isNonEmpty<T>(ts: readonly T[]): ts is readonly [T, ...T[]] {
  return ts.length > 0;
}

/*
 * `zip` takes two lists and returns a list of corresponding pairs.
 *
 * ```typescript
 * zip([1, 2], ['a', 'b'])  // -> [[1, 'a'], [2, 'b']]
 * ```
 *
 * If one input list is shorter than the other, excess elements of the longer
 * list are discarded:
 *
 * ```typescript
 * zip([1], ['a', 'b'])  // -> [1, 'a']
 * zip([1, 2], ['a'])  // -> [1, 'a']
 * zip([], [1, 2, 3])  // -> []
 * zip([1, 2, 3], [])  // -> []
 * ```
 */
export const zip = <A, B>(
  as: readonly A[],
  bs: readonly B[],
): ReadonlyArray<[A, B]> => {
  const length = Math.min(as.length, bs.length);

  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = [as[i], bs[i]];
  }

  return result;
};

/**
 * `map2` takes two lists and a function, applies the function to each pair of elements
 * from the two lists, and returns a list of results.
 *
 * ```typescript
 * map2([1, 2], ['a', 'b'], (num, str) => num + str)  // -> ['1a', '2b']
 * ```
 *
 * If one input list is shorter than the other, excess elements of the longer
 * list are discarded. The function is applied only to the corresponding pairs.
 *
 * ```typescript
 * map2([1], ['a', 'b'], (num, str) => num + str)  // -> ['1a']
 * map2([1, 2], ['a'], (num, str) => num + str)  // -> ['1a']
 * map2([], [1, 2, 3], (num, str) => num + str)  // -> []
 * map2([1, 2, 3], [], (num, str) => num + str)  // -> []
 * ```
 */
export const map2 = <A, B, C>(
  as: readonly A[],
  bs: readonly B[],
  func: (a: A, b: B) => C,
): ReadonlyArray<C> => {
  const length = Math.min(as.length, bs.length);

  const result = new Array<C>(length);

  for (let i = 0; i < length; i++) {
    result[i] = func(as[i], bs[i]);
  }

  return result;
};

/**
 * Returns a new array, containing the reversed contents of `as`.
 *
 * This differs from `myArray.reverse()`, as it preserves ordering of the input
 * array.
 */
export const reverse = <A>(as: readonly A[]): readonly A[] => {
  const result = [...as];

  result.reverse();

  return result;
};

/*
 * Builds an array of values, starting at `startInclusive` and ending before
 * `endExclusive`. Each value increments by `step`, or `1` if `step` is not
 * specified.
 *
 * If `endExclusive` is less than or equal to `startInclusive`, the result is an
 * empty array. Otherwise, `startInclusive` is always included in the result.
 */
export const range = (
  startInclusive: number,
  endExclusive: number,
  step = 1,
): readonly number[] => {
  const length = Math.max(0, Math.ceil((endExclusive - startInclusive) / step));
  const result = new Array<number>(length);

  for (let i = 0; i < length; i++) {
    result[i] = startInclusive + step * i;
  }

  return result;
};

/**
 * Deduplicates elements in `ts`, by checking equality on values returned from
 * `getter`. The first values which return a given `v` from `getter` propagate
 * to the result.
 */
export const uniqueBy = <T, V>(
  ts: readonly T[],
  getter: (_: T) => V,
): readonly T[] => {
  const result: T[] = [];
  const vs = new Set<V>();

  ts.forEach((t) => {
    const v = getter(t);
    if (!vs.has(v)) {
      result.push(t);
    }

    vs.add(v);
  });

  return result;
};

/**
 * Convenience overload of {@link uniqueBy}, which checks for uniqueness via the
 * `===` operator on each element.
 */
export const unique = <T>(ts: readonly T[]) => uniqueBy(ts, (x) => x);

/*
 * Reduces `as`, given a base case `base` and a reducer function `f`.
 *
 * This is an improvement over {@link Array.reduce}, as it allows the return
 * value to be a different type than the values in the array.
 */
export function reduce<A, B>(
  as: readonly A[],
  base: B,
  f: (next: A, acc: B) => B,
): B {
  let currentB = base;

  for (const a of as) {
    currentB = f(a, currentB);
  }

  return currentB;
}

/**
 * Finds all duplicate elements (tested via `===`) in the given array, returning
 * the duplicate elements in order of occurrence.
 *
 * ```typescript
 * findDuplicates([])  // returns []
 * findDuplicates([1, 2, 3])  // returns []
 * findDuplicates([1, 2, 2])  // returns [2]
 * findDuplicates([1, 2, 2, 1])  // returns [2, 1]
 * ```
 */
export const findDuplicates = <T>(ts: readonly T[]): readonly T[] => {
  const visited = new Set<T>();
  const duplicates = new Set<T>();

  for (const t of ts) {
    if (visited.has(t)) {
      duplicates.add(t);
    }
    visited.add(t);
  }

  return [...duplicates];
};

/** Allocates an array with length `count`, where each item is `item`. */
export const replicate = <T>(count: number, item: T): readonly T[] => {
  if (count <= 0) return [];

  return new Array(count).fill(item);
};

/**
 * Given two arrays, returns an array of interleaving elements between the two.
 * All elements of both arrays are returned - interleaving is cut short when
 * one array is shorter than the other.
 *
 * ```typescript
 * interleave([1, 2, 3], ['a', 'b', 'c'])  // [1, 'a', 2, 'b', 3, 'c']
 * interleave([], [1, 2, 3])  // [1, 2, 3]
 * interleave([1, 2, 3], [])  // [1, 2, 3]
 * ```
 */
export function interleave<A, B>(
  as: readonly A[],
  bs: readonly B[],
): ReadonlyArray<A | B> {
  if (as.length === 0) return bs;
  if (bs.length === 0) return as;

  const result = [];

  const maxLen = Math.max(as.length, bs.length);

  for (let i = 0; i < maxLen; i++) {
    if (as.length > i) {
      result.push(as[i]);
    }
    if (bs.length > i) {
      result.push(bs[i]);
    }
  }

  return result;
}

/**
 * Given an array of items, and a function to get a group name by which to group items,
 * returns a Map of group names to groups.
 */
export const groupBy = <K extends string | number | symbol, V>(
  arr: V[],
  getGroupName: (_: V) => K,
): { readonly [P in K]?: readonly V[] } => {
  const groups: { [P in K]?: V[] } = {};

  arr.forEach((el) => {
    const groupName = getGroupName(el);
    const groupItems = groups[groupName];

    if (groupItems === undefined) {
      groups[groupName] = [el];
    } else {
      groupItems.push(el);
    }
  });

  return groups;
};

/** Returns the first `n` elements from the given array.  */
export function take<T>(n: number, ts: readonly T[]): readonly T[] {
  return ts.slice(0, n);
}

/** Returns the given array, with the first `n` elements removed. */
export function drop<T>(n: number, ts: readonly T[]): readonly T[] {
  return ts.slice(n);
}

/** Typesafe version of `Array.isArray` */
export function isArray<T, U>(value: T | readonly U[]): value is readonly U[] {
  return Array.isArray(value);
}

/** Type helper -- given the type of an array, extracts the type of its elements. */
export type ElementType<T extends Array<unknown> | ReadonlyArray<unknown>> =
  T extends Array<infer R> ? R : T extends ReadonlyArray<infer R> ? R : never;
