import fc, {
  Arbitrary,
  type ArrayConstraints,
  type StringSharedConstraints,
} from "fast-check";

import {
  type CamelCaseString,
  type SnakeCaseString,
  type SplitStringArray,
  type TitleCaseString,
  toCamelCase,
  toSnakeCase,
  toSplitStringArray,
  toTitleCase,
} from "../Strings";

/** Generates an arbitrary lowercase alpha character. */
export function arbitraryLowerAlphaChar(): Arbitrary<string> {
  return fc.mapToConstant({
    num: 26,
    build: (v) => String.fromCharCode(v + 0x61),
  });
}

export type SplitStringArrayConstraints = Readonly<{
  wordContraints?: StringSharedConstraints;
  wordsConstraints?: ArrayConstraints;
}>;

export function arbitrarySplitStringArray(
  constraints: SplitStringArrayConstraints = {},
): Arbitrary<SplitStringArray> {
  return fc
    .array(
      fc.stringOf(arbitraryLowerAlphaChar(), constraints.wordContraints),
      constraints.wordsConstraints,
    )
    .map(toSplitStringArray);
}

export function arbitraryCamelCaseString(
  constraints: SplitStringArrayConstraints = {},
): Arbitrary<CamelCaseString> {
  return arbitrarySplitStringArray(constraints).map(toCamelCase);
}

export function arbitrarySnakeCaseString(
  constraints: SplitStringArrayConstraints = {},
): Arbitrary<SnakeCaseString> {
  return arbitrarySplitStringArray(constraints).map(toSnakeCase);
}

export function arbitraryTitleCaseString(
  constraints: SplitStringArrayConstraints = {},
): Arbitrary<TitleCaseString> {
  return arbitrarySplitStringArray(constraints).map(toTitleCase);
}
