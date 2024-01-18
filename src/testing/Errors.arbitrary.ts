import fc, { Arbitrary } from 'fast-check'

export const arbitraryCircularObject = (): Arbitrary<
  { circularRef: Record<string, unknown> } & Record<string, unknown>
> =>
  fc
    .object()
    .map((arbitrary) => Object.assign(arbitrary, { circularRef: arbitrary }))

export const arbitraryError = (): Arbitrary<Error> =>
  fc.constant(new Error(fc.string().toString()))
