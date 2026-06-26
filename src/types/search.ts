// =============================================================================
// Search types — search index entries.
// =============================================================================

import type { ContentType } from './article'

export interface SearchEntry {
  title: string
  description: string
  tags: string
  type: ContentType
  typeLabel: string
  slug: string
  href: string
}
