// =============================================================================
// About Page — /zh/about, /en/about
//
// Content always read from zh directory.  Rendered with react-markdown
// (pure Markdown — no JSX parsing, no angle-bracket issues).
// =============================================================================

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarkdownAsync } from 'react-markdown'

import type { Locale, Frontmatter } from '@/lib/types'
import { parseFrontmatter } from '@/lib/frontmatter'
import { readFile } from '@/lib/fs'
import { AboutLayout } from '@/components/layouts/AboutLayout'
import { MDXRenderer } from '@/components/content/MDXRenderer'

// ---------------------------------------------------------------------------
// Content path — always zh
// ---------------------------------------------------------------------------

const ABOUT_PATH = 'content/about/zh/index.md'

// ---------------------------------------------------------------------------

const FALLBACK_FRONTMATTER: Frontmatter = {
  title: 'About',
  description: '',
}

// ---------------------------------------------------------------------------
// generateStaticParams
// ---------------------------------------------------------------------------

export function generateStaticParams(): Array<{ lang: string }> {
  return [{ lang: 'zh' }, { lang: 'en' }]
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale

  let frontmatter: Frontmatter

  try {
    const raw = await readFile(ABOUT_PATH)
    frontmatter = parseFrontmatter(raw).frontmatter
  } catch {
    frontmatter = FALLBACK_FRONTMATTER
  }

  return {
    title:
      locale === 'zh'
        ? `${frontmatter.title} — 关于`
        : `${frontmatter.title} — About`,
    description: frontmatter.description,
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<React.ReactElement> {
  const { lang } = await params
  const locale = lang as Locale

  let frontmatter: Frontmatter
  let rawContent: string

  try {
    const raw = await readFile(ABOUT_PATH)
    const parsed = parseFrontmatter(raw)
    frontmatter = parsed.frontmatter
    rawContent = parsed.rawContent
  } catch {
    notFound()
  }

  return (
    <AboutLayout locale={locale} frontmatter={frontmatter!}>
      <MDXRenderer>
        <MarkdownAsync>{rawContent!}</MarkdownAsync>
      </MDXRenderer>
    </AboutLayout>
  )
}
