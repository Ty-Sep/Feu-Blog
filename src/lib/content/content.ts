// =============================================================================
// Content query layer — server-only.
//
// All content is stored under the zh directory.  Both zh and en routes serve
// the same Chinese content.  Locale switching affects only homepage UI text
// and article title translations (via frontmatter title_en, if provided).
// =============================================================================

import type { Locale, ContentType, ContentItem, ContentCardProps, BookChapter, BookChapterContent, BookData, SeriesArticle } from '@/types'
import { getCardConfig } from '@/tokens/card-config'
import { readFile, getSlugs } from '../fs'
import { parseFrontmatter } from './frontmatter'

// ---------------------------------------------------------------------------
// Content directory — always zh (single content source)
// ---------------------------------------------------------------------------

function contentDir(type: ContentType, _lang: Locale): string {
  // software-exam series: content stored at content/notes/software-exam/
  if (type === 'study-notes') {
    return 'content/notes/software-exam'
  }
  const route = getCardConfig(type).route
  return `content/${route}/zh`
}

// ---------------------------------------------------------------------------
// Book types — re-exported from the canonical definition in @/types
// ---------------------------------------------------------------------------

export type { BookChapter, BookChapterContent, BookData, SeriesArticle } from '@/types'

// ---------------------------------------------------------------------------
// getContentList
// ---------------------------------------------------------------------------

export async function getContentList(
  type: ContentType,
  lang: Locale,
): Promise<ContentCardProps[]> {
  const dir = contentDir(type, lang)
  const slugs = await getSlugs(dir)

  // Separate book chapters from standalone articles
  const bookGroups = new Map<string, { bookTitle: string; chapters: BookChapter[]; latestDate: string }>()
  const standalones: ContentCardProps[] = []

  for (const slug of slugs) {
    const filePath = `${dir}/${slug}.md`
    try {
      const raw = await readFile(filePath)
      const { frontmatter } = parseFrontmatter(raw)

      if (frontmatter.book) {
        // Book chapter — group by book identifier
        const group = bookGroups.get(frontmatter.book)
        const chapter: BookChapter = {
          slug,
          title: frontmatter.title,
          chapter: frontmatter.chapter ?? 0,
          summary: frontmatter.summary,
        }
        if (group) {
          group.chapters.push(chapter)
          if ((frontmatter.date ?? '') > group.latestDate) {
            group.latestDate = frontmatter.date ?? ''
          }
        } else {
          bookGroups.set(frontmatter.book, {
            bookTitle: frontmatter.bookTitle ?? frontmatter.book,
            chapters: [chapter],
            latestDate: frontmatter.date ?? '',
          })
        }
      } else {
        // Standalone article (no book field)
        standalones.push({
          type,
          slug,
          lang,
          title: lang === 'en' && frontmatter.title_en
            ? String(frontmatter.title_en)
            : frontmatter.title,
          description: frontmatter.description,
          date: frontmatter.date,
          tags: frontmatter.tags,
          featured: frontmatter.featured === true,
        })
      }
    } catch {
      // Skip missing or unreadable files.
    }
  }

  // Build book cards — one per book
  const bookCards: ContentCardProps[] = []
  for (const [bookSlug, group] of bookGroups) {
    // Sort chapters by chapter number
    group.chapters.sort((a, b) => a.chapter - b.chapter)

    bookCards.push({
      type,
      slug: bookSlug,
      lang,
      title: group.bookTitle,
      description: `${group.chapters.length} 个章节`,
      date: group.latestDate || undefined,
    })
  }

  // Merge + sort by date
  const items = [...bookCards, ...standalones]
  items.sort((a, b) => {
    const da = a.date ?? ''
    const db = b.date ?? ''
    return db.localeCompare(da)
  })

  return items
}

// ---------------------------------------------------------------------------
// getContentBySlug
// ---------------------------------------------------------------------------

