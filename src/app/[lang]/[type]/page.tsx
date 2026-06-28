// =============================================================================
// List Page — /zh/java, /en/articles, etc.
//
// Dynamic route [type] handles all five content types.  A single-page
// component validates the type against CONTENT_TYPES, loads the full card
// list, and delegates rendering to ListLayout.
//
// Study / note pages use BookshelfLayout; all others use ListLayout.
// =============================================================================

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale, ContentType } from '@/types'
import { CONTENT_TYPES, getCardConfig } from '@/tokens/card-config'
import { getContentList } from '@/lib/content'
import { ListLayout } from '@/components/layout/ListLayout'
import { BookshelfLayout } from '@/components/layout/BookshelfLayout'

// ---------------------------------------------------------------------------
// generateStaticParams
// ---------------------------------------------------------------------------

export function generateStaticParams(): Array<{ lang: string; type: string }> {
  const params: Array<{ lang: string; type: string }> = []

  for (const lang of ['zh', 'en'] as const) {
    for (const type of CONTENT_TYPES) {
      params.push({ lang, type })
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
  params: Promise<{ lang: string; type: string }>
}): Promise<Metadata> {
  const { lang, type } = await params

  // Bail early on invalid types so metadata doesn't render for 404 pages.
  if (!isValidType(type)) {
    return { title: 'Not Found' }
  }

  const ct = type as ContentType
  const config = getCardConfig(ct)

  return {
    title: config.label[lang as Locale],
    description:
      lang === 'zh'
        ? `${config.label.zh} — 文章列表`
        : `${config.label.en} — article list`,
    alternates: {
      languages: {
        zh: `/${lang === 'zh' ? 'zh' : 'zh'}/${config.route}`,
        en: `/${lang === 'en' ? 'en' : 'en'}/${config.route}`,
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ListPage({
  params,
}: {
  params: Promise<{ lang: string; type: string }>
}): Promise<React.ReactElement> {
  const { lang, type } = await params

  // Validate content type — 404 for anything outside CONTENT_TYPES.
  if (!isValidType(type)) {
    notFound()
  }

  const locale = lang as Locale
  const contentType = type as ContentType
  const config = getCardConfig(contentType)
  const cards = await getContentList(contentType, locale)

  // 学习笔记类内容使用书架布局，其余使用原有卡片列表
  // 👇 请把 'study' 替换成你学习笔记对应的实际 type 值
  const isBookshelfType = contentType === 'study-notes'

  if (isBookshelfType) {
    return (
      <BookshelfLayout
        locale={locale}
        type={contentType}
        title={config.label[locale]}
        cards={cards}
      />
    )
  }

  return (
    <ListLayout
      locale={locale}
      type={contentType}
      title={config.label[locale]}
      cards={cards}
    />
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value)
}