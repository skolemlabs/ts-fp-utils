import fc from "fast-check";

import {
  fromCamelCase,
  fromSnakeCase,
  fromTitleCase,
  isCamelCase,
  toCamelCase,
  toSnakeCase,
  toTitleCase,
} from "./Strings";
import {
  arbitraryCamelCaseString,
  arbitrarySnakeCaseString,
  arbitrarySplitStringArray,
  arbitraryTitleCaseString,
} from "./testing/String.arbitrary";

describe("Strings", () => {
  describe("fromTitleCase", () => {
    test("should return an array of words when given a title-cased string", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (input) => {
          const actual = fromTitleCase(toTitleCase(input));
          expect(actual).toEqual(input);
        }),
      );
    });
  });

  describe("fromSnakeCase", () => {
    test("should return an array of words when given a snake-cased string", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (input) => {
          const actual = fromSnakeCase(toSnakeCase(input));
          expect(actual).toEqual(input);
        }),
      );
    });
  });

  describe("toTitleCase", () => {
    test("should return the same string if it is already in title case", () => {
      fc.assert(
        fc.property(arbitraryTitleCaseString(), (s) => {
          expect(toTitleCase(fromTitleCase(s))).toEqual(s);
        }),
      );
    });

    test("should convert any SplitStringArray to title case", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (s) => {
          expect(toTitleCase(s)).toEqual(
            s
              .map((part) => {
                return part[0].toUpperCase() + part.slice(1);
              })
              .join(" "),
          );
        }),
      );
    });
  });

  describe("toSnakeCase", () => {
    test("should return the same string if it is already in snake_case", () => {
      fc.assert(
        fc.property(arbitrarySnakeCaseString(), (s) => {
          expect(toSnakeCase(fromSnakeCase(s))).toEqual(s);
        }),
      );
    });

    test("should convert any string to snake_case", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (s) => {
          expect(toSnakeCase(s)).toEqual(s.join("_"));
        }),
      );
    });
  });

  describe("fromCamelCase", () => {
    test("should return an array of words when given a camel-cased string", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (input) => {
          const actual = fromCamelCase(toCamelCase(input));
          expect(actual).toEqual(input);
        }),
      );
    });
  });

  describe("toCamelCase", () => {
    test("arbitrary generates only camelCase strings", () => {
      fc.assert(
        fc.property(arbitraryCamelCaseString(), (s) => {
          expect(isCamelCase(s)).toEqual(true);
        }),
      );
    });

    test("should return the same string if it is already in camel case", () => {
      fc.assert(
        fc.property(arbitraryCamelCaseString(), (s) => {
          expect(toCamelCase(fromCamelCase(s))).toEqual(s);
        }),
      );
    });

    test("should convert any SplitString to camel case", () => {
      fc.assert(
        fc.property(arbitrarySplitStringArray(), (s) => {
          const camelCased = toCamelCase(s);
          expect(camelCased).toEqual(
            s
              .map((word, index) => {
                const trimmedWord = word.trim();
                if (index === 0) return trimmedWord.toLowerCase();
                return (
                  trimmedWord.charAt(0).toUpperCase() +
                  trimmedWord.slice(1).toLowerCase()
                );
              })
              .join(""),
          );
        }),
      );
    });
  });
});
