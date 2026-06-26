// =============================================================================
// Shared TypeScript interfaces — leaf node, zero dependencies.
// =============================================================================

/* ── Locale ── */

export type Locale = 'zh' | 'en'

/* ── Content types ── */

export type ContentType =
  | 'study-notes'
  | 'articles'
  | 'projects'
  | 'lab'

/* ── Card Config ── */

export interface CardConfigEntry {
  /** Human-readable category labels per locale */
  label: Record<Locale, string>
  /** URL segment, e.g. "java" */
  route: string
  /** lucide-react icon name */
  icon: string
  /** Semantic token — resolves via CSS variable, e.g. "accent-java" */
  accent: string
}

/* ── ContentCard Props ── */

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

/* ── MDX Frontmatter ── */

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

/* ── Content Query Results ── */

export interface ContentItem {
  frontmatter: Frontmatter
  slug: string
  type: ContentType
  lang: Locale
  rawContent: string
}

/* ── Pagination ── */

export interface PaginationLink {
  slug: string
  title: string
}

export interface Pagination {
  prev?: PaginationLink
  next?: PaginationLink
}

/* ── Archive ── */

export interface SocialLink {
  label: string
  url: string
}

export interface CategoryLink {
  label: string
  count: number
  href: string
}

export interface CollectionLink {
  label: string
  href: string
}

export interface ProfileData {
  avatar: string
  bio: string
  contact: {
    email?: string
    github?: string
    socials?: SocialLink[]
  }
  featuredLinks?: SocialLink[]
}

export interface ArchiveData {
  categories: CategoryLink[]
  collections: CollectionLink[]
  profile: ProfileData
}

/* ── Homepage ── */

export interface HomepageModuleData {
  type: ContentType
  cards: ContentCardProps[]
}
