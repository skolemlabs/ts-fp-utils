import { type SortDirection } from "./SortDirection";

/**
 * Given to UI displaying a collection of items, allowing the UI to sort the
 * collection.
 */
export interface SortControls<ColumnT extends string> {
  /**
   * The currently specified sort behavior, or `undefined` if using the default
   * sort behavior.
   */
  readonly sort?: {
    /** The column that is currently being sorted on. */
    readonly column: ColumnT;
    /** The direction that `column` is being sorted on. */
    readonly direction: SortDirection;
  };

  /** Returns `true` if the collection is sortable by the given key `k`. */
  canSortBy(column: ColumnT): boolean;

  /**
   * Side effect: instructs the owner of the collection to sort it by the given
   * parameters.
   */
  sortBy(column: ColumnT, direction: SortDirection): void;
}
