// =============================================================================
// Locale Layout — wraps every route under /[lang].
//
// Responsibilities:
//   1. Declare supported locales via generateStaticParams
//   2. Pre-load the search index at build time (all MDX files for this locale)
//   3. Provide search data to SearchCommand via React Context
//
// Phase 7: layout is now async — it loads search entries once per locale
// so the cmdk search dialog works on every page without per-page setup.
// =============================================================================

import React from 'react'

import type { Locale } from '@/lib/types'
import { getAllSearchEntries } from '@/lib/search-data'
import { SearchProvider } from '@/components/search/SearchProvider'
import { FloatingActionButton } from '@/components/FloatingActionButton'

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams(): Array<{ lang: string }> {
  return [{ lang: 'zh' }, { lang: 'en' }]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const { lang } = await params
  const entries = await getAllSearchEntries(lang as Locale)

  return (
    <SearchProvider entries={entries}>
      {children}
      <FloatingActionButton />
    </SearchProvider>
  )
}
