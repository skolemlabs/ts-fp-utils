import fc from 'fast-check'

import * as Arrays from './Arrays'
import { comparing } from './ordering/Comparators'
import * as Sets from './Sets'

describe('Array utilities', () => {
  describe('partition', () => {
    it('Returns truthy elements in its first argument', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (xs) => {
          const predicate = (x: number) => x % 2 === 0

          const expected = xs.filter(predicate)
          const actual = Arrays.partition(xs, predicate)[0]

          expect(actual).toEqual(expected)
        })
      )
    })

    it('Returns falsy elements in its second argument', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (xs) => {
          const predicate = (x: number) => x % 2 === 0

          const expected = xs.filter((x) => !predicate(x))
          const actual = Arrays.partition(xs, predicate)[1]

          expect(actual).toEqual(expected)
        })
      )
    })

    it('Returns mutually exclusive lists', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (xs) => {
          const predicate = (x: number) => x % 2 === 0

          const [trues, falses] = Arrays.partition(xs, predicate)

          const trueSet = new Set(trues)
          const falseSet = new Set(falses)

          expect(Sets.intersection(trueSet, falseSet).size).toEqual(0)
        })
      )
    })

    it('Returns the entire list in the result', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (xs) => {
          const predicate = (x: number) => x % 2 === 0

          const [trues, falses] = Arrays.partition(xs, predicate)

          const trueSet = new Set(trues)
          const falseSet = new Set(falses)

          expect(Sets.union(trueSet, falseSet).size).toEqual(new Set(xs).size)

          xs.forEach((x) => {
            expect(trueSet.has(x) || falseSet.has(x)).toBeTruthy()
          })
        })
      )
    })
  })

  describe('reverse', () => {
    it('Does not modify the input array', () => {
      const input = [1, 2, 3]

      const _ = Arrays.reverse(input)

      expect(input).toEqual([1, 2, 3])
    })

    it('Behaves the same as `myArray.reverse()`', () => {
      fc.assert(
        fc.property(fc.array(fc.anything()), (input) => {
          const actual = Arrays.reverse(input)

          const expected = [...input]
          expected.reverse()

          expect(actual).toEqual(expected)
        })
      )
    })
  })

  describe('zip', () => {
    it('returns an array, which has the minimum length of its inputs', () => {
      fc.assert(
        fc.property(
          fc.array(fc.anything()),
          fc.array(fc.anything()),
          (as, bs) => {
            const actual = Arrays.zip(as, bs).length
            const expected = Math.min(as.length, bs.length)

            expect(actual).toEqual(expected)
          }
        )
      )
    })

    it('contains matching pairs from the input arrays', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100 }).chain((length) =>
            fc
              .array(fc.anything(), { minLength: length, maxLength: length })
              .chain((as) =>
                fc
                  .array(fc.anything(), {
                    minLength: length,
                    maxLength: length,
                  })
                  .map((bs) => [as, bs])
              )
          ),
          ([as, bs]) => {
            const actual = Arrays.zip(as, bs)

            actual.forEach(([a, b], i) => {
              expect(a).toEqual(as[i])
              expect(b).toEqual(bs[i])
            })
          }
        )
      )
    })
  })

  describe('range', () => {
    it('starts with the start index', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: -100, max: 100 })
            .chain((start) =>
              fc
                .integer({ min: 1, max: 100 })
                .chain((length) =>
                  fc
                    .integer({ min: 1, max: 100 })
                    .map((step) => [start, start + length, step])
                )
            ),
          ([start, end, step]) => {
            const actual = Arrays.range(start, end, step)

            expect(actual[0]).toEqual(start)
          }
        )
      )
    })

    it('does not include the end index', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: -100, max: 100 })
            .chain((start) =>
              fc
                .integer({ min: 1, max: 100 })
                .chain((length) =>
                  fc
                    .integer({ min: 1, max: 100 })
                    .map((step) => [start, start + length, step])
                )
            ),
          ([start, end, step]) => {
            const actual = Arrays.range(start, end, step)

            expect(actual.find((x) => x === end)).toBeUndefined()
          }
        )
      )
    })

    it('defaults to a step size of 1', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: -100, max: 100 })
            .chain((start) =>
              fc
                .integer({ min: 1, max: 100 })
                .map((length) => [start, start + length])
            ),
          ([start, end]) => {
            const actual = Arrays.range(start, end)
            const expectedLength = end - start

            expect(actual.length).toEqual(expectedLength)

            for (let i = 0; i < expectedLength; i++) {
              expect(actual[i]).toEqual(i + start)
            }
          }
        )
      )
    })
  })

  describe('unique/uniqueBy', () => {
    it('returns the input array when getter returns unique values', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat()).map((x) => [...new Set(x)]),
          (uniqueNumbers) => {
            const actual = Arrays.unique(uniqueNumbers)

            expect(actual).toEqual(uniqueNumbers)
          }
        )
      )
    })

    it('returns deduplicated elements when the getter returns the same value', () => {
      fc.assert(
        fc.property(fc.array(fc.nat(), { minLength: 1 }), (numbers) => {
          const actual = Arrays.uniqueBy(numbers, (_) => 0)

          expect(actual).toEqual([numbers[0]])
        })
      )
    })

    it('returns the first even and odd numbers', () => {
      fc.assert(
        fc.property(
          // Generate an array with at least one odd and one even number.
          fc
            .array(fc.integer({ min: 1 }))
            .filter(
              (numbers) =>
                numbers.some((x) => x % 2 === 0) &&
                numbers.some((x) => x % 2 === 1)
            ),
          (numbers) => {
            const actual = [...Arrays.uniqueBy(numbers, (x) => x % 2)].sort()

            const firstEven = numbers.find((x) => x % 2 === 0)
            const firstOdd = numbers.find((x) => x % 2 === 1)

            const expected = [firstEven, firstOdd].sort()

            expect(actual).toEqual(expected)
          }
        )
      )
    })
  })

  describe('reduce', () => {
    it('reduces the input array, in order', () => {
      fc.assert(
        fc.property(fc.array(fc.string({ maxLength: 5 })), (strings) => {
          const actual = Arrays.reduce(strings, '', (next, acc) => acc + next)

          const expected = strings.join('')

          expect(actual).toEqual(expected)
        })
      )
    })
  })

  describe('findDuplicates', () => {
    it('returns an empty array when no duplicates are found', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat()).map((x) => [...new Set(x)]),
          (uniqueNumbers) => {
            const actual = Arrays.findDuplicates(uniqueNumbers)

            expect(actual).toEqual([])
          }
        )
      )
    })

    it('returns all found duplicate elements, deduplicated', () => {
      fc.assert(
        fc.property(
          fc
            .array(fc.nat(), { minLength: 1 })
            .map((x) => [...new Set(x)])
            .chain((elements) =>
              fc
                .array(fc.nat({ max: elements.length - 1 }))
                .map((dupIndices) => {
                  const duplicates = dupIndices.map((i) => elements[i])

                  return {
                    numbersWithDuplicates: [...elements, ...duplicates],
                    duplicates,
                  }
                })
            ),
          ({ numbersWithDuplicates, duplicates }) => {
            const actual = Arrays.findDuplicates(numbersWithDuplicates)

            const expected = [...new Set(duplicates)]

            expect(actual).toEqual(expected)
          }
        )
      )
    })

    test('assertions in doc comments', () => {
      expect(Arrays.findDuplicates([])).toEqual([])
      expect(Arrays.findDuplicates([1, 2, 3])).toEqual([])
      expect(Arrays.findDuplicates([1, 2, 2])).toEqual([2])
      expect(Arrays.findDuplicates([1, 2, 2, 1])).toEqual([2, 1])
    })
  })

  describe('replicate', () => {
    it('returns an empty array when the length <= 0', () => {
      fc.assert(
        fc.property(fc.integer({ max: 0 }), fc.anything(), (length, item) => {
          const actual = Arrays.replicate(length, item)

          expect(actual).toHaveLength(0)
        })
      )
    })

    it('returns an array with the given length', () => {
      fc.assert(
        fc.property(fc.nat({ max: 20 }), fc.anything(), (length, item) => {
          const actual = Arrays.replicate(length, item)

          expect(actual).toHaveLength(length)
        })
      )
    })

    it('returns an array where each element is the given item', () => {
      fc.assert(
        fc.property(fc.nat({ max: 20 }), fc.anything(), (length, item) => {
          const actual = Arrays.replicate(length, item)

          actual.forEach((actualItem) => {
            expect(actualItem).toBe(item)
          })
        })
      )
    })
  })

  describe('interleave', () => {
    test('example 1 from doc comment', () => {
      const actual = Arrays.interleave([1, 2, 3], ['a', 'b', 'c'])
      const expected = [1, 'a', 2, 'b', 3, 'c']

      expect(actual).toEqual(expected)
    })

    it('returns an array of length equal to the sum of the inputs', () => {
      fc.assert(
        fc.property(
          fc.array(fc.anything()),
          fc.array(fc.anything()),
          (a1, a2) => {
            const actual = Arrays.interleave(a1, a2).length
            const expected = a1.length + a2.length

            expect(actual).toEqual(expected)
          }
        )
      )
    })

    it('is identity for left and right empty arrays', () => {
      fc.assert(
        fc.property(
          fc.array(fc.anything(), { minLength: 1 }),
          fc.boolean(),
          (values, left) => {
            const actual = left
              ? Arrays.interleave(values, [])
              : Arrays.interleave([], values)

            expect(actual).toBe(values)
          }
        )
      )
    })
  })

  describe('groupBy', () => {
    it('creates a map with the same items as the input array', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 0, maxLength: 2 }),
              value: fc.integer({ min: 0, max: 10 }),
            })
          ),
          (array) => {
            const groups = Arrays.groupBy(array, (el) => el.name)

            const groupByItems: typeof array = []
            Object.values(groups).forEach((group) => {
              group?.forEach((groupEl) => groupByItems.push(groupEl))
            })

            const sortedArray = array
              .sort(comparing((el) => el.name))
              .sort(comparing((el) => el.value))
            const sortedGroupByItems = groupByItems
              .sort(comparing((el) => el.name))
              .sort(comparing((el) => el.value))

            expect(sortedArray).toEqual(sortedGroupByItems)
          }
        )
      )
    })

    it('creates a map with the same set of keys as the groupBy set of keys', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 0, maxLength: 2 }),
              value: fc.integer({ min: 0, max: 10 }),
            })
          ),
          (array) => {
            const groups = Arrays.groupBy(array, (el) => el.name)

            const groupByKeys = new Set()
            Object.keys(groups).forEach((groupName) => {
              groupByKeys.add(groupName)
            })

            const arrayKeys = new Set(array.map((el) => el.name))

            expect(arrayKeys).toEqual(groupByKeys)
          }
        )
      )
    })
  })

  describe('take', () => {
    it('returns `n` elements for an array longer than size `n`', () => {
      fc.assert(
        fc.property(
          fc
            .nat({ max: 10 })
            .chain((n) =>
              fc
                .array(fc.nat(), { minLength: n + 1 })
                .map((array) => ({ n, array }))
            ),
          ({ n, array }) => {
            const actual = Arrays.take(n, array)

            expect(actual).toHaveLength(n)

            Arrays.range(0, n).forEach((i) => {
              expect(actual[i]).toEqual(array[i])
            })
          }
        )
      )
    })

    it('returns `array.length` elements for an array shorter than size `n`', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: 1, max: 10 })
            .chain((n) =>
              fc
                .array(fc.nat(), { maxLength: n - 1 })
                .map((array) => ({ n, array }))
            ),
          ({ n, array }) => {
            const actual = Arrays.take(n, array)

            expect(actual).toHaveLength(array.length)

            Arrays.range(0, array.length).forEach((i) => {
              expect(actual[i]).toEqual(array[i])
            })
          }
        )
      )
    })
  })

  describe('drop', () => {
    it('returns `array.length - n` elements if `array.length > n`', () => {
      fc.assert(
        fc.property(
          fc
            .nat({ max: 10 })
            .chain((n) =>
              fc
                .array(fc.nat(), { minLength: n + 1 })
                .map((array) => ({ n, array }))
            ),
          ({ n, array }) => {
            const actual = Arrays.drop(n, array)

            expect(actual).toHaveLength(array.length - n)

            Arrays.range(0, actual.length).forEach((i) => {
              expect(actual[i]).toEqual(array[i + n])
            })
          }
        )
      )
    })

    it('returns zero elements for an array of length `< n`', () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: 1, max: 10 })
            .chain((n) =>
              fc
                .array(fc.nat(), { maxLength: n - 1 })
                .map((array) => ({ n, array }))
            ),
          ({ n, array }) => {
            const actual = Arrays.drop(n, array)

            expect(actual).toHaveLength(0)
          }
        )
      )
    })
  })

  describe('map2', () => {
    it('Returns an array of the same length as the shortest input array', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (xs, ys) => {
          const actual = Arrays.map2(xs, ys, (x, y) => x + y).length
          const expected = Math.min(xs.length, ys.length)

          expect(actual).toEqual(expected)
        })
      )
    })

    it('Correctly applies the provided function to corresponding elements', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.array(fc.nat()), (xs, ys) => {
          const actual = Arrays.map2(xs, ys, (x, y) => x + y)
          const expected = xs
            .slice(0, Math.min(xs.length, ys.length))
            .map((x, i) => x + ys[i])

          expect(actual).toEqual(expected)
        })
      )
    })

    it('Returns an empty array if either input array is empty', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), fc.boolean(), (xs, bool) => {
          const actual = Arrays.map2(
            bool ? xs : [],
            bool ? [] : xs,
            (x, y) => x + y
          )

          expect(actual).toEqual([])
        })
      )
    })
  })
})
