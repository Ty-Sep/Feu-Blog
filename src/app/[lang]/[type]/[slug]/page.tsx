// =============================================================================
// Detail Page — /zh/java/spring-ioc, /en/articles/hello-world, etc.
//
// Two rendering paths:
//   1. Book mode — slug matches a book identifier → BookPage (client chapter nav)
//   2. Standalone article — regular DetailLayout with optional TOC sidebar
//
// Uses react-markdown (pure Markdown renderer) instead of MDX compilation.
// Angle brackets like <u, v> are treated as plain text — no escaping needed.
// =============================================================================

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarkdownAsync } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeShikiOriginal from '@shikijs/rehype'

import GithubSlugger from 'github-slugger'

import type { Locale, ContentType, ContentItem } from '@/types'
import type { TocItem } from '@/types'
import { CONTENT_TYPES } from '@/tokens/card-config'
import { getContentBySlug, getAllSlugs, getBookBySlug } from '@/lib/content'
import { getCachedHtml, getChapterHtmlPathMap, getCachedStandalone } from '@/lib/content/html-cache'
import { getCardConfig } from '@/tokens/card-config'
import { DetailLayout } from '@/components/layout/DetailLayout'
import { BookPage } from '@/components/content/BookPage'
import { ArticleShell } from '@/components/content/ArticleShell'
import { MDXRenderer } from '@/components/content/MDXRenderer'
import { CodeCopyButton } from '@/components/content/CodeCopyButton'

// ---------------------------------------------------------------------------
// Component overrides — notebook aesthetic (same as before)
// ---------------------------------------------------------------------------

function CodeBlock({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'pre'>): React.ReactElement {
  return (
    <div className="notebook-code-block">
      <div className="code-header">
        <span />
        <CodeCopyButton />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

function isExternal(href: string | undefined | null): boolean {
  if (!href) return false
  return href.startsWith('http://') || href.startsWith('https://')
}

const components = {
  pre: CodeBlock,
  img: ({ src, ...props }: React.ComponentPropsWithoutRef<'img'>) => {
    // react-markdown may pass an empty string when the Markdown image syntax
    // has no URL (e.g. ![]() or a blank line parsed as image).  Rendering
    // <img src=""> triggers a React warning — skip those nodes entirely.
    if (!src) return null

    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={src}
        {...props}
        className="max-w-full h-auto rounded-sketch"
        loading="lazy"
      />
    )
  },
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      {...props}
      className="border-l-[3px] my-6 pl-4 italic"
      style={{
        borderColor: 'var(--sticky-yellow)',
        color: 'var(--ink-secondary)',
      }}
    />
  ),
  a: ({
    href,
    ...props
  }: React.ComponentPropsWithoutRef<'a'>): React.ReactElement => {
    const external = isExternal(href)
    return (
      <a
        href={href}
        {...props}
        className="underline underline-offset-[3px] transition-colors"
        style={{ textDecorationColor: 'var(--ink-muted)' }}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      />
    )
  },
  h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1
      {...props}
      className="font-title text-4xl leading-tight mt-12 mb-6"
      style={{ fontFamily: 'var(--font-title)' }}
    />
  ),
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2
      {...props}
      className="font-title text-2xl leading-tight mt-10 mb-4"
      style={{ fontFamily: 'var(--font-title)' }}
    />
  ),
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3
      {...props}
      className="font-title text-xl leading-tight mt-8 mb-3"
      style={{ fontFamily: 'var(--font-title)' }}
    />
  ),
  h4: (props: React.ComponentPropsWithoutRef<'h4'>) => (
    <h4
      {...props}
      className="font-title text-lg leading-tight mt-6 mb-2"
      style={{ fontFamily: 'var(--font-title)' }}
    />
  ),
}

// ---------------------------------------------------------------------------
// Shared markdown config
// ---------------------------------------------------------------------------

/**
 * Profiled rehypeShiki — wraps the original plugin to time both the plugin
 * factory call and the actual transform (where the Shiki highlighter is
 * lazily initialised on first use).
 */
function profiledRehypeShiki(options: { theme: string }) {
  console.time('[Perf] rehypeShiki: plugin factory (SSR path)')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformer = (rehypeShikiOriginal as any)(options)
  console.timeEnd('[Perf] rehypeShiki: plugin factory (SSR path)')

  return async (tree: unknown, file?: unknown) => {
    console.time('[Perf] rehypeShiki: transform (SSR path) — first call = highlighter init')
    if (transformer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (transformer as any)(tree, file)
    }
    console.timeEnd('[Perf] rehypeShiki: transform (SSR path) — first call = highlighter init')
  }
}

const remarkPlugins = [remarkGfm]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rehypePlugins: any[] = [
  rehypeSlug,
  [profiledRehypeShiki, { theme: 'github-light' }],
]

// ---------------------------------------------------------------------------
// generateStaticParams
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<
  Array<{ lang: string; type: string; slug: string }>
