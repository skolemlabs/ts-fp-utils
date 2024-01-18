/** A value which may or may not be wrapped in a {@link Promise}. */
export type PromiseOrValue<T> = Promise<T> | T

/** Promotes a {@link PromiseOrValue<T>} into a {@link Promise<T>}. */
export function toPromise<T>(ft: PromiseOrValue<T>): Promise<T> {
  if (ft instanceof Promise) return ft
  return Promise.resolve(ft)
}
