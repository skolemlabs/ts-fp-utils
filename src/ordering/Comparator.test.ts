import fc from 'fast-check'

import { drop, replicate, take, zip } from '../Arrays'
import { niceFloat } from '../testing/Number.arbitrary'
import { makeComparator } from './Comparator'
import {
  ALWAYS_GREATER,
  ALWAYS_LESS,
  comparing,
  NATURAL_ORDER,
  nullsFirst,
  nullsLast,
} from './Comparators'

describe('Comparator', () => {
  describe('makeComparator', () => {
    it('Clones the original compareFn', () => {
      fc.assert(
        fc.property(fc.func(fc.double()), (compareFn) => {
          const originalPropertyNames = Object.getOwnPropertyNames(compareFn)
          const actual = makeComparator(compareFn)

          expect(actual).not.toBe(compareFn)
          expect(Object.getOwnPropertyNames(compareFn)).toEqual(
            originalPropertyNames
          )
        })
      )
    })

    describe('finally', () => {
      it('composes when not reversed', () => {
        fc.assert(
          fc.property(
            fc
              .array(fc.constantFrom('a', 'b', 'c'), { maxLength: 3 })
              .map((x) => [...new Set(x)])
              .chain((letters) =>
                fc
                  .array(fc.nat(), {
                    maxLength: letters.length,
                    minLength: letters.length,
                  })
                  .map((numbers) => zip(letters, numbers))
              ),
            (entries) => {
              const actual = [...entries].sort(
                comparing<[string, number], string>(([c, n]) => c).finally(
                  comparing(([c, n]) => n)
                )
              )

              const expected = [...entries].sort(([c1, n1], [c2, n2]) => {
                if (c1 > c2) return 1
                if (c1 < c2) return -1
                if (n1 > n2) return 1
                if (n1 < n2) return -1
                return 0
              })

              expect(actual).toEqual(expected)
            }
          )
        )
      })

      it('never reverses', () => {
        fc.assert(
          fc.property(
            fc
              .array(fc.constantFrom('a', 'b', 'c'), { maxLength: 3 })
              .map((x) => [...new Set(x)])
              .chain((letters) =>
                fc
                  .array(fc.nat(), {
                    maxLength: letters.length,
                    minLength: letters.length,
                  })
                  .map((numbers) => zip(letters, numbers))
              ),
            (entries) => {
              const actual = [...entries].sort(
                comparing<[string, number], string>(([c, n]) => c)
                  .finally(comparing(([c, n]) => n))
                  .reverse()
              )

              const expected = [...entries].sort(([c1, n1], [c2, n2]) => {
                if (c1 > c2) return -1
                if (c1 < c2) return 1
                if (n1 > n2) return 1
                if (n1 < n2) return -1
                return 0
              })

              expect(actual).toEqual(expected)
            }
          )
        )
      })
    })

    describe('call signature', () => {
      it('preserves the behavior of the original compareFn', () => {
        fc.assert(
          fc.property(
            fc.func(niceFloat(fc.double())),
            niceFloat(fc.double()),
            niceFloat(fc.double()),
            (compareFn, n1, n2) => {
              const actual = makeComparator(compareFn)

              expect(actual(n1, n2)).toEqual(compareFn(n1, n2))
            }
          )
        )
      })
    })

    describe('nullsFirst', () => {
      it('sorts null values first', () => {
        fc.assert(
          fc.property(
            fc.array(fc.oneof(fc.constant(null), fc.nat({ max: 10 }))),
            (input) => {
              const nullCount = input.filter((x) => x === null).length

              const actual = [...input].sort(nullsFirst((x) => x))

              expect(take(nullCount, actual)).toEqual(
                replicate(nullCount, null)
              )
            }
          )
        )
      })

      it('sorts non-null values in natural order', () => {
        fc.assert(
          fc.property(
            fc.array(fc.oneof(fc.constant(null), fc.nat())),
            (input) => {
              const nullCount = input.filter((x) => x === null).length

              const actual = [...input].sort(nullsFirst((x) => x))

              expect(drop(nullCount, actual)).toEqual(
                [...input]
                  .flatMap((x) => (x === null ? [] : [x]))
                  .sort(comparing((x) => x))
              )
            }
          )
        )
      })
    })

    describe('nullsLast', () => {
      it('sorts null values last', () => {
        fc.assert(
          fc.property(
            fc.array(fc.oneof(fc.constant(null), fc.nat())),
            (input) => {
              const nullCount = input.filter((x) => x === null).length

              const actual = [...input].sort(nullsLast((x) => x))

              expect(take(nullCount, actual.reverse())).toEqual(
                replicate(nullCount, null)
              )
            }
          )
        )
      })

      it('sorts non-null values in natural order', () => {
        fc.assert(
          fc.property(
            fc.array(fc.oneof(fc.constant(null), fc.nat())),
            (input) => {
              const nullCount = input.filter((x) => x === null).length

              const actual = [...input].sort(nullsLast((x) => x))

              expect(take(input.length - nullCount, actual)).toEqual(
                [...input]
                  .flatMap((x) => (x === null ? [] : [x]))
                  .sort(comparing((x) => x))
              )
            }
          )
        )
      })
    })

    describe('ALWAYS_LESS/ALWAYS_GREATER', () => {
      it('Sorts these values always first or last', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.oneof(
                fc.nat(),
                fc.constant('sort-me-first'),
                fc.constant('sort-me-last')
              )
            ),
            (inputs) => {
              const actual = [...inputs].sort(
                comparing((x) => {
                  if (x === 'sort-me-first') return ALWAYS_LESS
                  if (x === 'sort-me-last') return ALWAYS_GREATER
                  return x
                })
              )

              const expected = (() => {
                const firsts = inputs.filter((x) => x === 'sort-me-first')
                const lasts = inputs.filter((x) => x === 'sort-me-last')
                const numbers = inputs.filter((x) => typeof x === 'number')

                return [
                  ...firsts,
                  ...numbers.sort(comparing((x) => x)),
                  ...lasts,
                ]
              })()

              expect(actual).toEqual(expected)
            }
          )
        )
      })
    })

    describe('reverse', () => {
      it('Sorts an array in reverse order as the original function', () => {
        fc.assert(
          fc.property(fc.array(fc.nat()), (numbers) => {
            const actual = [...numbers].sort(
              makeComparator(NATURAL_ORDER).reverse()
            )

            const expected = [...numbers].sort(NATURAL_ORDER).reverse()

            expect(actual).toEqual(expected)
          })
        )
      })
    })

    describe('then', () => {
      it('Sorts an array by a second comparator to break ties', () => {
        fc.assert(
          fc.property(
            fc
              .array(fc.constantFrom('a', 'b', 'c'), { maxLength: 3 })
              .map((x) => [...new Set(x)])
              .chain((letters) =>
                fc
                  .array(fc.nat(), {
                    maxLength: letters.length,
                    minLength: letters.length,
                  })
                  .map((numbers) => zip(letters, numbers))
              ),
            (entries) => {
              const actual = [...entries].sort(
                comparing<[string, number], string>(([c, n]) => c).then(
                  comparing(([c, n]) => n)
                )
              )

              const expected = [...entries].sort(([c1, n1], [c2, n2]) => {
                if (c1 > c2) return 1
                if (c1 < c2) return -1
                if (n1 > n2) return 1
                if (n1 < n2) return -1
                return 0
              })

              expect(actual).toEqual(expected)
            }
          )
        )
      })
    })
  })
})
