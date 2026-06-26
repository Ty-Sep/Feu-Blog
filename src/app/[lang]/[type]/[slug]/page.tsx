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
import rehypeShiki from '@shikijs/rehype'

import GithubSlugger from 'github-slugger'

import type { Locale, ContentType, ContentItem } from '@/types'
import type { TocItem } from '@/types'
import { CONTENT_TYPES } from '@/tokens/card-config'
import { getContentBySlug, getAllSlugs, getBookBySlug } from '@/lib/content'
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

const remarkPlugins = [remarkGfm]
const rehypePlugins: [typeof rehypeSlug, [typeof rehypeShiki, { theme: string }]] = [
  rehypeSlug,
  [rehypeShiki, { theme: 'github-light' }],
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
  const { lang, type, slug } = await params

  if (!isValidType(type)) {
    notFound()
  }

  const locale = lang as Locale
  const contentType = type as ContentType

  // ── Path 1: Book mode ──
  const book = await getBookBySlug(contentType, slug, locale)
  if (book) {
    // Pre-extract TOC for each chapter
    const chaptersWithToc = book.chapters.map((ch) => ({
      ...ch,
      toc: extractToc(ch.rawContent),
    }))

    // Pre-render all chapters on the server so client switching is instant
    const renderedChapters = chaptersWithToc.map((ch) => (
      <ArticleShell
        key={ch.slug}
        title={ch.title}
        date={ch.frontmatter.date}
        tags={ch.frontmatter.tags}
      >
        <MDXRenderer>
          <MarkdownAsync
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={components}
          >
            {ch.rawContent}
          </MarkdownAsync>
        </MDXRenderer>
      </ArticleShell>
    ))

    return (
      <BookPage
        locale={locale}
        bookTitle={book.title}
        chapters={chaptersWithToc}
        renderedChapters={renderedChapters}
      />
    )
  }

  // ── Path 2: Standalone article ──
  const article = await getContentBySlug(contentType, slug, locale)
  if (!article) {
    notFound()
  }

  // ── Extract TOC (all article types) ──
  const toc: TocItem[] = extractToc(article.rawContent)

  return (
    <DetailLayout
      locale={locale}
      article={article}
      pagination={await buildPagination(article, contentType, locale)}
      toc={toc}
    >
      <MDXRenderer>
        <MarkdownAsync
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {article.rawContent}
        </MarkdownAsync>
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
