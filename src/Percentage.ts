import Decimal from 'decimal.js'

//
// #region Percentage {{{
//

/** A number of percentage points (i.e. 1/100 of a value). */
export type Percentage = `${number}%`
export const Percentage = {
  /**
   * Scales the given {@link Decimal} by the given {@link Percentage}.
   *
   * Example:
   * ```typescript
   * scale(new Decimal('100'), '25%')  // returns new Decimal('25')
   * ```
   */
  scale(percentage: Percentage, decimal: Decimal): Decimal {
    const multiplier = new Decimal(
      percentage.substring(0, percentage.length - 1)
    ).mul('0.01')

    return multiplier.mul(decimal)
  },
  /** Converts the given {@link Decimal} into a {@link Percentage}, as-is. */
  ofDecimal(decimal: Decimal): Percentage {
    if (decimal.isNaN() || !decimal.isFinite()) {
      throw new Error('Cannot convert decimal to percentage')
    }

    return `${decimal.toString()}%` as Percentage
  },

  /** Converts a {@link Percentage} to a {@link BasisPoints}. */
  toBasisPoints(percentage: Percentage): BasisPoints {
    return `${Percentage.value(percentage)
      .mul('100')
      .toString()}bps` as BasisPoints
  },

  /** Gets the numeric value of the given {@link Percentage}. */
  value(percentage: Percentage): Decimal {
    return new Decimal(percentage.substring(0, percentage.length - 1))
  },

  sign(percentage: Percentage): '+' | '-' | '±' {
    const value = Percentage.value(percentage)
    if (value.isZero()) return '±'
    if (value.isPositive()) return '+'
    return '-'
  },

  /** Computes the difference between two values, as a percentage. */
  difference(
    base: Decimal.Value,
    value: Decimal.Value,
    options: Readonly<{
      precision?: number
    }> = {}
  ): Percentage {
    const a = new Decimal(base)
    const b = new Decimal(value)

    const difference = new Decimal('100').mul(a.sub(b).div(a.add(b).div('2')))
    if (options.precision === undefined) {
      return Percentage.ofDecimal(difference)
    }

    return `${Number(difference.toPrecision(options.precision))}%`
  },
} as const

//
// #endregion Percentage }}}
// #region BasisPoints {{{
//

/** A number of basis points (i.e. 1/10_000 of a value). */
export type BasisPoints = `${number}bps`
export const BasisPoints = {
  /**
   * Scales the given {@link Decimal} by the given {@link BasisPoints}.
   *
   * Example:
   * ```typescript
   * scale(new Decimal('100'), '25bps')  // returns new Decimal('0.25')
   * ```
   */
  scale(decimal: Decimal, basisPoints: BasisPoints): Decimal {
    return BasisPoints.value(basisPoints).mul('0.0001').mul(decimal)
  },

  /** Converts the given {@link Decimal} into a {@link BasisPoints}, as-is. */
  ofDecimal(decimal: Decimal): BasisPoints {
    if (decimal.isNaN() || !decimal.isFinite()) {
      throw new Error('Cannot convert decimal to basis points')
    }

    return `${decimal.toString()}bps` as BasisPoints
  },

  /** Gets the numeric value of the given {@link BasisPoints}. */
  value(basisPoints: BasisPoints): Decimal {
    return new Decimal(basisPoints.substring(0, basisPoints.length - 3))
  },

  /** Rounds the given `basisPoints` to the nearest integer, returning as a `bigint`. */
  bigIntValue(basisPoints: BasisPoints): bigint {
    return BigInt(BasisPoints.value(basisPoints).round().toNumber())
  },
} as const

//
// #endregion BasisPoints }}}
//
