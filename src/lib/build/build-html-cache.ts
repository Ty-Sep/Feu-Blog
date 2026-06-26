// =============================================================================
// build-html-cache.ts — build-time Markdown → HTML pre-renderer.
//
// Scans content/ for all .md files, runs each through the same remark/rehype
// pipeline used at runtime (renderChapter), and writes the rendered HTML to
// .cache/content/.  A manifest at .cache/content/index.json maps every slug
// to its cached HTML path + metadata.
//
// The runtime reader (html-cache.ts) loads this index once and serves cached
// HTML without touching the unified pipeline — eliminating the ~10 s Shiki
// cold-start penalty entirely.
//
// Usage:
//   npx tsx src/lib/build/build-html-cache.ts      (standalone)
//   npm run build:content                           (via package.json script)
//   npm run build                                   (auto-runs before next build)
// =============================================================================

import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { resolve, join, relative, sep, extname, basename } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'

import { renderChapter } from '../content/render-chapter'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CACHE_DIR = resolve(process.cwd(), '.cache/content')
const CONTENT_DIR = resolve(process.cwd(), 'content')

// Directories scanned for standalone articles (mirrors contentDir in content.ts).
// Each corresponds to a ContentType: content/<dir>/zh/*.md
const STANDALONE_DIRS = ['articles', 'projects', 'lab', 'study-notes'] as const

// Books live under content/notes/<book-slug>/*.md (content-type = study-notes).
const BOOKS_ROOT = 'notes'

// ---------------------------------------------------------------------------
// Local types (self-contained, no @/ imports)
// ---------------------------------------------------------------------------

interface CacheFrontmatter {
  title: string
  title_en?: string
  date?: string
  tags?: string[]
  description?: string
  type?: string
  book?: string
  bookTitle?: string
  chapter?: number
  summary?: string
  featured?: boolean
}

interface TocItem {
  id: string
  text: string
  level: number
}

interface CachedChapter {
  slug: string
  title: string
  chapter: number
  htmlPath: string
  toc: TocItem[]
}

interface CachedBook {
  slug: string
  title: string
  chapters: CachedChapter[]
}

interface CachedStandalone {
  slug: string
  lang: string
  htmlPath: string
  frontmatter: CacheFrontmatter
  toc: TocItem[]
}

interface CacheIndex {
  version: 1
  generatedAt: string
  standalone: Record<string, CachedStandalone[]>
  books: Record<string, CachedBook[]>
}

// ---------------------------------------------------------------------------
// TOC extraction — same algorithm as page.tsx extractToc()
// ---------------------------------------------------------------------------

function extractToc(rawContent: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const items: TocItem[] = []
  const slugger = new GithubSlugger()
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(rawContent)) !== null) {
    const level = match[1]!.length as 1 | 2 | 3
    const text = match[2]!.trim()
    const id = slugger.slug(text)
    items.push({ id, text, level })
  }

  return items
}

// ---------------------------------------------------------------------------
// Content discovery
// ---------------------------------------------------------------------------

