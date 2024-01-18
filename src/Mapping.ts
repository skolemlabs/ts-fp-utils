/** A total mapping from one type to another. */
export type Mapping<A extends string | number | symbol, B> =
  | RecordMapping<A, B>
  | FunctionMapping<A, B>;

/** {@link Mapping} implemented as a {@link Record} lookup. */
export type RecordMapping<A extends string | number | symbol, B> = Readonly<{
  kind: "RecordMapping";

  /** Maps a value of type {@link A} to {@link B}. */
  get(a: A): B;

  /** The mapping, as a {@link Record}. */
  record: Record<A, B>;
}>;

/** {@link Mapping} implemented as a {@link Function} invocation. */
export type FunctionMapping<A extends string | number | symbol, B> = Readonly<{
  kind: "FunctionMapping";

  /** Maps a value of type {@link A} to {@link B}. */
  get(a: A): B;

  /** The mapping, as a {@link Function}. */
  fn(a: A): B;
}>;

/** Static utilities for {@link Mapping}s. */
export const Mapping = {
  /** Creates a {@link RecordMapping} from the given {@link Record}. */
  ofRecord<A extends string | number | symbol, B>(
    record: Record<A, B>,
  ): RecordMapping<A, B> {
    return {
      kind: "RecordMapping",
      get(a) {
        return record[a];
      },
      record,
    };
  },
  /** Creates a {@link FunctionMapping} from the given {@link Function}. */
  ofFunction<A extends string | number | symbol, B>(
    fn: (a: A) => B,
  ): FunctionMapping<A, B> {
    return {
      kind: "FunctionMapping",
      get: fn,
      fn,
    };
  },
} as const;