> {
  const params: Array<{ lang: string; type: string; slug: string }> = []

  for (const type of CONTENT_TYPES) {
    const slugs = await getAllSlugs(type)
    for (const { slug, lang } of slugs) {
      params.push({ lang, type, slug })
    }
  }

  return params
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; type: string; slug: string }>
}): Promise<Metadata> {
  const { lang, type, slug } = await params

  if (!isValidType(type)) {
    return { title: 'Not Found' }
  }

  // Try book first
  const book = await getBookBySlug(type as ContentType, slug, lang as Locale)
  if (book) {
    return {
      title: book.title,
      description: `${book.chapters.length} 个章节`,
    }
  }

  // Standalone article
  const article = await getContentBySlug(
    type as ContentType,
    slug,
    lang as Locale,
  )

  if (!article) {
    return { title: 'Not Found' }
  }

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function DetailPage({
  params,
}: {
  params: Promise<{ lang: string; type: string; slug: string }>
}): Promise<React.ReactElement> {
  console.time('[Perf] DetailPage total')
  const { lang, type, slug } = await params

  if (!isValidType(type)) {
    console.timeEnd('[Perf] DetailPage total')
    notFound()
  }

  const locale = lang as Locale
  const contentType = type as ContentType

  // ── Path 1: Book mode ──
  const book = await getBookBySlug(contentType, slug, locale)
  if (book) {
    // Pre-extract TOC for each chapter (lightweight regex pass)
    console.time('[Perf] extractToc (all chapters)')
    const chaptersWithToc = book.chapters.map((ch, i) => {
      const t0 = performance.now()
      const toc = extractToc(ch.rawContent)
      const elapsed = performance.now() - t0
      if (elapsed > 1) {
        console.log(`[Perf] extractToc: ch[${i}] "${ch.title}" = ${elapsed.toFixed(2)} ms (${ch.rawContent.length} chars)`)
      }
      return { ...ch, toc }
    })
    console.timeEnd('[Perf] extractToc (all chapters)')

    // Only SSR-render the FIRST chapter.  Other chapters are loaded on demand
    // via Server Action so the initial payload is proportional to one chapter,
    // not the entire series.
    //
    // When the build-time cache is available the first chapter is served from
    // pre-rendered HTML (no runtime pipeline).  Falls back to MarkdownAsync
    // (full remark/rehype/Shiki) when the cache hasn't been built yet.

    // Chapter slug → htmlPath map for client-side cache reading
    const chapterHtmlPaths = await getChapterHtmlPathMap(contentType, slug)

    const firstChapter = chaptersWithToc[0]!
    const firstChapterHtmlPath = chapterHtmlPaths.get(firstChapter.slug)
    const cachedFirstHtml = firstChapterHtmlPath
      ? await getCachedHtml(firstChapterHtmlPath)
      : null

    let initialRenderedChapter: React.ReactNode
    if (cachedFirstHtml) {
      console.time('[Perf] page: first chapter (cached HTML)')
      initialRenderedChapter = (
        <ArticleShell
          key={firstChapter.slug}
          title={firstChapter.title}
          date={firstChapter.frontmatter.date}
          tags={firstChapter.frontmatter.tags}
        >
          <MDXRenderer>
            <div dangerouslySetInnerHTML={{ __html: cachedFirstHtml }} />
          </MDXRenderer>
        </ArticleShell>
      )
      console.timeEnd('[Perf] page: first chapter (cached HTML)')
    } else {
      console.time('[Perf] page: MarkdownAsync (first chapter)')
      initialRenderedChapter = (
        <ArticleShell
          key={firstChapter.slug}
          title={firstChapter.title}
          date={firstChapter.frontmatter.date}
          tags={firstChapter.frontmatter.tags}
        >
          <MDXRenderer>
            <MarkdownAsync
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={components}
            >
              {firstChapter.rawContent}
            </MarkdownAsync>
          </MDXRenderer>
        </ArticleShell>
      )
      // Note: MarkdownAsync JSX creation is sync; actual rendering is deferred to
      // React's server render pass and is NOT captured by this timer.
      console.timeEnd('[Perf] page: MarkdownAsync (first chapter)')
    }

    console.timeEnd('[Perf] DetailPage total')
    return (
      <BookPage
        locale={locale}
        bookTitle={book.title}
        chapters={chaptersWithToc}
        initialRenderedChapter={initialRenderedChapter}
        chapterHtmlPaths={chapterHtmlPaths.size > 0 ? chapterHtmlPaths : undefined}
      />
    )
  }

  // ── Path 2: Standalone article ──
  const article = await getContentBySlug(contentType, slug, locale)
  if (!article) {
    console.timeEnd('[Perf] DetailPage total')
    notFound()
  }

  // ── Extract TOC (all article types) ──
  // Prefer cached TOC when available; otherwise extract at runtime.
  const cachedStandalone = await getCachedStandalone(contentType, slug, locale)
  const cachedHtml = cachedStandalone
    ? await getCachedHtml(cachedStandalone.htmlPath)
    : null

  const toc: TocItem[] = cachedStandalone?.toc ?? (() => {
    console.time('[Perf] extractToc (standalone)')
    const items = extractToc(article.rawContent)
    console.timeEnd('[Perf] extractToc (standalone)')
    return items
  })()

  console.timeEnd('[Perf] DetailPage total')
  return (
    <DetailLayout
      locale={locale}
      article={article}
      pagination={await buildPagination(article, contentType, locale)}
      toc={toc}
    >
      <MDXRenderer>
        {cachedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: cachedHtml }} />
        ) : (
          <MarkdownAsync
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={components}
          >
            {article.rawContent}
          </MarkdownAsync>
        )}
      </MDXRenderer>
    </DetailLayout>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value)
}

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

async function buildPagination(
  article: ContentItem,
  type: ContentType,
  locale: Locale,
) {
  const slugs = await getAllSlugs(type)
  const sameLang = slugs
    .filter((s) => s.lang === locale)
    .map((s) => s.slug)

  const idx = sameLang.indexOf(article.slug)
  if (idx === -1 || sameLang.length <= 1) return undefined

  const prev = idx > 0 ? { slug: sameLang[idx - 1]!, title: '' } : undefined
  const next =
    idx < sameLang.length - 1
      ? { slug: sameLang[idx + 1]!, title: '' }
      : undefined

  if (!prev && !next) return undefined

  return { prev, next }
}
