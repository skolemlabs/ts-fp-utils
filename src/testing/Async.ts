/**
 * Given some probability, returns either a rejected {@link Promise}, or the
 * supplied {@link Promise}.
 *
 * This is often useful for placing inline with a network request, in order to
 * make failures more visible for debugging, eg.:
 *
 * ```typescript
 *   return injectRejection(0.25, () => _fetch2(...))
 * ```
 *
 * @param probability ∈ [0, 1) - Returns a rejected {@link Promise} when
 *   a {@link Math.random} number is below `probability`.
 */
export function injectRejections<T>(
  probability: number,
  promiseSupplier: () => Promise<T>,
): Promise<T> {
  if (Math.random() < probability) {
    return Promise.reject(
      new Error("Injected promise rejection - see `Async.injectRejections`."),
    );
  }

  return promiseSupplier();
}

export function defer<T>(): Readonly<{
  promise: Promise<T>;
  resolve: (t: T) => void;
  reject: (e: unknown) => void;
}> {
  let resolve!: (t: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
