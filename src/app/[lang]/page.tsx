// =============================================================================
// Homepage — /zh, /en  (Phase 10)
//
// Sections:
//   HeroSection              — fade-in on mount
//   WorkspaceSection         — 4 static entry sticky notes (no MDX data needed)
//   FeaturedArticlesSection  — recent articles (up to 6)
//   ActivityTimelineSection  — recent items across all types (up to 10)
//
// Workspace data is now entirely static — the 4 entries link to:
//   /study-notes, /articles, /guestbook, /lab
// =============================================================================

import type { Metadata } from 'next'

import type { Locale } from '@/lib/types'
import { CONTENT_TYPES } from '@/tokens/card-config'
import { getContentList } from '@/lib/content'
import { HomepageLayout } from '@/components/layouts/HomepageLayout'
import type { TimelineItem } from '@/components/sections/ActivityTimelineSection'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TIMELINE_COUNT = 10

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

  const title =
    lang === 'zh' ? 'MyBlog · 笔记本工作台' : 'MyBlog · Notebook Workspace'

  const description =
    lang === 'zh'
      ? '手绘笔记本风格的双语技术博客'
      : 'A hand-drawn notebook-style bilingual tech blog'

  return {
    title,
    description,
    alternates: {
      languages: { zh: '/zh', en: '/en' },
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function Homepage({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<React.ReactElement> {
  const { lang } = await params
  const locale = lang as Locale

  // Load all content lists in parallel for featured articles + timeline
  const allContentLists = await Promise.all(
    CONTENT_TYPES.map((type) => getContentList(type, locale)),
  )
  const allContent = allContentLists.flat()

  // Featured articles — filtered by frontmatter featured: true, sorted by date desc
  const featuredArticles = allContent
    .filter((item) => item.featured === true)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  // Activity timeline — cross-type
  const recentItems: TimelineItem[] = allContent
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, TIMELINE_COUNT)
    .map((item) => ({
      date: item.date ?? '',
      title: item.title,
      type: item.type,
      slug: item.slug,
    }))

  return (
    <HomepageLayout
      locale={locale}
      featuredArticles={featuredArticles}
      recentItems={recentItems}
    />
  )
}
