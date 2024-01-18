import Decimal from "decimal.js";
import fc from "fast-check";

import { BasisPoints, Percentage } from "./Percentage";
import { niceFloat } from "./testing/Number.arbitrary";

describe("Percentage utilities", () => {
  describe("Percentage", () => {
    describe("ofDecimal", () => {
      it("Converts any valid Decimal into a Percentage", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (decimal) => {
              const actual = Percentage.ofDecimal(decimal);

              expect(actual).toEqual(`${decimal.toString()}%`);
            },
          ),
        );
      });

      it.each([
        new Decimal("NaN"),
        new Decimal("Infinity"),
        new Decimal("-Infinity"),
      ])(
        "Throws when converting an invalid Decimal to a Percentage",
        (decimal) => {
          expect(() => Percentage.ofDecimal(decimal)).toThrow();
        },
      );
    });

    describe("scale", () => {
      it("scales any number by 0%", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(Percentage.scale("0%", value).abs()).toEqual(
                new Decimal("0"),
              );
            },
          ),
        );
      });

      it("scales any number by 50%", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(Percentage.scale("50%", value)).toEqual(value.div("2"));
            },
          ),
        );
      });

      it("scales any number by 100%", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(Percentage.scale("100%", value)).toEqual(value);
            },
          ),
        );
      });
    });
  });

  describe("BasisPoints", () => {
    describe("ofDecimal", () => {
      it("Converts any valid Decimal into a BasisPoints", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (decimal) => {
              const actual = BasisPoints.ofDecimal(decimal);

              expect(actual).toEqual(`${decimal.toString()}bps`);
            },
          ),
        );
      });

      it.each([
        new Decimal("NaN"),
        new Decimal("Infinity"),
        new Decimal("-Infinity"),
      ])(
        "Throws when converting an invalid Decimal to a BasisPoints",
        (decimal) => {
          expect(() => BasisPoints.ofDecimal(decimal)).toThrow();
        },
      );
    });

    describe("scale", () => {
      it("scales any number by 0bps", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(BasisPoints.scale(value, "0bps").abs()).toEqual(
                new Decimal("0"),
              );
            },
          ),
        );
      });

      it("scales any number by 5_000bps", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(BasisPoints.scale(value, "50bps")).toEqual(
                value.div("200"),
              );
            },
          ),
        );
      });

      it("scales any number by 10_000bps", () => {
        fc.assert(
          fc.property(
            niceFloat(fc.double()).map((x) => new Decimal(x)),
            (value) => {
              expect(BasisPoints.scale(value, "10000bps")).toEqual(value);
            },
          ),
        );
      });
    });
  });
});
