// =============================================================================
// Search data — builds a flat, serialisable search index at build time.
//
// Used by SearchCommand (client component) to power the cmdk search dialog.
// All filesystem access happens here — the returned array is plain JSON-safe
// objects that can cross the server→client boundary.
// =============================================================================

import type { Locale, ContentType } from '@/lib/types'
import { CONTENT_TYPES, getCardConfig, getDetailRoute } from '@/tokens/card-config'
import { getContentList } from '@/lib/content'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchEntry {
  title: string
  description: string
  tags: string
  type: ContentType
  typeLabel: string
  slug: string
  href: string
}

// ---------------------------------------------------------------------------
// getAllSearchEntries
// ---------------------------------------------------------------------------

/**
 * Reads every MDX file across all content types for a given locale and
 * returns a flat, deduplicated search index.
 *
 * Called once per locale at build time inside `[lang]/layout.tsx`.
 */
export async function getAllSearchEntries(
  locale: Locale,
): Promise<SearchEntry[]> {
  const results: SearchEntry[] = []

  for (const type of CONTENT_TYPES) {
    const config = getCardConfig(type)
    const typeLabel = config.label[locale]
    const cards = await getContentList(type, locale)

    for (const card of cards) {
      results.push({
        title: card.title,
        description: card.description ?? '',
        tags: (card.tags ?? []).join(' '),
        type,
        typeLabel,
        slug: card.slug,
        href: getDetailRoute(type, locale, card.slug),
      })
    }
  }

  return results
}
