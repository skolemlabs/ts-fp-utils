export type SortDirection = (typeof SORT_DIRECTIONS)[number];
export const SORT_DIRECTIONS = ["Ascending", "Descending"] as const;

export const ORDERINGS_BY_SORT_DIRECTION = {
  Ascending: "ASC",
  Descending: "DESC",
} as const satisfies Record<SortDirection, string>;
