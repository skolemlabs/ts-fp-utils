import {
  ORDERINGS_BY_SORT_DIRECTION,
  type SortDirection,
} from "./SortDirection";

export type Ordering<ColumnT> = ReadonlyArray<[ColumnT, SortDirection]>;

/**
 * Given an {@link Ordering}, returns a {@link URLSearchParams} that can be used
 * to parameterize a GET request to sort by `ordering`.
 */
export function getParamsForOrdering<ColumnT>(
  ordering: Ordering<ColumnT>,
  serializeColumn: (c: ColumnT) => string,
): URLSearchParams {
  if (ordering.length === 0) return new URLSearchParams();

  const params = new URLSearchParams();

  params.set(
    "ordering",
    ordering
      .map(
        ([c, d]) => `${serializeColumn(c)}-${ORDERINGS_BY_SORT_DIRECTION[d]}`,
      )
      .join(";"),
  );

  return params;
}