export async function getContentBySlug(
  type: ContentType,
  slug: string,
  lang: Locale,
): Promise<ContentItem | null> {
  console.time(`[Perf] getContentBySlug: ${slug}`)
  const dir = contentDir(type, lang)
  const filePath = `${dir}/${slug}.md`

  try {
    const raw = await readFile(filePath)
    console.time(`[Perf] parseFrontmatter: ${slug}`)
    const { frontmatter, rawContent } = parseFrontmatter(raw)
    console.timeEnd(`[Perf] parseFrontmatter: ${slug}`)
    console.timeEnd(`[Perf] getContentBySlug: ${slug}`)
    return {
      frontmatter,
      rawContent,
      slug,
      type,
      lang,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// getAllSlugs — generates paths for both zh and en from the single zh source
// ---------------------------------------------------------------------------

export async function getAllSlugs(
  type: ContentType,
): Promise<Array<{ slug: string; lang: Locale }>> {
  const results: Array<{ slug: string; lang: Locale }> = []

  const dir = contentDir(type, 'zh')
  const slugs = await getSlugs(dir)

  const seenBooks = new Set<string>()

  for (const slug of slugs) {
    const filePath = `${dir}/${slug}.md`
    try {
      const raw = await readFile(filePath)
      const { frontmatter } = parseFrontmatter(raw)

      if (frontmatter.book) {
        // Book chapter — track the book slug (added once below)
        seenBooks.add(frontmatter.book)
      } else {
        // Standalone article
        results.push({ slug, lang: 'zh' })
        results.push({ slug, lang: 'en' })
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Add book slugs (both locales)
  for (const bookSlug of seenBooks) {
    results.push({ slug: bookSlug, lang: 'zh' })
    results.push({ slug: bookSlug, lang: 'en' })
  }

  return results
}

// ---------------------------------------------------------------------------
// getBookSlugs — discover all unique book identifiers for a content type
// ---------------------------------------------------------------------------

export async function getBookSlugs(type: ContentType): Promise<string[]> {
  const dir = contentDir(type, 'zh')
  const slugs = await getSlugs(dir)
  const bookSlugs = new Set<string>()

  for (const slug of slugs) {
    try {
      const raw = await readFile(`${dir}/${slug}.md`)
      const { frontmatter } = parseFrontmatter(raw)
      if (frontmatter.book) {
        bookSlugs.add(frontmatter.book)
      }
    } catch {
      // Skip unreadable files
    }
  }

  return [...bookSlugs]
}

// ---------------------------------------------------------------------------
// getBookBySlug — load a book with all its chapters
// ---------------------------------------------------------------------------

export async function getBookBySlug(
  type: ContentType,
  slug: string,
  lang: Locale,
): Promise<BookData | null> {
  console.time(`[Perf] getBookBySlug: ${slug}`)
  const dir = contentDir(type, lang)
  const slugs = await getSlugs(dir)

  const chapters: BookChapterContent[] = []
  let bookTitle = slug // fallback

  let readFileTotal = 0
  let parseFmTotal = 0

  for (const fileSlug of slugs) {
    try {
      const t0 = performance.now()
      const raw = await readFile(`${dir}/${fileSlug}.md`)
      readFileTotal += performance.now() - t0

      const t1 = performance.now()
      const { frontmatter, rawContent } = parseFrontmatter(raw)
      parseFmTotal += performance.now() - t1

      if (frontmatter.book === slug) {
        bookTitle = frontmatter.bookTitle ?? slug
        chapters.push({
          slug: fileSlug,
          title: frontmatter.title,
          chapter: frontmatter.chapter ?? 0,
          summary: frontmatter.summary,
          frontmatter,
          rawContent,
        })
      }
    } catch {
      // Skip unreadable files
    }
  }

  if (chapters.length === 0) {
    console.timeEnd(`[Perf] getBookBySlug: ${slug}`)
    return null
  }

  chapters.sort((a, b) => a.chapter - b.chapter)

  console.log(`[Perf] getBookBySlug: readFile (${slugs.length} files) = ${readFileTotal.toFixed(2)} ms`)
  console.log(`[Perf] getBookBySlug: parseFrontmatter (${slugs.length} files) = ${parseFmTotal.toFixed(2)} ms`)
  console.timeEnd(`[Perf] getBookBySlug: ${slug}`)

  return {
    slug,
    title: bookTitle,
    type,
    lang,
    chapters,
  }
}

// ---------------------------------------------------------------------------
// getBookChapters — fetch chapter list for a book (lightweight, no rawContent)
// ---------------------------------------------------------------------------

export async function getBookChapters(
  book: string,
  type: ContentType,
): Promise<BookChapter[]> {
  const dir = contentDir(type, 'zh')
  const slugs = await getSlugs(dir)

  const chapters: BookChapter[] = []

  for (const slug of slugs) {
    const filePath = `${dir}/${slug}.md`
    try {
      const raw = await readFile(filePath)
      const { frontmatter } = parseFrontmatter(raw)
      if (frontmatter.book === book) {
        chapters.push({
          slug,
          title: frontmatter.title,
          chapter: frontmatter.chapter ?? 0,
          summary: frontmatter.summary,
        })
      }
    } catch {
      // Skip unreadable files
    }
  }

  chapters.sort((a, b) => a.chapter - b.chapter)
  return chapters
}

// ---------------------------------------------------------------------------
// getSeriesArticles — legacy wrapper, delegates to getBookChapters
// ---------------------------------------------------------------------------

export async function getSeriesArticles(
  series: string,
  type: ContentType,
): Promise<SeriesArticle[]> {
  return getBookChapters(series, type)
}
