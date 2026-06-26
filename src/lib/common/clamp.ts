// =============================================================================
// clamp — numeric clamping utility.
// =============================================================================

/** Clamps `v` to the inclusive range [lo, hi]. */
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
