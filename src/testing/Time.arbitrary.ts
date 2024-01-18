import fc, { Arbitrary } from 'fast-check'

import { getKeys } from '../Objects'
import {
  HoursMinutesSeconds,
  INTERVAL_PERIODS,
  IntervalPeriod,
  ONE_HOUR_IN_MINUTES,
  ONE_HOUR_IN_SECONDS,
} from '../Time'

export const arbitraryHms = (): Arbitrary<HoursMinutesSeconds> =>
  fc.integer().map((x) => ({
    hours: Math.floor(x / ONE_HOUR_IN_SECONDS),
    minutes: Math.floor((x % ONE_HOUR_IN_SECONDS) / ONE_HOUR_IN_MINUTES),
    seconds: x % ONE_HOUR_IN_MINUTES,
  }))

export function arbitraryIntervalPeriod(): Arbitrary<IntervalPeriod> {
  return fc.constantFrom(...getKeys(INTERVAL_PERIODS))
}
