/**
 * Result of a call to {@link tryCatch} which resulted in the provider returning
 * a value.
 */
export interface TryCatchSuccess<A> {
  readonly kind: "CatchSuccess";
  /** The value returned by the provider given to a call to {@link tryCatch}. */
  readonly value: A;
}

/**
 * Result of a call to {@link tryCatch} which resulted in the provider throwing.
 */
export interface TryCatchFailure {
  readonly kind: "CatchFailure";
  /**
   * The first value thrown by the provider given to a call to {@link tryCatch}.
   */
  readonly caught: unknown;
}

/** Represents the result of calling {@link tryCatch}. */
export type TryCatchResult<A> = TryCatchSuccess<A> | TryCatchFailure;

/**
 * Adapts a `try`/`catch` block, allowing the caller to pattern match on the
 * result.
 */
export const tryCatch = <A>(aProvider: () => A): TryCatchResult<A> => {
  try {
    return {
      kind: "CatchSuccess",
      value: aProvider(),
    };
  } catch (e: unknown) {
    return {
      kind: "CatchFailure",
      caught: e,
    };
  }
};

/**
 * Runs the given `aProvider`, returning the provided value. If `aProvider`
 * throws, `valueIfThrown` is returned instead.
 */
export const tryOrDefault =
  <A>(valueIfThrown: A) =>
  <B>(bProvider: () => B): A | B => {
    const result = tryCatch(bProvider);
    switch (result.kind) {
      case "CatchSuccess":
        return result.value;
      case "CatchFailure":
        return valueIfThrown;
    }
  };

/** {@link tryOrDefault}, which returns `undefined` if the provider throws. */
export const tryOrUndefined = tryOrDefault(undefined);

/**
 * A utility to be used by JSON.stringify as it's optional 'replacer' argument.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#circular_references
 */
export function getCircularReplacer(): <K, V>(
  key: K,
  value: V,
) => V | undefined {
  const seen = new WeakSet();
  return (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
/** A utility for extracting error messages as strings from unknown data types */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  if (error === undefined) return "";

  return JSON.stringify(error, getCircularReplacer());
}
