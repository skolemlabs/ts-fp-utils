import fc from "fast-check";

import { arbitraryHms } from "./testing/Time.arbitrary";
import { formatDate, formatHms, HoursMinutesSeconds } from "./Time";

describe("Time utilities", () => {
  describe("formatDate", () => {
    it("Formats any date with default parameters", () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const actual = formatDate(date);

          expect(actual).not.toBeUndefined();
          expect(actual?.length).toBeGreaterThan(0);
        }),
      );
    });

    it("Returns undefined for an unknown time zone", () => {
      fc.assert(
        fc.property(
          fc.date(),
          // There are a lot of valid time zone strings... it's easiest to just
          // generate a long string which is almost certainly not a time zone.
          fc.string({ minLength: 10 }),
          (date, invalidTimeZone) => {
            const actual = formatDate(date, invalidTimeZone);

            expect(actual).toBeUndefined();
          },
        ),
      );
    });

    it("Formats a valid time in a valid time zone", () => {
      fc.assert(
        fc.property(
          fc.date(),
          fc.constantFrom("America/Denver", "America/Los_Angeles", null),
          (date, timeZone) => {
            const actual = formatDate(date, timeZone);

            expect(actual?.length).toBeGreaterThan(0);
          },
        ),
      );
    });
  });

  describe("secondsToHms", () => {
    it("converts a time in seconds to an object with hours, minutes, and seconds", () => {
      fc.assert(
        fc.property(fc.integer(), (seconds) => {
          const expected = {
            hours: Math.floor(seconds / 3600),
            minutes: Math.floor((seconds % 3600) / 60),
            seconds: seconds % 60,
          };

          const actual = HoursMinutesSeconds.ofSeconds(seconds);

          expect(actual).toEqual(expected);
        }),
      );
    });
  });

  describe("formatHms", () => {
    it("formats an object in HoursMinuteSeconds format to a string", () => {
      fc.assert(
        fc.property(arbitraryHms(), (hms) => {
          const actual = formatHms(hms);

          expect(actual).toEqual(
            `${hms.hours}h ${hms.minutes}m ${hms.seconds}s`,
          );
        }),
      );
    });
  });
});
