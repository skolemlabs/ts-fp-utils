import { xor } from './Math'

describe('Math', () => {
  describe('xor', () => {
    it('Obeys the truth table', () => {
      expect(xor(false, false)).toBe(false)
      expect(xor(false, true)).toBe(true)
      expect(xor(true, false)).toBe(true)
      expect(xor(true, true)).toBe(false)
    })
  })
})
