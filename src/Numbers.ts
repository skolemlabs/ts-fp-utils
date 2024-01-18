/**
 * Given a value and some bounds:
 * - Returns `low` if `value < low`
 * - Returns `high` if `value > high`
 * - Otherwise returns `value`
 */
export function clamp(low: number, value: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/**
 * Checks if `value` is between `lowInclusive` and `highInclusive`
 * (inclusively), and is also an integer.
 */
export function isIntInBounds(
  value: number,
  {
    lowInclusive,
    highInclusive,
  }: { readonly lowInclusive: number; readonly highInclusive: number },
): boolean {
  if (!Number.isSafeInteger(value)) return false;

  return value >= lowInclusive && value <= highInclusive;
}
