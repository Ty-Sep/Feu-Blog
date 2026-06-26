// =============================================================================
// Archive Page — /zh/archive, /en/archive
//
// Two-panel layout: left side lists categories (with post counts);
// right side shows a profile card.  All navigation data is
// derived from CARD_CONFIG — zero hardcoded routes or labels.
// =============================================================================

import type { Metadata } from 'next'

import type {
  Locale,
  ContentType,
  CategoryLink,
  ProfileData,
} from '@/lib/types'
import { CONTENT_TYPES, getCardConfig, getListRoute } from '@/tokens/card-config'
import { getContentList } from '@/lib/content'
import { ArchiveLayout } from '@/components/layouts/ArchiveLayout'
import authorAvatar from '@/image/author.png'

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

  return {
    title: lang === 'zh' ? '归档' : 'Archive',
    description:
      lang === 'zh' ? '浏览所有文章分类和笔记合集' : 'Browse all categories and note collections',
    alternates: {
      languages: {
        zh: '/zh/archive',
        en: '/en/archive',
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<React.ReactElement> {
  const { lang } = await params
  const locale = lang as Locale

  // Build data sources in parallel.
  const [categories, profile] = await Promise.all([
    buildCategories(locale),
    buildProfile(locale),
  ])

  return (
    <ArchiveLayout
      locale={locale}
      categories={categories}
      profile={profile}
    />
  )
}

// ---------------------------------------------------------------------------
// Data builders
// ---------------------------------------------------------------------------

/**
 * Builds category links from CARD_CONFIG with live post counts.
 *
 * Each content type becomes one category entry.  The count is the number of
 * MDX files in that type + locale directory.
 */
async function buildCategories(locale: Locale): Promise<CategoryLink[]> {
  const results: CategoryLink[] = []

  for (const type of CONTENT_TYPES) {
    const config = getCardConfig(type)
    const cards = await getContentList(type, locale)

    results.push({
      label: config.label[locale],
      count: cards.length,
      href: getListRoute(type, locale),
    })
  }

  return results
}

/**
 * Builds the profile data displayed in the right panel.
 *
 * Sensible defaults are provided; edit the returned values to personalise.
 */
function buildProfile(locale: Locale): ProfileData {
  return {
    avatar: authorAvatar.src,
    bio:
      locale === 'zh'
        ? '技术学习者 · 笔记记录者 · 持续成长中'
        : 'Tech learner · Note taker · Always growing',
    contact: {
      email: 'skyismycanvas@outlook.com',
      github: 'https://github.com/example',
    },
    featuredLinks: [],
  }
}