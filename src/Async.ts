/** @fileoverview Utilities for dealing with asynchronous code. */

import {
  differenceInMilliseconds,
  type Duration,
  milliseconds,
} from "date-fns";

export type PromiseOrValue<T> = T | Promise<T>;

export function toPromise<T>(pt: PromiseOrValue<T>): Promise<T> {
  if (pt instanceof Promise) {
    return pt;
  }
  return Promise.resolve(pt);
}
export type CancelablePromise<T> = Readonly<{
  promise: Promise<T>;
  getStatus(): "pending" | "resolved" | "rejected" | "canceled";
  cancel(): void;
  cancelQuietly(): void;
  cancelByRejecting(): void;
}>;

/**
 * Given a {@link Promise} wraps it in another promise which may be canceled.
 * Canceling is done by calling the returned `cancel` function. The `cancel`
 * function does nothing if the returned promise has been resolved.
 */
export function toCancelablePromise<T>(pt: Promise<T>): CancelablePromise<T> {
  const controller = new AbortController();

  let status: ReturnType<
    ReturnType<typeof toCancelablePromise<T>>["getStatus"]
  > = "pending";

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    controller.signal.onabort = () => {
      status = "canceled";
      reject(controller.signal.reason);
    };

    return pt
      .then((r) => {
        status = "resolved";
        resolve(r);
      })
      .catch((e) => {
        status = "rejected";
        reject(e);
      });
  });

  const self = {
    promise: wrappedPromise,
    getStatus() {
      return status;
    },
    cancel() {
      self.cancelByRejecting();
    },
    cancelQuietly() {
      wrappedPromise.catch(() => {
        // Do nothing
      });
      self.cancelByRejecting();
    },
    cancelByRejecting() {
      controller.abort(new Error("Promise canceled by caller."));
    },
  };

  return self;
}

/**
 * Given a {@link Promise}, maps it to one which does not reject by returning
 * {@link PromiseSettledResult}. This is sometimes useful for pattern matching
 * later on a promise result.
 */
export function settled<T>(pt: Promise<T>): Promise<PromiseSettledResult<T>> {
  return pt
    .then((value) => ({
      status: "fulfilled" as const,
      value,
    }))
    .catch((reason) => ({
      status: "rejected" as const,
      reason,
    }));
}
