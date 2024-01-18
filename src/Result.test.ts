import fc, { Arbitrary } from 'fast-check'

import { Result } from './Result'

function arbitraryResult<A, E>(
  aFn: () => Arbitrary<A>,
  eFn: () => Arbitrary<E>
): Arbitrary<Result<A, E>> {
  return fc.oneof(aFn().map(Result.ok), eFn().map(Result.err))
}

describe('Result', () => {
  describe('Ok', () => {
    it('should map correctly', () => {
      fc.assert(
        fc.property(fc.integer(), fc.func(fc.integer()), (a, f) => {
          expect(
            Result.ok(a)
              .map(f)
              .match({
                ok: (v) => v,
                err: () => {
                  throw new Error('shouldnt happen')
                },
              })
          ).toEqual(f(a))
        })
      )
    })

    it('should bind correctly', () => {
      fc.assert(
        fc.property(fc.integer(), fc.func(fc.integer()), (a, f) => {
          expect(
            Result.ok(a)
              .bind((v) => Result.ok(f(v)))
              .match({
                ok: (v) => v,
                err: () => {
                  throw new Error('shouldnt happen')
                },
              })
          ).toEqual(f(a))
        })
      )
    })

    it('should match ok correctly', () => {
      fc.assert(
        fc.property(fc.integer(), (a) => {
          expect(
            Result.ok(a).match({
              ok: (v) => v,
              err: () => {
                throw new Error('shouldnt happen')
              },
            })
          ).toEqual(a)
        })
      )
    })

    describe('Chaining Operations on Ok', () => {
      it('should chain multiple maps correctly', () => {
        fc.assert(
          fc.property(
            fc.integer(),
            fc.func(fc.integer()),
            fc.func(fc.integer()),
            (a, f, g) => {
              expect(
                Result.ok(a)
                  .map(f)
                  .map(g)
                  .match({
                    ok: (v) => v,
                    err: () => {
                      throw new Error('shouldnt happen')
                    },
                  })
              ).toEqual(g(f(a)))
            }
          )
        )
      })

      it('should chain multiple binds correctly', () => {
        fc.assert(
          fc.property(
            fc.integer(),
            fc.func(fc.integer()),
            fc.func(fc.integer()),
            (a, f, g) => {
              expect(
                Result.ok(a)
                  .bind((v) => Result.ok(f(v)))
                  .bind((w) => Result.ok(g(w)))
                  .match({
                    ok: (v) => v,
                    err: () => {
                      throw new Error('shouldnt happen')
                    },
                  })
              ).toEqual(g(f(a)))
            }
          )
        )
      })

      it('should chain maps after binds correctly', () => {
        fc.assert(
          fc.property(
            fc.integer(),
            fc.func(fc.integer()),
            fc.func(fc.integer()),
            (a, f, g) => {
              expect(
                Result.ok(a)
                  .bind((v) => Result.ok(f(v)))
                  .map(g)
                  .match({
                    ok: (v) => v,
                    err: () => {
                      throw new Error('shouldnt happen')
                    },
                  })
              ).toEqual(g(f(a)))
            }
          )
        )
      })

      it('should unwrapOr return the encapsulated value', () => {
        fc.assert(
          fc.property(fc.integer(), fc.integer(), (a, defaultValue) => {
            expect(Result.ok(a).unwrapOr(defaultValue)).toEqual(a)
          })
        )
      })
    })

    it('should not change the Ok value with mapErr', () => {
      fc.assert(
        fc.property(fc.integer(), fc.func(fc.anything()), (a, f) => {
          const original = Result.ok(a)
          const transformed = original.mapErr(f)
          expect(transformed).toEqual(original)
        })
      )
    })

    it('should unwrap to the encapsulated value', () => {
      fc.assert(
        fc.property(fc.integer(), (a) => {
          expect(Result.ok(a).unwrap()).toEqual(a)
        })
      )
    })
  })

  describe('Err', () => {
    it('should not map', () => {
      fc.assert(
        fc.property(fc.anything(), fc.func(fc.anything()), (e, f) => {
          const expected = Result.err(e)
          const actual = expected.map(f)
          expect(actual).toBe(expected)
        })
      )
    })

    it('should not bind', () => {
      fc.assert(
        fc.property(fc.anything(), fc.func(fc.anything()), (e, f) => {
          const expected = Result.err(e)
          const actual = expected.bind(() => Result.ok(f(e)))
          expect(actual).toBe(expected)
        })
      )
    })

    it('should match err correctly', () => {
      fc.assert(
        fc.property(fc.anything(), (e) => {
          expect(
            Result.err(e).match({ ok: () => 'success', err: (v) => v })
          ).toEqual(e)
        })
      )
    })

    describe('Chaining Operations on Err', () => {
      it('should not change value after chaining multiple maps', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            fc.func(fc.anything()),
            fc.func(fc.anything()),
            (e, f, g) => {
              const expected = Result.err(e)
              const actual = expected.map(f).map(g)
              expect(actual).toBe(expected)
            }
          )
        )
      })

      it('should not change value after chaining multiple binds', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            fc.func(fc.anything()),
            fc.func(fc.anything()),
            (e, f, g) => {
              const expected = Result.err(e)
              const actual = expected
                .bind(() => Result.ok(f(e)))
                .bind(() => Result.ok(g(e)))
              expect(actual).toBe(expected)
            }
          )
        )
      })

      it('should not change value after chaining binds after maps', () => {
        fc.assert(
          fc.property(
            fc.anything(),
            fc.func(fc.anything()),
            fc.func(fc.anything()),
            (e, f, g) => {
              const expected = Result.err(e)
              const actual = expected.map(f).bind(() => Result.ok(g(e)))
              expect(actual).toBe(expected)
            }
          )
        )
      })
    })

    it('should unwrapOr return the provided default value', () => {
      fc.assert(
        fc.property(fc.anything(), fc.anything(), (e, defaultValue) => {
          expect(Result.err(e).unwrapOr(defaultValue)).toEqual(defaultValue)
        })
      )
    })

    it('should transform the Err value with mapErr', () => {
      fc.assert(
        fc.property(fc.anything(), fc.func(fc.anything()), (e, f) => {
          expect(
            Result.err(e)
              .mapErr(f)
              .match({
                ok: () => 'unexpected success',
                err: (v) => v,
              })
          ).toEqual(f(e))
        })
      )
    })

    it('should throw an error on unwrap', () => {
      fc.assert(
        fc.property(fc.anything(), (e) => {
          expect(() => Result.err(e).unwrap()).toThrow()
        })
      )
    })
  })
  describe('errIfUndefined', () => {
    it('should return Err for undefined input', () => {
      fc.assert(
        fc.property(fc.constant(undefined), (input) => {
          const result = Result.errIfUndefined(input)
          expect(
            result.match({
              ok: () => 'unexpected success',
              err: (e) => e,
            })
          ).toBeUndefined()
        })
      )
    })

    it('should return Ok for defined input', () => {
      fc.assert(
        fc.property(
          fc.anything().filter((v) => v !== undefined),
          (input) => {
            const result = Result.errIfUndefined(input)
            expect(
              result.match({
                ok: (v) => v,
                err: () => 'unexpected error',
              })
            ).toEqual(input)
          }
        )
      )
    })
  })
  describe('Result Laws', () => {
    describe('Identity Laws', () => {
      it('should satisfy the Left Identity law', () => {
        fc.assert(
          fc.property(
            fc.integer(),
            fc.func(arbitraryResult(fc.integer, fc.integer)),
            (a, f) => {
              expect(
                Result.ok(a)
                  .bind(f)
                  .match({
                    ok: (v) => v,
                    err: (e) => e,
                  })
              ).toEqual(
                f(a).match({
                  ok: (v) => v,
                  err: (e) => e,
                })
              )
            }
          )
        )
      })

      it('should satisfy the Right Identity law', () => {
        fc.assert(
          fc.property(arbitraryResult(fc.integer, fc.integer), (m) => {
            expect(
              m.bind(Result.ok).match({
                ok: (v) => v,
                err: (e) => e,
              })
            ).toEqual(
              m.match({
                ok: (v) => v,
                err: (e) => e,
              })
            )
          })
        )
      })
    })

    describe('Composition Laws', () => {
      it('should satisfy the Composition law', () => {
        fc.assert(
          fc.property(
            arbitraryResult(fc.integer, fc.integer),
            fc.func(arbitraryResult(fc.integer, fc.integer)),
            fc.func(arbitraryResult(fc.integer, fc.integer)),
            (m, f, g) => {
              const left = m
                .bind(f)
                .bind(g)
                .match({
                  ok: (v) => v,
                  err: (e) => e,
                })

              const right = m
                .bind((x) => f(x).bind(g))
                .match({
                  ok: (v) => v,
                  err: (e) => e,
                })

              expect(left).toEqual(right)
            }
          )
        )
      })
    })
  })
})
