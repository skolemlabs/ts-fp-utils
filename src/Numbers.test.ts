import fc from 'fast-check'

import { isIntInBounds } from './Numbers'

describe('Number utilities', () => {
  describe('isIntInBounds', () => {
    it('returns false for non-integer values', () => {
      fc.assert(
        fc.property(
          fc.double().filter((x) => !Number.isSafeInteger(x)),
          fc.double(),
          fc.double(),
          (value, highInclusive, lowInclusive) => {
            expect(isIntInBounds(value, { highInclusive, lowInclusive })).toBe(
              false
            )
          }
        )
      )
    })

    it('returns false if value is below the lower bound', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: Number.MIN_SAFE_INTEGER + 2 })
            .chain((lowInclusive) =>
              fc
                .integer({
                  min: Number.MIN_SAFE_INTEGER,
                  max: lowInclusive - 1,
                })
                .map((value) => ({ value, lowInclusive }))
            ),
          fc.double(),
          ({ value, lowInclusive }, highInclusive) => {
            expect(isIntInBounds(value, { lowInclusive, highInclusive })).toBe(
              false
            )
          }
        )
      )
    })

    it('returns false if value is above the higher bound', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ max: Number.MAX_SAFE_INTEGER - 2 })
            .chain((highInclusive) =>
              fc
                .integer({
                  min: highInclusive + 1,
                  max: Number.MAX_SAFE_INTEGER,
                })
                .map((value) => ({ value, highInclusive }))
            ),
          fc.double(),
          ({ value, highInclusive }, lowInclusive) => {
            expect(isIntInBounds(value, { lowInclusive, highInclusive })).toBe(
              false
            )
          }
        )
      )
    })

    it('returns true if value is an integer in bounds', () => {
      fc.assert(
        fc.property(
          fc
            .integer({
              min: Number.MIN_SAFE_INTEGER + 1,
              max: Number.MAX_SAFE_INTEGER - 1,
            })
            .chain((value) =>
              fc
                .integer({ min: Number.MIN_SAFE_INTEGER, max: value })
                .chain((lowInclusive) =>
                  fc
                    .integer({ min: value, max: Number.MAX_SAFE_INTEGER })
                    .map((highInclusive) => ({
                      value,
                      lowInclusive,
                      highInclusive,
                    }))
                )
            ),
          ({ value, lowInclusive, highInclusive }) => {
            expect(isIntInBounds(value, { lowInclusive, highInclusive })).toBe(
              true
            )
          }
        )
      )
    })
  })
})
