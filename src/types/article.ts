// =============================================================================
// Article types — content types, frontmatter, pagination.
// =============================================================================

import type { Locale } from './common'

export type ContentType =
  | 'study-notes'
  | 'articles'
  | 'projects'
  | 'lab'

export interface ContentCardProps {
  type: ContentType
  title: string
  description?: string
  date?: string
  tags?: string[]
  slug: string
  lang: Locale
  /** When true, the article appears in the Featured Articles section. */
  featured?: boolean
}

export interface Frontmatter {
  title: string
  /** English title override — used when locale is 'en'. Falls back to title. */
  title_en?: string
  date?: string
  tags?: string[]
  description?: string
  /** Optional per-file content-type override */
  type?: ContentType
  /** Series identifier — groups articles into a reading sequence (legacy) */
  series?: string
  /** Book identifier — groups chapters into a book (replaces series for book mode) */
  book?: string
  /** Human-readable book title shown on cards and navigation */
  bookTitle?: string
  /** Position within a series or book (1-based) */
  order?: number
  /** Chapter number within a book (1-based) */
  chapter?: number
  /** Short summary for series/book navigation display */
  summary?: string
  /** Allow arbitrary future keys without type errors */
  [key: string]: unknown
}

export interface ContentItem {
  frontmatter: Frontmatter
  slug: string
  type: ContentType
  lang: Locale
  rawContent: string
}

export interface PaginationLink {
  slug: string
  title: string
}

export interface Pagination {
  prev?: PaginationLink
  next?: PaginationLink
}
