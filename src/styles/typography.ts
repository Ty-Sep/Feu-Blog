// =============================================================================
// Typography constants — shared font style objects for the design system.
//
// All components reference these instead of writing inline fontSize / fontWeight.
// =============================================================================

import type { CSSProperties } from 'react'

export const TITLE_XL: CSSProperties = {
  fontSize: 'clamp(4rem, 8vw, 7rem)',
  fontWeight: 700,
  fontFamily: 'var(--font-title)',
}

export const TITLE_L: CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  fontFamily: 'var(--font-title)',
}

export const HEADING: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  fontFamily: 'var(--font-title)',
}

export const BODY: CSSProperties = {
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  lineHeight: 1.75,
}

export const BODY_SM: CSSProperties = {
  fontSize: '0.875rem',
  fontFamily: 'var(--font-body)',
}

export const CAPTION: CSSProperties = {
  fontSize: '0.6875rem',
  fontFamily: 'var(--font-body)',
}

export const TAG: CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 500,
}
