// =============================================================================
// Book types — book-mode reading experience.
// =============================================================================

import type { Locale } from './common'
import type { ContentType, Frontmatter } from './article'

export interface BookChapter {
  /** File slug (used internally for content loading). */
  slug: string
  title: string
  /** Chapter number within the book (1-based). */
  chapter: number
  /** Short summary for navigation display. */
  summary?: string
}

export interface BookChapterContent extends BookChapter {
  frontmatter: Frontmatter
  rawContent: string
}

export interface BookData {
  /** Book identifier (e.g. "software-exam"). */
  slug: string
  /** Human-readable book title (e.g. "软件设计师"). */
  title: string
  type: ContentType
  lang: Locale
  chapters: BookChapterContent[]
}

/** Legacy alias — kept for compatibility with SeriesNavigation → BookNavigation rename path. */
export type SeriesArticle = BookChapter
