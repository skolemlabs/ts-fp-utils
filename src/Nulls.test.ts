import fc from 'fast-check'

import { throwIfNull } from './Nulls'

describe('Null utilities', () => {
  it('Returns the value if it is not null', () => {
    fc.assert(
      fc.property(
        fc.anything().filter((x) => x !== null),
        (value) => {
          const actual = throwIfNull(value)

          expect(actual).toBe(value)
        }
      )
    )
  })

  it('Throws an error if the value is null', () => {
    expect(() => throwIfNull(null)).toThrowError()
  })
})
