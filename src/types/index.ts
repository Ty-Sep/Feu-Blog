// =============================================================================
// Types barrel — re-exports all domain types from a single entry point.
// =============================================================================

export type { Locale, CardConfigEntry } from './common'
export type {
  ContentType,
  ContentCardProps,
  Frontmatter,
  ContentItem,
  PaginationLink,
  Pagination,
} from './article'
export type {
  BookChapter,
  BookChapterContent,
  BookData,
  SeriesArticle,
} from './book'
export type { SearchEntry } from './search'
export type { TocItem } from './toc'
export type {
  SocialLink,
  CategoryLink,
  CollectionLink,
  ProfileData,
  ArchiveData,
  HomepageModuleData,
} from './archive'
