// =============================================================================
// Content lib barrel — re-exports content + frontmatter.
// =============================================================================

export {
  getContentList,
  getContentBySlug,
  getAllSlugs,
  getBookSlugs,
  getBookBySlug,
  getBookChapters,
  getSeriesArticles,
} from './content'
export type { BookChapter, BookChapterContent, BookData, SeriesArticle } from './content'

export { parseFrontmatter } from './frontmatter'
export type { ParsedFrontmatter } from './frontmatter'
