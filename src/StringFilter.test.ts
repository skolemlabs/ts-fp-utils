import fc from "fast-check";

import * as Arrays from "./Arrays";
import { filter } from "./StringFilter";

describe("StringFilter", () => {
  describe("starts-with", () => {
    it("Keeps strings which start with the filterText", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.string().map((x) => ({ filterText: `${filterText}${x}` })),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "starts-with");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Keeps strings which start with the lowercase filterText", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.string().map((x) => ({
                  filterText: `${filterText.toLowerCase()}${x}`,
                })),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "starts-with");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Removes strings which do not start with the lowercase filterText", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).chain((filterText) =>
            fc
              .array(
                fc
                  .string()
                  .filter(
                    (x) =>
                      !x.toLowerCase().startsWith(filterText.toLowerCase()),
                  )
                  .map((filterText) => ({ filterText })),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "starts-with");

            expect(Object.keys(actual).length).toEqual(0);
          },
        ),
      );
    });
  });

  describe("includes", () => {
    it("Keeps strings which include the filterText", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.string().chain((value) =>
                  fc.integer({ min: 0, max: value.length }).map((cut) => {
                    const [prefix, suffix] = [
                      value.slice(0, cut),
                      value.slice(cut),
                    ];

                    return { filterText: `${prefix}${filterText}${suffix}` };
                  }),
                ),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "includes");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Keeps strings which include the lowercase filterText", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.string().chain((value) =>
                  fc.integer({ min: 0, max: value.length }).map((cut) => {
                    const [prefix, suffix] = [
                      value.slice(0, cut),
                      value.slice(cut),
                    ];

                    return {
                      filterText: `${prefix}${filterText.toLowerCase()}${suffix}`,
                    };
                  }),
                ),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "includes");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Removes strings which do not include the case-insensitive filterText", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).chain((filterText) =>
            fc
              .array(
                fc
                  .string()
                  .filter(
                    (x) => !x.toLowerCase().includes(filterText.toLowerCase()),
                  )
                  .map((filterText) => ({ filterText })),
              )
              .map((values) => ({
                filterText,
                values,
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "includes");

            expect(Object.keys(actual).length).toEqual(0);
          },
        ),
      );
    });
  });

  describe("fuzzy-linear", () => {
    it("Returns `values` when `filterText` is empty", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string().map((filterText) => ({ filterText }))),
          (values) => {
            const actual = filter("", values, "fuzzy-linear");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    test("Basic example", () => {
      const actual = filter(
        "abc",
        ["abracadabra", "ABRACADABRA", "Zebra"].map((filterText) => ({
          filterText,
        })),
        "fuzzy-linear",
      );

      const expected = ["abracadabra", "ABRACADABRA"].map((filterText) => ({
        filterText,
      }));

      expect(actual).toEqual(expected);
    });

    it("Keeps strings which contain the filterText, broken up", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.array(fc.string()).chain((extraParts) =>
                  fc
                    .array(fc.integer({ min: 0, max: filterText.length }), {
                      minLength: extraParts.length,
                      maxLength: extraParts.length,
                    })
                    .map((indices) => {
                      return Arrays.reduce(
                        Arrays.zip(extraParts, indices),
                        filterText,
                        ([s, i], acc) => {
                          const [prefix, suffix] = [
                            acc.slice(0, i),
                            acc.slice(i),
                          ];

                          return `${prefix}${s}${suffix}`;
                        },
                      );
                    }),
                ),
              )
              .map((values) => ({
                filterText,
                values: values.map((filterText) => ({ filterText })),
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "fuzzy-linear");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Keeps strings which contain the lowercase filterText, broken up", () => {
      fc.assert(
        fc.property(
          fc.string().chain((filterText) =>
            fc
              .array(
                fc.array(fc.string()).chain((extraParts) =>
                  fc
                    .array(fc.integer({ min: 0, max: filterText.length }), {
                      minLength: extraParts.length,
                      maxLength: extraParts.length,
                    })
                    .map((indices) => {
                      return Arrays.reduce(
                        Arrays.zip(extraParts, indices),
                        filterText.toLowerCase(),
                        ([s, i], acc) => {
                          const [prefix, suffix] = [
                            acc.slice(0, i),
                            acc.slice(i),
                          ];

                          return `${prefix}${s}${suffix}`;
                        },
                      );
                    }),
                ),
              )
              .map((values) => ({
                filterText,
                values: values.map((filterText) => ({ filterText })),
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "fuzzy-linear");

            expect(actual).toEqual(values);
          },
        ),
      );
    });

    it("Removes strings which do not include the case-insensitive filterText", () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.char(), { minLength: 3 }).chain((filterText) =>
            fc
              .array(fc.integer({ min: 1, max: filterText.length - 2 }))
              .map((indices) =>
                indices.map((i) => {
                  const [prefix, suffix] = [
                    filterText.slice(0, i - 1),
                    filterText.slice(i),
                  ];

                  return prefix + suffix;
                }),
              )
              .map((values) => ({
                filterText,
                values: values.map((filterText) => ({ filterText })),
              })),
          ),
          ({ filterText, values }) => {
            const actual = filter(filterText, values, "fuzzy-linear");

            expect(Object.keys(actual).length).toEqual(0);
          },
        ),
      );
    });
  });
});