/** List .md files inside content/<relDir>, or [] if the directory is absent. */
async function scanDir(relDir: string): Promise<string[]> {
  const absolute = resolve(CONTENT_DIR, relDir)
  if (!existsSync(absolute)) return []

  try {
    const entries = await readdir(absolute, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => join(relDir, e.name))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Single-file processing
// ---------------------------------------------------------------------------

interface ProcessedFile {
  frontmatter: CacheFrontmatter
  slug: string
  html: string
  toc: TocItem[]
}

async function processFile(relPath: string): Promise<ProcessedFile | null> {
  const absolute = resolve(CONTENT_DIR, relPath)
  const slug = basename(relPath, '.md')

  let raw: string
  try {
    raw = readFileSync(absolute, 'utf-8')
  } catch {
    console.warn(`  ⚠️  Skipping unreadable file: ${relPath}`)
    return null
  }

  const { data, content } = matter(raw)

  const frontmatter: CacheFrontmatter = {
    title: data.title ? String(data.title) : slug,
    title_en: data.title_en ? String(data.title_en) : undefined,
    date: data.date ? String(data.date) : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.map((t: unknown) => String(t))
      : undefined,
    description: data.description ? String(data.description) : undefined,
    type: data.type ? String(data.type) : undefined,
    book: data.book ? String(data.book) : undefined,
    bookTitle: data.bookTitle ? String(data.bookTitle) : undefined,
    chapter: typeof data.chapter === 'number' ? data.chapter : undefined,
    summary: data.summary ? String(data.summary) : undefined,
    featured: data.featured === true,
  }

  const toc = extractToc(content)

  let html: string
  try {
    html = await renderChapter(content)
  } catch (err) {
    console.error(`  ❌ renderChapter failed for ${relPath}:`, err)
    return null
  }

  console.log(`  ✓ ${relPath}  (${html.length.toLocaleString()} bytes)`)

  return { frontmatter, slug, html, toc }
}

// ---------------------------------------------------------------------------
// HTML output helpers
// ---------------------------------------------------------------------------

async function writeHtmlFile(htmlDir: string, fileName: string, html: string): Promise<string> {
  await mkdir(htmlDir, { recursive: true })
  const filePath = join(htmlDir, fileName)
  await writeFile(filePath, html, 'utf-8')
  // Return cache-relative path (relative to CACHE_DIR)
  return relative(CACHE_DIR, filePath).replace(/\\/g, '/')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('')
  console.log('══════════════════════════════════════════════════')
  console.log('  build-html-cache — Build-Time HTML Cache')
  console.log('══════════════════════════════════════════════════')
  console.log('')

  const startTime = performance.now()

  // Ensure cache root exists
  await mkdir(CACHE_DIR, { recursive: true })

  // ─────────────────────────────────────────────────────────────────────
  // Phase A — Standalone articles
  // ─────────────────────────────────────────────────────────────────────

  const standalone: Record<string, CachedStandalone[]> = {}

  for (const type of STANDALONE_DIRS) {
    const dir = `${type}/zh`
    const files = await scanDir(dir)

    if (files.length === 0) {
      standalone[type] = []
      continue
    }

    console.log(`── Standalone: ${type} (${files.length} file${files.length > 1 ? 's' : ''}) ──`)

    const entries: CachedStandalone[] = []

    for (const file of files) {
      const result = await processFile(file)
      if (!result) continue

      // Skip book-chapter files that happen to live in standalone dirs
      if (result.frontmatter.book) continue

      const htmlDir = resolve(CACHE_DIR, type)
      const fileName = `${result.slug}.html`
      const htmlPath = await writeHtmlFile(htmlDir, fileName, result.html)

      entries.push({
        slug: result.slug,
        lang: 'zh',
        htmlPath,
        frontmatter: result.frontmatter,
        toc: result.toc,
      })
    }

    standalone[type] = entries
  }

  // ─────────────────────────────────────────────────────────────────────
  // Phase B — Book chapters (content/notes/<book-slug>/*.md)
  // ─────────────────────────────────────────────────────────────────────

  const bookMap = new Map<string, CachedBook>()

  const booksRootAbs = resolve(CONTENT_DIR, BOOKS_ROOT)
  if (existsSync(booksRootAbs)) {
    let bookDirs: string[] = []
    try {
      const entries = await readdir(booksRootAbs, { withFileTypes: true })
      bookDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
    } catch {
      // No book directories
    }

    for (const dirName of bookDirs) {
      const bookDirRel = `${BOOKS_ROOT}/${dirName}`
      const files = await scanDir(bookDirRel)

      if (files.length === 0) continue

      console.log(`── Book: ${dirName} (${files.length} chapter${files.length > 1 ? 's' : ''}) ──`)

      for (const file of files) {
        const result = await processFile(file)
        if (!result) continue

        // Book slug = frontmatter.book || directory name
        const bookSlug = result.frontmatter.book || dirName
        const bookTitle = result.frontmatter.bookTitle || bookSlug

        let book = bookMap.get(bookSlug)
        if (!book) {
          book = { slug: bookSlug, title: bookTitle, chapters: [] }
          bookMap.set(bookSlug, book)
        }

        const htmlDir = resolve(CACHE_DIR, BOOKS_ROOT, bookSlug)
        const fileName = `${result.slug}.html`
        const htmlPath = await writeHtmlFile(htmlDir, fileName, result.html)

        book.chapters.push({
          slug: result.slug,
          title: result.frontmatter.title,
          chapter: result.frontmatter.chapter ?? 0,
          htmlPath,
          toc: result.toc,
        })
      }
    }

    // Sort chapters within each book
    for (const book of bookMap.values()) {
      book.chapters.sort((a, b) => a.chapter - b.chapter)
    }
  }

  const books: Record<string, CachedBook[]> = {
    'study-notes': [...bookMap.values()],
  }

  // ─────────────────────────────────────────────────────────────────────
  // Phase C — Write index manifest
  // ─────────────────────────────────────────────────────────────────────

  const index: CacheIndex = {
    version: 1,
    generatedAt: new Date().toISOString(),
    standalone,
    books,
  }

  const indexPath = resolve(CACHE_DIR, 'index.json')
  await writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8')

  // ─────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
  const standaloneCount = Object.values(standalone).reduce((s, a) => s + a.length, 0)
  const chapterCount = Object.values(books).reduce(
    (s, arr) => s + arr.reduce((ss, b) => ss + b.chapters.length, 0),
    0,
  )

  console.log('')
  console.log(`  ✅ Done in ${elapsed}s`)
  console.log(`     ${standaloneCount} standalone article${standaloneCount !== 1 ? 's' : ''}`)
  console.log(`     ${chapterCount} book chapter${chapterCount !== 1 ? 's' : ''}`)
  console.log(`     Index → ${relative(process.cwd(), indexPath)}`)
  console.log('')
}

main().catch((err) => {
  console.error('[build-html-cache] Fatal:', err)
  process.exit(1)
})
