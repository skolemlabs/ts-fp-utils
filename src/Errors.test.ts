import fc from 'fast-check'

import { getCircularReplacer, getErrorMessage } from './Errors'
import {
  arbitraryCircularObject,
  arbitraryError,
} from './testing/Errors.arbitrary'

describe('Errors', () => {
  describe('getCircularReplacer', () => {
    it('returns primitive values it has already seen', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.string(),
            fc.double(),
            fc.float()
          ),
          (val) => {
            const replacer = getCircularReplacer()

            const firstCall = replacer(undefined, val)
            expect(firstCall).toEqual(val)

            const secondCall = replacer(undefined, val)
            expect(secondCall).toEqual(val)
          }
        )
      )
    })

    it('returns undefined for an object that has already been seen', () => {
      fc.assert(
        fc.property(arbitraryCircularObject(), (obj) => {
          const replacer = getCircularReplacer()

          const firstCall = replacer(undefined, obj)
          expect(firstCall).toEqual(obj)

          const circularRefCall = replacer(undefined, obj.circularRef)
          expect(circularRefCall).toBeUndefined()
        })
      )
    })
  })

  describe('getErrorMessage', () => {
    it('converts unknown types to strings', () => {
      fc.assert(
        fc.property(fc.anything(), (unknownError) => {
          const result = getErrorMessage(unknownError)

          expect(result).toBeDefined()
          expect(typeof result).toBe('string')
        })
      )
    })
    it('extracts messages from Error objects', () => {
      fc.assert(
        fc.property(arbitraryError(), (error) => {
          const result = getErrorMessage(error)

          expect(result).toBeDefined()
          expect(typeof result).toBe('string')
        })
      )
    })
  })
})
