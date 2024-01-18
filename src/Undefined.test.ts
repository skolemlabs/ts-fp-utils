import fc from "fast-check";

import { Undefined } from "./Undefined";

describe("Undefined utilities", () => {
  describe("map", () => {
    it("Returns undefined for an undefined input", () => {
      fc.assert(
        fc.property(
          fc.func(fc.oneof(fc.anything(), fc.constant(undefined))),
          (f) => {
            const actual = Undefined.map(undefined, f);

            expect(actual).toBeUndefined();
          },
        ),
      );
    });

    it("Returns the mapped value for an input that is not undefined", () => {
      fc.assert(
        fc.property(
          fc.func(fc.oneof(fc.anything(), fc.constant(undefined))),
          fc.anything().filter((x) => x !== undefined),
          (f, input) => {
            const actual = Undefined.map(input, f);
            const expected = f(input);

            expect(actual).toEqual(expected);
          },
        ),
      );
    });
  });

  describe("toList", () => {
    it("Returns the empty list for an undefined input", () => {
      const actual = Undefined.toList(undefined);

      expect(actual).toEqual([]);
    });

    it("Returns a singleton list for an input that is not undefined", () => {
      fc.assert(
        fc.property(
          fc.anything().filter((x) => x !== undefined),
          (input) => {
            const actual = Undefined.toList(input);
            const expected = [input];

            expect(actual).toEqual(expected);
          },
        ),
      );
    });
  });

  describe.only("mapToList", () => {
    it("Returns an empty list for an undefined input", () => {
      fc.assert(
        fc.property(fc.func(fc.anything()), (f) => {
          const actual = Undefined.mapToList(undefined, f);

          expect(actual).toEqual([]);
        }),
      );
    });

    it.only("Returns a singleton list with the result of applying the function to the input, for an input that is not undefined", () => {
      fc.assert(
        fc.property(
          fc.anything().filter((x) => x !== undefined),
          fc.func(fc.anything().filter((x) => x !== undefined)),
          (input, f) => {
            const actual = Undefined.mapToList(input, f);
            const expected = [f(input)];

            expect(actual).toEqual(expected);
          },
        ),
      );
    });
  });

  describe("allValues", () => {
    it("Returns undefined if any value of the record is empty", () => {
      fc.assert(
        fc.property(
          fc
            .object()
            .filter((x) => Object.values(x).some((v) => v === undefined)),
          (obj) => {
            const actual = Undefined.all(obj);

            expect(actual).toBeUndefined();
          },
        ),
      );
    });

    it("Returns the same object if all fields are not undefined", () => {
      fc.assert(
        fc.property(
          fc
            .object()
            .filter((x) => Object.values(x).every((v) => v !== undefined)),
          (obj) => {
            const actual = Undefined.all(obj);

            expect(actual).toBe(obj);
          },
        ),
      );
    });
  });

  describe("mapAllValues", () => {
    it("Maps over a record with no undefined values and returns the result", () => {
      fc.assert(
        fc.property(
          fc.object({ values: [fc.anything().filter((x) => x !== undefined)] }),
          fc.func(
            fc.object({
              values: [fc.anything().filter((x) => x !== undefined)],
            }),
          ),
          (obj, f) => {
            const expected = f(obj);

            const actual = Undefined.mapAll(obj, f);

            expect(actual).toEqual(expected);
          },
        ),
      );
    });

    it("Returns undefined if any fields are undefined", () => {
      fc.assert(
        fc.property(
          fc
            .object()
            .filter((x) => Object.values(x).some((v) => v === undefined)),
          fc.func(fc.anything()),
          (obj, f) => {
            expect(Undefined.mapAll(obj, f)).toBeUndefined();
          },
        ),
      );
    });
  });
});
