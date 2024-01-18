import { Arbitrary } from 'fast-check'

/**
 * Generates a floating point number with none of the following edge cases:
 * - `-0`
 * - `Infinity`
 * - `-Infinity`
 * - `NaN`
 */
export function niceFloat(
  arbitraryNumber: Arbitrary<number>
): Arbitrary<number> {
  return (
    arbitraryNumber
      .filter((x) => Number.isFinite(x) && !Number.isNaN(x))
      // Get rid of -0
      .map((x) => (x === 0 ? 0 : x))
  )
}
