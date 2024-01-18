import * as dateFns from "date-fns";
import { format as dateFnsFormat, utcToZonedTime } from "date-fns-tz";

import { comparing, minimumBy } from "./ordering/Comparators";

export const ONE_HOUR_IN_SECONDS = 3600;
export const ONE_HOUR_IN_MINUTES = 60;

/**
 * Formats a given {@link Date} to a string, optionally in a given time zone,
 * with a given format.
 *
 * @returns `undefined` if date formatting fails, which is delegated to the
 * `date-fns` library.
 */
export function formatDate(
  date: Date,
  timeZone: string | null = null,
  fmt = "yyyy-MM-dd hh:mm:ss O",
): string | undefined {
  try {
    if (timeZone !== null) {
      return dateFnsFormat(utcToZonedTime(date, timeZone), fmt, {
        timeZone,
      });
    }

    return dateFnsFormat(date, fmt);
  } catch (error) {
    return undefined;
  }
}

type NewType = dateFns.Duration;

export const Dates = {
  add(date: Date, duration: NewType): Date {
    return dateFns.add(date, duration);
  },
  isBefore(date: Date, dateToCompare: Date): boolean {
    return dateFns.isBefore(date, dateToCompare);
  },
  subtract(date: Date, duration: dateFns.Duration): Date {
    return dateFns.sub(date, duration);
  },
  format: formatDate,
};

export interface HoursMinutesSeconds {
  hours: number;
  minutes: number;
  seconds: number;
}

export const HoursMinutesSeconds = {
  /**
   * Converts a number in seconds into an object that contains the number of hours, minutes, and seconds.
   *
   * @returns An object containing the time formatted in hours, seconds, and minutes
   */
  ofSeconds(seconds: number): HoursMinutesSeconds {
    const hours = Math.floor(seconds / ONE_HOUR_IN_SECONDS);
    const minutes = Math.floor(
      (seconds % ONE_HOUR_IN_SECONDS) / ONE_HOUR_IN_MINUTES,
    );
    const remainingSeconds = seconds % ONE_HOUR_IN_MINUTES;

    return { hours, minutes, seconds: remainingSeconds };
  },
  ofDuration(duration: dateFns.Duration): HoursMinutesSeconds {
    const seconds = dateFns.milliseconds(duration) / 1_000;

    return HoursMinutesSeconds.ofSeconds(seconds);
  },
} as const;

/**
 * Converts a time in {@link HoursMinutesSeconds} to a string.
 *
 * @params {Object} A duration represented by hours, minutes, and seconds {@link HoursMinutesSeconds}
 *
 * @returns {string} The time/duration in `xh xm xs`
 */
export function formatHms(time: HoursMinutesSeconds): string {
  return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
}

/** A type representing valid time intervals */
export type IntervalPeriod = keyof typeof INTERVAL_PERIODS;

/** The default interval periods for use. */
export const DEFAULT_INTERVAL_PERIODS = [
  "1M",
  "5M",
  "1H",
  "3H",
] as const satisfies readonly IntervalPeriod[];

/** Valid {@link IntervalPeriod}s and their metadata. */
export const INTERVAL_PERIODS = {
  "1M": {
    description: "1 minute",
    duration: { minutes: 1 },
    defaultWindowSize: { hours: 12 },
  },
  "5M": {
    description: "5 minutes",
    duration: { minutes: 5 },
    defaultWindowSize: { days: 1 },
  },
  "10M": {
    description: "10 minutes",
    duration: { minutes: 10 },
    defaultWindowSize: { days: 1 },
  },
  "15M": {
    description: "15 minutes",
    duration: { minutes: 15 },
    defaultWindowSize: { days: 1 },
  },
  "20M": {
    description: "20 minutes",
    duration: { minutes: 20 },
    defaultWindowSize: { days: 3 },
  },
  "30M": {
    description: "30 minutes",
    duration: { minutes: 30 },
    defaultWindowSize: { days: 3 },
  },
  "45M": {
    description: "45 minutes",
    duration: { minutes: 45 },
    defaultWindowSize: { days: 3 },
  },
  "1H": {
    description: "1 hour",
    duration: { hours: 1 },
    defaultWindowSize: { weeks: 1 },
  },
  "2H": {
    description: "2 hours",
    duration: { hours: 2 },
    defaultWindowSize: { weeks: 1 },
  },
  "3H": {
    description: "3 hours",
    duration: { hours: 3 },
    defaultWindowSize: { weeks: 1 },
  },
  "12H": {
    description: "12 hours",
    duration: { hours: 12 },
    defaultWindowSize: { weeks: 1 },
  },
  "1D": {
    description: "1 day",
    duration: { days: 1 },
    defaultWindowSize: { months: 1 },
  },
  "3D": {
    description: "3 days",
    duration: { days: 3 },
    defaultWindowSize: { months: 6 },
  },
  "1W": {
    description: "1 week",
    duration: { weeks: 1 },
    defaultWindowSize: { years: 1 },
  },
  "2W": {
    description: "2 weeks",
    duration: { weeks: 2 },
    defaultWindowSize: { years: 1 },
  },
  "3W": {
    description: "3 weeks",
    duration: { weeks: 3 },
    defaultWindowSize: { years: 1 },
  },
  "1Mo": {
    description: "1 month",
    duration: { months: 1 },
    defaultWindowSize: { years: 2 },
  },
  "2Mo": {
    description: "2 months",
    duration: { months: 2 },
    defaultWindowSize: { years: 2 },
  },
  "6Mo": {
    description: "6 months",
    duration: { months: 6 },
    defaultWindowSize: { years: 5 },
  },
  "1Y": {
    description: "1 year",
    duration: { years: 1 },
    defaultWindowSize: { years: 10 },
  },
} as const satisfies Record<string, IntervalPeriodMetadata>;

