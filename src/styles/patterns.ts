// =============================================================================
// Style patterns — shared CSS-in-JS objects for repeated layout patterns.
// =============================================================================

import type { CSSProperties } from 'react'

/** Thin scrollbar style used by sidebars and search results. */
export const scrollbarThin: CSSProperties = {
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--ink-muted) transparent',
}

/** Sticky sidebar container with frosted-glass backdrop. */
export const sidebarContainer: CSSProperties = {
  backgroundColor: 'var(--sidebar-bg)',
  backdropFilter: 'var(--sidebar-blur)',
  WebkitBackdropFilter: 'var(--sidebar-blur)',
}
