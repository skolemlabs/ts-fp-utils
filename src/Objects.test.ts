import fc from "fast-check";

import * as Arrays from "./Arrays";
import * as Objects from "./Objects";
import { type Entry, mapEntries } from "./Objects";
import type { AssertTrue, Equals } from "./typeAssertions";

//
// #region: Type assertions
//

// tests for type operator `Entry<O>`

interface EntryInput {
  name: string;
  age: number;
  locations: string[] | null;
}

type EntryOutput =
  | ["name", string]
  | ["age", number]
  | ["locations", string[] | null];

type __Assert__Entry__Optional__Key = AssertTrue<
  Equals<Entry<{ key?: undefined }>, ["key", undefined]>
>;
type __Assert__Entry__Key = AssertTrue<
  Equals<Entry<{ key: undefined }>, ["key", undefined]>
>;
type __Assert__Entry__ModelEntry = AssertTrue<
  Equals<Entry<EntryInput>, EntryOutput>
>;
type __Assert__Entry__Partial__ModelEntry = AssertTrue<
  Equals<Entry<Partial<EntryInput>>, EntryOutput>
>;

// tests for type operator `KeysOfNonNeverValues<O>`

interface KeysOfNonNeverValuesInput {
  name: string;
  age?: number;
  foo: never;
}

type KeysOfNonNeverValuesOutput = "name" | "age";

type __Assert__KeysOfNonNeverValues = AssertTrue<
  Equals<
    Objects.KeysOfNonNeverValues<KeysOfNonNeverValuesInput>,
    KeysOfNonNeverValuesOutput
  >
>;

// tests for type operator `OmitNeverFromObject<O>`

interface OmitNeverFromObjectInput {
  name: string;
  age?: number;
  foo: never;
}

type OmitNeverFromObjectOutput = {
  name: string;
  age?: number;
};

type __Assert__OmitNeverFromObject = AssertTrue<
  Equals<
    Objects.OmitNeverFromObject<OmitNeverFromObjectInput>,
    OmitNeverFromObjectOutput
  >
>;

//
// #endregion: Type assertions
//

interface MyObject {
  readonly foo: "foo";
  readonly bar: "bar";
  readonly foobar: "foobar";
}

const MY_OBJECT: MyObject = {
  foo: "foo",
  bar: "bar",
  foobar: "foobar",
};

describe("Object utilities", () => {
  describe("omit", () => {
    it("Removes the given key from the given object.", () => {
      const actual = Objects.omit(MY_OBJECT, "foo");

      expect("foo" in actual).toBeFalsy();
      Object.keys(actual).forEach((key) => {
        expect(key in MY_OBJECT).toBeTruthy();
      });
    });
  });

  describe("groupBy", () => {
    it('throws an Error if the key "__proto__" is found', () => {
      expect(() => Objects.groupBy([[]], () => "__proto__")).toThrow(
        /__proto__/,
      );
    });

    it("associates a key for every element, when keys do not collide", () => {
      fc.assert(
        fc.property(fc.array(fc.uuid()), (uuids) => {
          const actual = Objects.groupBy(uuids, (x) => x);

          uuids.forEach((uuid) => {
            expect(actual[uuid]).toEqual(uuid);
          });
        }),
      );
    });

    it("Associates the last key/value pair upon collision", () => {
      fc.assert(
        fc.property(
          fc
            .string()
            // See above test - this key is forbidden, as it will change the
            // prototype of the returned object.
            .filter((x) => x !== "__proto__"),
          fc.array(fc.anything(), { minLength: 1 }),
          (key, values) => {
            const actual = Objects.groupBy(values, () => key);

            const lastValue = values[values.length - 1];

            expect(actual).toEqual({
              [key]: lastValue,
            });
          },
        ),
      );
    });
  });

  describe("map", () => {
    it("Returns a record with the same keys as the original", () => {
      fc.assert(
        fc.property(
          fc
            .array(fc.string())
            .map((keys) =>
              Object.fromEntries(keys.map((k) => [k, k] as const)),
            ),
          fc.func(fc.anything()),
          (record, fn) => {
            const actual = Objects.map(record, fn);

            expect(Object.keys(actual)).toEqual(Object.keys(record));
          },
        ),
      );
    });

    it("Returns a record where the values are mapped", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()).chain((keys) =>
            fc
              .array(fc.nat(), {
                minLength: keys.length,
                maxLength: keys.length,
              })
              .map((values) => Object.fromEntries(Arrays.zip(keys, values))),
          ),
          (record) => {
            const actual = Objects.map(record, (x) => x * 2);

            expect(Object.values(actual)).toEqual(
              Object.values(record).map((x) => x * 2),
            );
          },
        ),
      );
    });

    test("Corresponding keys return the same value", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()).chain((keys) =>
            fc
              .array(fc.nat(), {
                minLength: keys.length,
                maxLength: keys.length,
              })
              .map((values) => Object.fromEntries(Arrays.zip(keys, values))),
          ),
          (record) => {
            const actual = Objects.map(record, (x) => x * 2);

            Object.keys(record).forEach((k) => {
              expect(record[k] * 2).toEqual(actual[k]);
            });
          },
        ),
      );
    });
  });

  describe("mapEntries", () => {
    it("Applies the provided function to each entry in the record", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()).chain((keys) =>
            fc
              .array(fc.nat(), {
                minLength: keys.length,
                maxLength: keys.length,
              })
              .map((values) =>
                Object.fromEntries(keys.map((k, i) => [k, values[i]] as const)),
              ),
          ),
          (record) => {
            const actual = mapEntries(record, ([k, v]) => [k, v * 2] as const);

            Object.entries(record).forEach(([k, v]) => {
              expect(actual[k]).toEqual(v * 2);
            });
          },
        ),
      );
    });

    it("Preserves the keys from the original record", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()).chain((keys) =>
            fc
              .array(fc.nat(), {
                minLength: keys.length,
                maxLength: keys.length,
              })
              .map((values) =>
                Object.fromEntries(keys.map((k, i) => [k, values[i]] as const)),
              ),
          ),
          (record) => {
            const actual = mapEntries(record, ([k, v]) => [k, v * 2] as const);

            expect(Object.keys(actual)).toEqual(Object.keys(record));
          },
        ),
      );
    });

    it("Can change the keys of the record", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()).chain((keys) =>
            fc
              .array(fc.nat(), {
                minLength: keys.length,
                maxLength: keys.length,
              })
              .map((values) =>
                Object.fromEntries(keys.map((k, i) => [k, values[i]] as const)),
              ),
          ),
          (record) => {
            const actual = mapEntries(
              record,
              ([k, v]) => [`new_${k}`, v] as const,
            );

            Object.keys(record).forEach((k) => {
              expect(actual[`new_${k}`]).toEqual(record[k]);
            });
          },
        ),
      );
    });
  });
});