export const IntervalPeriod = {
  all: ((): readonly IntervalPeriod[] =>
    Object.keys(INTERVAL_PERIODS) as readonly IntervalPeriod[])(),

  /** Finds the {@link IntervalPeriod} which is nearest to the given date, both
   * relative to `now`.
   * */
  nearestTo(now: Date, dateFromNow: Date): IntervalPeriod {
    const difference = now.getTime() - dateFromNow.getTime();

    const differences = IntervalPeriod.all.map((d) => {
      const dateFromNow = dateFns.add(now, INTERVAL_PERIODS[d].duration);
      const localDifference = now.getTime() - dateFromNow.getTime();
      return [d, difference - localDifference] as const;
    });

    return (
      minimumBy(
        differences,
        comparing(([_, x]) => Math.abs(x)),
      )?.[0] ?? "1M"
    );
  },
};

/** Metadata for a given {@link IntervalPeriod}. */
export type IntervalPeriodMetadata = Readonly<{
  /** A human-readable description of the interval period. */
  description: string;
  /** The duration (bucket/candle size) of the interval period. */
  duration: dateFns.Duration;
  /** The default window size (full time range) for the interval period. */
  defaultWindowSize: dateFns.Duration;
}>;

export const Duration = {
  MS_IN_DAY: dateFns.milliseconds({ days: 1 }),
  MS_IN_HOUR: dateFns.milliseconds({ hours: 1 }),
  MS_IN_MINUTE: dateFns.milliseconds({ minutes: 1 }),
  MS_IN_SECOND: dateFns.milliseconds({ seconds: 1 }),
  add(d1: dateFns.Duration, d2: dateFns.Duration): dateFns.Duration {
    return Duration.ofMilliseconds(
      dateFns.milliseconds(d1) + dateFns.milliseconds(d2),
    );
  },
  equals(d1: dateFns.Duration, d2: dateFns.Duration): boolean {
    return dateFns.milliseconds(d1) === dateFns.milliseconds(d2);
  },
  gt(d1: dateFns.Duration, d2: dateFns.Duration): boolean {
    return dateFns.milliseconds(d1) > dateFns.milliseconds(d2);
  },
  gte(d1: dateFns.Duration, d2: dateFns.Duration): boolean {
    return dateFns.milliseconds(d1) >= dateFns.milliseconds(d2);
  },
  lt(d1: dateFns.Duration, d2: dateFns.Duration): boolean {
    return dateFns.milliseconds(d1) < dateFns.milliseconds(d2);
  },
  lte(d1: dateFns.Duration, d2: dateFns.Duration): boolean {
    return dateFns.milliseconds(d1) <= dateFns.milliseconds(d2);
  },
  ofMilliseconds(ms: number): dateFns.Duration {
    const days = Math.floor(ms / Duration.MS_IN_DAY);
    ms -= days * Duration.MS_IN_DAY;

    const hours = Math.floor(ms / Duration.MS_IN_HOUR);
    ms -= hours * Duration.MS_IN_HOUR;

    const minutes = Math.floor(ms / Duration.MS_IN_MINUTE);
    ms -= minutes * Duration.MS_IN_MINUTE;

    const seconds = Math.floor(ms / Duration.MS_IN_SECOND);
    ms -= seconds * Duration.MS_IN_SECOND;

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  },
  subtract(d1: dateFns.Duration, d2: dateFns.Duration): dateFns.Duration {
    const delta = dateFns.milliseconds(d1) - dateFns.milliseconds(d2);

    if (delta < 0) {
      throw new Error(
        "d1 is smaller than d2, can't produce a negative duration",
      );
    }

    return Duration.ofMilliseconds(delta);
  },
  toHumanString(d: dateFns.Duration): string {
    const formattedDuration = dateFns.formatDuration(d, { delimiter: ", " });
    const lastCommaIndex = formattedDuration.lastIndexOf(",");

    if (lastCommaIndex === -1) {
      return formattedDuration;
    }

    return (
      formattedDuration.substring(0, lastCommaIndex) +
      " and" +
      formattedDuration.substring(lastCommaIndex + 1)
    );
  },
  toMilliseconds(d: dateFns.Duration): number {
    return dateFns.milliseconds(d);
  },
};

/**
 * Calculates the bucket size for a given interval period
 *
 * @param {IntervalPeriod} period - The interval period for which the bucket size should be calculated.
 * @returns {number} The size of individual data buckets/candles.
 */
export function getDataBucketSizeByPeriod(period: IntervalPeriod): number {
  return Math.ceil(
    dateFns.milliseconds(INTERVAL_PERIODS[period].defaultWindowSize) /
      dateFns.milliseconds(INTERVAL_PERIODS[period].duration),
  );
}

/**
 * Returns the start date for a given period.
 *
 * @param {IntervalPeriod} period - The {@link IntervalPeriod} for which the start date should be calculated.
 * @returns {Date} The start date for the given period.
 */
export function getStartDateByPeriod(period: IntervalPeriod, end: Date): Date {
  return dateFns.sub(end, INTERVAL_PERIODS[period].defaultWindowSize);
}
