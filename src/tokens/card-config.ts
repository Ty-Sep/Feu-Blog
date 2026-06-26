// =============================================================================
// CARD_CONFIG — single source of truth for every content type.
//
// Phase 10: java/408/software-exam merged into study-notes.  lab added.
//
// Components consume this map exclusively.  They never reference labels,
// routes, icons, or accent tokens directly and never reference raw colour
// values.  Adding a new content type means adding one entry here — zero
// component changes are needed.
// =============================================================================

import type { ContentType, CardConfigEntry } from '@/types'

// ---------------------------------------------------------------------------
// Primary map
// ---------------------------------------------------------------------------

export const CARD_CONFIG: Record<ContentType, CardConfigEntry> = {
  'study-notes': {
    label:  { zh: '学习笔记',     en: 'Study Notes' },
    route:  'study-notes',
    icon:   'book-open',
    accent: 'accent-study',
  },

  articles: {
    label:  { zh: '技术文章',     en: 'Articles' },
    route:  'articles',
    icon:   'pen',
    accent: 'accent-articles',
  },

  projects: {
    label:  { zh: '项目总结',     en: 'Projects' },
    route:  'projects',
    icon:   'folder',
    accent: 'accent-projects',
  },

  lab: {
    label:  { zh: '实验室',       en: 'Lab' },
    route:  'lab',
    icon:   'flask-conical',
    accent: 'accent-lab',
  },
}

// ---------------------------------------------------------------------------
// Derived constants
// ---------------------------------------------------------------------------

/** Ordered list of all content types (derived from the map keys). */
export const CONTENT_TYPES: readonly ContentType[] =
  Object.keys(CARD_CONFIG) as unknown as readonly ContentType[]

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Safe lookup that always returns an entry. */
export function getCardConfig(type: ContentType): CardConfigEntry {
  return CARD_CONFIG[type]
}

/**
 * Resolves a content type to its CSS variable reference.
 */
export function getAccentVariable(type: ContentType): string {
  return `var(--${CARD_CONFIG[type].accent})`
}

/**
 * Builds the localised list-page href for a content type.
 */
export function getListRoute(type: ContentType, lang: string): string {
  return `/${lang}/${CARD_CONFIG[type].route}`
}

/**
 * Builds the localised detail-page href for a content type.
 */
export function getDetailRoute(
  type: ContentType,
  lang: string,
  slug: string,
): string {
  return `/${lang}/${CARD_CONFIG[type].route}/${slug}`
}
