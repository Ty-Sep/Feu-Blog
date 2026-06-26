// =============================================================================
// Guestbook Page — /zh/guestbook, /en/guestbook
//
// Kraft-paper styled guestbook with sticky-note messages.
// Data is stored in data/guestbook.json.
//
// This is a server component — it reads the JSON file at request time
// (SSG at build time, revalidated on new messages via client-side reload).
// =============================================================================

import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { GuestbookLayout } from '@/components/layout/GuestbookLayout'
import type { GuestbookMessage } from '@/components/guestbook/GuestbookNote'

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
    title: lang === 'zh' ? '留言板' : 'Guestbook',
    description:
      lang === 'zh' ? '无需登录，随便聊聊' : 'No login required, say hello',
    alternates: {
      languages: { zh: '/zh/guestbook', en: '/en/guestbook' },
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function GuestbookPage({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<React.ReactElement> {
  const { lang } = await params

  // Read messages from JSON file
  let messages: GuestbookMessage[] = []
  try {
    const raw = await readFile(
      join(process.cwd(), 'data', 'guestbook.json'),
      'utf-8',
    )
    const all = JSON.parse(raw) as Array<Record<string, unknown>>
    messages = all
      .sort((a, b) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
      )
      .map((m) => ({
        id: String(m.id ?? ''),
        name: String(m.name ?? ''),
        message: String(m.message ?? ''),
        createdAt: String(m.createdAt ?? ''),
        color: (['yellow', 'blue', 'pink'] as const).includes(
          String(m.color ?? '') as 'yellow' | 'blue' | 'pink',
        )
          ? (String(m.color) as 'yellow' | 'blue' | 'pink')
          : 'yellow',
      }))
  } catch {
    // Empty guestbook
  }

  return (
    <GuestbookLayout
      locale={lang as 'zh' | 'en'}
      messages={messages}
    />
  )
}
