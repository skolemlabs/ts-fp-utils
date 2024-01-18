/** Performs an exclusive-or operation on the operands. */
export function xor(a: boolean, b: boolean): boolean {
  if (a) return !b
  if (b) return !a
  return false
}
