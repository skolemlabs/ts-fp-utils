import fc, { Arbitrary } from 'fast-check'

import * as Sets from './Sets'

const arbitrarySet = <A>(arbitraryA: Arbitrary<A>): Arbitrary<ReadonlySet<A>> =>
  fc.array(arbitraryA).map((xs) => new Set(xs))

describe('Sets', () => {
  describe('empty', () => {
    it('returns a set of size zero', () => {
      expect(Sets.empty().size).toEqual(0)
    })
  })

  describe('singleton', () => {
    it('returns a set of size one, containing the given element', () => {
      fc.assert(
        fc.property(fc.anything(), (element) => {
          const actual = Sets.singleton(element)

          expect(actual.size).toEqual(1)
          expect(actual.has(element)).toBeTruthy()
        })
      )
    })
  })

  describe('difference', () => {
    it('equals the left-hand set when differenced with an empty set', () => {
      fc.assert(
        fc.property(arbitrarySet(fc.anything()), (set) => {
          const actual = Sets.difference(set, Sets.empty())

          expect(actual).toEqual(set)
        })
      )
    })

    it('equals the empty set when the left-hand set is empty', () => {
      fc.assert(
        fc.property(arbitrarySet(fc.anything()), (set) => {
          const actual = Sets.difference(Sets.empty(), set)

          expect(actual).toEqual(Sets.empty())
        })
      )
    })

    it('never contains any elements from the right-hand set', () => {
      fc.assert(
        fc.property(
          arbitrarySet(fc.anything()),
          arbitrarySet(fc.anything()),
          (left, right) => {
            const actual = Sets.difference(left, right)

            actual.forEach((x) => {
              expect(right.has(x)).toBeFalsy()
            })
          }
        )
      )
    })
  })

  describe('intersection', () => {
    it('returns empty when given an empty set as either argument', () => {
      fc.assert(
        fc.property(
          arbitrarySet(fc.anything()).chain((set) =>
            fc.constantFrom(
              Sets.intersection(Sets.empty(), set),
              Sets.intersection(set, Sets.empty())
            )
          ),
          (actual) => {
            expect(actual).toEqual(Sets.empty())
          }
        )
      )
    })

    it('contains elements present in both sets', () => {
      fc.assert(
        fc.property(
          arbitrarySet(fc.anything()),
          arbitrarySet(fc.anything()),
          (set1, set2) => {
            const actual = Sets.intersection(set1, set2)

            const set1Array = [...set1]
            set1Array
              .filter((x) => set2.has(x))
              .forEach((x) => {
                expect(actual.has(x)).toBeTruthy()
              })
          }
        )
      )
    })

    it('is mutually exclusive from any set difference', () => {
      fc.assert(
        fc.property(
          arbitrarySet(fc.anything()).chain((set1) =>
            arbitrarySet(fc.anything()).chain((set2) =>
              fc
                .constantFrom(
                  Sets.difference(set1, set2),
                  Sets.difference(set2, set1)
                )
                .map((difference) => ({
                  difference,
                  intersection: Sets.intersection(set1, set2),
                }))
            )
          ),
          ({ difference, intersection }) => {
            difference.forEach((x) => {
              expect(intersection.has(x)).toBeFalsy()
            })

            intersection.forEach((x) => {
              expect(difference.has(x)).toBeFalsy()
            })
          }
        )
      )
    })
  })

  describe('union', () => {
    it('always contains all elements from both sets', () => {
      fc.assert(
        fc.property(
          arbitrarySet(fc.anything()),
          arbitrarySet(fc.anything()),
          (set1, set2) => {
            const actual = Sets.union(set1, set2)

            set1.forEach((x) => {
              expect(actual.has(x)).toBeTruthy()
            })

            set2.forEach((x) => {
              expect(actual.has(x)).toBeTruthy()
            })
          }
        )
      )
    })
  })

  describe('filter', () => {
    it('removes items which do not pass the `test` function', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat()).map((x) => new Set(x)),
          (numbers) => {
            const actual = Sets.filter(numbers, (x) => x % 2 === 0)

            const expected = new Set()
            for (const n of numbers) {
              if (n % 2 === 0) {
                expected.add(n)
              }
            }

            expect(actual).toEqual(expected)
          }
        )
      )
    })
  })
})
