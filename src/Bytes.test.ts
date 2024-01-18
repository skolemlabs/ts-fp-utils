import fc from 'fast-check'

import { Bytes } from './Bytes'

describe('Bytes', () => {
  describe('Encoding/decoding properties', () => {
    it('converts to/from utf-8 string', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const actual = Bytes.ofString(input, 'utf-8').toString('utf-8')

          expect(actual).toEqual(input)
        })
      )
    })

    it('converts to/from a byte array', () => {
      const input = new Uint8Array([
        178, 174, 227, 199, 61, 81, 203, 104, 249, 58, 196, 16, 180, 53, 166,
        166, 225, 124, 90, 162, 87, 58, 155, 233, 30, 76, 73, 105, 100, 21, 80,
        147,
      ])
      const actual = Bytes.ofUint8Array(input)

      expect(input).toEqual(actual.toUint8Array())
    })

    it('converts a byte array to base-64', () => {
      const input = new Uint8Array([
        178, 174, 227, 199, 61, 81, 203, 104, 249, 58, 196, 16, 180, 53, 166,
        166, 225, 124, 90, 162, 87, 58, 155, 233, 30, 76, 73, 105, 100, 21, 80,
        147,
      ])
      const actual = Bytes.ofUint8Array(input).toString('base-64')
      const expected = 'sq7jxz1Ry2j5OsQQtDWmpuF8WqJXOpvpHkxJaWQVUJM='

      expect(actual).toEqual(expected)
    })

    it('converts a byte array to base-64 and back', () => {
      const input = new Uint8Array([
        178, 174, 227, 199, 61, 81, 203, 104, 249, 58, 196, 16, 180, 53, 166,
        166, 225, 124, 90, 162, 87, 58, 155, 233, 30, 76, 73, 105, 100, 21, 80,
        147,
      ])
      const base64 = Bytes.ofUint8Array(input).toString('base-64')
      const actual = Bytes.ofString(base64, 'base-64').toUint8Array()
      const expected = input

      expect(actual).toEqual(expected)
    })

    it('Decodes base-64 without padding', () => {
      const input = 'sq7jxz1Ry2j5OsQQtDWmpuF8WqJXOpvpHkxJaWQVUJM'
      const actual = Bytes.ofString(input, 'base-64')

      expect(actual.toUint8Array()).toEqual(
        new Uint8Array([
          178, 174, 227, 199, 61, 81, 203, 104, 249, 58, 196, 16, 180, 53, 166,
          166, 225, 124, 90, 162, 87, 58, 155, 233, 30, 76, 73, 105, 100, 21,
          80, 147,
        ])
      )
    })
  })
})
